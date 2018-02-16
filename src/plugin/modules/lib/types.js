define([
    '../interfaces/type/narrative',
    '../interfaces/type/genome',
    '../interfaces/type/genomeFeature',
    '../interfaces/type/assembly',
    '../interfaces/type/assemblyContig',
    '../interfaces/type/pairedEndLibrary',
    '../interfaces/type/singleEndLibrary',
    '../interfaces/type/fbaModel',
    '../interfaces/type/media'
], function (
    narrative,
    genome,
    genomeFeature,
    assembly,
    assemblyContig,
    pairedEndLibrary,
    singleEndLibrary,
    fbaModel,
    media
) {
    'use strict';

    var objectTypes = [{
        id: 'narrative',
        uiId: 'narrative',
        kbaseTypeId: 'Narrative',
        resultId: 'Narrative',
        label: 'Narrative',
        methods: narrative,
        typeKeys: ['cells?', 'metadata'],
        searchKeys: [{
            key: 'title',
            label: 'Title',
            type: 'string',
            disableSort: true
        }, {
            key: 'source',
            label: 'Source',
            type: 'string'
        }, {
            key: 'code_output',
            label: 'Code Output',
            type: 'string'
        }, {
            key: 'app_output',
            label: 'App Output',
            type: 'string'
        }, {
            key: 'app_info',
            label: 'App Info',
            type: 'string'
        }, {
            key: 'app_input',
            label: 'App Input',
            type: 'string'
        }, {
            key: 'job_ids',
            label: 'Job Ids',
            type: 'string'
        }, {
            key: 'creator',
            label: 'Creator',
            type: 'string'
        }],
        sortFields: [{
            key: 'title',
            label: 'Title',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'created',
            label: 'Created (fake)',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'updated',
            label: 'Updated (fake)',
            isTimestamp: false,
            isObjectName: false
        }, {
            value: 'owner',
            label: 'Owner (fake)',
            isTimestamp: false,
            isObjectName: false
        }, {
            value: 'creator',
            label: 'Creator',
            isTimestamp: false,
            isObjectname: false
        }],
        // Note translated into api-speak.
        defaultSortingRules: [{
            is_timestamp: 1,
            is_object_name: 0,
            key_name: 'timestamp',
            descending: 1
        }],
        defaultSearch: {
            key: 'cr'
        }
    }, {
        id: 'genome',
        uiId: 'genome',
        kbaseTypeId: 'Genome',
        resultId: 'Genome',
        label: 'Genome',
        methods: genome,
        typeKeys: ['domain', 'features', 'id', 'scientific_name', 'taxonomy?'],
        searchKeys: [{
            key: 'id',
            label: 'ID',
            type: 'string'
        },
        {
            key: 'domain',
            label: 'Domain',
            type: 'string'
        },
        {
            key: 'taxonomy',
            label: 'Taxonomy',
            type: 'string'
        },
        {
            key: 'scientific_name',
            label: 'Scientific Name',
            type: 'string'
        },
        {
            key: 'features',
            label: 'Feature Count',
            type: 'integer'
        },
            // not sure about this, there are three indexing rules,
            // with different types...
        {
            key: 'assembly_guid',
            label: 'Assembly GUID',
            type: 'string'
        },
        ],
        sortFields: [{
            key: 'id',
            label: 'ID',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'domain',
            label: 'Domain',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'scientific_name',
            label: 'Scientific name',
            isTimestamp: false,
            isObjectName: false
        }]
    }, {
        id: 'genomefeature',
        uiId: 'genomeFeature',
        kbaseTypeId: 'GenomeFeature',
        resultId: 'GenomeFeature',
        label: 'Genome Feature',
        methods: genomeFeature,
        typeKeys: ['aliases?', 'function?', 'id', 'location', 'protein_translation?', 'type'],
        searchKeys: [{
            key: 'id',
            label: 'ID',
            type: 'string'
        },
        {
            key: 'function',
            label: 'Function',
            type: 'string'
        },
        {
            key: 'aliases',
            label: 'Aliases',
            comment: 'list of string',
            type: 'string'
        },
        {
            key: 'contig_id',
            label: 'Contig ID',
            type: 'string'
        },
            // contig_guid is hidden
        {
            key: 'start',
            label: 'Start',
            type: 'integer'
        },
        {
            key: 'stop',
            label: 'Stop',
            type: 'integer'
        },
        {
            key: 'strand',
            label: 'Strand',
            type: 'string',
        },
        {
            key: 'feature_type',
            label: 'Feature Type',
            type: 'string'
        },
        {
            key: 'ontology_terms',
            label: 'Ontology Terms',
            type: 'string'
        },

        {
            key: 'genome_domain',
            label: 'Genome Domain',
            type: 'string'
        },
        {
            key: 'genome_taxonomy',
            label: 'Genome Taxonomy',
            type: 'string'
        },
        {
            key: 'genome_scientific_name',
            label: 'Genome Scientific Name',
            type: 'string'
        }
            // assembly_guid hidden
        ],
        sortFields: [{
            key: 'id',
            label: 'ID',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'function',
            label: 'Function',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'start',
            label: 'Start',
            isTimestamp: false,
            isObjectName: false
        }]
    }, {
        id: 'assembly',
        uiId: 'assembly',
        kbaseTypeId: 'Assembly',
        resultId: 'Assembly',
        label: 'Assembly',
        methods: assembly,
        typeKeys: ['contigs', 'dna_size', 'external_source_id', 'gc_content', 'name'],
        searchKeys: [{
            key: 'contigs',
            label: 'Contigs',
            type: 'integer'
        }, {
            key: 'dna_size',
            label: 'DNA Size',
            type: 'integer'
        }, {
            key: 'external_source_id',
            label: 'External Source ID',
            type: 'string'
        }, {
            key: 'gc_content',
            label: 'GC Content',
            type: 'float'
        }, {
            key: 'name',
            label: 'Name',
            type: 'string'
        }],
        sortFields: [{
            key: 'name',
            label: 'Name',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'dna_size',
            label: 'DNA Size',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'gc_content',
            label: 'GC Content',
            isTimestamp: false,
            isObjectName: false
        }]
    }, {
        id: 'assemblycontig',
        uiId: 'assemblyContig',
        kbaseTypeId: 'AssemblyContig',
        resultId: 'AssemblyContig',
        label: 'Assembly Contig',
        methods: assemblyContig,
        typeKeys: ['contig_id', 'description', 'gc_content', 'length'],
        searchKeys: [{
            key: 'contig_id',
            label: 'Contig Id',
            type: 'string'
        },
        {
            key: 'description',
            label: 'Description',
            type: 'string'
        },
        {
            key: 'gc_content',
            label: 'GC Content',
            type: 'float'
        },
        {
            key: 'length',
            label: 'Length',
            type: 'integer'
        }
        ],
        sortFields: [{
            key: 'contig_id',
            label: 'Contig ID',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'gc_content',
            label: 'GC Content',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'length',
            label: 'Length',
            isTimestamp: false,
            isObjectName: false
        }]
    }, {
        id: 'pairedendlibrary',
        uiId: 'pairedEndLibrary',
        kbaseTypeId: 'PairedEndLibrary',
        resultId: 'PairedEndLibrary',
        label: 'Paired End Library',
        methods: pairedEndLibrary,
        // typeKeys: [], // ['insert_size_mean', 'lib1', 'sequencing_tech'],
        typeKeys: ['lib1', 'gc_content', 'phred_type', 'qual_mean', 'read_count', 'read_length_mean', 'sequencing_tech'],
        typeKeyProps: ['files', 'gc_content', 'insert_size', 'phred_type', 'quality', 'read_count', 'read_length', 'technology'],
        searchKeys: [{
            key: 'technology',
            label: 'Sequencing Technology',
            type: 'string'
        },
        {
            key: 'files',
            label: 'Files',
            type: 'string'
        },
        {
            key: 'phred_type',
            label: 'Phred Type',
            type: 'string'
        },
        {
            key: 'read_count',
            label: 'Read Count',
            type: 'integer'
        },
        {
            key: 'read_length',
            label: 'Mean Read Length',
            type: 'integer'
        },
        {
            key: 'insert_size',
            label: 'Mean Insert Size',
            type: 'integer'
        },
        {
            key: 'quality',
            label: 'Quality',
            type: 'float'
        },
        {
            key: 'gc_content',
            label: 'GC Content',
            type: 'float'
        }
        ],
        sortFields: [{
            key: 'technology',
            label: 'Sequencing Technology',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'read_count',
            label: 'Read Count',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'read_length',
            label: 'Mean Read Length',
            isTimestamp: false,
            isObjectName: false
        }]
    }, {
        id: 'singleendlibrary',
        uiId: 'singleEndLibrary',
        kbaseTypeId: 'SingleEndLibrary',
        resultId: 'SingleEndLibrary',
        label: 'Single End Library',
        methods: singleEndLibrary,
        // typeKeys: [], // ['lib1', 'lib2', 'sequencing_tech'],
        typeKeys: ['lib', 'gc_content', 'lib', 'phred_type', 'qual_mean', 'read_count', 'read_length_mean', 'sequencing_tech'],
        // typeKeyProps: ['files', 'gc_content', 'insert_size', 'phred_type', 'quality', 'read_count', 'read_length', 'technology'],
        searchKeys: [{
            key: 'technology',
            label: 'Sequencing Technology',
            type: 'string'
        },
        {
            key: 'files',
            label: 'Files',
            type: 'string'
        },
        {
            key: 'phred_type',
            label: 'Phred Type',
            type: 'string'
        },
        {
            key: 'read_count',
            label: 'Read Count',
            type: 'integer'
        },
        {
            key: 'read_length',
            label: 'Mean Read Length',
            type: 'integer'
        },
        {
            key: 'quality',
            label: 'float',
            type: 'Quality'
        },
        {
            key: 'gc_content',
            label: 'GC Content',
            type: 'float'
        }
        ],
        sortFields: [{
            key: 'technology',
            label: 'Sequencing Technology',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'read_count',
            label: 'Read Count',
            isTimestamp: false,
            isObjectName: false
        }, {
            key: 'read_length',
            label: 'Mean Read Length',
            isTimestamp: false,
            isObjectName: false
        }]
    }, {
        id: 'fbamodel',
        uiId: 'fbaModel',
        kbaseTypeId: 'FBAModel',
        resultId: 'FBAModel',
        label: 'FBA Model',
        methods: fbaModel,
        searchKeys: [
        ],
        sortFields: []
    }, {
        id: 'media',
        uiId: 'media',
        kbaseTypeId: 'Media',
        resultId: 'Media',
        label: 'Media',
        methods: media,
        searchKeys: [
        ],
        sortFields: []
    }];
    var objectTypeMap = {};
    objectTypes.forEach(function (type) {

        var searchKeysMap = {};
        type.searchKeys.forEach(function (searchKey) {
            searchKeysMap[searchKey.key] = searchKey;
        });
        type.searchKeysMap = searchKeysMap;

        var sortFieldsMap = {};
        type.sortFields.forEach(function (sortField) {
            sortFieldsMap[sortField.key] = sortField;
        });
        type.sortFieldsMap = sortFieldsMap;

        objectTypeMap[type.id] = type;
    });


    function getType(key) {
        return objectTypeMap[key];
    }

    function getTypeForObject(searchObject) {
        var type = objectTypeMap[searchObject.object_props.type.toLowerCase()];

        if (!type) {
            console.error('Object type not found!!!', searchObject, objectTypeMap);
            throw new Error('Object type not found!!: ' + searchObject.object_props.type);
        }

        return type;
        // return type.module.make({object: searchObject});
    }

    function typeIt(value) {
        var type = getTypeForObject(value);
        return type.id;
        // // duck typing for now...
        // // loop through all types (as defined above)
        // // NB use loop because .find is not suppported on any IE.
        // // var types = Object.keys(objectTypes);
        // for (var i = 0; i < objectTypes.length; i += 1) {
        //     var type = objectTypes[i];
        //     // loop through each key and see if in the current values data property.
        //     var keys = type.typeKeys;
        //     if (keys && keys.every(function (key) {
        //         var optional = false;
        //         if (key.substr(-1) === '?') {
        //             optional = true;
        //             key = key.substr(0, -1);
        //         }
        //         var found = (key in value.data);
        //         if (!found && optional) {
        //             return true;
        //         }
        //         return found;
        //     })) {
        //         return type.id;
        //     }
        // }
        // // Try again with typeKeys -- these should be more reliable but they are not
        // // yet set up for all types.
        // for (i = 0; i < objectTypes.length; i += 1) {
        //     type = objectTypes[i];
        //     // loop through each key and see if in the current values data property.
        //     keys = type.typeKeyProps;
        //     if (keys && keys.every(function (key) {
        //         var optional = false;
        //         if (key.substr(-1) === '?') {
        //             optional = true;
        //             key = key.substr(0, -1);
        //         }
        //         var found = (key in value.key_props);
        //         if (!found && optional) {
        //             return true;
        //         }
        //         return found;
        //     })) {
        //         return type.id;
        //     }
        // }
        // console.warn('could not type', value);
        // return 'unknown';
    }

    function getLookup() {
        return objectTypes.map(function (objectType) {
            return {
                id: objectType.id,
                label: objectType.label
            };
        });
    }
    return {
        types: objectTypes,
        typesMap: objectTypeMap,
        typeIt: typeIt,
        getType: getType,
        getLookup: getLookup
    };
});