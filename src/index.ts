import {
    WebGLRenderer, Scene, PerspectiveCamera, AxesHelper, Box3, Vector3, PMREMGenerator,
    ACESFilmicToneMapping, sRGBEncoding
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';


export default class Modelviewer {
    private ele: Element;
    private stats?: Stats;
    private renderer: WebGLRenderer;
    private scene: Scene;
    private camera: PerspectiveCamera;
    private controls: OrbitControls;
    private pmremGenerator: PMREMGenerator;
    private ready4Env?: Function;

    constructor(ele: Element, options: any) {
        this.ele = ele;

        if (options.stats) {
            this.stats = Stats();
            document.body.appendChild(this.stats.dom);
        }

        this.renderer = new WebGLRenderer({
            alpha: true,
            antialias: true
        });

        const width = options.size.width || ele.clientWidth;
        const height = options.size.height || ele.clientHeight;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        this.renderer.outputEncoding = sRGBEncoding;

        this.scene = new Scene();

        if (options.axesHelper) {
            // Todo: fix 100
            const axesHelper = new AxesHelper(options.axesHelper);
            this.scene.add(axesHelper);
        }

        this.camera = new PerspectiveCamera(
            60, width / height, 0.01, 1000
        );

        this.scene.add(this.camera);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = -10;
        this.controls.screenSpacePanning = true;

        this.controls.minPolarAngle=this.controls.maxPolarAngle= Math.PI / 2;


        this.pmremGenerator = new PMREMGenerator(this.renderer); // 使用hdr作为背景色
        this.pmremGenerator.compileEquirectangularShader();

        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        const environment = options.environment;

        if (environment) {
            this.getCubeMapTexture(environment.url);
            if (options.environment.callback) {
                this.ready4Env = options.environment.callback;
            }
        }

        this.ele.appendChild(this.renderer.domElement);
    }

    loadModelData(modelType = 'GLTF', modelSrc: string) {
        const src = JSON.stringify(modelSrc);
        if (modelType.toLowerCase() === 'gltf') {
            const loader = new GLTFLoader();
            loader.parse(src, '', gltf => {
                const object = gltf.scene;
                const box = new Box3().setFromObject(object);
                const size = box.getSize(new Vector3()).length();
                const center = box.getCenter(new Vector3());

                object.position.x += (object.position.x - center.x);
                object.position.y += (object.position.y - center.y);
                object.position.z += (object.position.z - center.z);

                this.camera.position.copy(center);
                // this.camera.position.x += size / 1.5;
                this.camera.position.x = 0;
                this.camera.position.y = 0; // += size / 5.0;
                this.camera.position.z += size;
                // this.camera.position.z += size;

                this.controls.maxDistance = size * 5;
                this.controls.minDistance = size / 5;
                this.camera.near = size / 10;
                this.camera.far = size * 10;
                this.camera.updateProjectionMatrix();

                this.camera.lookAt(center);

                this.scene.add(gltf.scene);

                this.animate();
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.stats && this.stats.update();
        this.controls && this.controls.update();
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
}
