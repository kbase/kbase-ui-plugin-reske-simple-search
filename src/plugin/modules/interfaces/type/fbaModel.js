define([
], function (
) {
    'use strict';

    function normalize(object) {
        object['fbaModel'] = {
            id: object.data.id,
            name: object.data.name,
            source: object.data.source,
            type: object.data.type,
            modelCompartments: object.data.modelcompartments,
            modelCompounds: object.data.modelcompounds,
            modelReactions: object.data.modelreactions,
            // genomeGuid: object.data.genome_guid,
            genomeRef: object.data.genome_ref,
            scientificName: object.key_props.scientific_name,
            taxonomy: object.key_props.taxonomy,
            genomeName: object.key_props.genome_name
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