#!/usr/bin/env node
"use strict";

import { fileURLToPath } from "url";
import path from "path";
import {
  getExports,
  loadFiles,
  findMjsFiles,
  writeFile,
  getRelPath,
} from "./utils/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {function} func
 * @returns {array} [name, parameterNames]
 */
function getFunctionInfo(func) {
  // Get the name of the function
  const name = func.name;

  // Get the source code of the function
  const functionSource = func.toString();

  // Use regular expressions to parse parameter names
  const parameterNames =
    functionSource
      .slice(functionSource.indexOf("(") + 1, functionSource.indexOf(")"))
      .match(/([^\s,]+)/g) || [];

  return [name, parameterNames];
}

/**
 *
 * @param {array} exports
 * @param {object} data
 * @returns {array} exports
 */
function sortExports(exports, data) {
  let dataIds = new Set(Object.keys(data));
  let todo = exports;
  let done = [];
  let maxDefer = todo.length; // no infinite iterations

  console.log("Sorting functions...");

  // find function dependencies
  for (const exp of exports) {
    const [nameDef, dependencies] = getFunctionInfo(exp.object);
    exp.dependencies = dependencies;
    exp.nameDef = nameDef;
    exp.id = exp.name == "default" ? exp.nameDef : exp.name;
  }

  while (todo.length > 0) {
    const exp = todo.shift(); // pop first element
    /* if all dependencies are in dataIds: push on results,
    otherwiese: put at end andcheck later
    */

    let isOk = true;
    for (const d of exp.dependencies) {
      if (!dataIds.has(d)) {
        //console.log(`dependency missing for ${exp.id}: ${d}`);
        isOk = false;
        break;
      }
    }

    if (isOk) {
      console.log(`${exp.id}(${exp.dependencies})`);
      done.push(exp);
      //console.log(`adding ${exp.id}`);
      maxDefer = todo.length;
      dataIds.add(exp.id);
    } else {
      //console.log(`deferring ${exp.id}`);
      todo.push(exp);
    }

    //console.log(maxDefer);
    // prevent infinite loop in dependency cycles
    if (maxDefer < 0) {
      throw new Error(
        `Infinite loop: Dependency cycle: ${JSON.stringify(todo)}`,
      );
    } else {
      maxDefer -= 1;
    }
  }
  return done;
}

/**
 *
 * @param {array} items
 * @param {string} filepath
 */
function save(items, filepath) {
  let imports = [];
  let exports = [];
  for (const it of items) {
    imports.push(`import {${it.name} as ${it.id}} from "${it.relPath}";`);
    exports.push(
      // eslint-disable-next-line
      `{name: "${it.id}", dependencies: ${JSON.stringify(it.dependencies)}, callable: ${it.id}}`
    );
  }
  const text =
    imports.join("\n") + "\nexport default [\n" + exports.join(",\n") + "\n];";

  writeFile(filepath, text);
}

const [_node, _script, inputDir, jsData, jsOut] = process.argv;
const jsDataRel = getRelPath(__dirname, jsData);
const outDir = path.dirname(path.resolve(jsOut));

import(jsDataRel).then((modData) => {
  findMjsFiles(inputDir)
    .then((x) => x.sort())
    .then((x) => x.filter((f) => path.resolve(f) != path.resolve(jsOut)))
    .then((x) => loadFiles(x))
    .then((x) => getExports(x, outDir))
    .then((x) => sortExports(x, modData.default))
    .then((exps) => save(exps, jsOut));
});
