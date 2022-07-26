import Modelviewer from './index';

const div = document.createElement('div');
div.id = 'container';
div.setAttribute('style', 'background-color: #000; width: 700px; height: 700px');

document.body.appendChild(div)

const ele = document.querySelector('#container');

fetch('/xdyb.gltf')
    .then(res => res.json())
    .then(result => {

        const mver = new Modelviewer(ele!, {
            size: {
                width: 700,
                height: 700
            },
            environment: {
            //     url: '/StudioH.hdr'
            },
            axes: {
                // helper: 100
            },
            camera: {
                // helper: true,
                lookAtPoint: true
            },
            controls: {},
            lights: {
                hemisphereLight: [0xffffff, 0x444444, 1],
                ambientLights: {
                    color: 0xff0000,
                    intensity: 0.5
                }
            }
        });

        mver.loadModelData('gltf', result);
    })
