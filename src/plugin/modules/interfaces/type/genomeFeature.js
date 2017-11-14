define([], function () {
    'use strict';

    function normalize(object) {
        object['genomeFeature'] = {
            title: object.object_name,
            description: 'description here...',
            function: object.data.function,
            featureType: object.data.type,
            location: object.data.location.map(function (location) {
                var start = location[1];
                var length = location[3];
                var direction = location[2];
                var end;
                switch (direction) {
                case '+':
                    end = start + length - 1;
                    break;
                case '-':
                    // end = start;
                    // start = end - length;
                    end = start - length + 1;
                    break;
                default:
                    throw new Error('Invalid direction: ' + direction);
                }
                return {
                    genome: location[0],
                    start: start,
                    direction: direction,
                    length: length,
                    end: end
                };
            }),
            genome: {
                domain: object.parent_data.domain,
                scientificName: object.parent_data.scientific_name,
                taxonomy: object.parent_data.taxonomy ? object.parent_data.taxonomy.split(';').map(function (item) {
                    return item.trim(' ');
                }).filter(function (item) {
                    return (item.trim(' ').length !== 0);
                }) : []
            }
            //     return item.trim(' ');
            // assemblyGuid: object.data.assembly_guid,
            // domain: object.data.domain,
            // featureCount: object.data.features,
            // scientificName: object.data.scientific_name,
            // taxonomy: object.data.taxonomy ? object.data.taxonomy.split(';').map(function (item) {
            //     return item.trim(' ');
            // }).filter(function (item) {
            //     return (item.trim(' ').length !== 0);
            // }) : []
        };
    }

    function guidToReference(guid) {
        var m = guid.match(/^WS:(\d+)\/(\d+)\/(\d+):feature\/(.*)$/);
        var ref = m.slice(1, 4).join('/');
        return {
            workspaceId: m[1],
            objectId: m[2],
            objectVersion: m[3],
            ref: ref,
            feature: m[4],
            dataviewId: ref + '?sub=Feature&subid=' + m[4]
        };
    }

    return {
        normalize: normalize,
        guidToReference: guidToReference
    };
});