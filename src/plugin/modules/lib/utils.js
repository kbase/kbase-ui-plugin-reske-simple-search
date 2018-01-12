define([
], function (
) {
    'use strict';

    function getProp(obj, props, defaultValue, isMissing) {
        if (typeof props === 'string') {
            props = [props];
        }
        function getit(o, p) {
            if (p.length === 0) {
                return;
            }
            var value;
            if (o instanceof Array) {
                var index = parseInt(o.pop());
                if (isNaN(index)) {
                    return;
                }
                value = o[index];
            } else {
                value = o[p.pop()];
            }
            if (p.length === 0) {
                return value;
            }
            if (typeof value !== 'object') {
                return;
            }
            if (value === null) {
                return;
            }
            return getit(value, p);
        }
        for (var i = 0; i < props.length; i += 1) {
            var prop = props[i].split('.');
            var value = getit(obj, prop.reverse());
            if (value === undefined || (isMissing && isMissing(value))) {
                continue;
            }
            return value;
        }
        return defaultValue;
    }

    function hasProp(obj, props) {
        if (typeof props === 'string') {
            props = [props];
        }
        function getit(o, p) {
            if (p.length === 0) {
                return;
            }
            var value;
            if (o instanceof Array) {
                var index = parseInt(o.pop());
                if (isNaN(index)) {
                    return;
                }
                value = o[index];
            } else {
                value = o[p.pop()];
            }
            if (p.length === 0) {
                return value;
            }
            if (typeof value !== 'object') {
                return;
            }
            if (value === null) {
                return;
            }
            return getit(value, p);
        }
        for (var i = 0; i < props.length; i += 1) {
            var prop = props[i].split('.');
            var value = getit(obj, prop.reverse());
            if (value === undefined) {
                continue;
            }
            return true;
        }
        return false;
    }

   

    // deep equality comparison
    function isEqual(v1, v2) {
        function iseq(v1, v2) {
            var t1 = typeof v1;
            var t2 = typeof v2;
            if (t1 !== t2) {
                return false;
            }
            switch (t1) {
            case 'string':
            case 'number':
            case 'boolean':
                if (v1 !== v2) {
                    return false;
                }
                break;
            case 'undefined':
                if (t2 !== 'undefined') {
                    return false;
                }
                break;
            case 'object':
                if (v1 instanceof Array) {
                    if (v1.length !== v2.length) {
                        return false;
                    } else {
                        for (var i = 0; i < v1.length; i++) {
                            if (!iseq(v1[i], v2[i])) {
                                return false;
                            }
                        }
                    }
                } else if (v1 === null) {
                    if (v2 !== null) {
                        return false;
                    }
                } else if (v2 === null) {
                    return false;
                } else {
                    var k1 = Object.keys(v1);
                    var k2 = Object.keys(v2);
                    if (k1.length !== k2.length) {
                        return false;
                    }
                    for (var i = 0; i < k1.length; i++) {
                        if (!iseq(v1[k1[i]], v2[k1[i]])) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        return iseq(v1, v2);
    }

    function ReskeSearchError(code, message, detail, info) {
        this.code = code;
        this.message = message;
        this.detail = detail;
        this.info = info;
    }
    ReskeSearchError.prototype = Object.create(Error.prototype);
    ReskeSearchError.prototype.constructor = ReskeSearchError;
    ReskeSearchError.prototype.name = 'ReskeSearchError';

    return {
        getProp: getProp,
        hasProp: hasProp,
        isEqual: isEqual,
        ReskeSearchError: ReskeSearchError
    };
});
