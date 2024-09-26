"use strict";

import type { Integer } from "../Types";

export const halfFloat2Float = (h: Integer): number => {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7c00) >> 10;
  const f = h & 0x03ff;

  if (e === 0) {
    // Subnormal number
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
  } else if (e === 0x1f) {
    // NaN or Infinity
    return f ? NaN : s ? -Infinity : Infinity;
  } else {
    // Normalized number
    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
  }
};
