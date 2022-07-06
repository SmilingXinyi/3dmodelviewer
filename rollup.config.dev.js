import serve from 'rollup-plugin-serve'
import typescript from '@rollup/plugin-typescript';
// import {nodeResolve} from '@rollup/plugin-node-resolve';

// import commonjs from "@rollup/plugin-commonjs";
// import {terser} from 'rollup-plugin-terser';

// const outConf = {
//     name: 'modelviewer',
//     file: 'dist/modelviewer.js',
//     format: 'umd',
//     sourcemap: true
// }

// const outConf = {
//     name: 'modelviewer',
//     // file: 'dist/modelviewer.js',
//     format: "es",
//     dir: 'dist',
//     sourcemap: true,
//     // inlineDynamicImports: true
//     manualChunks: {
//         three: ['three'],
//         GLTFLoader: ['three/examples/jsm/loaders/GLTFLoader'],
//         stats: ['three/examples/jsm/libs/stats.module'],
//         OrbitControls: ['three/examples/jsm/controls/OrbitControls']
//     }
//
// }

// export default {
//     input: 'src/start.ts',
//     output: [
//         outConf
//     ],
//     plugins: [
//         // typescript({tsconfig: './tsconfig.json'}),
//         // nodeResolve()
//     ]
// };


export default {
    input: './src/index.ts',
    output: [
        {
            name: 'modelviewer',
            format: 'es',
            dir: 'dist',
            sourcemap: true,
            manualChunks: {
                // three: ['three'],
                // GLTFLoader: ['three/examples/jsm/loaders/GLTFLoader'],
                // stats: ['three/examples/jsm/libs/stats.module'],
                // OrbitControls: ['three/examples/jsm/controls/OrbitControls']
            }
        }
    ],
    plugins: [
        typescript({tsconfig: './tsconfig.json'}),
        serve({
            open: true,
            contentBase: ['dist'],
            host: 'localhost',
            port: 8001
        })
    ]
}
