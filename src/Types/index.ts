"use strict";

export type Integer = number;
export type NumericMatrix = number[][]; // Numeric matrix
export type MatrixType =
  | Uint8ClampedArray[]
  | Int8Array[]
  | Uint8Array[]
  | Int16Array[]
  | Uint16Array[]
  | Int32Array[]
  | Uint32Array[];

export type TensorType =
  | NumericMatrix
  | NumericMatrix[]
  | MatrixType
  | MatrixType[]
  | BigInt64Array[]
  | TensorType[];

export type GGUFLogsType = { date: string; message: string };

export type TensorInfosElementType = {
  name: string;
  n_dims: number;
  shape: bigint[];
  dtype: Integer;
  offset: bigint;
};
export type TypedArrayConstructorType =
  | Uint8ArrayConstructor
  | Int8ArrayConstructor
  | Uint16ArrayConstructor
  | Int16ArrayConstructor
  | Uint32ArrayConstructor
  | Int32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;
export type TensorInfosType = TensorInfosElementType[];
export type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;
