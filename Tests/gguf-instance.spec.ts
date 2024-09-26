"use strict";
import { gguf } from "@huggingface/gguf";
import { test, expect } from "bun:test";

import validator from "@euriklis/validator-ts";
import { GGUF } from "../src";
const gguf0 = new GGUF();
const gguf1 = new GGUF("../../LLM/BgGPT-7B-Instruct-v0.2.F16.gguf");
await gguf1.load();
const loadedFromHuggingFace = await gguf(gguf1.file as string, {
  allowLocalFile: true,
});
const { version, tensor_count, kv_count, ...metadata } =
  loadedFromHuggingFace.metadata;
const answer = new validator(gguf0)
  .isInstanceof(GGUF)
  .describe("The GGUF library has to:")
  .test({ title: true, success: "green", error: "red" })
  .describe("1. generate empty instance when no file parameter is inserted.")
  .test()
  .and.bind(new validator(gguf1.file).isString)
  .describe(
    "2. provide a getter and setter method file, which gets/sets the GGUF file which will be loaded.",
  )
  .test()
  .and.bind(new validator(gguf1.magic).isSame("GGUF"))
  .describe(
    "3. provide a async method load, which loads the data of the GGUF file.",
  )
  .test()
  .and.bind(
    new validator(metadata).isSame(gguf1.metadata),
  )
  .describe(
    "4. provide getter/setter method metadata, which gets/sets the metadata of the GGUF file.",
  )
  .test().answer;
test("GGUF instance testing", () => expect(answer).toBe(true));
