"use strict";
import { test, expect } from "bun:test";
import { halfFloat2Float } from "../src/Models";
import validator from "@euriklis/validator-ts";
console.log(halfFloat2Float(0x03ff));
const answer = new validator(halfFloat2Float(0))
  .describe("The halfFloat2Float utility function has to:")
  .test({ title: true, success: "green", error: "red" })
  .isSame(0)
  .describe("1. handle the zero case 0x000.")
  .test()
  .and.bind(
    new validator(halfFloat2Float(0x0001)).isInRange(
      0.000000059604645 - 1e-10,
      0.000000059604645 + 1e-10,
    ),
  )
  .describe(
    "2. parse correcctly the smallest subnormal number from f16 to f32.",
  )
  .test()
  .and.bind(
    new validator(halfFloat2Float(0x03ff) - 0.000060975552).isInRange(
      -1e-8,
      1e-8,
    ),
  )
  .describe("3. parse correctly the largest subnormal number from f16 to f32.")
  .test()
  .and.bind(new validator(halfFloat2Float(0x0400) - 0.00006103515625).isSame(0))
  .describe(
    "4. parse correctly the smallest positive normal number from f16 to f32.",
  )
  .test()
  .and.bind(
    new validator(halfFloat2Float(0x3555) - 0.33325195).isInRange(-1e-8, 1e-8),
  )
  .describe("5. parse correctly the nearest value to 1/3 from f16 to f32.")
  .test()
  .and.bind(
    new validator(halfFloat2Float(0x3bff) - 0.99951172).isInRange(-1e-8, 1e-8),
  )
  .describe("6. parse correctly the largest number less than one.")
  .test()
  .and.bind(new validator(halfFloat2Float(0x3c00) - 1).isSame(0))
  .describe("7. pare correctly the number one from f16 to f32.")
  .test()
  .and.bind(
    new validator(halfFloat2Float(0x3c01) - 1.00097656).isInRange(-1e-8, 1e-8),
  )
  .describe(
    "8. parse correctly the smallest number greater than one from f16 to f32.",
  )
  .test()
  .and.bind(
    new validator(halfFloat2Float(0x7bff) - 65504).isInRange(-1e-8, 1e-8),
  )
  .describe("9. parse correctly the largest normal number from f16 to f32.")
  .test()
  .and.bind(new validator(halfFloat2Float(0x7c00)).isSame(Infinity))
  .describe("10. parse correctly the positive Infinity case from f16 to f32.")
  .test()
  .and.bind(new validator(halfFloat2Float(0x8000)).isSame(-0))
  .describe("11. parse correctly the MINUS ZERO CASE from f16 to f32.")
  .test()
  .and.bind(new validator(halfFloat2Float(0xfc00)).isSame(-Infinity))
  .describe("12. parse correctly the negative Infinity case from f16 to f32.")
  .test()
  .and.bind(new validator(halfFloat2Float(0xc000)).isSame(-2))
  .describe("13. parse correctly the minus two number from f16 to f32.")
  .test().answer;
test("halfFloat2Float test", () => expect(answer).toBe(true));
