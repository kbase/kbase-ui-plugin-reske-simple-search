// a wrapper for the error component, loads the search help.
define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        button = t('button');

    function viewModel(params) {
        var search = params.hostVm;

        console.log('in search error wrapper', params);

        var error = search.error;

        var code = ko.pureComputed(function () {
            if (!search.error()) {
                return;
            }
            return search.error().code;
        });
        var message = ko.pureComputed(function () {
            if (!search.error()) {
                return;
            }
            return search.error().message;
        });
        var detail = ko.pureComputed(function () {
            if (!search.error()) {
                return;
            }
            return search.error().detail;
        });
        var info = ko.pureComputed(function () {
            if (!search.error()) {
                return;
            }
            return search.error().info;
        });

        // var code = params.code;
        // var message = params.message;
        // var detail = params.detail;
        // var info = params.info;

        function doClose() {
            params.onClose();
        }

        return {
            // The error wrapper dialog interface
            title: 'Search Error',
            buttons: [
                {
                    title: 'Close',
                    action: doClose
                }
            ],
            error: error,
            close: close,
            // The error component VM interface
            code: code,
            message: message,
            detail: detail,
            info: info
        };
    }

    function buildHelpViewer() {
        return div({
            dataBind: {
                component: {
                    name: '"reske-simple-search/error"',
                    params: {
                        code: 'code',
                        message: 'message',
                        detail: 'detail',
                        info: 'info'
                    }
                }
            }
        });
    }

    function template() {
        return div({
            style: {
                // backgroundColor: 'white'
            }
        }, [
            // title
            div({
                dataBind: {
                    text: 'title'
                },
                style: {
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    fontSize: '150%',
                    padding: '8px',
                    borderBottom: '1px green solid'
                }
            }),
            // body
            div({
                // dataBind: {
                //     text: 'body'
                // },
                style: {
                    padding: '8px',
                    minHeight: '10em',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                }
            }, buildHelpViewer()),
            // buttons
            div({
                dataBind: {
                    foreach: 'buttons'
                },
                style: {
                    padding: '8px',
                    textAlign: 'right',
                    backgroundColor: 'transparent'
                }
            }, button({
                type: 'button',
                dataBind: {
                    text: 'title',
                    click: 'action'
                }
            }))
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