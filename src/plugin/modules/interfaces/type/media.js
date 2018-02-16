define([
], function (
) {
    'use strict';

    function normalize(object) {
        object['media'] = {
            id: object.data.id,
            name: object.data.name,
            externalSourceId: object.data.external_source_id,
            type: object.data.type,
            modelCompounds: object.data.modelcompounds,
            isDefined: object.data.isDefined,
            isMinimal: object.data.isMinimal,
            isAerobic: object.data.isAerobic
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