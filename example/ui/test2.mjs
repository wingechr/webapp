"use strict";
import {
  Component,
  LabelOutputComponent,
} from "@wingechr/webapp/components/index.mjs";

const c1 = new LabelOutputComponent("id2", "id3", "f2");
const c2 = new Component("main", "id2");

export { c1, c2 };
