"use strict";

import type { GGUF } from "..";
import type { Integer } from "../Types";
import { readBytesFromFile } from "./readBytesFromFile";

export const getDataBuffer = async (
  tensorDataStart: Integer,
  gguf: GGUF,
  index: Integer,
  typeInfo: {
    name: string;
    TypedArrayConstructor: any;
    elementSize: Integer;
  },
) => {
  const tensorInfo = gguf.tensorInfos[index];
  const dataStart = tensorDataStart + Number(tensorInfo.offset);

  const { TypedArrayConstructor, elementSize } = typeInfo;
  const totalElements = tensorInfo.shape.reduce(
    (total, dim) => total * Number(dim),
    1,
  );
  let dataEnd: number;
  if (index < Number(gguf.tensorsCount) - 1) {
    const nextTensorInfo = gguf.tensorInfos[index + 1];
    dataEnd = tensorDataStart + Number(nextTensorInfo.offset);
  } else dataEnd = dataStart + totalElements * elementSize;

  const dataBuffer = await readBytesFromFile(
    gguf.file,
    dataStart,
    dataEnd - dataStart,
  );

  return dataBuffer;
};
