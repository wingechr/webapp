#!/usr/bin/env node
"use strict";

import path from "path";
import { JSDOM } from "jsdom";
import { getRelPath, writeFile, readFile } from "./utils/index.mjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [_node, _script, uiJs, inHtml, outHtml, createStaticHtml] = process.argv;

const uiJsRel = getRelPath(__dirname, path.resolve(uiJs));

let html = readFile(inHtml);

import(uiJsRel).then((mod) => {
  const dom = new JSDOM(html);
  if (createStaticHtml.toLowerCase() == "true") {
    for (const component of mod.default) {
      component.createHtml(dom.window);
    }
  }

  html = dom.serialize();
  writeFile(outHtml, html);
});
