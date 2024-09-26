"use strict";
import { readMetadataKeyValuePair, readTensorInfo } from "./Models";
import type { Integer, GGUFLogsType, TensorInfosType } from "./Types";

export class GGUF {
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

  get file(): string {
    return this._file;
  }

  set file(f: string) {
    this._file = f;
  }

  get logs(): GGUFLogsType[] {
    return this._logs;
  }

  set logs(message: GGUFLogsType) {
    this._logs.push(message);
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

  async load() {
    if (this.file) {
      // load the file buffer...
      let offset: Integer, n: Integer;
      const arrayBuffer: ArrayBuffer = await Bun.file(this.file).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
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
      // read the tensors:
      let i;
      for (i = 0; i < tensorsCount; i++) {}
      console.log("Started reading of the tensors.");

      return true;
    }

    this.logs = {
      date: Date.now().toString(),
      message: "No file defined in the current GGUF instance.",
    };

    return false;
  }

  readTensorByIndex(index: Integer) {
    if (this.tensorsCount) {
      if (this.tensorsCount >= index)
        throw new Error("Incorrect tensor index.");
      const buffer = this.buffer;
      const tensorInfo = this.tensorInfos[index];
      const nextTensorInfo = this.tensorInfos[index]?.offset || buffer?.length;
      const data = buffer?.slice(
        this._metadataEndOffset + tensorInfo.offset + 1,
      );
      return data;
    }
  }
}
