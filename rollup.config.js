"use strict";

import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";
import json from "@rollup/plugin-json";

import cfgFile from "./screeps.json" with { type: "json" };

const dest = process.env.DEST;

if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
}

const config = cfgFile[dest];

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    json(),
    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src" }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    screeps({ config, dryRun: config == null }),
  ],
};
