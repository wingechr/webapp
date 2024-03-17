"use strict";

import { App } from "@wingechr/webapp";

import data from "./data/index.mjs";
import functions from "./functions/index.mjs";

const app = new App(data, functions);

export default app;
