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

    function viewModel(params) {
        return {
            code: params.code,
            message: params.message,
            detail: params.detail,
            info: BS.buildPresentableJson(params.info())
        };
    }

    function template() {
        return div([
            BS.buildPanel({
                name: 'code',
                title: 'Code',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'code'
                    }
                })
            }),
            BS.buildPanel({
                name: 'message',
                title: 'Message',
                type: 'danger',
                body: div({
                    dataBind: {
                        text: 'message'
                    }
                })
            }),
            BS.buildCollapsiblePanel({
                name: 'detail',
                title: 'Detail',
                type: 'danger',
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