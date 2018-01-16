/*
Top level panel for  search
*/
define([
    // global deps
    'bluebird',
    'knockout-plus',
    'numeral',
    'marked',
    // kbase deps
    'kb_common/html',
    // local deps
    '../lib/utils',
    '../lib/objectSearch',
    './searchError',
    './sharedIcon',
    './search'
], function (
    Promise,
    ko,
    numeral,
    marked,
    html,
    utils,
    ObjectSearch,
    SearchErrorComponent,
    SharedIconComponent,
    SearchComponent
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function viewModel(params) {
        var runtime = params.runtime;

        var overlayComponent = ko.observable();
        var showOverlay = ko.observable();

        showOverlay.subscribe(function (newValue) {
            overlayComponent(newValue);
        });

        var objectSearch = ObjectSearch.make({
            runtime: runtime
        });

            // Primary user input.
        var searchInput = ko.observable();
        searchInput.extend({
            rateLimit: {
                timeout: 300,
                method: 'notifyWhenChangesStop'
            }
        });

        // Set of object types to show
        var typeFilter = ko.observableArray();
        var typeFilterOptions = [{
            label: 'Narrative',
            value: 'narrative',
            count: ko.observable()
        }, {
            label: 'Genome',
            value: 'genome',
            count: ko.observable()
        }, {
            label: 'Assembly',
            value: 'assembly',
            count: ko.observable()
        }, {
            label: 'Paired-End Read',
            value: 'pairedendlibrary',
            count: ko.observable()
        }, {
            label: 'Single-End Read',
            value: 'singleendlibrary',
            count: ko.observable()
        }].map(function (item) {
            item.enabled = ko.pureComputed(function () {
                return typeFilter().indexOf(item.value) === -1;
            });
            return item;
        });

        var searchResults = ko.observableArray();
        var searchTotal = ko.observable();
        var actualSearchTotal = ko.observable();
        var searchElapsed = ko.observable();
        var searching = ko.observable();
        var userSearch = ko.observable();
        var availableRowHeight = ko.observable();

        var page = ko.observable();

        // Page size, the number of rows to show, is calcuated dynamically
        var pageSize = ko.observable();

        var withPrivateData = ko.observable(true);
        var withPublicData = ko.observable(true);

        // UI BITS
        var status = ko.observable();
        var error = ko.observable();

        // SOMEbody needs to figure out the new page size
        // and adjust the current page. We want to 
        // preserve the position within the search result space
        // as much as possible.
        // If this were scrolling, without pages, the job would be much easier,
        // we could simply keep the same exact starting result item.
        // In this approach we'll need to ensure that the first result
        // item in the page is still visible, but it might shift down the
        // page a bit.
        pageSize.subscribeChanged(function (newValue, oldValue) {
            var currentPage = page();

            if (!currentPage) {
                return;
            }

            var newPage = Math.floor((currentPage - 1) * oldValue / newValue) + 1;
            page(newPage);
        });

        var searchStack = [];
        var searchMap = {};
        function doSearch(params) {
            var searchId;
            // console.log('doSearch', searchStack,length, Object.keys(searchMap).length);
            Promise.try(function () {
                searching(true);
            })
                .then(function () {
                    // If the query is empty, we simply reset the search.
                    if (!params.query) {
                        console.warn('search called with no query - resetting search');
                        searchTotal(0);
                        actualSearchTotal(0);
                        searchResults.removeAll();
                        status('needinput');
                        return true;
                    }

                    // Other search string validation and reformatting could be done here...

                    
                    // Ignore an identitical search. This can happen, although it
                    // shouldn't with churn in ...
                    // console.log('searching with...', params);
                    if (searchStack.length) {
                        var lastSearchId = searchStack[searchStack.length-1];
                        var lastSearch = searchMap[lastSearchId];
                        if (utils.isEqual(params, lastSearch.params)) {
                            console.warn('skipping search - identical to previous pending');
                            return false;
                        }
                    }

                    searchId = html.genId();
                    searchMap[searchId] = {
                        params: params                    
                    };
                    searchStack.push(searchId);
                    
                    return Promise.all([
                        objectSearch.executeSearch({
                            pageSize: params.pageSize,
                            page: params.page,
                            query: params.query,
                            withPrivateData: params.withPrivateData,
                            withPublicData: params.withPublicData,
                            typeFilter: params.typeFilter,
                            sortingRules: params.sortingRules,

                            status: status,
                            // searchExpression: searchExpression,
                            searchTotal: searchTotal,
                            actualSearchTotal: actualSearchTotal,
                            searchResults: searchResults
                        }),
                        objectSearch.searchAllTypes({
                            query: params.query,
                            withPrivateData: params.withPrivateData,
                            withPublicData: params.withPublicData
                        })
                    ])
                        .spread(function (results, summary) {
                            // TODO: process the results here rather than inside executeSearch!
                            typeFilterOptions.forEach(function (option) {
                                option.count(summary.typeToCount[option.value]);
                            });
                            return true;                     
                        });
                })
                .then(function (searched) {
                    if (searched) {
                        searching(false);
                    }
                })
                .catch(function (err) {
                    searching(false);
                    console.error('ERROR', err);                
                    if (err instanceof utils.ReskeSearchError) {
                        error({
                            code: err.code,
                            message: err.message,
                            detail: err.detail,
                            info: err.info
                        });
                    } else if (err instanceof Error) {
                        error({
                            code: 'error',
                            message: err.name + ': ' + err.message,
                            detail: 'trace here',
                            info: {
                                stackTrace: err.stack.split('\n')
                            }
                        });
                    } else {
                        error({
                            code: 'unknown',
                            message: err.message,
                            detail: '',
                            info: err
                        });
                    }
                    showOverlay({
                        name: SearchErrorComponent.name(),
                        type: 'error',
                        params: {
                            type: '"error"',
                            hostVm: 'search'
                        }
                    });
                })
                .finally(function (value) {
                    // if (!thisSearch.cancelled) {
                    //     searching(false);
                    // }
                    // console.log('finally value', value);
                    // searching(false);
                    if (searchId) {
                        if (searchMap[searchId]) {
                            delete searchMap[searchId];
                            searchStack = searchStack.filter(function (id) {
                                return (id !== searchId);
                            });
                        } else {
                            console.error('search id not found!', searchId, searchStack);
                        }
                    }
                });
        }

        var sortingRules = ko.observableArray();
        function sortBy(sortSpec) {
            var sortRule = {
                is_timestamp: sortSpec.isTimestamp ? 1 : 0,
                is_object_name: sortSpec.isObjectName ? 1 : 0,
                key_name: sortSpec.keyName,
                descending: sortSpec.direction() === 'descending' ? 1 : 0
            };
            sortingRules.removeAll();
            sortingRules.push(sortRule);
        }

        var searchQuery = ko.pureComputed(function () {
            return searchInput();
        });

        searchQuery.subscribe(function () {
            // reset the page back to 1 because we do not konw if the
            // new search will extend this far.
            if (!page()) {
                page(1);
            } else if (page() > 1) {
                page(1);
            }
        });

        // Gather all search parameters into one computed object.

        var searchParams = ko.pureComputed(function () {
            return {
                query: searchQuery(),
                withPrivateData: withPrivateData(),
                withPublicData: withPublicData(),
                typeFilter: typeFilter(),
                page: page(),
                pageSize: pageSize(),
                sortingRules: sortingRules()
            };
        });

        var searchInputs = ko.pureComputed(function () {
            return {
                query: searchQuery(),
                withPrivateData: withPrivateData(),
                withPublicData: withPublicData(),
                typeFilter: typeFilter()
            };
        });

        searchInputs.subscribe(function () {
            page(1);
            doSearch(searchParams());
        });

        // Search paging is separated from the input parameters because the input parameters will
        // probably change the search space, the paging and sorting inputs don't.
        var searchPaging = ko.pureComputed(function () {
            return {
                page: page(),
                pageSize: pageSize(),
                sortingRules: sortingRules()
            };
        });

        searchPaging.subscribe(function () {
            doSearch(searchParams());
        });

        function refreshSearch() {
            doSearch(searchParams());
        }

        // TRY COMPUTING UBER-STATE
        var searchState = ko.pureComputed(function () {
            // console.log('search state calc...', searching());
            if (searching()) {
                return 'inprogress';
            }

            if (searchParams().query) {
                if (!pageSize()) {
                    return 'pending';
                }
                if (searchResults().length === 0) {
                    return 'notfound';
                } else {
                    return 'success';
                }
            } else {
                return 'none';
            }
        });

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
                style: {

                },
                action: {
                    // fn: doOpenNarrative
                    link: 'url'
                }
            },
            {
                name: 'narrativeVersion',
                label: 'Ver',
                type: 'number',
                format: '0,0',
                width: 5
            },
            {
                name: 'type',
                label: 'Type',
                type: 'string',
                width: 12
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
                format: 'nice-elapsed',
                sort: {
                    keyName: 'date',
                    isTimestamp: true,
                    isObject: false,
                    direction: ko.observable('descending'),
                    active: ko.observable(true)
                },
                width: 10
            },
            {
                name: 'owner',
                label: 'Owner',
                type: 'string',
                width: 12,
                action: {
                    fn: doOpenProfile
                }
            },
            {
                name: 'shared',
                label: 'Shared',
                type: 'string',
                width: 8,
                component: SharedIconComponent.name(),
                headerStyle: {
                    textAlign: 'center'
                },
                rowStyle: {
                    textAlign: 'center'
                }
            }           
        ];

        // ensure that the initial sorting rules reflect the initial column configuration.
        columns.forEach(function (column) {
            if (column.sort && column.sort.active()) {
                sortBy(column.sort);
            }
        });

        var vm = {
            search: {
                // INPUTS
                searchInput: searchInput,
                // typeFilterInput: typeFilterInput,
                typeFilter: typeFilter,
                typeFilterOptions: typeFilterOptions,
                withPrivateData: withPrivateData,
                withPublicData: withPublicData,

                // SYNTHESIZED INPUTS
                searchQuery: searchQuery,
                searchState: searchState,

                // RESULTS
                searchResults: searchResults,
                searchTotal: searchTotal,
                actualSearchTotal: actualSearchTotal,
                searchElapsed: searchElapsed,
                searching: searching,
                userSearch: userSearch,
                status: status,

                // Sorting
                sortBy: sortBy,

                // computed
                availableRowHeight: availableRowHeight,
                pageSize: pageSize,

                // Note, starts with 1.
                page: page,

                refreshSearch: refreshSearch,
                showOverlay: showOverlay,
                error: error,

                columns: columns
            },
            overlayComponent: overlayComponent
        };

        return vm;
    }

    function template() {
        return div({
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '12px',
                paddingLeft: '12px'
            }
        }, [
            ko.kb.komponent({
                name: SearchComponent.name(),
                params: {
                    search: 'search'
                }
            }),
            ko.kb.komponent({
                name: 'generic/overlay-panel-bootstrappish',
                params: {
                    component: 'overlayComponent',
                    hostVm: 'search'
                }
            })
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
