"use strict";

import type { GGUF } from "..";
export const isNotLoaded = (gguf: GGUF) => {
  if (!gguf.isLoaded) {
    gguf.logs = "The buffer is not loaded.";
    return true;
  }

  return false;
};
