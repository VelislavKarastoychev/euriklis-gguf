"use strict";

import fs from "fs/promises";
import type { Integer } from "../Types";

/**
 * Reads a piece from given file determined from
 * a length and a position from which to start
 * reading.
 * @param {string} path - The url of the file.
 * @param {Integer} position - The position in the
 * file from which the reading process will start.
 * @param {Integer} length - The length in bytes.
 * @returns {Buffer} - The bytes which was read.
 */
export const readBytesFromFile = async (
  path: string,
  position: Integer,
  length: Integer,
): Promise<Buffer> => {
  const bytesContent = new Uint8Array(length);
  const fileHandler = await fs.open(path, "r");
  await fileHandler.read(bytesContent, 0, length, position);
  await fileHandler.close();

  return Buffer.from(bytesContent.buffer);
};
