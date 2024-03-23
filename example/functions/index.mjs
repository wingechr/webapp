/* eslint-disable */
/*
created with:
node scripts/buildFunctionsMjs.mjs example/functions example/data/index.mjs example/functions/index.mjs
*/
/* eslint-enable */
import { default as comp_0_f_91_f91 } from "./f_91.mjs";
import { f2 as comp_1_f2_f2 } from "./a/f2.mjs";
import { f2x as comp_2_f2_f2x } from "./a/f2.mjs";
import { f1a as comp_3_f1a_f1a } from "./f1a.mjs";
export default [
  {
    name: "comp_0_f_91_f91",
    dependencies: ["p1", "p2"],
    callable: comp_0_f_91_f91,
  },
  { name: "comp_1_f2_f2", dependencies: ["p1", "f91"], callable: comp_1_f2_f2 },
  {
    name: "comp_2_f2_f2x",
    dependencies: ["p1", "f2"],
    callable: comp_2_f2_f2x,
  },
  {
    name: "comp_3_f1a_f1a",
    dependencies: ["p1", "f91"],
    callable: comp_3_f1a_f1a,
  },
];
