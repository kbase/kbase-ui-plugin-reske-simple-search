/*
overlayPanel
A generic full-height translucent panel which overlays the entire page to about 75% of the width.
It is a container component, and expects to be passed a component to render and a viewmodel
to pass along.
it offers a close function for the sub-component to use, in addition to invoking close
from a built-in close button (?)
*/
define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,        
        div = t('div');

    function viewModel(params) {
        var hostVm = params.hostVm;

        var showPanel = ko.observable();

        function doClose() {
            showPanel(!showPanel());
        }

        params.component.subscribe(function (newValue) {
            if (newValue) {
                showPanel(true);
            } else {
                if (showPanel()) {
                    showPanel(false);
                }
            }
        });

        var panelStyle = ko.pureComputed(function() {
            if (showPanel() === undefined) {
                // the initial state;
                return;
            }
            if (showPanel()) {
                return styles.classes.panelin;
            } else {
                return styles.classes.panelout;
            }
        });

        // var type = ko.observable(params.type || 'info');

        var typeBackgroundColor = ko.pureComputed(function() {
            if (!params.component()) {
                return;
            }
            switch (params.component().type) {                     
            case 'error':
                return 'rgba(216, 138, 138, 0.8)';
            case 'info':
            default:
                return 'rgba(36, 89, 193, 0.8)';       
            }
            
        });

        return {
            showPanel: showPanel,
            panelStyle: panelStyle,
            typeBackgroundColor: typeBackgroundColor,
            doClose: doClose,
            component: params.component,
            hostVm: hostVm
        };
    }

    var styles = html.makeStyles({
        classes: {
            container: {
                css: {
                    position: 'absolute',
                    top: '0',
                    // left: '0',
                    left: '-100%',
                    bottom: '0',
                    right: '0',
                    width: '100%',
                    zIndex: '3',
                    backgroundColor: 'rgba(0,0,0,0.6)'
                }
            },
            panel: {
                css: {
                    position: 'absolute',
                    top: '0',
                    // left: '0',
                    left: '0',
                    bottom: '0',
                    width: '75%',
                    zIndex: '3'
                }
            },
            panelBody: {
                css: {
                    position: 'absolute',
                    top: '30px',
                    left: '0',
                    bottom: '0',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }
            },
            panelButton: {
                css: {
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    color: '#FFF',
                    cursor: 'pointer'
                }
            },
            panelin: {
                css: {
                    animationDuration: '0.5s',
                    animationName: 'slidein',
                    animationIterationCount: '1',
                    animationDirection: 'normal',
                    left: '0'
                }
            },
            panelout: {
                css: {
                    animationDuration: '0.5s',
                    animationName: 'slideout',
                    animationIterationCount: '1',
                    animationDirection: 'normal',
                    left: '-100%'
                }
            },
            miniButton: {
                css: {
                    padding: '2px',
                    border: '2px transparent solid',
                    cursor: 'pointer'
                },
                pseudo: {
                    hover: {
                        border: '2px white solid'
                    },
                    active: {
                        border: '2px white solid',
                        backgroundColor: '#555',
                        color: '#FFF'
                    }
                }
            }
        }, 
        rules: {
            keyframes: {
                slidein: {
                    from: {
                        left: '-100%'
                    },
                    to: {
                        left: '0'
                    }
                },
                slideout: {
                    from: {
                        left: '0'
                    },
                    to: {
                        left: '-100%'
                    }
                }
            }
        }
    });

    function template() {
        return div({
            dataBind: {
                css: 'panelStyle'
            },
            class: styles.classes.container
        }, div({
            dataBind: {
                style: {
                    'background-color': 'typeBackgroundColor'
                }
            },
            class: styles.classes.panel
        }, [
            styles.sheet,
            div({
                dataBind: {
                    click: 'doClose'
                },
                class: styles.classes.panelButton
            }, 'X'),
            div({
                class: styles.classes.panelBody
            }, [
                '<!-- ko if: component() -->',
                div({
                    dataBind: {
                        component: {
                            name: 'component().name',
                            params: {
                                // original: 'component().params',
                                onClose: 'doClose',
                                hostVm: 'hostVm'
                            }
                        }
                    },
                    style: {
                        flex: '1 1 0px'
                    }
                }),
                '<!-- /ko -->'
            ])
        ]));
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return component;
});
