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
  console.log("Scanning " + directory);
  const filePaths = glob.glob(directory + "/**/*.mjs");
  return filePaths;
}

/**
 *
 * @param {string} dirFrom
 * @param {string} filePath
 * @returns {string}
 */
function getRelPath(dirFrom, filePath) {
  return (
    "./" + path.relative(dirFrom, path.resolve(filePath)).replace(/\\/g, "/")
  );
}

/**
 *
 * @param {array} filePaths
 * @returns {Promise}
 */
function loadFiles(filePaths) {
  return Promise.all(
    filePaths.map((fp) => {
      let fpRel = getRelPath(__dirname, fp);
      console.log("importing " + fpRel);
      return import(fpRel).then((mod) => [fp, mod]);
    }),
  );
}

/**
 *
 * @param {array} files_modules
 * @param {string} outDir
 * @returns {array}
 */
function getExports(files_modules, outDir) {
  const exports = [];
  for (const [fp, mod] of files_modules) {
    for (const [name, obj] of Object.entries(mod)) {
      const fpRel = getRelPath(outDir, fp);
      console.log("Found export: " + name);
      exports.push({ relPath: fpRel, name: name, object: obj });
    }
  }
  return exports;
}

/**
 *
 * @param {string} filepathHtml
 * @returns {array}
 */
function extractDivIds(filepathHtml) {
  // Read the HTML file
  console.log("loading " + filepathHtml);
  const html = readFile(filepathHtml);
  const dom = new JSDOM(html);
  // Extract div ids
  const divIds = [];
  dom.window.document.querySelectorAll("*").forEach((e) => {
    const id = e.id.trim();
    if (id) {
      console.log("found id: " + id);
      divIds.push(id);
    }
  });

  return divIds;
}

function readFile(filePath) {
  console.log("Reading " + filePath);
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, text) {
  console.log("Writing " + filePath);
  return fs.writeFileSync(filePath, text, "utf8");
}

export {
  getExports,
  findMjsFiles,
  loadFiles,
  getRelPath,
  extractDivIds,
  readFile,
  writeFile,
};
