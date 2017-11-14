define([
    'knockout-plus',
    'marked'
], function (
    ko,
    marked
) {
    'use strict';

    function renderMarkdown(source) {
        try {
            var html = marked(source);
            // just in case this is a "code cell" we need to escape out any script tags 
            // (but regular tags need to be there -- this is markdown after all)
            var scripty = /<script/;
            if (scripty.test(html)) {
                html = 'markdown blocked due to script';
            }
            return html;
        } catch (ex) {
            return 'Error rendering markdown: ' + ex.message;
        }
    }

    // TODO prepare it for prettifyig??
    function renderCode(source) {
        try {
            var html = source.replace(/</, '&lt;').replace(/>/, '&gt;');
            return html;
        } catch (ex) {
            return 'Error rendering code: ' + ex.message;
        }
    }

    function normalizeToNarrative(object, options) {
        // try to suss out interesting narrative bits.
        var cells;
        if (!object.data.cells) {
            cells = [];
        } else {
            cells = object.data.cells.map(function (cell) {
                if (Object.keys(cell.metadata).length > 0) {
                    if (cell.metadata.kbase.appCell) {
                        var appCell = cell.metadata.kbase.appCell;
                        var app = {
                            name: null,
                            method: null,
                            module: null,
                            description: null
                        };
                        var iconUrl;
                        // Surface some key attributes of an app, but only if the 
                        // metadata is well structured.
                        // Hopefully most of the issues with incompletely structured app 
                        // cells is due to the presence of early development narratives.
                        if (appCell.app.spec && 'info' in appCell.app.spec) {
                            app.name = appCell.app.spec.info.name;
                            app.id = appCell.app.spec.info.id;
                            app.method = appCell.app.spec.info.id.split('/')[1];
                            app.module = appCell.app.spec.info.module_name;
                            app.description = appCell.app.spec.info.subtitle;
                            if (appCell.app.spec.info.icon) {
                                var url = appCell.app.spec.info.icon.url;
                                if (url) {
                                    iconUrl = options.runtime.config('services.narrative_method_store.image_url') + url;
                                }
                            }
                        }

                        return {
                            type: 'app',
                            params: cell.metadata.kbase.appCell.params,
                            spec: cell.metadata.kbase.appCell.app.spec,
                            iconUrl: iconUrl,
                            app: app
                        };
                    } else if (cell.metadata.kbase.outputCell) {
                        return {
                            type: 'output',
                            show: ko.observable(false)

                        };
                    } else if (cell.metadata.kbase.dataCell) {
                        return {
                            type: 'data',
                            show: ko.observable(false)
                        };
                    } else {
                        if (Object.keys(cell.metadata.kbase).length === 0) {
                            if (cell.outputs) {
                                // is a code cell that has been run. 
                                // a code cell not run?
                                return {
                                    type: 'code',
                                    source: cell.source,
                                    code: renderCode(cell.source),
                                    show: ko.observable(false)
                                };
                            } else if (cell.source.match(/kb-cell-out/)) {
                                var m = cell.source.match(/kbaseNarrativeOutputCell\((.*)\)/);
                                if (m) {
                                    try {
                                        return {
                                            type: 'output-widget',
                                            param: JSON.parse([m[1]]),
                                            show: ko.observable(false)
                                        };
                                    } catch (ex) {
                                        return {
                                            type: 'output-widget',
                                            error: 'Error parsing output widget param: ' + ex.error,
                                            show: ko.observable(false)
                                        };
                                    }
                                } else {
                                    return {
                                        type: 'output-widget',
                                        error: 'Cannot find widget in output cell source',
                                        show: ko.observable(false)
                                    };
                                }
                            } else {
                                // this is a plain Jupyter cell.
                                // any way to differentiate between code and markdown???

                                return {
                                    type: 'markdown',
                                    markdown: cell.source,
                                    html: renderMarkdown(cell.source)
                                };
                            }
                        } else {
                            return {
                                type: 'kbase-unknown',
                                text: 'Unknown kbase cell type: ',
                                show: ko.observable(false)
                            };
                        }
                    }
                } else {
                    // Empty metadata - jupyter native
                    if (cell.outputs) {
                        // is a code cell that has been run. 
                        // a code cell not run?
                        return {
                            type: 'code',
                            source: cell.source,
                            code: renderCode(cell.source),
                            show: ko.observable(false)
                        };
                    }
                    return {
                        type: 'markdown',
                        markdown: cell.source,
                        html: renderMarkdown(cell.source)
                    };
                }

            });
        }

        // add toggling.
        var cellTypeCounts = {};


        cells.forEach(function (cell) {
            if (!cell.show) {
                cell.show = ko.observable(true);
            }
            cell.doToggleShow = function () {
                cell.show(!cell.show());
            };
            if (!cellTypeCounts[cell.type]) {
                cellTypeCounts[cell.type] = 1;
            } else {
                cellTypeCounts[cell.type] += 1;
            }
        });

        object['narrative'] = {
            title: object.data.metadata.name,
            description: 'narrative description here...',
            cells: {
                show: ko.observable(false),
                doToggleShow: function (data) {
                    data.show(!data.show());
                },
                cells: cells
            },
            markdownCells: {
                show: ko.observable(false),
                doToggleShow: function (data) {
                    data.show(!data.show());
                },
                cells: cells.filter(function (cell) {
                    return (cell.type === 'markdown');
                })
            },
            cellCount: cells.length,
            appCellCount: cellTypeCounts.app || 0,
            dataCellCount: ((cellTypeCounts.output || 0) + (cellTypeCounts.data || 0)),
            markdownCellCount: cellTypeCounts.markdown || 0,
            codeCellCount: cellTypeCounts.code || 0,
            dataObjectCount: object.workspaceInfo.object_count - 1 // approximate, because there may be hidden objects.
        };
    }

    function guidToReference(guid) {
        var m = guid.match(/^WS:(\d+)\/(\d+)\/(\d+)$/);
        var objectRef = m.slice(1, 4).join('/');
        return {
            workspaceId: m[1],
            objectId: m[2],
            objectVersion: m[3],
            ref: m.slice(1, 4).join('/'),
            dataviewId: objectRef
        };
    }

    function normalize(object, options) {
        normalizeToNarrative(object, options);
    }

    return {
        normalize: normalize,
        guidToReference: guidToReference
    };
});