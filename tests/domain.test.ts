import test from "node:test";import assert from "node:assert/strict";import {SESSIONS,sampleClips,coverage,switchTime,validateClip} from "../lib/domain.ts";
const clips=sampleClips();
test("consecutive nights have separate setlists and coverage",()=>{assert.notDeepEqual(SESSIONS[0].songs,SESSIONS[1].songs);assert.equal(coverage(clips,"sh-1002").filter(c=>c.clip).length,7);assert.equal(coverage(clips,"sh-1003").filter(c=>c.clip).length,2);});
test("duplicate uploads do not increase coverage",()=>assert.equal(coverage([...clips,{...clips[0],id:"copy"}],"sh-1002").filter(c=>c.clip).length,7));
test("new view fills exactly one cell, leaves other night untouched",()=>{const added={...clips[0],id:"new",view:"crowd"};assert.equal(coverage([...clips,added],"sh-1002").filter(c=>c.clip).length,8);assert.equal(coverage([...clips,added],"sh-1003").filter(c=>c.clip).length,2);});
test("same performance switches with canonical offset",()=>{assert.equal(switchTime(clips[0],{...clips[1],fileStart:4,songStart:2},10,"晴天"),12);});
test("different night, song and unsegmented uploads cannot switch",()=>{assert.equal(switchTime(clips[0],clips[7],10,"晴天"),null);assert.equal(switchTime(clips[0],clips[2],10,"晴天"),null);assert.equal(switchTime(clips[0],{...clips[1],songs:["晴天","稻香"]},10,"晴天"),null);assert.equal(switchTime(clips[0],{...clips[1],aligned:false},10,"晴天"),null);});
test("out of range target is not selectable",()=>{assert.equal(switchTime(clips[0],clips[1],40,"晴天"),null);});
test("upload requires a real session and accepts optional metadata",()=>{assert.throws(()=>validateClip({sessionId:"wrong"}));assert.equal(validateClip({sessionId:"sh-1002"}).view,"unknown");assert.deepEqual(validateClip({sessionId:"sh-1002"}).songs,[]);assert.throws(()=>validateClip({sessionId:"sh-1002",view:"x".repeat(41)}));assert.equal(validateClip({sessionId:"sh-1002",songs:["晴天"],segment:"大合唱",view:"front"}).segment,"大合唱");});
test("custom songs remain available, duplicate songs collapse",()=>{assert.deepEqual(validateClip({sessionId:"sh-1002",songs:["新歌","新歌"],view:"front"}).songs,["新歌"]);});


test("camera angles remain fixed while unspecified is allowed",()=>{for(const view of ["front","wide","crowd","unknown"])assert.equal(validateClip({sessionId:"sh-1002",view}).view,view);assert.throws(()=>validateClip({sessionId:"sh-1002",view:"内场右侧"}));});
