"use strict";
import type { Integer } from "../Types";

export function readGGUFString(buffer: Buffer, offset: Integer) {
  const len = Number(buffer.readBigUInt64LE(offset));
  offset += 8;
  const str = buffer.toString("utf8", offset, offset + len);
  offset += len;
  return { str, offset };
}

export function readMetadataValue(
  buffer: Buffer,
  offset: number,
  value_type: number,
): { value: any; offset: number } {
  switch (value_type) {
    case 0: // UINT8
      const uint8 = buffer.readUInt8(offset);
      offset += 1;
      return { value: uint8, offset };
    case 1: // INT8
      const int8 = buffer.readInt8(offset);
      offset += 1;
      return { value: int8, offset };
    case 2: // UINT16
      const uint16 = buffer.readUInt16LE(offset);
      offset += 2;
      return { value: uint16, offset };
    case 3: // INT16
      const int16 = buffer.readInt16LE(offset);
      offset += 2;
      return { value: int16, offset };
    case 4: // UINT32
      const uint32 = buffer.readUInt32LE(offset);
      offset += 4;
      return { value: uint32, offset };
    case 5: // INT32
      const int32 = buffer.readInt32LE(offset);
      offset += 4;
      return { value: int32, offset };
    case 6: // FLOAT32
      const float32 = buffer.readFloatLE(offset);
      offset += 4;
      return { value: float32, offset };
    case 7: // BOOL
      const boolValue = buffer.readUInt8(offset);
      offset += 1;
      return { value: boolValue !== 0, offset };
    case 8: // STRING
      const { str, offset: newOffset } = readGGUFString(buffer, offset);
      return { value: str, offset: newOffset };
    case 9: // ARRAY
      // Read value type
      const arrayValueType = buffer.readUInt32LE(offset);
      offset += 4;
      // Read length
      const arrayLength = Number(buffer.readBigUInt64LE(offset));
      offset += 8;
      const array = [];
      for (let i = 0; i < arrayLength; i++) {
        const { value: elementValue, offset: newOffset } = readMetadataValue(
          buffer,
          offset,
          arrayValueType,
        );
        offset = newOffset;
        array.push(elementValue);
      }
      return { value: array, offset };
    case 10: // UINT64
      const uint64 = buffer.readBigUInt64LE(offset);
      offset += 8;
      return { value: uint64, offset };
    case 11: // INT64
      const int64 = buffer.readBigInt64LE(offset);
      offset += 8;
      return { value: int64, offset };
    case 12: // FLOAT64
      const float64 = buffer.readDoubleLE(offset);
      offset += 8;
      return { value: float64, offset };
    default:
      throw new Error(`Unknown value_type ${value_type} at offset ${offset}`);
  }
}

export function readMetadataKeyValuePair(
  buffer: Buffer,
  offset: Integer,
): { key: string; value_type: Integer; value: any; offset: Integer } {
  // Read key
  const { str: key, offset: offsetAfterKey } = readGGUFString(buffer, offset);
  offset = offsetAfterKey;
  // Read value_type
  const value_type = buffer.readUInt32LE(offset);
  offset += 4;
  // Read value
  const { value, offset: offsetAfterValue } = readMetadataValue(
    buffer,
    offset,
    value_type,
  );
  offset = offsetAfterValue;
  return { key, value_type, value, offset };
}
