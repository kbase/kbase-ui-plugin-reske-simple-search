/*
Top level panel for jgi search
*/
define([
    'knockout-plus',
    './components/main'
], function (
    ko,
    MainComponent
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime;
        var hostNode, container;
        var rootComponent;

        function attach(node) {
            hostNode = node;
            rootComponent = ko.kb.createRootComponent(runtime, MainComponent.name());
            container = hostNode.appendChild(rootComponent.node);
        }

        function start() {
            runtime.send('ui', 'setTitle', 'Search');
            rootComponent.start();
        }

        function stop() {
            rootComponent.stop();
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
                container.innerHTML = '';
            }
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
