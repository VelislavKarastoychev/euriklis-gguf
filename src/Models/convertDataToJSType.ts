"use strict";

import type {
  Integer,
  TensorInfosElementType,
  TypedArray,
  TypedArrayConstructorType,
} from "../Types";
import { halfFloat2Float } from "./halfFloat2Float";

export const convertDataToJSType = (
  tensorInfo: TensorInfosElementType,
  dataBuffer: Buffer,
  totalElements: Integer,
  TypedArrayConstructor: TypedArrayConstructorType,
): TypedArray => {
  let dataArray;
  if (tensorInfo.dtype === 1) {
    // GGML_TYPE_F16:
    const uint16Array = new Uint16Array(
      dataBuffer.buffer,
      dataBuffer.byteOffset,
      totalElements,
    );
    const float32Array = new Float32Array(totalElements);
    for (let i = 0; i < totalElements; i++) {
      float32Array[i] = halfFloat2Float(uint16Array[i]);
    }
    dataArray = float32Array;
  } else {
    dataArray = new TypedArrayConstructor(
      dataBuffer.buffer,
      dataBuffer.byteOffset,
      totalElements,
    );
  }

  return dataArray;
};
