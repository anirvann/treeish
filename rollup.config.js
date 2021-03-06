import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import { uglify } from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';

let pluginOptions = [
  resolve(),
  eslint(),
  babel({
    exclude: 'node_modules/**',
  }),
  commonjs({
    compress: {
      drop_console: true,
      unsafe: true
    },
    mangle: {
      eval: true,
      unsafe: true
    },
  }),
  uglify(),
  filesize({
    showGzippedSize: true,
  })
];

export default {
  input: 'index.js',
  output: {
    file: 'dist/tree.min.js',
    format: 'cjs'
  },
  plugins: pluginOptions,
};