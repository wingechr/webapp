#!/usr/bin/env node
"use strict";

import { writeFile, readFile } from "./utils/index.mjs";

const [_node, _script, inJson, outJs] = process.argv;

let text = readFile(inJson);
text = "export default " + text + ";";
writeFile(outJs, text);
