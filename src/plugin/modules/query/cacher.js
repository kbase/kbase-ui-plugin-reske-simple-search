define([], function () {
    function Cacher() {
        var cache = {};
        var cacheSize = 0;
        var maxSize = 200;
        var trimSize = 20;
        var maxAge = 60000;

        function add(key, value) {
            if (has(key)) {
                // throw new Error('Cache entry already exists for ' + key);
                console.warn('Cache entry already exists for key ' + key);
            }
            if (cacheSize >= maxSize) {
                trim();
            }
            cache[key] = {
                key: key,
                value: value,
                addedAt: new Date().getTime()
            };
            cacheSize += 1;
        }

        function has(key) {
            var item = cache[key];
            if (item === undefined) {
                return false;
            }
            var now = new Date().getTime();
            if ((now - item.addedAt) > maxAge) {
                delete cache[key];
                cacheSize -= 1;
                return false;
            }
            return true;
        }

        function get(key, defaultValue) {
            var item = cache[key];
            if (!item) {
                return defaultValue;
            }
            var now = new Date().getTime();
            if ((now - item.addedAt) > maxAge) {
                delete cache[key];
                cacheSize -= 1;
                return defaultValue;
            }
            return item.value;
        }

        function remove(key) {
            delete cache[key];
            cacheSize -= 1;
        }

        function trim() {
            // make list of all items
            var items = Object.keys(cache).map(function (key) {
                return cache[key];
            }).sort(function (a, b) {
                return (a.addedAt - b.addedAt);
            });

            if (items.length < trimSize) {
                return;
            }
            var toRemove = items.slice(0, trimSize);

            toRemove.forEach(function (item) {
                remove(item.key);
            });
        }

        function check() {
            var toRecache = [];
            var newCache = {};
            var now = new Date().getTime();
            Object.keys(cache).forEach(function (key) {
                var item = cache[key];
                if ((now - item.addedAt) > maxAge) {
                    return;
                }
                toRecache.push(item);
            });
            toRecache.forEach(function (item) {
                newCache[item.key] = item;
            });
            cacheSize = toRecache.length;
            cache = newCache;
        }

        function size() {
            return cacheSize;
        }

        return {
            add: add,
            get: get,
            has: has,
            remove: remove,
            check: check,
            size: size,
            trim: trim
        };
    }

    return Cacher;
});