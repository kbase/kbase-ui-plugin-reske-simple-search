define([
    'bluebird',
    'kb_common/jsonRpc/genericClient',
    'kb_service/utils',
    '../../types',
    '../cacher'
], function (
    Promise,
    GenericClient,
    serviceUtils,
    Types,
    Cacher
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;

        function searchTypes(runtime, searchTerm, withPublic, withPrivate) {

            // With an empty search term, we simply reset the current search results.
            // The default behaviour would be to return all available items.
            if (!searchTerm || searchTerm.length === 0) {
                return Promise.try(function () {
                    var hits = Types.types.map(function (type) {
                        return {
                            type: type.id,
                            title: type.label,
                            hitCount: null
                        };
                    });
                    return {
                        hits: hits,
                        elapsed: 0
                    };
                });
            }

            var client = new GenericClient({
                url: runtime.config('services.reske.url'),
                module: 'KBaseRelationEngine',
                token: runtime.service('session').getAuthToken()
            });

            var param = self.searchTypesInput = {
                match_filter: {
                    full_text_in_all: searchTerm
                },
                access_filter: {
                    with_private: withPrivate ? 1 : 0,
                    with_public: withPublic ? 1 : 0
                }
            };

            return client.callFunc('search_types', [param])
                .then(function (result) {
                    var searchResult = result[0];
                    var hits = Types.types.map(function (type) {
                        var hitCount = searchResult.type_to_count[type.kbaseTypeId] || 0;
                        return {
                            type: type.id,
                            title: type.label,
                            hitCount: hitCount
                        };
                    });
                    return {
                        hits: hits,
                        elapsed: searchResult.search_time
                    };
                });
        }
        var queryFuns = {
            searchTypes: searchTypes
                // searchObjects: searchObjects
        };

        function query(spec) {
            // We operate over a flattened array of queries.
            var queryMap = {};
            Object.keys(spec).forEach(function (queryKey) {
                var queryInput = spec[queryKey];
                var queryFun = queryFuns[queryKey];
                if (!queryFun) {
                    throw new Error('Sorry, query method not supported: ' + queryKey);
                }
                queryMap[queryKey] = queryFun(queryInput);
            });
            return Promise.props(queryMap);
        }

        return {
            query: query
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };

});