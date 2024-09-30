"use strict";
import fs from "fs/promises";
import * as conditions from "./Conditions";
import {
  alignOffset,
  calculateTensorDataEnd,
  convertDataToJSType,
  halfFloat2Float,
  readBytesFromFile,
  readMetadataKeyValuePair,
  readTensorInfo,
} from "./Models";
import type {
  Integer,
  GGUFLogsType,
  TensorInfosType,
  TensorType,
  TypedArray,
} from "./Types";

export class GGUF {
  public static ggmlTypeToTypedArray(dtype: number) {
    const typeMap: {
      [key: number]: {
        name: string;
        TypedArrayConstructor: any;
        elementSize: number;
      };
    } = {
      0: { name: "F32", TypedArrayConstructor: Float32Array, elementSize: 4 }, // GGML_TYPE_F32
      1: { name: "F16", TypedArrayConstructor: Uint16Array, elementSize: 2 }, // GGML_TYPE_F16
      24: { name: "I8", TypedArrayConstructor: Int8Array, elementSize: 1 }, // GGML_TYPE_I8
      25: { name: "I16", TypedArrayConstructor: Int16Array, elementSize: 2 }, // GGML_TYPE_I16
      26: { name: "I32", TypedArrayConstructor: Int32Array, elementSize: 4 }, // GGML_TYPE_I32
      27: { name: "I64", TypedArrayConstructor: BigInt64Array, elementSize: 8 }, // GGML_TYPE_I64
      28: { name: "F64", TypedArrayConstructor: Float64Array, elementSize: 8 }, // GGML_TYPE_F64
      // Add other types as needed
    };

    return typeMap[dtype];
  }

  private _alignment: Integer = 32;
  private _file: string = "";
  private _logs: GGUFLogsType[] = [];
  private _magic: string = "";
  private _version: Integer = 3;
  private _tensorsCount: bigint = 0n;
  private _metadataKVPairsCount: bigint = 0n;
  private _metadata: Record<string, any> = {};
  private _tensorInfos: TensorInfosType = [];
  private offset: Integer = 0;
  private buffer: Buffer | null = null;
  private _metadataEndOffset: number = 0;

  constructor(file: string = "") {
    if (file) this.file = file;
  }

  get alignment(): Integer {
    return this._alignment;
  }

  set alignment(alignment: Integer) {
    this._alignment = alignment;
  }

  get file(): string {
    return this._file;
  }

  set file(f: string) {
    this._file = f;
  }

  get logs(): GGUFLogsType[] {
    return this._logs;
  }

  set logs(message: string) {
    const log: GGUFLogsType = {
      date: Date.now().toString(),
      message,
    };
    this._logs.push(log);
  }

  get magic(): string {
    return this._magic;
  }

  set magic(magic: string) {
    this._magic = magic;
  }

  get version(): Integer {
    return this._version;
  }

  set version(version: Integer) {
    this._version = version;
  }

  get tensorsCount(): bigint {
    return this._tensorsCount;
  }

  set tensorsCount(tensorsCount: bigint) {
    this._tensorsCount = tensorsCount;
  }

  get metadataKVPairsCount(): bigint {
    return this._metadataKVPairsCount;
  }

  set metadataKVPairsCount(metadataKVPairsCount: bigint) {
    this._metadataKVPairsCount = metadataKVPairsCount;
  }

  get metadata(): Record<string, any> {
    return this._metadata;
  }

  set metadata(metadata: Record<string, any>) {
    this._metadata = metadata;
  }

  get tensorInfos(): TensorInfosType {
    return this._tensorInfos;
  }

  set tensorInfos(tensorInfos: TensorInfosType) {
    this._tensorInfos = tensorInfos;
  }

  get isLoaded() {
    return !!this.buffer;
  }

