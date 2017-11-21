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
        p = t('p'),
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
        // var searchInput = params.search.searchInput;
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

       
        // don't automatically sync; only sync on pressing the 
        // search refresh button or with enter key.

        // .syncWith(params.search.searchInput);

        // just parked here for now until supported in RESKE
        var withSharedData = ko.observable(true);

        var showHistory = ko.observable(false);

        var searchHistory = ko.observableArray();

        // function addToHistory(data) {
        //     history.push(searchInput());
        // }

        // This is the obervable in the actual search input.
        var searchControlValue = ko.observable();

        // This is the search value the user has commited by clicking
        // the search button or pressing the Enter key.
        var searchInput = ko.observable();

        function addToSearchHistory(value) {
            if (searchHistory.indexOf(value) !== -1) {
                return;
            }
            
            searchHistory.push(value);

            if (searchHistory().length > 10) {
                searchHistory.shift();
            }
        }


        // When it is updated by either of those methods, we save
        // it in the search history, and also forward the value to
        // the search query.
        searchInput.subscribe(function (newValue) {
            // add to history if not already there...
            addToSearchHistory(newValue);
            params.search.searchInput(newValue);
        });

        function useFromHistory(data) {
            searchControlValue(data);
            // TODO: way for this to actually flow from the 
            // control after the searchInput is updated?
            searchInput(data);
            showHistory(false);
        }

        // function removeFromHistory(data) {

        // }

        function doToggleHistory() {
            showHistory(!showHistory());
        }

        var searchInputClass = ko.pureComputed(function () {
            if (searchControlValue() !== searchInput()) {
                return styles.classes.modifiedFilterInput;
            }

            if (searchInput()) {
                return styles.classes.activeFilterInput;
            }

            return null;
        });

        function doRunSearch() {
            searchInput(searchControlValue());

            // params.search.refreshSearch();
        }

        function doKeyUp(data, ev) {
            if (ev.key) {
                if (ev.key === 'Enter') {
                    doRunSearch();
                }
            } else if (ev.keyCode) {
                if (ev.keyCode === 13) {
                    doRunSearch();
                }
            }
        }

        return {
            // The top level search is included so that it can be
            // propagated.
            search: params.search,
            // And we break out fields here for more natural usage (or not??)
            searchControlValue: searchControlValue,
            searchResults: searchResults,
            searchTotal: searchTotal,
            searching: searching,
            pageSize: pageSize,
            page: page,

            withSharedData: withSharedData,
            showHistory: showHistory,
            doToggleHistory: doToggleHistory,

            useFromHistory: useFromHistory,
            searchHistory: searchHistory,
            searchInputClass: searchInputClass,

            // ACTIONS
            doHelp: doHelp,
            doRunSearch: doRunSearch,
            doKeyUp: doKeyUp
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
                    click: 'doRunSearch'
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
            div({
                class: 'form-control',
                style: {
                    display: 'inline-block',
                    width: '100%',
                    position: 'relative',
                    padding: '0',
                    border: 'none'
                }
            }, [
                input({
                    class: 'form-control',                   
                    dataBind: {
                        textInput: 'searchControlValue',
                        // value: 'searchInput',
                        hasFocus: true,
                        // css: 'searchInput() ? "' + styles.classes.activeFilterInput + '" : null',
                        css: 'searchInputClass',
                        event: {
                            keyup: 'doKeyUp'
                        }
                    },
                    placeholder: 'Search KBase Data'
                }),
                '<!-- ko if: showHistory -->',
                div({
                    
                    class: styles.classes.historyContainer
                }, [
                    '<!-- ko if: searchHistory().length > 0 -->',
                    '<!-- ko foreach: searchHistory -->',                    
                    div({
                        dataBind: {
                            text: '$data',
                            click: '$component.useFromHistory'
                        },
                        class: styles.classes.historyItem
                    }),
                    '<!-- /ko -->',
                    '<!-- /ko -->',
                    '<!-- ko ifnot: searchHistory().length > 0 -->',
                    p({
                        style: {
                            fontStyle: 'italic'
                        }
                    }, 'no items in history yet - Search!'),
                    '<!-- /ko -->',
                ]),
                '<!-- /ko -->'
            ]),
            div({
                class: 'input-group-addon',
                style: {
                    cursor: 'pointer'
                },
                dataBind: {
                    click: 'doToggleHistory',
                    style: {
                        'background-color': 'showHistory() ? "silver" : null'
                    }
                }
            }, span({
                class: 'fa fa-history'
            })),
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
            label('Ownership '),
            span({
                dataBind: {
                    css: '$component.search.withPrivateData() ? "' + styles.classes.activeFilterInput + '" : null'
                },
                class: ['form-control', styles.classes.checkboxControl]               
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
                dataBind: {
                    css: '$component.withSharedData() ? "' + styles.classes.activeFilterInput + '" : null'
                },
                class: ['form-control', styles.classes.checkboxControl]    
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
                        checked: '$component.withSharedData'
                    }
                }),
                ' Shared with you'
            ])),
            span({
                dataBind: {
                    css: '$component.search.withPublicData() ? "' + styles.classes.activeFilterInput + '" : null'
                },
                class: ['form-control', styles.classes.checkboxControl]    
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
            span({
                style: {
                    fontWeight: 'bold',
                    color: 'gray',
                    marginTop: '8px',
                    fontSize: '80%'
                }
            }, 'Filters: '),
            buildSearchFilters(),
            
            div({
                style: {
                    display: 'inline-block',
                    marginLeft: '12px'
                }
            }, [
                label('Type '),
                utils.komponent({
                    name: 'reske-simple-search/type-filter-control',
                    params: {
                        search: 'search'
                    }
                })
            ])
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
            textAlign: 'left'
            // border: '1px blue dashed'
        },
        resultArea: {
            flex: '1 1 0px',
            // border: '1px green dotted',
            display: 'flex',
            flexDirection: 'column'
        },
        activeFilterInput: {
            // fontFamily: 'monospace',
            backgroundColor: 'rgba(209, 226, 255, 1)',
            color: '#000'
        },
        modifiedFilterInput: {
            // fontFamily: 'monospace',
            backgroundColor: 'rgba(255, 245, 158, 1)',
            color: '#000'
        },
        checkboxControl: {
            borderColor: 'transparent',
            boxShadow: 'none',
            margin: '0 2px'
        },
        historyContainer: {
            display: 'block',
            position: 'absolute',
            border: '1px silver solid',
            backgroundColor: 'rgba(255,255,255,0.9)',
            zIndex: '3',
            top: '100%',
            left: '0',
            right: '0'
        },
        historyItem: {
            css: {
                padding: '3px'
            },
            pseudo: {
                hover: {
                    backgroundColor: 'silver'
                }
            }
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
