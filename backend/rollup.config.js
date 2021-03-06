import { terser } from "rollup-plugin-terser";
// plugin-node-resolve and plugin-commonjs are required for a rollup bundled project
// to resolve dependencies from node_modules. See the documentation for these plugins
// for more details.
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
	input: "src/index.ts",
	output: {
		exports: "named",
		format: "es",
		file: "dist/worker.mjs",
		sourcemap: true,
	},
	plugins: [commonjs(), typescript(), nodeResolve({ browser: true }), terser()],
};
