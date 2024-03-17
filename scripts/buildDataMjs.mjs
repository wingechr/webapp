#!/usr/bin/env node
"use strict";

import fs from "fs";

const [_node, _script, inJson, outJs] = process.argv;

let text = fs.readFileSync(inJson, "utf8");
text = "export default " + text + ";";
fs.writeFileSync(outJs, text, "utf8");
