import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

const outConf = {
    name: 'modelviewer',
    file: 'dist/modelviewer.js',
    format: 'umd',
    sourcemap: true
}

export default {
    input: 'src/index.ts',
    output: [
        outConf,
        Object.assign({}, outConf, {
            file: 'dist/modelviewer.min.js',
            plugins: [
                terser()
            ]
        }),
        Object.assign({}, outConf, {
            format: 'esm',
            file: 'dist/modelviewer.esm.js'
        })
    ],
    plugins: [
        typescript({tsconfig: './tsconfig.json'}),
        nodeResolve()
    ],

};
