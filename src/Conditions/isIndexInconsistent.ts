"use strict";
import type { GGUF } from "..";
import type { Integer } from "../Types";

export const isIndexInconsistent = (gguf: GGUF, index: Integer) => {
  if (index < 0) {
    gguf.logs = "The index has to be a positive integer.";
    return true;
  }
  if (gguf.tensorsCount <= index) {
    gguf.logs = "The index has to be smaller than the tensors count.";
    return true;
  }

  return false;
};