  async load() {
    if (this.file) {
      // load the file buffer...
      let offset: Integer, n: Integer;
      //const arrayBuffer: ArrayBuffer = await Bun.file(this.file).arrayBuffer();
      const buffer: Buffer = await fs.readFile(this.file);
      this.buffer = buffer;
      offset = this.offset;
      this.offset += 4;
      // read the magic:
      const magic = this.buffer.toString("ascii", offset, this.offset);
      if (magic !== "GGUF")
        throw new Error("Internal error. The file is not GGUF specified.");
      this.magic = magic;
      // read the version:
      offset = this.offset;
      this.offset += 4;
      const version = buffer.readUInt32LE(offset);
      this.version = version;
      // read the tensors count.
      offset = this.offset;
      this.offset += 8;
      const tensorsCount = buffer.readBigInt64LE(offset);
      this.tensorsCount = tensorsCount;
      // read the metadata key - value pairs count.
      offset = this.offset;
      this.offset += 8;
      const metadataKVPairsCount = buffer.readBigInt64LE(offset);
      this.metadataKVPairsCount = metadataKVPairsCount;
      // read the metadata:
      const metadata: Record<string, any> = {};
      offset = this.offset;
      n = Number(this.metadataKVPairsCount);
      offset = this.offset;
      for (let i = 0; i < n; i++) {
        const {
          key,
          value,
          offset: newOffset,
        } = readMetadataKeyValuePair(buffer, offset);
        metadata[key] = value;
        offset = newOffset;
      }
      this.offset = offset;
      this.metadata = metadata;
      // read the tensor info
      const tensorInfos = [];
      n = Number(this.tensorsCount);
      offset = this.offset;
      for (let i = 0; i < n; i++) {
        const {
          name,
          shape,
          n_dims,
          dtype,
          tensorOffset,
          offset: offsetAfterReading,
        } = readTensorInfo(buffer, offset);
        offset = offsetAfterReading;
        tensorInfos.push({
          name,
          n_dims,
          shape,
          dtype,
          offset: tensorOffset,
        });
      }
      this.offset = offset;
      // store the end of the metadata offset;
      this._metadataEndOffset = this.offset;
      this.tensorInfos = tensorInfos;
      this._tensorInfos.sort((a, b) => Number(a.offset) - Number(b.offset));
      this.alignment = this.metadata["general.alignment"] || this._alignment;

      return true;
    }

    this.logs = "No file defined in the current GGUF instance.";

    return false;
  }

  get tensorsDataStart() {
    return alignOffset(this._metadataEndOffset, this.alignment);
  }

  async readTensorByIndex(index: Integer): Promise<{
    name: string;
    data: TypedArray;
    shape: bigint[];
    dtype: number;
  } | null> {
    const isNotLoaded = conditions.isNotLoaded(this);
    const tensorsCountNotExists = conditions.tensorsCountNotExists(this);
    const indexIsInappropriate = conditions.isIndexInconsistent(this, index);
    if (isNotLoaded || tensorsCountNotExists || indexIsInappropriate)
      return null;

    // get the tensor info index.
    const tensorsDataStart = this.tensorsDataStart;
    const tensorInfo = this.tensorInfos[index];

    const dataStart = tensorsDataStart + Number(tensorInfo.offset);
    const typeInfo = GGUF.ggmlTypeToTypedArray(tensorInfo.dtype);

    const { TypedArrayConstructor, elementSize } = typeInfo;
    const totalElements = tensorInfo.shape.reduce(
      (total, dim) => total * Number(dim),
      1,
    );
    const dataEnd = calculateTensorDataEnd(
      this,
      index,
      dataStart,
      totalElements,
      elementSize,
    );
    const dataBuffer = await readBytesFromFile(
      this.file,
      dataStart,
      dataEnd - dataStart,
    );

    const expectedDataLength = elementSize * totalElements;
    if (expectedDataLength > dataBuffer.length) {
      this.logs =
        "The data in the buffer is too short for expected number of total elements.";

      return null;
    }

    const data: TypedArray = convertDataToJSType(
      tensorInfo,
      dataBuffer,
      totalElements,
      TypedArrayConstructor,
    );
    return {
      name: tensorInfo.name,
      data,
      shape: tensorInfo.shape,
      dtype: tensorInfo.dtype,
    };
  }
}
