"use strict";

import fs from "fs";
import path from "path";
import { glob } from "glob";
import { JSDOM } from "jsdom";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {string} directory
 * @returns {Promise} resolves to list of paths
 */
function findMjsFiles(directory) {
  const filePaths = glob.glob(directory + "/**/*.mjs");
  return filePaths;
}

function getRelPath(dirFrom, filePath) {
  return (
    "./" + path.relative(dirFrom, path.resolve(filePath)).replace(/\\/g, "/")
  );
}

function loadFiles(filePaths) {
  return Promise.all(
    filePaths.map((fp) => {
      let fpRel = getRelPath(__dirname, fp);
      return import(fpRel).then((mod) => [fp, mod]);
    }),
  );
}

function getExports(files_modules, outDir) {
  const exports = [];
  for (const [fp, mod] of files_modules) {
    for (const [name, obj] of Object.entries(mod)) {
      const fpRel = getRelPath(outDir, fp);
      exports.push({ relPath: fpRel, name: name, object: obj });
    }
  }
  return exports;
}

function extractDivIds(filepathHtml) {
  // Read the HTML file
  const html = fs.readFileSync(filepathHtml, "utf8");
  const dom = new JSDOM(html);
  // Extract div ids
  const divIds = [];
  dom.window.document.querySelectorAll("*").forEach((e) => {
    const id = e.id.trim();
    if (id) {
      divIds.push(id);
    }
  });

  return divIds;
}

export { getExports, findMjsFiles, loadFiles, getRelPath, extractDivIds };
