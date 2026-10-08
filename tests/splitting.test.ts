import test from "node:test";import assert from "node:assert/strict";import {findPauseBoundaries,validateRanges} from "../lib/splitting.ts";
test("suggests quiet gaps without treating continuous singing as a boundary",()=>{
 const energy=Array(200).fill(.1);for(let i=76;i<84;i++)energy[i]=.001;
 assert.deepEqual(findPauseBoundaries(energy,.25,50),[20]);
 assert.deepEqual(findPauseBoundaries(Array(200).fill(.1),.25,50),[]);
 assert.deepEqual(findPauseBoundaries(Array(200).fill(0),.25,50),[]);
});
test("ignores short pauses and gaps near the recording edges",()=>{const energy=Array(200).fill(.1);for(let i=0;i<8;i++)energy[i]=.001;energy[80]=.001;assert.deepEqual(findPauseBoundaries(energy,.25,50),[]);});
test("allows gaps and repeated songs but rejects overlapping, reversed or out of bounds segments",()=>{
 assert.equal(validateRanges([{song:" A ",start:0,end:10},{song:"A",start:15,end:30}],40)[0].song,"A");
 for(const ranges of [[{song:"A",start:0,end:12},{song:"B",start:10,end:20}],[{song:"A",start:10,end:5}],[{song:"A",start:0,end:41}],[{song:"",start:0,end:10}],[{song:"A",start:0,end:.5}]])assert.throws(()=>validateRanges(ranges,40));
});
