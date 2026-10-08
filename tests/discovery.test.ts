import test from "node:test";
import assert from "node:assert/strict";
import {SESSIONS,sampleClips,type Interaction} from "../lib/domain.ts";
import {recentSessions,sessionStats,listSessionVideos,DEFAULT_FILTERS,DEFAULT_VIDEO_FILTERS} from "../lib/discovery.ts";
const now=new Date("2026-10-07T12:00:00+08:00"),clips=sampleClips();
test("recent sessions combine filters, sort newest first and exclude unknown/future dates",()=>{
 const items=recentSessions(SESSIONS,DEFAULT_FILTERS,now);
 assert.equal(items.length,6);assert.equal(items[0].id,"hz-1006");assert.equal(items.at(-1)?.id,"sh-0926");
 assert.deepEqual(recentSessions(SESSIONS,{...DEFAULT_FILTERS,artist:"周杰伦",city:"上海",search:"星港"},now).map(s=>s.id),["sh-1003","sh-1002"]);
 assert.equal(recentSessions(SESSIONS,{...DEFAULT_FILTERS,city:"南京",artist:"周杰伦"},now).length,0);
 assert.equal(recentSessions([...SESSIONS,{...SESSIONS[0],id:"future",date:"2026-11-01"}],{...DEFAULT_FILTERS,period:"all"},now).length,6);
});
test("30-day window uses Shanghai calendar boundaries, history retains older concerts",()=>{
 const rows=[{...SESSIONS[0],id:"edge",date:"2026-09-08",time:"00:00"},{...SESSIONS[0],id:"old",date:"2026-09-07",time:"23:59"}];
 assert.deepEqual(recentSessions(rows,DEFAULT_FILTERS,now).map(s=>s.id),["edge"]);
 assert.equal(recentSessions(rows,{...DEFAULT_FILTERS,period:"all"},now).length,2);
});
test("session counts deduplicate video IDs and publisher IDs; empty session stays empty",()=>{
 assert.deepEqual(sessionStats([...clips,clips[0]],"sh-1002"),{videos:7,contributors:1});
 assert.deepEqual(sessionStats(clips,"hz-1001"),{videos:0,contributors:0});
});
test("video filters isolate a night and include multi-song videos and segments",()=>{
 const mixed={...clips[0],id:"multi",songs:["晴天","稻香"],view:"crowd"};
 assert.deepEqual(listSessionVideos([...clips,mixed],[],"sh-1002",{...DEFAULT_VIDEO_FILTERS,content:"song:晴天",view:"crowd"}).map(c=>c.id),["multi"]);
 const segment={...mixed,id:"talk",songs:[],segment:"歌手互动"};
 assert.deepEqual(listSessionVideos([...clips,segment],[],"sh-1002",{...DEFAULT_VIDEO_FILTERS,content:"segment:歌手互动"}).map(c=>c.id),["talk"]);
 assert.ok(listSessionVideos(clips,[],"sh-1003",DEFAULT_VIDEO_FILTERS).every(c=>c.sessionId==="sh-1003"));
});
test("likes sort uses distinct users, then actual timestamps across timezone formats",()=>{
 const a={...clips[0],id:"a",createdAt:"2026-10-07T08:00:00Z"},b={...a,id:"b",createdAt:"2026-10-07T15:00:00+08:00"};
 const action=(id:string,videoId:string,userId:string):Interaction=>({id,videoId,userId,kind:"like",text:"",at:null,status:"approved",createdAt:a.createdAt});
 assert.deepEqual(listSessionVideos([b,a],[],a.sessionId,DEFAULT_VIDEO_FILTERS).map(c=>c.id),["a","b"]);
 assert.deepEqual(listSessionVideos([a,b],[action("1","b","u"),action("2","b","u"),action("3","a","v")],a.sessionId,{...DEFAULT_VIDEO_FILTERS,sort:"likes"}).map(c=>c.id),["a","b"]);
 assert.deepEqual(listSessionVideos([a,b],[action("1","b","u")],a.sessionId,{...DEFAULT_VIDEO_FILTERS,sort:"likes"}).map(c=>c.id),["b","a"]);
});
