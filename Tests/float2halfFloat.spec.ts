"use strict";
import { test, expect } from "bun:test";
import { float2HalfFloat, halfFloat2Float } from "../src/Models";
import validator from "@euriklis/validator-ts";

const fiveF16 = float2HalfFloat(5);
const fiveF32 = halfFloat2Float(fiveF16);
const infF16 = float2HalfFloat(Infinity);

const answer = new validator(halfFloat2Float(fiveF16))
  .describe("The float2HalfFloat utility function has to:")
  .test({ title: true, success: "green", error: "red" })
  .isSame(fiveF32)
  .and.bind(new validator(float2HalfFloat(fiveF32)).isSame(fiveF16))
  .describe("1. convert correctly the number five from F32 to F16.")
  .test()
  .and.bind(new validator(halfFloat2Float(infF16)).isSame(Infinity))
  .and.bind(new validator(float2HalfFloat(Infinity)).isSame(infF16))
  .describe("2. convert correctly the Infinity number from F32 to F16.")
  .test().answer;

test("float2HalfFloat utility function.", () => expect(answer).toBe(true));
