"use strict";
import type { GGUF } from "..";
import type { Integer } from "../Types";

export const calculateTensorDataEnd = (
  gguf: GGUF,
  index: Integer,
  dataStart: Integer,
  totalElements: Integer,
  elementSize: Integer,
) => {
  let dataEnd: Integer;
  if (index < Number(gguf.tensorsCount) - 1) {
    const nextTensorInfo = gguf.tensorInfos[index + 1];
    dataEnd = dataStart + Number(nextTensorInfo.offset);
  } else dataEnd = dataStart + totalElements * elementSize;

  return dataEnd;
};
