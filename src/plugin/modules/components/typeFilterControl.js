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

    var styles = html.makeStyles({
        activeFilterInput: {
            // fontFamily: 'monospace',
            backgroundColor: 'rgba(209, 226, 255, 1)',
            color: '#000'
        }
    });

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

        var typeFilter = params.search.typeFilter;

        var optionSelected = ko.pureComputed(function () {
            if (typeFilter() && typeFilter().length > 0) {
                // $component.typeFilter()[0] !== "_select_"
                return true;
            }
            return false;
        });

        return {
            search: params.search,
            // Type filter
            optionSelected: optionSelected,
            typeFilter: typeFilter,
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
            styles.sheet,
            label(' '),
            select({
                dataBind: {
                    value: 'typeFilterInput',
                    event: {
                        change: '$component.doSelectTypeFilter'
                    },
                    foreach: 'typeFilterOptions',
                    css: 'optionSelected() ? "' + styles.classes.activeFilterInput + '" : null'
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