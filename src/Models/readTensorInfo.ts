"use strict";

import { readGGUFString } from "./readMetadataKeyValuePair";
/**
 * Utility function which reads the info key - value
 * pairs of the GGUF metadata section.
 * @param {Buffer} buffer - The content of the file as a buffer type.
 * @param {number} offset - the current offset position.
 * @returns {{
 * name: string;
 * n_dims: bigint;
 * shape: bigint[];
 * dtype: number;
 * tensorOffset: bigint;
 * offset: number
 * }} The data needed to present a tensor.
 */
export function readTensorInfo(
  buffer: Buffer,
  offset: number,
): {
  name: string;
  n_dims: number;
  shape: bigint[];
  dtype: number;
  tensorOffset: bigint;
  offset: number;
} {
  // Read name
  const { str: name, offset: offsetAfterName } = readGGUFString(buffer, offset);
  offset = offsetAfterName;
  // Read n_dimensions
  const n_dims = buffer.readUInt32LE(offset);
  offset += 4;
  // Read dimensions
  const shape: bigint[] = [];
  for (let i = 0; i < n_dims; i++) {
    const dim = buffer.readBigUInt64LE(offset);
    offset += 8;
    shape.push(dim);
  }
  // Read type
  const dtype = buffer.readUInt32LE(offset);
  offset += 4;
  // Read offset
  const tensorOffset = buffer.readBigUInt64LE(offset);
  offset += 8;
  return { name, n_dims, shape, dtype, tensorOffset, offset };
}
