define([
    'bluebird',
    'kb_common/jsonRpc/genericClient',
    'kb_service/utils',
    '../cacher'
], function (
    Promise,
    GenericClient,
    serviceUtils,
    Cacher
) {
    function factory(config) {
        var runtime = config.runtime;

        var userProfileService = new GenericClient({
            url: runtime.config('services.UserProfile.url'),
            module: 'UserProfile',
            token: runtime.service('session').getAuthToken()
        });

        var userCache = Cacher();

        function userQuery(userIds) {
            var resultsMap = {};
            var usersNeeded = [];

            userIds.forEach(function (userId) {
                if (userCache.has(userId)) {
                    resultsMap[userId] = userCache.get(userId);
                } else {
                    usersNeeded.push(userId);
                }
            });

            // Everything is cached?
            if (usersNeeded.length === 0) {
                return userIds.map(function (userId) {
                    return resultsMap[userId];
                });
            }

            // Otherwise bundle up the object id specs for one request.
            return userProfileService.callFunc('get_user_profile', [usersNeeded])
                .spread(function (users) {
                    users.forEach(function (userProfile, index) {
                        var userId = usersNeeded[index];
                        
                        // TODO: resolve this - duplicates appearing.
                        if (userCache.has(userId)) {
                            console.warn('Duplicate object detected: ' + ref);
                        } else {
                            userCache.add(userId, userProfile);
                        }
                        resultsMap[userId] = userProfile;
                    });
                    // unpack the results back into an array with the same shape.
                    // TODO: just accept a map, since we don't want duplicate refs anyway.
                    return userIds.map(function (userId) {
                        return resultsMap[userId];
                    });
                });
        }

        var queryFuns = {
            userProfile: userQuery
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