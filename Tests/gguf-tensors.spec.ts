"use strict";
import { test, expect } from "bun:test";
import { gguf } from "@huggingface/gguf";
import { GGUF } from "../src";
import validator from "@euriklis/validator-ts";
import { halfFloat2Float } from "../src/Models";
const url = "../../LLM/BgGPT-7B-Instruct-v0.2.F16.gguf";

const model = new GGUF(url);
const ggufData = await gguf(url, {
  allowLocalFile: true,
});
await model.load();
const tensorInfos = model.tensorInfos;
const tensor = model.readTensorByIndex(0);
if (!tensor) console.log(model.logs);
const answer = new validator(ggufData.tensorInfos)
  .isSame(tensorInfos)
  .describe("The GGUF tensorInfos getter/setter method has to:")
  .test({ title: true, success: "green", error: "red" })
  .describe(
    "1. return an array of object items which contain information for each tensor.",
  )
  .test().answer;
test("GGUF tensorInfos", () => expect(answer).toBe(true));
