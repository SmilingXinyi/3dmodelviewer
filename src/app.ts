import Modelviewer from './index';
import * as THREE from 'three';

const div = document.createElement('div');
div.id = 'container';
div.setAttribute('style', 'background-color: #000; width: 700px; height: 700px');

document.body.appendChild(div)

const ele = document.querySelector('#container');

fetch('/ast3.gltf')
    .then(res => res.json())
    .then(result => {

        const mver = new Modelviewer(ele!, {
            // size: {
            //     width: 700,
            //     height: 700
            // },
            // environment: {
            //     url: '/xiaodu-ast1.hdr',
            //     callback: () => {
            //         console.log('环境加载完成');
            //     }
            // },
            // axes: {
                // helper: 100
            // },
            // camera: {
            //     helper: true,
            //     lookAtPoint: true
            // },
            controls: {},
            lights: {
                hemisphereLight: [0xFFFFFF, 0x000000, 1],
                ambientLights: {
                    color: 0xffffff,
                    intensity: 0.3
                }
            },
            stats: true,
            model: {
                fix: (scene) => {
                    if (scene.children[0]?.children[0]?.material?.opacity === 0) {
                        scene.children[0]?.children[0]?.material?.opacity = .3
                    }

                    // @ts-ignore
                    if (scene.children[0]?.children[0]?.material?.name === '材质.3') {
                        const material1 = new THREE.MeshPhysicalMaterial({
                            roughness: 0.5,
                            transmission: 1.2,
                            // thickness: 10,
                            opacity: 0.5,
                            transparent: true,
                            sheen: .6,
                            reflectivity: .4,
                            clearcoat: 1.2
                        });

                        // @ts-ignore
                        scene.children[0]?.children[0]?.material = material1;
                    }

                    let mesh = scene.children[0];
                    mesh.castShadow = true;
                    if (mesh.children.length > 0) {
                        mesh.children = mesh.children.map(i => {
                            i.castShadow = true;
                            i.receiveShadow = true;
                            return i;
                        });
                    }
                    mesh.receiveShadow = true;
                    mesh.position.set(0, 0, 0);

                    let mesh2 = scene.children[1];
                    if (mesh2) {
                        mesh2.castShadow = true;
                        mesh2.receiveShadow = true;
                        if (mesh2.children.length > 0) {
                            mesh2.children = mesh2.children.map(i => {
                                i.castShadow = true;
                                i.receiveShadow = true;
                                return i;
                            });
                        }
                    }

                    return scene;
                }
            }
        });

        mver.loadModelData('gltf', result, () => {
            console.log('模型加载完成');
        });
    })
