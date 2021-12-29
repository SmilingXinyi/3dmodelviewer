/**
 * @file 3dmodelviewer
 * @author xinyi
 */

import * as THREE from 'three';
import {
    Options
} from './types';
import {Object3D, Renderer, Camera} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

export default class Modelviewer {
    private opts: Options;
    private scene: Object3D;
    private renderer: Renderer;
    private camera: Camera;
    private animations: Function[];

    constructor(opts: Options) {
        this.opts = Object.assign({}, {
            scale: .1
        }, opts);

        const widht = this.opts.size?.width || window.innerWidth;
        const height = this.opts.size?.height || window.innerHeight;

        this.animations = [];

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(widht, height);

        this.camera = new THREE.PerspectiveCamera(
            40, widht / height, .1, 200
        );

        this.camera.position.set(0, 0, 20);

        this.scene = new THREE.Scene();

        if (typeof opts.dom === 'string') {
            const parent = document.querySelector(opts.dom);
            parent && parent.appendChild(this.renderer.domElement);
        } else if (opts.dom instanceof HTMLElement) {
            opts.dom.appendChild(this.renderer.domElement);
        } else {
            document.body.appendChild(this.renderer.domElement);
        }

        if (typeof this.opts.model === 'string') {
            this.loadModel(this.opts.modelType, this.opts.model);
        } else if (typeof this.opts.model === 'object') {
            this.loadModelData(this.opts.modelType, JSON.stringify(this.opts.model))
        }

        if (this.opts.helper) {
            const axesHelper = new THREE.AxesHelper(5);
            this.scene.add(axesHelper);
        }

        if (this.opts.ambientLights) {
            this.opts.ambientLights.forEach(({color = 0xffffff, intensity = 1}) => (
                this.scene.add(new THREE.AmbientLight(color, intensity))
            ));
        }

        if (this.opts.directionalLights) {
            this.opts.directionalLights.forEach(({position, color = 0xffffff}) => {
                const directionalLight = new THREE.DirectionalLight(color);
                directionalLight.position.set(...position);
                this.scene.add(directionalLight);
            });
        }

        this.animate();
    }

    loadModelData(modelType: string, modelsrc: string) {
        if (modelType === 'gltf') {
            const loader = new GLTFLoader();
            loader.parse(modelsrc, '', gltf => {
                let mesh = gltf.scene.children[0];
                mesh.position.set(0, 0, 0);
                gltf.scene.scale.set(this.opts.scale, this.opts.scale, this.opts.scale);
                this.scene.add(gltf.scene);
                let dyal = 0.0025;
                this.animations.push(function () {
                    if (gltf.scene.rotation.y >= .5) {
                        dyal = -Math.abs(dyal);
                    }
                    if (gltf.scene.rotation.y <= -.5) {
                        dyal = Math.abs(dyal);
                    }
                    gltf.scene.rotation.y = gltf.scene.rotation.y + dyal;
                });
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
