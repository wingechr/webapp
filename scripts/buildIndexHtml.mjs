#!/usr/bin/env node
"use strict";

import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { getRelPath } from "./utils/index.mjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [_node, _script, uiJs, inHtml, outHtml, createStaticHtml] = process.argv;

const uiJsRel = getRelPath(__dirname, path.resolve(uiJs));

let html = fs.readFileSync(inHtml, "utf8");

import(uiJsRel).then((mod) => {
  const dom = new JSDOM(html);
  if (createStaticHtml.toLowerCase() == "true") {
    for (const component of mod.default) {
      component.createHtml(dom.window.document);
    }
  }

  html = dom.serialize();
  fs.writeFileSync(outHtml, html, "utf8");
});
