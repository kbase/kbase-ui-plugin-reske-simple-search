define([
    'knockout-plus',
    'bluebird',
    'kb_common/html',
    'kb_common/ui',
    '../lib/utils'
], function (
    ko,
    Promise,
    html,
    ui,
    utils
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span'),
        input = t('input'),
        label = t('label');

    /*
    This view model establishes the primary search context, including the
    search inputs
    search state
    paging controls
    search results

    sub components will be composed with direct references to any of these vm pieces
    they need to modify or use.
     */
    function viewModel(params) {

        // Unpack the Search VM.
        var searchInput = params.search.searchInput;
        var searchResults = params.search.searchResults;
        var searchTotal = params.search.searchTotal;
        var searching = params.search.searching;
        var pageSize = params.search.pageSize;
        var page = params.search.page;

        function doHelp() {
            params.search.showOverlay({
                name: 'reske-simple-search/search-help',
                params: {},
                viewModel: {}
            });
        }

        return {
            // The top level search is included so that it can be
            // propagated.
            search: params.search,
            // And we break out fields here for more natural usage (or not??)
            searchInput: searchInput,
            searchResults: searchResults,
            searchTotal: searchTotal,
            searching: searching,
            pageSize: pageSize,
            page: page,

            // ACTIONS
            doHelp: doHelp,
            doRefreshSearch: params.search.refreshSearch,
        };
    }

    /*
        Builds the search input area using bootstrap styling and layout.
    */
    function buildInputArea() {
        return div({
            class: 'form'
        }, div({
            class: 'input-group'
        }, [
            div({
                class: 'input-group-addon',
                style: {
                    cursor: 'pointer',
                    borderRadius: '4px',
                    borderTopRightRadius: '0',
                    borderBottomRightRadius: '0',
                    paddingLeft: '8px',
                    paddingRight: '8px'
                },
                dataBind: {
                    click: 'doRefreshSearch'
                }
            }, span({
                style: {
                    display: 'inline-block',
                    width: '2em',
                    textAlign: 'center'
                }
            }, span({
                class: 'fa',
                style: {
                    fontSize: '100%',
                    color: '#000',
                    // width: '2em'
                },
                dataBind: {
                    // style: {
                    //     color: 'searching() ? "green" : "#000"'
                    // }
                    css: {
                        'fa-search': '!searching()',
                        'fa-spinner fa-pulse': 'searching()',
                    }
                }
            }))),
            input({
                class: 'form-control',
                style: {
                },
                dataBind: {
                    textInput: 'searchInput',
                    hasFocus: true
                },
                placeholder: 'Search KBase Data'
            }),
            div({
                class: 'input-group-addon',
                style: {
                    cursor: 'pointer'
                },
                dataBind: {
                    click: 'doHelp'
                }
            }, span({
                class: 'fa fa-info'
            }))
        ]));
    }

    function buildSearchFilters() {
        return div({
            style: {
                display: 'inline-block',
                textAlign: 'center',
                margin: '6px auto'
            }
        }, [
            // 'Search in ',
            label('Ownership: '),
            span({
                // class: 'checkbox'
            }, label({
                style: {
                    fontWeight: 'normal',
                    marginRight: '4px',
                    marginLeft: '6px'
                }
            }, [
                input({
                    type: 'checkbox',
                    dataBind: {
                        checked: '$component.search.withPrivateData'
                    }
                }),
                ' Own Data'
            ])),
            span({
                // class: 'checkbox'
            }, label({
                style: {
                    fontWeight: 'normal',
                    marginRight: '4px',
                    marginLeft: '6px'
                }
            }, [
                input({
                    type: 'checkbox',
                    // dataBind: {
                    //     checked: '$component.search.withPrivateData'
                    // }
                }),
                ' Shared with you'
            ])),
            span({
                // class: 'ckeckbox'
            }, label({
                style: {
                    fontWeight: 'normal',
                    marginRight: '4px',
                    marginLeft: '6px'
                }
            }, [
                input({
                    type: 'checkbox',
                    dataBind: {
                        checked: '$component.search.withPublicData'
                    }
                }),
                ' Public'
            ]))
        ]);
    }
    
    function buildFilterArea() {
        return div({
            class: 'form-inline',
            style: {
                display: 'inline-block'
            }
        }, [
            buildSearchFilters(),
            div({
                style: {
                    display: 'inline-block',
                    marginLeft: '12px'
                }
            }, utils.komponent({
                name: 'reske-simple-search/type-filter-control',
                params: {
                    search: 'search'
                }
            }))
        ]);
    }

    function buildResultsArea() {
        return utils.komponent({
            name: 'reske-simple-search/browser',
            params: {
                search: 'search'
            }
        });
    }

    var styles = html.makeStyles({
        component: {
            flex: '1 1 0px',
            display: 'flex',
            flexDirection: 'column'
        },
        searchArea: {
            flex: '0 0 50px',
            // border: '1px red solid'
        },
        filterArea: {
            flex: '0 0 50px',
            textAlign: 'center'
            // border: '1px blue dashed'
        },
        resultArea: {
            flex: '1 1 0px',
            // border: '1px green dotted',
            display: 'flex',
            flexDirection: 'column'
        }
    });


    function template() {
        return div({
            class: styles.classes.component
        }, [
            styles.sheet,
            // The search input area
            div({
                class: styles.classes.searchArea
            }, buildInputArea()),
            // The search filter area
            div({
                class: styles.classes.filterArea
            }, buildFilterArea()),
            // The search results / error / message area
            div({
                class: styles.classes.resultArea
            }, [
                buildResultsArea(),
            ])
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});
