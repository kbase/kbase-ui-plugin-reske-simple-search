define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        select = t('select'),
        option = t('option'),
        div = t('div'),
        label = t('label');

    function viewModel(params) {
        var typeFilterOptions = params.search.typeFilterOptions.map(function (option) {
            return option;
        });
        typeFilterOptions.unshift({
            label: 'All Types',
            value: '_select_',
            enabled: true
        });

        function doRemoveTypeFilter(data) {
            params.search.typeFilter.remove(data);
        }

        function doSelectTypeFilter(data) {
            if (data.typeFilterInput() === '_select_') {
                params.search.typeFilter([]);
                return;
            }
            params.search.typeFilter([data.typeFilterInput()]);
        }

        return {
            search: params.search,
            // Type filter
            typeFilter: params.search.typeFilter,
            typeFilterInput: ko.observable('_select_'),
            typeFilterOptions: typeFilterOptions,
            doRemoveTypeFilter: doRemoveTypeFilter,
            doSelectTypeFilter: doSelectTypeFilter            
        };
    }

    function template() {
        return div({
            class: 'form-group',
            style: {
                margin: '0 4px'
            }
        }, [
            label('Type: '),
            select({
                dataBind: {
                    value: 'typeFilterInput',
                    event: {
                        change: '$component.doSelectTypeFilter'
                    },
                    foreach: 'typeFilterOptions'
                },
                class: 'form-control',
                style: {
                    margin: '0 4px'
                }
            }, [
                option({
                    dataBind: {
                        value: 'value',
                        text: 'label',
                        attr: {
                            selected: 'value === $component.typeFilter()[0]'
                        }
                    }
                }),
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