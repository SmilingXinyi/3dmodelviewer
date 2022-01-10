/**
 * @file 3dmodelviewer
 * @author xinyi
 */

import * as THREE from 'three';
import {
    Options
} from './types';
import {Object3D, Camera, Light, WebGLRenderer} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module'

export default class Modelviewer {
    private opts: Options;
    private scene: Object3D;
    private renderer: WebGLRenderer;
    private camera: Camera;
    private animations: Function[];
    private stats?: Stats;

    constructor(opts: Options) {
        this.opts = Object.assign({}, {
            scale: .1,
            stats: false,
            outputEncoding: 0,
            opacity: .3
        }, opts);

        const widht = this.opts.size?.width || window.innerWidth;
        const height = this.opts.size?.height || window.innerHeight;

        this.animations = [];

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        this.renderer.shadowMap.enabled = true;

        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.outputEncoding = parseInt(String(this.opts.outputEncoding), 10) === 1
            ? THREE.sRGBEncoding : THREE.LinearEncoding;

        this.renderer.setSize(widht, height);

        if (this.opts.stats) {
            this.stats = Stats();
            document.body.appendChild(this.stats.dom);
        }

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

        // const hlight = new THREE.HemisphereLight( 0xffffff, 0xffffff, .7 );
        // this.scene.add( hlight );

        if (this.opts.ambientLights) {
            this.opts.ambientLights.forEach(({color = 0xffffff, intensity = 1}) => (
                this.scene.add(new THREE.AmbientLight(color, intensity))
            ));
        }

        if (this.opts.directionalLights) {
            this.opts.directionalLights.forEach(({position, color = 0xffffff, intensity = 1}) => {
                const directionalLight = new THREE.DirectionalLight(color, intensity);
                directionalLight.position.set(...position);
                directionalLight.castShadow = true;
                // directionalLight.shadow.mapSize.width = 1024;
                // directionalLight.shadow.mapSize.height = 1024;
                // const d = 50;
                //
                // directionalLight.shadow.camera.left = - d;
                // directionalLight.shadow.camera.right = d;
                // directionalLight.shadow.camera.top = d;
                // directionalLight.shadow.camera.bottom = - d;

                // directionalLight.shadow.camera.far = 3500;
                // directionalLight.shadow.bias = - 0.0001;
                directionalLight.shadow.mapSize.width = 2048;
                directionalLight.shadow.mapSize.height = 2048;
                this.scene.add(directionalLight);
            });
        }

        this.animate();
    }

    resetLight(value: number) {
        this.scene.children.forEach((item, _i) => {
            if (item.type === 'AmbientLight'
                && item instanceof Light) {
                item.intensity = value;
            }
        });
    }

    clearModel(type: string) {
        let index = -1;
        this.scene.children.forEach((item, i) => {
            if (item.type === type)
                index = i;
        });
        this.scene.children.splice(index, 1);
    }

    loadModelData(modelType: string, modelsrc: string) {
        if (modelType === 'gltf') {
            const loader = new GLTFLoader();
            loader.parse(modelsrc, '', gltf => {
                // @ts-ignore
                if (gltf.scene.children[0]?.children[0]?.material?.opacity === 0) {
                    // @ts-ignore
                    gltf.scene.children[0]?.children[0]?.material?.opacity = this.opts.opacity
                }
                let mesh = gltf.scene.children[0];
                mesh.castShadow = true;
                if (mesh.children.length > 0) {
                    mesh.children = mesh.children.map(i => {
                        i.castShadow = true;
                        i.receiveShadow = true;
                        return i;
                    });
                }
                mesh.receiveShadow = true;
                mesh.position.set(0,0,0);

                let mesh2 = gltf.scene.children[1];
                if(mesh2) {
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
                throw err;
            });
        } else {
            throw new Error('The model type does not implement the loading function')
        }
    }

    loadModel(modelType: string, modelsrc: string) {
        if (modelType === 'gltf') {
            const loader = new GLTFLoader();
            loader.load(modelsrc, (gltf) => {
                let mesh = gltf.scene.children[0];
                mesh.position.set(0,0,0);
                gltf.scene.scale.set(this.opts.scale, this.opts.scale, this.opts.scale);
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
        this.stats && this.stats.update();
        this.animations.forEach(funcs => funcs());
        this.renderer.render(this.scene, this.camera);
    }
}
