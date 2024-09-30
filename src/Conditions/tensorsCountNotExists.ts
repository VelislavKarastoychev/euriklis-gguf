"use strict";

import type { GGUF } from "..";

export const tensorsCountNotExists = (gguf: GGUF) => {
  if (!gguf.tensorsCount) {
    gguf.logs = "No tensors in this file or data not loaded.";
    return true;
  }

  return false;
};
