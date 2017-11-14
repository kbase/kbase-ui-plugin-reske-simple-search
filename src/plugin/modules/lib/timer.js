define([], function () {
    'use strict';

    function factory(config) {
        var timers = [];
        var timersMap = {};

        function startTimer(name) {
            timersMap[name] = {
                start: new Date(),
                stop: null,
                elapsed: null
            };
            timers.push(name);
        }

        function stopTimer(name) {
            var timer = timersMap[name];
            timer.stop = new Date();
            timer.elapsed = timer.stop.getTime() - timer.start.getTime();
        }

        function log() {
            timers.forEach(function (name) {
                var timer = timersMap[name];
                console.log('timer: ' + name + ':' + timer.elapsed);
            });
        }

        return {
            startTimer: startTimer,
            stopTimer: stopTimer,
            log: log
        };

    }

    return factory;
});