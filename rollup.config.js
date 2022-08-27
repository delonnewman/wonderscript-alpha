// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/wonderscript.ts',
    output: {
        dir: 'dist',
        format: 'umd',
        name: 'wonderscript',
        sourcemap: true,
    },
    plugins: [typescript()]
};