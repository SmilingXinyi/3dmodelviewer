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
    private animations: Function[];

    constructor(opts: Options) {
        this.opts = opts;

        const widht = this.opts.size?.width || window.innerWidth;
        const height = this.opts.size?.height || window.innerHeight;

        this.animations = [];

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(widht, height);

        this.camera = new THREE.PerspectiveCamera(
            40, widht / height, 0.1, 200
        );

        this.camera.position.set(0, 0, 20);
        // this.camera.lookAt(new THREE.Vector3(0, 0, 0));

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

        if (typeof this.opts.model === 'string') {
            this.loadModel(this.opts.modelType, this.opts.model);
        } else if (typeof this.opts.model === 'object') {
            this.loadModelData(this.opts.modelType, JSON.stringify(this.opts.model))
        }

        if (this.opts.helper) {
            const axesHelper = new THREE.AxesHelper(5);
            this.scene.add(axesHelper);
        }

        this.animate();
    }

    loadModelData(modelType: string, modelsrc: string) {
        if (modelType === 'gltf') {
            const loader = new GLTFLoader();
            loader.parse(modelsrc, '', gltf => {
                gltf.scene.scale.set(.1, .1, .1);
                this.scene.add(gltf.scene);
                this.animations.push(function () {
                    // @ts-ignore
                    this.scene.rotation.y += 0.002;
                }.bind(gltf));
            }, err => {
                throw err
            });
        } else {
            throw new Error('The model type does not implement the loading function')
        }
    }

    loadModel(modelType: string, modelsrc: string) {
        if (modelType === 'gltf') {
            const loader = new GLTFLoader();
            loader.load(modelsrc, (gltf) => {
                gltf.scene.scale.set(.1, .1, .1);
                this.scene.add(gltf.scene);
            }, (process: ProgressEvent) => {
                console.info(process)
            }, err => {
                throw err;
            });
        } else {
            throw new Error('The model type does not implement the loading function')
        }
    }

    public animate() {
        requestAnimationFrame(() => this.animate());
        this.animations.forEach(funcs => funcs());
        this.renderer.render(this.scene, this.camera);
    }
}
