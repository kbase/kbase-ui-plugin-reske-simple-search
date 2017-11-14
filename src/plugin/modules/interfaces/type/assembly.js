define([
    'numeral',
    './common'
], function (
    numeral,
    common
) {
    'use strict';

    function normalize(object) {
        object['assembly'] = {
            title: object.data.scientific_name || object.object_name,
            description: 'description here...',
            contigCount: object.data.contigs,
            dnaSize: object.data.dna_size,
            gcContent: object.data.gc_content,
            // contigCount: {
            //     value: object.data.contigs,
            //     formatted: common.padRight(numeral(object.data.contigs).format('0,0'), 2)
            // },
            // dnaSize: {
            //     value: object.data.dna_size,
            //     formatted: common.padRight(numeral(object.data.dna_size).format('0,0'), 2)
            // },
            externalSourceId: object.data.external_source_id,
            // gcContent: {
            //     value: object.data.gc_content,
            //     formatted: numeral(100 * object.data.gc_content).format('0.0')
            // },
            name: object.data.name
        };
    }

    function guidToReference(guid) {
        var m = guid.match(/^WS:(\d+)\/(\d+)\/(\d+)$/);
        var objectRef = m.slice(1, 4).join('/');
        return {
            workspaceId: m[1],
            objectId: m[2],
            objectVersion: m[3],
            ref: objectRef,
            dataviewId: objectRef
        };
    }

    return {
        normalize: normalize,
        guidToReference: guidToReference
    };
});