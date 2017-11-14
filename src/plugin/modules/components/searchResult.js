define([
    'knockout-plus',
    'jquery',
    'kb_common/html'
], function (
    ko,
    $,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    var styles = html.makeStyles({
        component: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column'
        },
        miniButton: {
            css: {
                padding: '2px',
                border: '2px transparent solid',
                cursor: 'pointer'
            },
            pseudo: {
                hover: {
                    border: '2px white solid'
                },
                active: {
                    border: '2px white solid',
                    backgroundColor: '#555',
                    color: '#FFF'
                }
            }
        }
    });

    function viewModel(params) {
        var search = params.search;
        var searchResults = search.searchResults;
        var searching = search.searching;

        function doOpenNarrative(cell) {
            if (cell.url) {
                window.open(cell.url, '_blank');
            }
        }

        function doViewObject(cell) {
            if (cell.url) {
                window.open(cell.url, '_blank');
            }
        }

        function doOpenProfile(cell) {
            if (cell.url) {
                window.open(cell.url, '_blank');
            }
        }

        var columns = [
            {
                name: 'narrativeTitle',
                label: 'Narrative',
                type: 'string',
                // widths are summed, and each column's actual width attribute
                // is set as the percent of total.
                width: 35,
                action: {
                    fn: doOpenNarrative
                }
            },
            {
                name: 'type',
                label: 'Type',
                type: 'string',
                width: 8
            },   
            
            {
                name: 'objectName',
                label: 'Object',
                type: 'string',
                // width is more like a weight... for all current columns the
                // widths are summed, and each column's actual width attribute
                // is set as the percent of total.
                width: 35,
                action: {
                    fn: doViewObject
                }
            },
            {
                name: 'date',
                label: 'Date',
                type: 'date',
                format: 'MM/DD/YYYY',
                sort: {
                    keyName: 'date',
                    isTimestamp: true,
                    isObject: false,
                    direction: ko.observable('ascending'),
                    active: ko.observable(false)
                },
                width: 8
            },
            {
                name: 'owner',
                label: 'Owner',
                type: 'string',
                width: 8,
                action: {
                    fn: doOpenProfile
                }
            },
            {
                name: 'shared',
                label: 'Shared',
                type: 'string',
                width: 8,
                component: 'reske-simple-search/shared-icon',
                headerStyle: {
                    textAlign: 'center'
                },
                rowStyle: {
                    textAlign: 'center'
                }
            }
           
        ];

        function sortBy(column) {
            // fake for now...
            if (!column.sort) {
                return;
            }
            if (!column.sort.active()) {
                column.sort.active(true);
            }

            if (column.sort.direction() === 'ascending') {
                column.sort.direction('descending');
            } else {
                column.sort.direction('ascending');
            }
           
            search.sortBy({
                isTimestamp: column.sort.isTimestamp  || false,
                isObjectName: column.sort.isObjectName || false,
                keyName: column.sort.keyName,
                direction: column.sort.direction()
            });
        }

        sortBy(columns[3]);

        return {
            search: params.search,
            searchResults: searchResults,
            searching: searching,
            table: {
                // a quick hack untl we tame the data layer...
                rows: searchResults.map(function (item) {
                    return item.simpleBrowse;
                }),
                columns: columns,
                isLoading: searching,
                pageSize: search.pageSize,
                state: search.searchState,
                sortBy: sortBy
            },
        };
    }

    function template() {
        return div({
            class: styles.classes.component
        }, [
            styles.sheet,
            div({
                dataBind: {
                    component: {
                        name: '"reske-simple-search/table"',
                        params: {
                            table: 'table'
                        }
                    }
                },
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 0px'
                }
            })
        ]);
    }

    function component() {
        return {
            viewModel: {
                createViewModel: viewModel
            },
            template: template()
        };
    }

    return component;
});
