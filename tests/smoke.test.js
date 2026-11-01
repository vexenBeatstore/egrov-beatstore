import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";
test("unknown route returns 404",async()=>{const r=await worker.fetch(new Request("https://example.test/nope"),{PUBLIC_ORIGIN:"https://example.test",DB:{prepare(){throw new Error("unexpected DB access")}}});assert.equal(r.status,404);});
test("API errors are JSON",async()=>{const r=await worker.fetch(new Request("https://example.test/api/v1/unknown"),{PUBLIC_ORIGIN:"https://example.test",DB:{prepare(){throw new Error("unexpected DB access")}}});assert.equal(r.headers.get("content-type").includes("application/json"),true);});
