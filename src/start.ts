
// import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

// Promise.all([
//     import ('three'),
//     import ('three/examples/jsm/loaders/GLTFLoader'),
//     import ('three/examples/jsm/libs/stats.module'),
//     import ('three/examples/jsm/controls/OrbitControls')
// ]).then(([
//              THREE,
//              {GLTFLoader},
//              Stats,
//              {OrbitControls}
//          ]) => {
//     const {Object3D, Camera, Light, WebGLRenderer} = THREE;
//     // console.log(THREE);
//     // console.log(Object3D, Camera, Light, WebGLRenderer);
//     // console.log(GLTFLoader);
//     // console.log(Stats);
//     // console.log(OrbitControls);
// })


import * as THREE from 'three';
import {Object3D, Camera, Light, WebGLRenderer} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';


export default class Modelviewer {
    constructor() {
        console.log(Object3D, Camera, Light, WebGLRenderer);
        console.log(GLTFLoader);
        console.log(Stats, OrbitControls);
        console.log(THREE);
    }
};
