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
            // size: {
            //     width: 700,
            //     height: 700
            // },
            environment: {
                url: '/xiaodu-ast1.hdr',
                callback: () => {
                    console.log('环境加载完成');
                }
            },
            // axes: {
                // helper: 100
            // },
            // camera: {
            //     helper: true,
            //     lookAtPoint: true
            // },
            // controls: {},
            lights: {
                hemisphereLight: [0x333fff, 0x000000, 1],
            //     ambientLights: {
            //         color: 0xffff00,
            //         intensity: 0.3
            //     }
            },
            stats: true,
        });

        mver.loadModelData('gltf', result, () => {
            console.log('模型加载完成');
        });
    })
