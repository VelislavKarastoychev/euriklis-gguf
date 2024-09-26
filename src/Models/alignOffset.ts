"use strict";
import type { Integer } from "../Types";

export const alignOffset = (offset: Integer, alignment: Integer) => {
  return offset + ((alignment - (offset % alignment)) % alignment);
};
