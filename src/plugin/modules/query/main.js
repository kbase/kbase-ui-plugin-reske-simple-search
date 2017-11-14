define([
    'require',
    'bluebird',
], function (
    localRequire,
    Promise
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;

        var defaultQuerySpecs = [{
            name: 'workspace',
            module: './handlers/workspace'
        }, {
            name: 'userProfile',
            module: './handlers/userProfile'
        }];
        var queryRegistry = {};

        function addQueryHandler(querySpec) {
            return new Promise(function (resolve, reject) {
                localRequire([querySpec.module], function (Module) {
                    var queryHandler = Module.make({
                        runtime: runtime
                    });
                    if (queryRegistry[querySpec.name]) {
                        reject(new Error('query already registered: ' + querySpec.name));
                        return;
                    }
                    queryRegistry[querySpec.name] = queryHandler;
                    resolve();
                }, function (err) {
                    reject(err);
                });
            });
        }

        function start() {
            return Promise.all(defaultQuerySpecs.map(function (querySpec) {
                return addQueryHandler(querySpec);
            }));
        }

        function query(specs) {
            // We operate over a flattened array of queries.
            // Each top level query property is a main query entrypoint
            var queryMap = {};
            Object.keys(specs).forEach(function (key) {
                var spec = specs[key];
                var handler = queryRegistry[key];
                if (!handler) {
                    throw new Error('Unknown query: ' + key);
                }

                queryMap[key] = handler.query(spec.query);
            });
            return Promise.props(queryMap);
        }

        return {
            start: start,
            stop: stop,
            query: query
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});