"use strict";
import { test, expect } from "bun:test";
import { halfFloat2Float } from "../src/Models";
import validator from "@euriklis/validator-ts";

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
  .describe("2. parse correcctly f16 to f32 numbers.")
  .test().answer;

test("halfFloat2Float test", () => expect(answer).toBe(true));
