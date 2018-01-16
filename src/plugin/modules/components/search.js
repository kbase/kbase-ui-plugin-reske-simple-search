define([
    'knockout-plus',
    'bluebird',
    'kb_common/html',
    'kb_common/ui',
    './typeFilterControl',
    './browser',
    './searchBar'
], function (
    ko,
    Promise,
    html,
    ui,
    TypeFilterControl,
    BrowserComponent,
    SearchBarComponent
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
        // var searchInput = params.search.searchInput;
        var searchResults = params.search.searchResults;
        var searchTotal = params.search.searchTotal;
        var searching = params.search.searching;
        var pageSize = params.search.pageSize;
        var page = params.search.page;

        // just parked here for now until supported in RESKE
        var withSharedData = ko.observable(true);

        // This is the obervable in the actual search input.
        var searchControlValue = ko.observable();

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
        };
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

    function buildInputArea() {
        return ko.kb.komponent({
            name: SearchBarComponent.name(),
            params: {
                search: 'search'
            }
        });
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
                ko.kb.komponent({
                    name: TypeFilterControl.name(),
                    params: {
                        search: 'search'
                    }
                })
            ])
        ]);
    }

    function buildResultsArea() {
        return ko.kb.komponent({
            name: BrowserComponent.name(),
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
    return ko.kb.registerComponent(component);
});
