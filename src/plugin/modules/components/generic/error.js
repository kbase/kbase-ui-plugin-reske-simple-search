define([
    'knockout-plus',
    'kb_common/html',
    'kb_common/bootstrapUtils'
], function (
    ko,
    html,
    BS
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function validateViewModel(params) {
        var spec = {            
            source: {
                type: 'string',
                observable: true,
                required: false
            },
            code: {
                type: 'string',
                observable: true,
                required: true
            },
            message: {
                type: 'string',
                observable: true,
                required: true
            },
            detail: {
                type: 'string',
                observable: true,
                required: true
            },
            info: {
                type: 'object',
                observable: true,
                required: false
            },
            onClose: {
                type: 'function',
                required: true
            }
        };

    }

    function viewModel(params) {
        return {
            source: params.source,
            code: params.code,
            message: params.message,
            detail: params.detail,
            info: BS.buildPresentableJson(params.info())
        };
    }

    function template() {
        return div([
            BS.buildPanel({
                name: 'message',
                class: 'kb-panel-light',
                title: 'Message',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'message'
                    }
                })
            }),
            '<!-- ko if: source -->',
            BS.buildPanel({
                name: 'source',
                class: 'kb-panel-light',                
                title: 'Source',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'source'
                    }
                })
            }),
            '<!-- /ko -->',
            BS.buildPanel({
                name: 'code',
                class: 'kb-panel-light',
                title: 'Code',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'code'
                    }
                })
            }),            
            BS.buildCollapsiblePanel({
                name: 'detail',
                title: 'Detail',
                type: 'danger',
                classes: ['kb-panel-light'],
                collapsed: false,
                hidden: false,
                body: div({
                    dataBind: {
                        html: 'detail'
                    }
                })
            }),
            BS.buildCollapsiblePanel({
                name: 'info',
                title: 'Info',
                type: 'danger',
                classes: ['kb-panel-light'],
                collapsed: true,
                hidden: false,
                body: div({
                    dataBind: {
                        if: 'info'
                    }
                }, div({
                    dataBind: {
                        html: 'info'
                    }
                }))
            })
        ]);
    }

    
    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});