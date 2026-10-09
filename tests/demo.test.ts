import test from "node:test";
import assert from "node:assert/strict";
import {createDemoStore} from "../lib/demo.ts";

const draft={artist:"演示乐队",tour:"我们的现场",city:"上海",venue:"演出馆",date:"2026-10-09",time:"19:30",night:""};
function setup(){
 const store=createDemoStore();
 const asset=store.upload(new Blob(["demo video"],{type:"video/mp4"}));
 const input={sessionId:"sh-1002",songs:["晴天"],segment:"",view:"front",tags:[],description:"测试片段",duration:10,assetId:asset.id};
 // Requests deliberately mirror the shared JSON API; inspect complete responses here.
 const api=(path:string,body?:unknown):any=>store.request(path,body);
 return {store,asset,input,api};
}
test("uploaded blob survives publication and edits; a fresh page resets state",async()=>{
 const {store,asset,input,api}=setup();
 try{
  const {clip}=api("videos",input);
  assert.equal(clip.src,asset.src);
  assert.equal(await (await fetch(clip.src)).text(),"demo video");
  const edited=api("videos/"+clip.id,{...input,sessionId:"sh-1003",description:"更新"}).clip;
  assert.equal(edited.src,clip.src);
  assert.equal(api("state").clips.filter((c:any)=>c.id===clip.id).length,1);
  assert.equal(edited.sessionId,"sh-1003");
  const fresh=createDemoStore();
  assert.equal((fresh.request("state") as any).clips.some((c:any)=>c.id===clip.id),false);
  fresh.dispose();
 }finally{store.dispose();}
 await assert.rejects(fetch(asset.src));
});
test("new sessions and split batches commit together and retries do not duplicate clips",()=>{
 const {store,input,api}=setup();
 try{
  const count=api("state").sessions.length;
  const body={requestId:"batch-demo",newSession:draft,clips:[input,{...input,songs:["新歌"],assetId:"missing"}]};
  assert.throws(()=>api("videos/batch",body));
  assert.equal(api("state").sessions.length,count);
  body.clips[1].assetId=input.assetId;
  const result=api("videos/batch",body);
  assert.equal(result.clips.length,2);
  assert.deepEqual(api("videos/batch",body),result);
  api("videos",{...input,newSession:draft});
  const state=api("state");
  assert.equal(state.sessions.length,count+1);
  assert.deepEqual(state.sessions.at(-1).songs,["晴天","新歌"]);
  assert.equal(state.clips.filter((c:any)=>!c.sample).length,3);
 }finally{store.dispose();}
});
test("two viewers can like, save, comment, report, suggest and approve moments",()=>{
 const {store,input,api}=setup();
 try{
  const {clip}=api("videos",input);
  api("demo/switch-user");
  for(const kind of ["like","save"])for(let i=0;i<2;i++)api("actions",{videoId:clip.id,kind,active:true});
  for(const kind of ["comment","marker","report"])api("actions",{videoId:clip.id,kind,text:"演示留言",at:3});
  let state=api("state");assert.equal(state.interactions.length,5);
  const marker=state.interactions.find((a:any)=>a.kind==="marker");
  assert.equal(marker.status,"pending");
  assert.throws(()=>api("approve",{id:marker.id,approved:true}));
  assert.throws(()=>api("videos/"+clip.id,input));
  api("actions",{videoId:clip.id,kind:"like",active:false});
  assert.equal(api("state").interactions.length,4);
  assert.throws(()=>api("actions",{videoId:clip.id,kind:"comment",text:"越界",at:11}));
  api("demo/switch-user");api("approve",{id:marker.id,approved:true});
  state=api("state");assert.equal(state.interactions.find((a:any)=>a.id===marker.id).status,"approved");
  state.clips.length=0;assert.ok(api("state").clips.length);
 }finally{store.dispose();}
});

test("standalone concert creation validates, deduplicates, and accepts later uploads",()=>{
 const {store,input,api}=setup();
 try{
  const before=api("state");
  assert.throws(()=>api("sessions",{...draft,city:""}));
  assert.equal(api("state").sessions.length,before.sessions.length);
  const {session}=api("sessions",draft);
  assert.equal(api("state").clips.length,before.clips.length);
  assert.equal(api("sessions",draft).session.id,session.id);
  assert.equal(api("state").sessions.length,before.sessions.length+1);
  api("videos",{...input,sessionId:session.id});
  assert.deepEqual(api("state").sessions.find((s:any)=>s.id===session.id).songs,["晴天"]);
 }finally{store.dispose();}
});
