/**
 * @file 3dmodelviewer
 * @author xinyi
 */

import * as THREE from 'three';
import {
    Options
} from './types';
import {Object3D, Renderer, Camera, Light} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

export default class Modelviewer {
    private opts: Options;
    private scene: Object3D;
    private renderer: Renderer;
    private camera: Camera;
    private ambientLight: Light;

    constructor(opts: Options) {
        this.opts = opts;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 0, 15);

        this.scene = new THREE.Scene();

        if (typeof opts.dom === 'string') {
            const parent = document.querySelector(opts.dom);
            parent && parent.appendChild(this.renderer.domElement);
        } else if (opts.dom instanceof HTMLElement) {
            opts.dom.appendChild(this.renderer.domElement);
        } else {
            document.body.appendChild(this.renderer.domElement);
        }

        this.ambientLight = new THREE.AmbientLight('#FFFFFF');
        this.scene.add(this.ambientLight);

        this.loadModel(this.opts.modelType, this.opts.model);

        this.animate();
    }

    loadModel(modelType: string, modelsrc?: string) {
        if (modelType === 'gltf') {
            const loader = new GLTFLoader();
            // loader.load(modelsrc, (gltf) => {
            //     gltf.scene.scale.set(.1, .1, .1);
            //     this.scene.add(gltf.scene);
            // }, (size) => {
            //     console.log(size);
            // }, err => {
            //     throw err;
            // });

            loader.loadAsync('https://xasset-open.cdn.bcebos.com/activity/jly.gltf',
                    process => {
                console.log(process);
                    }
            )
        }
        else {
            throw new Error('The model type does not implement the loading function')
        }
    }

    public animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
