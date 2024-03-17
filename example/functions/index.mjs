import { default as f91 } from "./f_91.mjs";
import { f2 as f2 } from "./a/f2.mjs";
import { f2x as f2x } from "./a/f2.mjs";
import { f1a as f1a } from "./f1a.mjs";
export default [
  { name: "f91", dependencies: ["p1", "p2"], callable: f91 },
  { name: "f2", dependencies: ["p1", "f91"], callable: f2 },
  { name: "f2x", dependencies: ["p1", "f2"], callable: f2x },
  { name: "f1a", dependencies: ["p1", "f91"], callable: f1a },
];
