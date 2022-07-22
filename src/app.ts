import Modelviewer from './index';

const div = document.createElement('div');
div.id = 'container';
div.setAttribute('style', 'background-color: #000; width: 700px; height: 400px');

document.body.appendChild(div)

const ele = document.querySelector('#container');

fetch('/xd0720.gltf')
    .then(res => res.json())
    .then(result => {

        const mver = new Modelviewer(ele!, {
            size: {
                width: 700,
                height: 400
            },
            environment: {
                url: '/StudioH.hdr'
            }
        });

        mver.loadModelData('gltf', result);
    })
