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

export type TensorInfosType = {
  name: string;
  n_dims: number;
  shape: bigint[];
  dtype: Integer;
  offset: bigint;
}[];
