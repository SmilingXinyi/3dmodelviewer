import {
    WebGLRenderer, Scene, PerspectiveCamera, CameraHelper, AxesHelper, Box3, Vector3, PMREMGenerator,
    ACESFilmicToneMapping, sRGBEncoding, MeshStandardMaterial, BoxHelper, HemisphereLight, AmbientLight,
    AnimationMixer, Clock, DirectionalLight
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';

type AmbientLightType = {
    color: number;
    intensity: number;
}

type DirectionalLightType = {
    color?: number,
    position: [x: number, y: number, z: number],
    intensity?: number
}

const defaultOptions = {
    camera: {
        helper: false,
        lookAtPoint: false
    },
    model: {
        helper: false,
        wireframe: false
    },
    axes: {
        helper: false
    },
    lights: {
        hemisphereLight: null,
        ambientLights: <AmbientLightType[] | null>null,
        directionalLights: <DirectionalLightType[] | null>null
    }
}

export default class Modelviewer {
    private ele: Element;
    private stats?: Stats;
    private controls?: OrbitControls;
    private renderer: WebGLRenderer;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private pmremGenerator: PMREMGenerator;
    private ready4Env?: Function;
    protected options: any;
    private mixer: any;
    private readonly clock: Clock;

    constructor(ele: Element, options: any) {
        this.ele = ele;
        this.options = Object.assign({}, defaultOptions, options);

        if (options.stats) {
            this.stats = Stats();
            document.body.appendChild(this.stats.dom);
        }

        this.renderer = new WebGLRenderer({
            alpha: true,
            antialias: true
        });

        this.clock = new Clock();

        const width = options.size?.width || ele.clientWidth;
        const height = options.size?.height || ele.clientHeight;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.outputEncoding = sRGBEncoding;

        this.scene = new Scene();

        if (options.axes?.helper) {
            const axesHelper = new AxesHelper(options.axes.helper);
            this.scene.add(axesHelper);
        }

        this.camera = new PerspectiveCamera(
            60, width / height, 0.01, 1000
        );

        if (options.camera && options.camera.helper) {
            const cameraHelper = new CameraHelper(this.camera);
            this.scene.add(cameraHelper);
        }

        this.scene.add(this.camera);

        if (options.controls) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.autoRotate = false;
            this.controls.autoRotateSpeed = -10;
            this.controls.screenSpacePanning = true;

            if (options.controls.yAxis) {
                this.controls.minPolarAngle = this.controls.maxPolarAngle = Math.PI / 2;
            }

            if (options.controls.xAxis) {
                this.controls.minPolarAngle = this.controls.maxPolarAngle = Math.PI;
            }
        }

        this.pmremGenerator = new PMREMGenerator(this.renderer); // 使用hdr作为背景色
        this.pmremGenerator.compileEquirectangularShader();

        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        const environment = options.environment;

        if (environment) {
            if (environment.url) {
                this.getCubeMapTexture(environment.url);
                if (options.environment.callback) {
                    this.ready4Env = options.environment.callback;
                }
            }
        }

        let {hemisphereLight, ambientLights, directionalLights} = this.options.lights;
        if (Array.isArray(hemisphereLight)) {
            const [sky, ground, intensity] = hemisphereLight;
            this.scene.add(new HemisphereLight(sky, ground, intensity));
        }

        if (ambientLights) {
            if (!Array.isArray(ambientLights)) {
                ambientLights = [ambientLights];
            }

            ambientLights.forEach((ambientLight: AmbientLightType) => {
                this.scene.add(new AmbientLight(ambientLight.color, ambientLight.intensity));
            });
        }

        if (directionalLights) {
            directionalLights.forEach((directionalLightInfo: DirectionalLightType) => {
                const {position, color = 0xffffff, intensity = 1} = directionalLightInfo;
                const directionalLight = new DirectionalLight(color, intensity);
                directionalLight.position.set(...position);
                this.scene.add(directionalLight);
            });
        }

        this.animate = this.animate.bind(this);

        this.ele.appendChild(this.renderer.domElement);
    }

    loadModelData(modelType = 'gltf', modelSrc: string, callback?: Function) {
        const src = JSON.stringify(modelSrc);
        if (modelType.toLowerCase() === 'gltf') {
            const loader = new GLTFLoader();
            loader.parse(src, '', gltf => {
                let object = gltf.scene;
                if (this.options.model.fix) {
                    object = this.options.model.fix(object);
                }
                const box = new Box3().setFromObject(object);
                const size = box.getSize(new Vector3()).length();
                const center = box.getCenter(new Vector3());

                const animations = gltf.animations;
                if (animations && animations.length > 0) {
                    this.mixer = new AnimationMixer(object);
                    let action = this.mixer.clipAction(animations[0]);
                    action.play()
                }

                object.position.x += (object.position.x - center.x);
                object.position.y += (object.position.y - center.y);
                object.position.z += (object.position.z - center.z);

                if (this.options.model.helper) {
                    const boxHelper = new BoxHelper(object, 0xffff00);
                    this.scene.add(boxHelper);
                }

                this.traverseMaterials(object, (material: MeshStandardMaterial) => {
                    material.wireframe = this.options.model.wireframe;
                });

                this.camera.position.copy(center);
                // this.camera.position.x += size / 1.5;
                this.camera.position.x = 0;
                this.camera.position.y = 0; // += size / 5.0;
                this.camera.position.z += size;
                // this.camera.position.z = 0;

                if (this.controls) {
                    this.controls.maxDistance = size * 5;
                    this.controls.minDistance = size / 5;
                }
                this.camera.near = size / 10;
                this.camera.far = size * 10;
                this.camera.updateProjectionMatrix();
                const staticPoint = this.options.camera.lookAtPoint;
                if (staticPoint) {
                    if (staticPoint instanceof Array && staticPoint.length === 3) {
                        this.camera.lookAt(new Vector3().fromArray(staticPoint));
                    } else {
                        this.camera.lookAt(new Vector3(0, 0, 0));
                    }
                } else {
                    this.camera.lookAt(center);
                }

                callback && callback();

                this.scene.add(gltf.scene);
                this.animate();
            });
        }
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.stats && this.stats.update();
        this.controls && this.controls.update();
        this.mixer && this.mixer.update(this.clock.getDelta());
        this.render();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    private getCubeMapTexture(hdrsrc: string) {
        new RGBELoader()
            .load(hdrsrc, (texture) => {
                const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
                this.pmremGenerator.dispose();
                this.scene.environment = envMap;
                this.ready4Env && this.ready4Env(true);
            }, undefined, (error) => {
                this.ready4Env && this.ready4Env(false);
                throw error;
            });
    }

    private traverseMaterials(object: any, callback: Function) {
        object.traverse((node: any) => {
            if (!node.isMesh) return;
            const materials = Array.isArray(node.material)
                ? node.material
                : [node.material];
            materials.forEach(callback);
        });
    }
}
