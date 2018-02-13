define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        span = t('span'),
        label = t('label'),
        input = t('input'),
        div = t('div');

    function viewModel(params) {
        var tags = params.sourceTags.tags;
        var inverted = params.sourceTags.inverted;
        var use = params.sourceTags.use;

        var searchNarratives = ko.observable();
        var searchReference = ko.observable();

        if (use()) {
            if (tags.indexOf('refdata') >= 0) {
                if (inverted()) {
                    searchReference(false);
                    searchNarratives(true);
                } else {
                    searchReference(true);
                    searchNarratives(false);
                }
            } else {
                searchReference(true);
                searchNarratives(true);
            }
        } else {
            searchReference(true);
            searchNarratives(true);
        }

        function evaluate() {
            if (searchReference()) {
                if (searchNarratives()) {
                    use(false);
                    tags.removeAll();
                    inverted(false);
                } else {
                    tags.removeAll();
                    tags.push('refdata');
                    use(true);
                    inverted(false);
                }
            } else {
                if (searchNarratives()) {
                    tags.removeAll();
                    tags.push('refdata');
                    use(true);
                    inverted(true);
                } else {
                    use(true);
                    tags.removeAll();                    
                    inverted(false);
                }
            }
        }

        searchNarratives.subscribe(function () {
            evaluate();
        });

        searchReference.subscribe(function () {
            evaluate();
        });

        return {
            searchNarratives: searchNarratives,
            searchReference: searchReference
        };
    }

    var styles = html.makeStyles({
        component: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column'
        },
        filterArea: {
            flex: '0 0 50px',
            textAlign: 'left'
        },
        resultArea: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column'
        },
        activeFilterInput: {
            backgroundColor: 'rgba(209, 226, 255, 1)',
            color: '#000'
        },
        modifiedFilterInput: {
            backgroundColor: 'rgba(255, 245, 158, 1)',
            color: '#000'
        },
        checkboxControl: {
            css: {
                borderColor: 'transparent',
                boxShadow: 'none',
                margin: '0 2px'
            },
            inner: {
                label: {
                    fontWeight: 'normal',
                    marginRight: '4px',
                    marginLeft: '6px'
                }
            }
        }
    });

    function buildControls() {
        return div({
            style: {
                display: 'inline-block'
            }
        }, [
            span({
                dataBind: {
                    css: 'searchNarratives() ? "' + styles.classes.activeFilterInput + '" : null'
                },
                class: ['form-control', styles.classes.checkboxControl]               
            }, label([
                input({
                    type: 'checkbox',
                    dataBind: {
                        checked: 'searchNarratives'
                    }
                }),
                ' Narratives'
            ])),
            span({
                dataBind: {
                    css: 'searchReference() ? "' + styles.classes.activeFilterInput + '" : null'
                },
                class: ['form-control', styles.classes.checkboxControl]               
            }, label([
                input({
                    type: 'checkbox',
                    dataBind: {
                        checked: 'searchReference'
                    }
                }),
                ' Reference Data'
            ])),
        ]);
    }
    function template() {
        return div({
            style: {
                display: 'inline-block'
            }
        }, [
            styles.sheet,
            buildControls()
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return ko.kb.registerComponent(component);
});