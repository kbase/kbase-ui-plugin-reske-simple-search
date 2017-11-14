define([
    'kb_common/html'
], function(
    html 
) {
    'use strict';

    var t = html.tag,
        span = t('span');

    function viewModel(params) {
        return {
            shared: params.field.value
        };
    }

    function koSwitch(value, cases) {
        return [
            '<!-- ko switch: ' + value + ' -->',
            cases.map(function (caseSpec) {
                var caseValue;
                if (typeof caseSpec[0] === 'string') {
                    caseValue = '"' + caseSpec[0] + '"';
                }
                return [
                    '<!-- ko case: ' + caseValue + ' -->',
                    caseSpec[1],
                    '<!-- /ko -->'
                ];
            }),
            '<!-- /ko -->'
        ];
    }

    function icon(type) {
        return span({
            class: 'fa fa-' + type
        });
    }

    function template() {
        return span([
            koSwitch('shared', [
                ['owner', icon(('key'))],
                ['shared', icon('share-alt')],
                ['public', icon('globe')]
            ])
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