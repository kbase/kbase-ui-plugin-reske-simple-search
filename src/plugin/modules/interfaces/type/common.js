define([
    'kb_common/html',
], function (
    html
) {
    'use strict';

    var t = html.tag,
        span = t('span');

    /*
        padRight pads the string to the right in order to have size 
        characters after the decimal place. If no decimal place, imagine.
    */
    function padRight(s, size) {
        // how many spaces now.
        var dotPos = s.lastIndexOf('.');
        var len;
        if (dotPos >= 0) {
            len = size - (s.length - dotPos);
            if (len <= 0) {
                return s;
            }
        } else {
            len = size;
        }
        var i;
        var pad = '';
        for (i = 0; i < len; i += 1) {
            pad += span({
                style: {
                    visibility: 'hidden'
                }
            }, '0');
        }
        return s + pad;
    }

    return {
        padRight: padRight
    };
});