"use strict";
import { test, expect } from "bun:test";
import { gguf } from "@huggingface/gguf";
import { GGUF } from "../src";
import validator from "@euriklis/validator-ts";
import { halfFloat2Float } from "../src/Models";
import type { GGUFTensorType } from "../src/Types";
const url = "../../LLM/BgGPT-7B-Instruct-v0.2.F16.gguf";

const model = new GGUF(url);
const ggufData = await gguf(url, {
  allowLocalFile: true,
});
await model.load();
const tensorInfos = model.tensorInfos;
const tensor = await model.readTensorByIndex(290);
const tensor2 = await model.readTensorByIndex(2);
const tensorByName = await model.readTensorByName("blk.0.ffn_down.weight");
const answer = new validator(ggufData.tensorInfos)
  .isSame(tensorInfos)
  .describe("The GGUF tensorInfos getter/setter method has to:")
  .test({ title: true, success: "green", error: "red" })
  .describe(
    "1. return an array of object items which contain information for each tensor.",
  )
  .test()
  .and.bind(
    new validator(tensor?.data.length).isSame(
      tensor?.shape.reduce((a, b) => a * Number(b), 1),
    ),
  )
  .describe("2. handle float16 type numbers.")
  .test()
  .and.bind(
    new validator((tensor2 as GGUFTensorType).name).isSame(
      (tensorByName as GGUFTensorType).name,
    ),
  )
  .describe(
    "3. provide method readTensorByName, which gets the tensor by its name.",
  )
  .test().answer;
test("GGUF tensorInfos", () => expect(answer).toBe(true));
