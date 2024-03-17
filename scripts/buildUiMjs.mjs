#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import {
  extractDivIds,
  getExports,
  loadFiles,
  findMjsFiles,
} from "./utils/index.mjs";

/**
 *
 * @param {array} exports
 * @param {array} externalIds
 * @returns {array} exports
 */
function sortExports(exports, externalIds) {
  /* initialize nodes in tree */
  externalIds = externalIds || [];
  const tree = {};
  const byId = {};
  for (const exp of exports) {
    const obj = exp.object;
    const id = obj.id;
    const parentId = obj.parentId;
    if (tree[id]) {
      throw new Error(`duplicate id ${id}`);
    }
    tree[id] = [];
    byId[id] = exp;
  }

  /* link nodes, find externals */
  for (const exp of exports) {
    const obj = exp.object;
    const id = obj.id;
    const parentId = obj.parentId;
    if (!tree[parentId]) {
      if (externalIds.indexOf(parentId) == -1) {
        throw new Error(
          `Not defined external id: ${parentId} not in ${externalIds}`,
        );
      }
      tree[parentId] = [];
    }
    tree[parentId].push(id);
  }

  // walk through tree and create
  // sorted array of ids in orderedIds
  const orderedIds = [];
  /**
   *
   * @param {array} ids
   */
  function walk(ids) {
    // sort
    ids.sort();
    for (const id of ids) {
      // save id (except externals)
      if (externalIds.indexOf(id) == -1) {
        orderedIds.push(id);
      }
      // recursion
      walk(tree[id]);
    }
  }

  walk(externalIds);

  // return objects
  const result = orderedIds.map((id) => byId[id]);

  return result;
}

/**
 *
 * @param {array} items
 * @param {string} filepath
 */
function save(items, filepath) {
  let imports = [];
  let exports = [];
  for (const i in items) {
    const it = items[i];
    const filepathRel = it.relPath;
    const basename = path
      .basename(filepathRel)
      .replace(".mjs", "")
      .replace("-", "_");
    const nameImp = it.name;
    const name = `comp_${i}_${basename}_${nameImp}`;
    imports.push(`import {${nameImp} as ${name}} from "${filepathRel}";`);
    exports.push(name);
  }
  const text =
    imports.join("\n") + "\nexport default [\n" + exports.join(",\n") + "\n];";

  fs.writeFileSync(filepath, text);
}

const [_node, _script, inputDir, indexHtmlPath, jsOut] = process.argv;

const outDir = path.dirname(path.resolve(jsOut));
const externalDIvIds = extractDivIds(indexHtmlPath);

findMjsFiles(inputDir)
  .then((x) => x.sort())
  .then((x) => x.filter((f) => path.resolve(f) != path.resolve(jsOut)))
  .then((x) => loadFiles(x))
  .then((x) => getExports(x, outDir))
  .then((x) => sortExports(x, externalDIvIds))
  .then((exps) => save(exps, jsOut));
