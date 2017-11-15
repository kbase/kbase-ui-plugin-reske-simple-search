define([
    'bluebird',
    'kb_common/jsonRpc/genericClient',
    './rpc',
    './types',
    './utils',
    './timer',
    '../query/main'
], function (
    Promise,
    GenericClient,
    Rpc,
    Types,
    utils,
    Timer,
    QueryEngine
) {
    'use strict';

    var maxSearchResults = 10000;

    function factory (config) {
        var runtime = config.runtime;

        var rpc = Rpc.make({
            runtime: runtime
        });

        function objectSearch(param) {

            // var client = new GenericClient({
            //     url: runtime.config('services.reske.url'),
            //     module: 'KBaseRelationEngine',
            //     token: runtime.service('session').getAuthToken()
            // });
            var timer = Timer();
            timer.startTimer('search objects');
            // var start = new Date().getTime();
            return rpc.call('KBaseRelationEngine', 'search_objects', [param])
                .catch(function (err) {
                    if (/Result window is too large/.test(err.message)) {
                        throw new utils.ReskeSearchError(
                            'too-many-results',
                            'Too many results requested (exceeded max of 10,000)', 
                            err.message,
                            {
                                comment: 'This is an application error - should not appear in real life...',
                                originalError: err
                            }
                        );
                    } else {
                        throw new utils.ReskeSearchError(
                            'reskeSearchError', 
                            'Unknown error processing search',
                            err.message,
                            {
                                originalError: err
                            }
                        );
                    }

                    // arg.message(err.message);
                })          
                .then(function (result) {
                    // var finished = new Date().getTime();
                    timer.stopTimer('search objects');
                    timer.log();
                    // console.log('search_objects timing', finished - start);
                    var hits = result[0];

                    // Here we modify each object result, essentially normalizing
                    // some properties and adding ui-specific properties.
                    hits.objects.forEach(function (object, index) {
                        var type = Types.typeIt(object);
                        // object.type = type;
                        var typeDef = Types.typesMap[type];
                        object.type = typeDef;

                        // get the ref for this object from the guid.
                        var reference = typeDef.methods.guidToReference(object.guid);

                        object.dataList = Object.keys(object.data || {}).map(function (key) {
                            return {
                                key: key,
                                type: typeof object.data[key],
                                value: object.data[key]
                            };
                        });
                        object.parentDataList = Object.keys(object.parent_data || {}).map(function (key) {
                            return {
                                key: key,
                                type: typeof object.data[key],
                                value: object.data[key]
                            };
                        });
                        object.keyList = Object.keys(object.key_props || {}).map(function (key) {
                            return {
                                key: key,
                                type: typeof object.key_props[key],
                                value: object.key_props[key]
                            };
                        });

                        object.meta = {
                            workspace: reference,
                            ids: reference,
                            resultNumber: index + hits.pagination.start + 1
                        };
                    });

                    // We have just updated the objects inside of hits, so we just return hits itself.
                    return hits;
                });
        }

        var filter = {
            object_type: null,
            match_filter: {
                full_text_in_all: null,
                lookupInKeys: {}
            }
        };

        var currentSearch = {
            search: null,
            cancelled: false
        };

        function addStringSearch(keySearch, keySearchTerm) {
            var value = keySearch.fields.string_value();
            if (value) {
                if (value.length < 3) {
                // todo  this should be in the search keys list
                    return 'Sorry, the search term ' + keySearch.key + ' must be > 2 characters';
                } else {
                // TODO: ensure only one instance of a key search term
                // TODO: we must type the keys ...
                //   ... value is just for strings
                    keySearchTerm[keySearch.key] = {
                        value: value
                    };
                }
            }
        }

        function isEmpty(value) {
            return (value === undefined || value.length === 0);
        }

        // Note that RESKE uses "double" in the api, but otherwise refers to them as floats.
        function addFloatSearch(keySearch, keySearchTerm) {
            var value = keySearch.fields.float_value();
            var minValue = keySearch.fields.min_float();
            var maxValue = keySearch.fields.max_float();
            if (isEmpty(value) && isEmpty(minValue) && isEmpty(maxValue)) {
                return;
            }
            try {
                var searchTerm = {};
                var termSet = false;
                if (!isEmpty(value)) {
                    var floatValue = parseFloat(value);
                    if (isNaN(floatValue)) {
                        return 'Invalid exact float entry: ' + value;
                    }
                    searchTerm.double_value = floatValue;
                    termSet = true;
                }

                if (!(isEmpty(minValue))) {
                    var minFloatValue = parseFloat(minValue);
                    if (isNaN(minFloatValue)) {
                        return 'Invalid min float entry: ' + minValue;
                    }
                    searchTerm.min_double = minFloatValue;
                    termSet = true;
                }

                if (!isEmpty(maxValue)) {
                    var maxFloatValue = parseFloat(maxValue);
                    if (isNaN(maxFloatValue)) {
                        return 'Invalid max float entry: ' + value;
                    }
                    searchTerm.max_double = maxFloatValue;
                    termSet = true;
                }
                if (termSet) {
                    keySearchTerm[keySearch.key] = searchTerm;
                }
            } catch (ex) {
                return ex.message;
            }
        }

        function addIntegerSearch(keySearch, keySearchTerm) {
            var value = keySearch.fields.int_value();
            var minValue = keySearch.fields.min_int();
            var maxValue = keySearch.fields.max_int();
            if (isEmpty(value) && isEmpty(minValue) && isEmpty(maxValue)) {
                return;
            }
            try {
                var searchTerm = {};
                var termSet = false;
                if (!isEmpty(value)) {
                    var intValue = parseInt(value);
                    if (isNaN(intValue)) {
                        return 'Invalid exact integer entry: ' + value;
                    }
                    searchTerm.int_value = intValue;
                    termSet = true;
                }

                if (!(isEmpty(minValue))) {
                    var minIntValue = parseInt(minValue);
                    if (isNaN(minIntValue)) {
                        return 'Invalid min integer entry: ' + minValue;
                    }
                    searchTerm.min_int = minIntValue;
                    termSet = true;
                }

                if (!isEmpty(maxValue)) {
                    var maxIntValue = parseInt(maxValue);
                    if (isNaN(maxIntValue)) {
                        return 'Invalid max integer entry: ' + maxValue;
                    }
                    searchTerm.max_int = maxIntValue;
                    termSet = true;
                }
                if (termSet) {
                    keySearchTerm[keySearch.key] = searchTerm;
                }
            } catch (ex) {
                return ex.message;
            }
        }

        /*
        arg is a vm:
        status()
        pageStart()
        pageSize()


        return is
        status:
        total:
        error: 
        message:
        */
        function executeSearch(arg) {
            return Promise.try(function () {
                // Search cancellation
                if (currentSearch.search) {
                    console.warn('cancelling search...');
                    currentSearch.search.cancel();
                    currentSearch.cancelled = true;
                }
                currentSearch = {
                    search: null,
                    cancelled: false
                };
                var thisSearch = currentSearch;

                arg.status('setup');

                var param = {
                    // object_type: 'narrative',
                    // match_filter: {
                    //     full_text_in_all: searchInput(),
                    // },
                    match_filter: {},
                    pagination: {
                        start: (arg.page - 1) * arg.pageSize || 0,
                        count: arg.pageSize
                    },
                    post_processing: {
                        ids_only: 0,
                        skip_info: 0,
                        skip_keys: 0,
                        skip_data: 0
                    },
                    access_filter: {
                        with_private: arg.withPrivateData ? 1 : 0, 
                        with_public: arg.withPublicData ? 1 : 0
                    },
                    sorting_rules: arg.sortingRules || {}
                };
                var newFilter = {
                    object_type: null,
                    match_filter: {
                        full_text_in_all: null,
                    }
                };

                if (arg.typeFilter.length > 0) {
                    newFilter.object_type = arg.typeFilter[0];
                }

                // Free text search
                var freeTextTerm = arg.query;
                var allowMatchAll = false;
                if (freeTextTerm && freeTextTerm.length > 0) {
                    if (freeTextTerm.length < 3) {
                        if (freeTextTerm === '*') {
                            newFilter.match_filter.full_text_in_all = null;
                            allowMatchAll = true;
                        } else {
                            // todo this message should be beneath the free text search input
                            arg.message('Sorry, the search term must be > 2 characters');
                        }
                    } else {
                        newFilter.match_filter.full_text_in_all = freeTextTerm;
                    }
                }

                // KEY SEARCHES DISABLED FOR NOW
                // Key search
                // one search term per key
                // keys derived from the type
                // can only search on keys when there is an object type
                var keySearchTerm = {};
                var error;
                // if (objectType()) {
                //     newFilter.object_type = objectType();
                //     if (keySearches().length > 0) {
                //         keySearches().forEach(function (keySearch, index) {
                //             // Need to inspect each one based on the type... wow.
                //             switch (keySearch.type) {
                //             case 'string':
                //                 var error = addStringSearch(keySearch, keySearchTerm);
                //                 if (error) {
                //                     message(error);
                //                 }
                //                 break;
                //             case 'integer':
                //                 error = addIntegerSearch(keySearch, keySearchTerm);
                //                 if (error) {
                //                     message(error);
                //                 }
                //                 break;
                //             case 'float':
                //                 error = addFloatSearch(keySearch, keySearchTerm);
                //                 if (error) {
                //                     message(error);
                //                 }
                //                 break;
                //                 // TODO: implement the other types!
                //             }
                //
                //         });
                //         newFilter.match_filter.lookupInKeys = keySearchTerm;
                //     }
                // }

                // If there are no search terms at all, we just reset
                // the search.
                if (!newFilter.match_filter.full_text_in_all ) {                    
                    if (newFilter.match_filter.full_text_in_all === null && allowMatchAll) {
                        // let it pass
                    } else {
                        console.warn('object search called with no query');
                        arg.searchTotal(0);
                        arg.actualSearchTotal(0);
                        arg.searchResults.removeAll();
                        arg.status('needinput');
                        arg.message('No input');
                        return;
                    }
                }

                // Compare old and new filter.
                // If we have a filter change, we need to reset the page start.
                // if (JSON.stringify(filter) !== JSON.stringify(newFilter)) {
                //     arg.pageStart(0);
                // }

                filter = newFilter;
                param.object_type = filter.object_type;
                param.match_filter = filter.match_filter;

                arg.status('searching');
                arg.message('Searching...');

                var start = new Date().getTime(), startSlather;

                currentSearch.search = objectSearch(param)
                    .then(function (result) {
                        startSlather = new Date().getTime();
                        return slatherFromWorkspace(result);
                    })
                    .then(function (result) {
                        return slatherFromUserProfiles(result);
                    })
                    .then(function (result) {
                        return processResult(result);
                    })
                    .then(function (hits) {
                        var finished = new Date().getTime();
                        console.log('search timings', startSlather - start, finished - startSlather);
                        if (thisSearch.cancelled) {
                            console.warn('ignoring cancelled request');
                            return null;
                        }

                        arg.searchResults.removeAll();

                        if (hits.objects.length === 0) {
                            arg.status('noresults');
                            arg.searchTotal(0);
                            arg.actualSearchTotal(0);
                            arg.message('Found nothing');
                            return;
                        }
                        arg.message('Found ' + hits.total + ' items');

                        hits.objects.forEach(function (object, index) {
                            arg.searchResults.push(object);
                        });
                        arg.status('haveresults');
                        // arg.actualSearchTotal(hits.total);
                        // if (hits.total > maxSearchResults) {
                        //     arg.searchTotal(maxSearchResults);
                        // } else {
                        //     arg.searchTotal(hits.total);
                        // }
                        if (hits.total > maxSearchResults) {
                            arg.actualSearchTotal(hits.total);
                            var actualMax = arg.pageSize * Math.floor(maxSearchResults/arg.pageSize);
                            arg.searchTotal(actualMax);
                            // addMessage({
                            //     type: 'warning',
                            //     message: 'Too many search results (' + result.total + '), restricted to 10,000'
                            // });
                        } else {
                            arg.actualSearchTotal(hits.total);
                            arg.searchTotal(hits.total);
                        }
                    })
                    // .catch(function (err) {
                    //     console.error('error', err);
                    //     throw new utils.ReskeSearchError('reske-'
                    //     arg.message(err.message);
                    // })
                    .finally(function () {
                        if (thisSearch && thisSearch.search.isCancelled()) {
                            console.warn('search cancelled');
                        }
                        thisSearch = null;
                        currentSearch = {
                            search: null,
                            cancelled: false
                        };
                        //searching(false);
                    });
                return currentSearch.search;
            });
        }
    
        function canRead(perm) {
            return (perm !== 'n');
        }
    
        function canWrite(perm) {
            switch (perm) {
            case 'w':
            case 'a':
                return true;
            }
            return false;
        }
    
        function canShare(perm) {
            return (perm === 'a');
        }

        function normalizeToType(object, runtime) {
            var typeDef = Types.typesMap[object.type.id];
            if (typeDef.methods && typeDef.methods.normalize) {
                return typeDef.methods.normalize(object, { runtime: runtime });
            }
        }

        function getTypeIcon(object, options) {
            var typeId = object.currentObjectInfo.type;
            var type = options.runtime.service('type').parseTypeId(typeId);
            return options.runtime.service('type').getIcon({ type: type });
        }

        // At the moment, this must come after the workspace slathering, because the 
        // object owners are not reliably in search results.
        function slatherFromUserProfiles(searchResult) {
            var timer = Timer();
            timer.startTimer('get user profiles');
            var queryEngine = QueryEngine.make({
                runtime: runtime
            });
            return queryEngine.start()
                .then(function () {
                    var foundObjects = searchResult.objects;
                    if (foundObjects.length === 0) {
                        return searchResult;
                    }

                    // Loop through the results picking up the object owner into an array.
                    var owners = foundObjects.reduce(function (accum, object) {
                        var owner = object.workspaceInfo.owner;
                        accum[owner] = true;
                        return accum;
                    }, {});

                    return queryEngine.query({
                        userProfile: {
                            query: {
                                userProfile: Object.keys(owners).map(function (key) { return key; })
                            }
                        }
                    })
                        .then(function (result) {
                            // let the slathering begin!
                            var profiles = result.userProfile.userProfile;
                            var profileMap = profiles.reduce(function (accum, profile) {
                                accum[profile.user.username] = profile;
                                return accum;
                            }, {});
                            searchResult.objects.forEach(function (object) {
                                var profile = profileMap[object.workspaceInfo.owner];
                                object.ownerProfile = profile;
                            });
                        })
                        .then(function () {
                            timer.stopTimer('get user profiles');
                            timer.log();
                            return searchResult;
                        });
                });
        }

        function slatherFromWorkspace(searchResult) {
            var queryEngine = QueryEngine.make({
                runtime: runtime
            });
            var timer = Timer();
            timer.startTimer('get workspace and object info');
            return queryEngine.start()
                .then(function () {
                    var foundObjects = searchResult.objects;
                    if (foundObjects.length === 0) {
                        return searchResult;
                    }

                    // wrap in a workspace call to get workspace and object info for each narrative.                   

                    var originalObjectSpecs = foundObjects.map(function (object) {
                        var spec = {
                            wsid: object.meta.workspace.workspaceId,
                            objid: object.meta.workspace.objectId,
                            ver: 1
                        };
                        var ref = [spec.wsid, spec.objid, spec.ver].join('/');
                        return {
                            spec: spec,
                            ref: ref
                        };
                    });

                    var currentObjectSpecs = foundObjects.map(function (object) {
                        var spec = {
                            wsid: object.meta.workspace.workspaceId,
                            objid: object.meta.workspace.objectId,
                            ver: object.meta.workspace.objectVersion
                        };
                        var ref = [spec.wsid, spec.objid, spec.ver].join('/');
                        return {
                            spec: spec,
                            ref: ref
                        };
                    });

                    var allObjectSpecs = {};
                    originalObjectSpecs.forEach(function (spec) {
                        allObjectSpecs[spec.ref] = spec;
                    });
                    currentObjectSpecs.forEach(function (spec) {
                        allObjectSpecs[spec.ref] = spec;
                    });

                    var uniqueWorkspaces = Object.keys(foundObjects.reduce(function (acc, object) {
                        var workspaceId = object.meta.workspace.workspaceId;
                        acc[String(workspaceId)] = true;
                        return acc;
                    }, {})).map(function (id) {
                        return parseInt(id);
                    });

                    // TODO: combine original and current objec specs -- for some objects they will
                    // be the same. This is not just for efficiency, but because the object queries
                    // with otherwise trip over each other. After the objectquery, the results can 
                    // be distributed back to the original and current object groups.

                    return queryEngine.query({
                        workspace: {
                            query: {
                                objectInfo: Object.keys(allObjectSpecs).map(function (key) { return allObjectSpecs[key]; }),
                                workspaceInfo: uniqueWorkspaces
                            }
                        }
                    })
                        .then(function (result) {
                            var allObjectsInfo = result.workspace.objectInfo;
                            var workspacesInfo = result.workspace.workspaceInfo;

                            // back to a map!
                            var allObjectsInfoMap = {};
                            allObjectsInfo.forEach(function (objectInfo) {
                                allObjectsInfoMap[objectInfo.ref] = objectInfo;
                            });

                            foundObjects.forEach(function (object, i) {
                                object.originalObjectInfo = allObjectsInfoMap[originalObjectSpecs[i].ref];
                                object.currentObjectInfo = allObjectsInfoMap[currentObjectSpecs[i].ref];

                                // Incorporate workspace info                                

                                // NB workspaceQuery returns a map of String(workspaceId) -> workspaceInfo
                                // This is not symmetric with the input, but it is only used here, and we 
                                // do eventually need a map, and internally workspaceQuery accumulates the
                                // results into a map, so ...
                                object.workspaceInfo = workspacesInfo[String(object.meta.workspace.workspaceId)];
                            });
                        })
                        .then(function () {
                            timer.stopTimer('get workspace and object info');
                            timer.log();
                            return searchResult;
                        });
                });
        }

        function processResult(searchResult) {
            searchResult.objects.forEach(function (object, i) {
                var username = runtime.service('session').getUsername();

                // also patch up the narrative object...
                object.meta.owner = object.workspaceInfo.owner;                            
                
                object.meta.isPublic = (object.workspaceInfo.globalread === 'r');
                object.meta.isOwner = (object.meta.owner === username);
                // set sharing info.
                if (!object.meta.isOwner && !object.meta.isPublic) {
                    object.meta.isShared = true;
                } else {
                    object.meta.isShared = false;
                }
                object.meta.canRead = canRead(object.workspaceInfo.user_permission);
                object.meta.canWrite = canWrite(object.workspaceInfo.user_permission);
                object.meta.canShare = canShare(object.workspaceInfo.user_permission);

                if (object.currentObjectInfo.notfound) {
                    // Bail early if the object info reveals that it has been deleted.
                    object.simpleBrowse = {
                        narrativeTitle: {
                            value: null
                        },
                        objectName: {
                            value: '* DELETED *'
                        },
                        type: {
                            value: null
                        },
                        date: {
                            value: null
                        },
                        owner: {
                            value: null
                        },
                        shared: {
                            value: null
                        }
                    };
                    return;
                }

                object.meta.updated = {
                    by: object.currentObjectInfo.saved_by,
                    at: new Date(object.currentObjectInfo.saveDate)
                };
                object.meta.created = {
                    by: object.originalObjectInfo.saved_by,
                    at: new Date(object.originalObjectInfo.saveDate)
                };

                // This may be a narrative or a reference workspace.
                // We get this from the metadata.
                if (object.workspaceInfo.metadata.narrative) {
                    var narrativeTitle, narrativeId, narrativeUrl;
                    if (!object.workspaceInfo.metadata.narrative_nice_name) {
                        if (object.workspaceInfo.metadata.is_temporary === 'true') {
                            narrativeTitle = '* TEMPORARY *';
                        } else {
                            narrativeTitle = '* MISSING *';
                        }           
                    } else {
                        narrativeTitle = object.workspaceInfo.metadata.narrative_nice_name;
                        narrativeId = 'ws.' + object.workspaceInfo.id +
                        '.obj.' + object.workspaceInfo.metadata.narrative;
                        narrativeUrl = runtime.config('services.narrative.url') + '/narrative/' + narrativeId;
                    }
                   
                    object.context = {
                        type: 'narrative',
                        narrativeTitle: narrativeTitle,
                        narrativeId: narrativeId,
                        narrativeUrl: narrativeUrl
                    };
                } else if (object.workspaceInfo.name === 'KBaseExampleData') {
                    object.context = {
                        type: 'exampleData'
                    };
                } else if (object.originalObjectInfo.metadata.Source) {
                    // If we have a Source property, chances are it is from a
                    // reference workspace.
                    object.context = {
                        type: 'reference',
                        workspaceName: object.workspaceInfo.name,
                        source: object.currentObjectInfo.metadata.Source,
                        sourceId: object.currentObjectInfo.metadata['Source ID'],
                        accession: object.currentObjectInfo.metadata.accession
                    };
                    // TODO: don't reference workspaces have some metadata to describe
                } else {
                    object.context = {
                        type: 'unknown',
                        workspaceName: object.workspaceInfo.name
                    };
                }

                object.typeIcon = getTypeIcon(object, { runtime: runtime });

                var objectName, objectRef;
                if (object.type.id !== 'narrative') {
                    objectName = object.currentObjectInfo.name;
                    objectRef = object.currentObjectInfo.ref;
                } 

                normalizeToType(object, runtime);

                var shared;
                if (object.meta.isOwner) {
                    shared = 'owner';
                } else if (object.meta.isShared) {
                    shared = 'shared';
                } else if (object.meta.isPublic) {
                    shared = 'public';
                }

                var ownerName;
                if (object.ownerProfile.user.username === username) {
                    ownerName = 'you';
                } else {
                    ownerName = object.ownerProfile.user.realname;
                }

                object.simpleBrowse = {
                    narrativeTitle: {
                        value: object.context.narrativeTitle || '-',
                        info: 'The narrative',
                        url: object.context.narrativeUrl
                    },
                    objectName: {
                        value: objectName || '-',
                        info: 'The name of the object',
                        url: objectRef ? '#dataview/' + objectRef : null
                    },
                    type: {
                        value: object.type.kbaseTypeId,
                        info: 'This is an object of type ' + object.type
                    },
                    date: {
                        value: object.timestamp,
                        info: 'The date this object was last saved'
                    },
                    owner: {
                        value: ownerName,
                        info: 'The owner of the Narrative in which this object is located',
                        url: '#people/' + object.ownerProfile.user.username
                    },                                   
                    shared: {
                        value: shared,
                        info: 'How are you getting access to this object?'
                    }
                };

                
            });
            return searchResult;
        }

        return {
            executeSearch: executeSearch,
            slatherFromWorkspace: slatherFromWorkspace
        };
    }

    return {
        make: factory
    };
});
