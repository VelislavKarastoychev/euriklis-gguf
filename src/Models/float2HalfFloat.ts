"use strict";
export const float2HalfFloat = (val: number): number => {
  const floatView = new Float32Array(1);
  const int32View = new Uint32Array(floatView.buffer);

  floatView[0] = val;
  const x = int32View[0];

  const sign = (x >> 16) & 0x8000; // Sign bit
  let exponent = ((x >> 23) & 0xff) - 127 + 15; // Adjust exponent
  let mantissa = x & 0x007fffff; // Mantissa bits

  if (exponent <= 0) {
    // Subnormal number or zero
    if (exponent < -10) {
      // Too small, return signed zero
      return sign;
    }
    mantissa |= 0x00800000; // Add implicit leading 1
    mantissa >>= 1 - exponent;
    mantissa = (mantissa + 0x00001000) >> 13; // Round mantissa
    return sign | mantissa;
  } else if (exponent === 0xff - 127 + 15) {
    if (mantissa === 0) {
      // Infinity
      return sign | 0x7c00;
    } else {
      // NaN
      mantissa >>= 13;
      return sign | 0x7c00 | mantissa | (mantissa === 0 ? 1 : 0);
    }
  } else {
    if (mantissa & 0x00001000) {
      // Round mantissa
      mantissa += 0x00002000;
      if (mantissa & 0x00800000) {
        mantissa = 0;
        exponent += 1;
      }
    }
    if (exponent > 30) {
      // Overflow to Infinity
      return sign | 0x7c00;
    }
    mantissa >>= 13;
    return sign | (exponent << 10) | mantissa;
  }
};
