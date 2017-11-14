define([
    'numeral',
    './common'
], function (
    numeral,
    common
) {
    'use strict';

    function normalize(object) {
        var taxonomy;

        if (object.data.taxonomy) {
            var sep;
            if (object.data.taxonomy.indexOf(';') >= 0) {
                sep = ';';
            } else if (object.data.taxonomy.indexOf(',') >= 0) {
                sep = ',';
            } else {
                taxonomy = [object.data.taxonomy];
            }
            if (sep) {
                taxonomy = object.data.taxonomy.split(sep).map(function (item) {
                    return item.trim(' ');
                }).filter(function (item) {
                    return (item.trim(' ').length !== 0);
                });
            }
        } else {
            taxonomy = [];
        }
        object['genome'] = {
            title: object.data.scientific_name || object.object_name,
            description: 'description here...',
            assemblyGuid: object.data.assembly_guid,
            domain: object.data.domain,
            featureCount: object.data.features,
            // featureCount: {
            //     value: object.data.contigs,
            //     formatted: common.padRight(numeral(object.data.features).format('0,0'), 2)
            // },
            scientificName: object.data.scientific_name,
            taxonomy: taxonomy,
            dnaSize: object.currentObjectInfo.metadata.Size,
            source: object.currentObjectInfo.metadata.Source,
            sourceId: object.currentObjectInfo.metadata['Source Id'],
            accession: object.currentObjectInfo.metadata.accession
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