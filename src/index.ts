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
import Stats from 'three/examples/jsm/libs/stats.module'

export default class Modelviewer {
    private opts: Options;
    private scene: Object3D;
    private renderer: Renderer;
    private camera: Camera;
    private animations: Function[];
    private stats?: Stats;

    constructor(opts: Options) {
        this.opts = Object.assign({}, {
            scale: .1,
            stats: false,
            outputEncoding: 0,
            opacity: .3,
            rotationValue: .4
        }, opts);

        const widht = this.opts.size?.width || window.innerWidth;
        const height = this.opts.size?.height || window.innerHeight;

        this.animations = [];

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        // @ts-ignore
        this.renderer.outputEncoding = this.opts.outputEncoding === 1
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

        if (this.opts.ambientLights) {
            this.opts.ambientLights.forEach(({color = 0xffffff, intensity = 1}) => (
                this.scene.add(new THREE.AmbientLight(color, intensity))
            ));
        }

        if (this.opts.directionalLights) {
            this.opts.directionalLights.forEach(({position, color = 0xffffff, intensity = 1}) => {
                const directionalLight = new THREE.DirectionalLight(color, intensity);
                directionalLight.position.set(...position);
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
                console.log(gltf);

                // @ts-ignore
                if (gltf.scene.children[0]?.children[0]?.material?.opacity === 0) {
                    // @ts-ignore
                    gltf.scene.children[0]?.children[0]?.material?.opacity = this.opts.opacity
                }

                // @ts-ignore
                if (gltf.scene.children[0]?.children[0]?.material?.name === '材质.3') {

                    const material1 = new THREE.MeshPhysicalMaterial({
                        roughness: 0.4,
                        transmission: 2,
                        // @ts-ignore
                        thickness: 0.4,
                        opacity: 0.5,
                        transparent: true,
                        sheen: 0.5,
                        reflectivity: 0.7,
                        clearcoat: 0.2
                    });

                    // @ts-ignore
                    gltf.scene.children[0]?.children[0]?.material = material1;
                }

                // @ts-ignore
                if (gltf.scene.children[0]?.children[0]?.material?.opacity === 0) {
                    // @ts-ignore
                    gltf.scene.children[0]?.children[0]?.material?.opacity = this.opts.opacity
                    // @ts-ignore
                    // gltf.scene.children[0]?.children[1]?.material?.roughness = 0.4;
                    // @ts-ignore
                    console.log(gltf.scene.children[0]?.children[0]?.material?.name);

                    // @ts-ignore
                    if (gltf.scene.children[0]?.children[0]?.material?.name === '材质.3') {
                        console.log(true);
                        // @ts-ignore
                        gltf.scene.children[0]?.children[0]?.material?.roughness = 0.1;
                        // @ts-ignore
                        gltf.scene.children[0]?.children[0]?.material?.metaless = 0.5;

                        // const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, {
                        //     format: RGBFormat,
                        //     generateMipmaps: true,
                        //     minFilter: LinearMipmapLinearFilter
                        // });

                        // const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget)

                        // const sphereMaterial = new THREE.MeshBasicMaterial({
                        //     envMap: cubeCamera.renderTarget  //cubeCamera生成的纹理作为球体的环境贴图
                        // })

                    }
                }
                let mesh = gltf.scene.children[0];
                mesh.position.set(0,0,0);
                gltf.scene.scale.set(this.opts.scale, this.opts.scale, this.opts.scale);
                this.scene.add(gltf.scene);
                let dyal = 0.0015;
                let rotationValue = this.opts.rotationValue;
                this.animations.push(function () {
                    if (gltf.scene.rotation.y >= rotationValue) {
                        dyal = -Math.abs(dyal);
                    }
                    if (gltf.scene.rotation.y <= -rotationValue) {
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
        this.stats && this.stats.update();
        this.animations.forEach(funcs => funcs());
        this.renderer.render(this.scene, this.camera);
    }
}
