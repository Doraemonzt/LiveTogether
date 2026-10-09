import {SESSIONS,sampleClips,validateClip,type Clip,type Interaction} from "./domain.ts";
import {validateSession,findExistingSession,createCommunitySession,includeContributedSongs} from "./sessions.ts";

// One instance per page. Files and community state never leave this browser tab.
export function createDemoStore(){
 let sessions=structuredClone(SESSIONS),clips=sampleClips(),interactions:Interaction[]=[];
 let user="demo-1";
 const assets=new Map<string,string>();
 const batches=new Map<string,Clip[]>();
 function upload(file:Blob){
  if(!file.size||file.size>25*1024*1024)throw new Error("请选择不超过 25 MB 的视频");
  if(!["video/mp4","video/webm","video/quicktime"].includes(file.type.split(";")[0]))throw new Error("请选择 MP4、WebM 或 MOV 视频");
  const id=crypto.randomUUID(),src=URL.createObjectURL(file);
  assets.set(id,src);return {id,src};
 }
 function request(path:string,b:any={}){
  if(path==="state")return structuredClone({sessions:includeContributedSongs(sessions,clips),clips,interactions,user,aiEnabled:true});
  if(path==="demo/switch-user"){user=user==="demo-1"?"demo-2":"demo-1";return {ok:true};}
  if(path==="analyze")return {suggestion:{view:"unknown",tags:[],description:"把这一刻的现场，留在我们的共同记忆里。",uncertainty:"可按你的现场记忆修改。"}};
  if(path==="sessions"){
   const draft=validateSession(b),existing=findExistingSession(draft,sessions);
   const session=existing||createCommunitySession(draft,"community-"+crypto.randomUUID(),user);
   if(!existing)sessions=[...sessions,session];
   return {session:structuredClone(session)};
  }
  if(path==="videos"||path.startsWith("videos/")){
   const batch=path==="videos/batch",id=path.slice("videos/".length);
   if(batch&&(!b.requestId||!Array.isArray(b.clips)||!b.clips.length||b.clips.length>8))throw new Error("分段发布参数无效");
   const batchKey=user+":"+b.requestId;
   if(batch&&batches.has(batchKey))return {clips:structuredClone(batches.get(batchKey)!)};
   const draft=b.newSession?validateSession(b.newSession):null;
   const target=draft?(findExistingSession(draft,sessions)||createCommunitySession(draft,"community-"+crypto.randomUUID(),user)):null;
   const catalog=target&&!sessions.some(s=>s.id===target.id)?[...sessions,target]:sessions;
   const results:Clip[]=(batch?b.clips:[b]).map((item:any)=>{
    const data=validateClip(target?{...item,sessionId:target.id}:item,catalog);
    if(batch&&(data.songs.length!==1||data.segment))throw new Error("每个剪辑片段必须归属一首歌曲");
    const editing=!batch&&path!=="videos";
    const old=editing?clips.find(c=>c.id===id):undefined;
    if(editing&&(!old||old.owner!==user))throw new Error("只能修改自己的记录");
    if(old)return {...old,...data,aligned:false};
    const src=assets.get(item.assetId);
    if(!src)throw new Error("请先选择视频");
    if(!Number.isFinite(item.duration)||item.duration<=0||item.duration>7200)throw new Error("视频时长无效");
    return {id:crypto.randomUUID(),...data,src,poster:item.poster||SESSIONS[0].cover,duration:item.duration,owner:user,author:user==="demo-1"?"追光的人":"晚风来信",aligned:false,fileStart:0,songStart:0,sample:false,createdAt:new Date().toISOString()};
   });
   if(batch&&results.some(c=>c.sessionId!==results[0].sessionId))throw new Error("单次拆分的片段必须属于同一场次");
   // Commit only after all clips validate, so failed publication creates no empty session.
   sessions=catalog;
   clips=[...results,...clips.filter(c=>!results.some(r=>r.id===c.id))];
   if(batch)batches.set(batchKey,structuredClone(results));
   return structuredClone(batch?{clips:results}:{clip:results[0]});
  }
  if(path==="actions"){
   const clip=clips.find(c=>c.id===b.videoId);
   if(!clip)throw new Error("视频不存在");
   const kind=b.kind as Interaction["kind"];
   if(!["like","save","comment","marker","report"].includes(kind))throw new Error("无效操作");
   const toggle=kind==="like"||kind==="save";
   const id=toggle?`${user}:${clip.id}:${kind}`:crypto.randomUUID();
   const text=toggle?"":String(b.text||"").trim().slice(0,500);
   if(!toggle&&!text)throw new Error("请先填写内容");
   const at=toggle||b.at===null?null:Number(b.at);
   if(at!==null&&(!Number.isFinite(at)||at<0||at>clip.fileStart+clip.duration))throw new Error("时间点不在片段范围内");
   interactions=interactions.filter(a=>a.id!==id);
   if(!toggle||b.active)interactions.unshift({id,videoId:clip.id,userId:user,kind,text,at,status:kind==="marker"&&clip.owner!==user?"pending":"approved",createdAt:new Date().toISOString()});
   return {ok:true};
  }
  if(path==="approve"){
   const marker=interactions.find(a=>a.id===b.id&&a.kind==="marker");
   if(!marker||!clips.some(c=>c.id===marker.videoId&&c.owner===user))throw new Error("只有上传者能确认标记");
   marker.status=b.approved?"approved":"rejected";return {ok:true};
  }
  throw new Error("暂不支持此操作");
 }
 function dispose(){assets.forEach(src=>URL.revokeObjectURL(src));assets.clear();}
 return {upload,request,dispose};
}

let store:ReturnType<typeof createDemoStore>|undefined;
export function demoStore(){return store??=createDemoStore();}
