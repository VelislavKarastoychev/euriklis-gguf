"use strict";
import { test, expect } from "bun:test";

import validator from "@euriklis/validator-ts";
import { GGUF } from "../src";
const gguf = new GGUF();

const answer = new validator(gguf)
  .isInstanceof(GGUF)
  .describe("The GGUF library has to:")
  .test({ title: true, success: "green", error: "red" })
  .describe("1. generate empty instance when no file parameter is inserted.")
  .test().answer;
test("GGUF instance testing",() => expect(answer));
