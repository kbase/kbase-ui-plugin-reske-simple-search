define([
    'numeral',
    './common'
], function (
    numeral,
    common
) {
    'use strict';

    function normalize(object) {
        object['assemblyContig'] = {
            title: null || object.object_name,
            description: object.data.description,
            contigId: object.data.contig_id,
            length: {
                value: object.data.length,
                formatted: common.padRight(numeral(object.data.contigs).format('0,0'), 4)
            },
            gcContent: {
                value: object.data.gc_content,
                formatted: common.padRight(numeral(100 * object.data.gc_content).format('0.000'))
            }
        };
    }

    function guidToReference(guid) {
        var m = guid.match(/^WS:(\d+)\/(\d+)\/(\d+):contig\/(.*)$/);
        var objectRef = m.slice(1, 4).join('/');
        return {
            workspaceId: m[1],
            objectId: m[2],
            objectVersion: m[3],
            ref: objectRef,
            feature: m[4],
            dataviewId: objectRef
        };
    }

    return {
        normalize: normalize,
        guidToReference: guidToReference
    };
});