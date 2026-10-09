"use client";
import {useEffect,useRef,useState} from "react";
import {UploadCloud,Plus,Loader2,Video,Music2} from "lucide-react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {VIEWS,SEGMENTS,type Clip,type ConcertSession} from "@/lib/domain";
import {inspectVideo,api,uploadVideo} from "@/lib/media";
import {toast} from "sonner";
import SessionChoice from "./session-choice";
import {EMPTY_SESSION,validateSession,findExistingSession,createCommunitySession,type SessionDraft} from "@/lib/sessions";
export type UploadContext={sessionId?:string;song?:string;view?:string;edit?:Clip};
export function Picker({value,onChange,items,label}:{value:string;onChange:(v:string)=>void;items:{id:string;name:string}[];label:string}){return <Select value={value} onValueChange={onChange}><SelectTrigger className="picker" aria-label={label}><SelectValue placeholder={label}/></SelectTrigger><SelectContent>{items.map(i=><SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select>;}

function UploadChoices({label,options,selected,onChange,multiple=false,maxLength=40,allowAdd=true}:{label:string;options:{id:string;name:string}[];selected:string[];onChange:(values:string[])=>void;multiple?:boolean;maxLength?:number;allowAdd?:boolean}){
 const [adding,setAdding]=useState(false),[draft,setDraft]=useState(""),[extras,setExtras]=useState<string[]>([]);
 const choices=allowAdd?[...options,...[...new Set([...extras,...selected])].filter(id=>!options.some(o=>o.id===id)).map(name=>({id:name,name}))]:options;
 function add(){const name=draft.trim();if(!name)return;const id=choices.find(o=>o.name===name)?.id||name;if(!choices.some(o=>o.id===id))setExtras([...extras,name]);onChange(multiple?[...new Set([...selected,id])]:[id]);setDraft("");setAdding(false);}
 return <div className="upload-choice-group"><div className="upload-label">{label}</div><div className="tag-options">
 {choices.map(o=><button key={o.id} type="button" aria-pressed={selected.includes(o.id)} className={selected.includes(o.id)?"selected":""} onClick={()=>onChange(selected.includes(o.id)?selected.filter(v=>v!==o.id):multiple?[...selected,o.id]:[o.id])}>{o.name}</button>)}
 {allowAdd&&<button type="button" className="add-choice" aria-label={"新增"+label} aria-expanded={adding} onClick={()=>setAdding(!adding)}><Plus size={13}/>新增</button>}
 </div>{adding&&<div className="inline-form"><input autoFocus className="field" aria-label={"新增"+label+"内容"} placeholder={"输入"+label} value={draft} maxLength={maxLength} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.nativeEvent.isComposing){e.preventDefault();add();}if(e.key==="Escape"){e.stopPropagation();setAdding(false);}}}/><button type="button" className="secondary" disabled={!draft.trim()} onClick={add}>添加</button><button type="button" className="text-button" onClick={()=>setAdding(false)}>取消</button></div>}</div>;
}

export default function UploadDialog({sessions,context,onClose,onPublished,aiEnabled}:{sessions:ConcertSession[];context:UploadContext|null;onClose:()=>void;onPublished:(c:Clip)=>Promise<void>;aiEnabled:boolean}){
const fixedSession=!!context?.sessionId&&!context?.edit;
const[sessionMode,setSessionMode]=useState<"existing"|"new">("existing");const[draft,setDraft]=useState<SessionDraft>({...EMPTY_SESSION});
const edit=context?.edit;const[sessionId,setSessionId]=useState(context?.sessionId||edit?.sessionId||"");const[songs,setSongs]=useState<string[]>(edit?.songs|| (context?.song?[context.song]:[]));const[segment,setSegment]=useState(edit?.segment||"");const[view,setView]=useState(VIEWS.some(v=>v.id===(edit?.view||context?.view))?(edit?.view||context?.view)!:"unknown");const[description,setDescription]=useState(edit?.description||"");const[file,setFile]=useState<File|null>(null);const[media,setMedia]=useState<{duration:number;poster:string;frames:string[];src:string}|null>(null);const[busy,setBusy]=useState("");const[error,setError]=useState("");const[artist,setArtist]=useState("");const[assetId,setAssetId]=useState("");const input=useRef<HTMLInputElement>(null);
useEffect(()=>()=>{if(media)URL.revokeObjectURL(media.src);},[media]);
let validDraft:SessionDraft|undefined;let draftError="";if(sessionMode==="new"){try{validDraft=validateSession(draft);}catch(e){draftError=(e as Error).message;}}
const duplicate=validDraft?findExistingSession(validDraft,sessions):undefined;
const session=sessionMode==="new"?(duplicate||(validDraft?createCommunitySession(validDraft,"draft",""):undefined)):sessions.find(s=>s.id===sessionId);
async function choose(f:File){setBusy("读取视频");setError("");setFile(null);setMedia(null);setAssetId("");try{const m=await inspectVideo(f);setMedia(m);setFile(f);}catch(e){setError((e as Error).message);}finally{setBusy("");}}
async function publish(){setBusy("正在发布");setError("");try{if(!session)throw new Error("请选择已有场次或填写完整的新场次");const targetId=session.id;const newSession=sessionMode==="new"?validateSession(draft):undefined;let key=assetId;if(!edit&&!key){if(!file||!media)throw new Error("请先选择可播放的视频");const result=await uploadVideo(file);key=result.id;setAssetId(key);}const{clip}=await api("videos"+(edit?"/"+edit.id:""),{sessionId:targetId,newSession,songs,segment,view,tags:edit?.tags||[],description,assetId:key,duration:media?.duration,poster:media?.poster});await onPublished(clip);toast.success(edit?"现场归属已更新":"你的视角已加入共同现场");onClose();}catch(e){setError((e as Error).message);}finally{setBusy("");}}
return <Dialog open={!!context} onOpenChange={open=>{if(!open&&!busy)onClose();}}>
<DialogContent className="upload-dialog simple-upload">
 <DialogTitle>{edit?"编辑现场记录":"分享你的现场"}</DialogTitle>
 <DialogDescription>留下你镜头里的现场。</DialogDescription>
 <fieldset disabled={!!busy} className="form-stack upload-fields">
  {fixedSession&&session?<div className="upload-destination"><Music2 size={18}/><div><strong>{session.artist} · {session.city}</strong><p>{session.date} {session.time} · {session.night}</p></div></div>:<SessionChoice sessions={sessions} mode={sessionMode} onMode={mode=>{setSessionMode(mode);setSongs([]);setSegment("");setError("");}} sessionId={sessionId} onChoose={id=>{setSessionId(id);setSongs([]);setSegment("");setError("");}} search={artist} onSearch={setArtist} draft={draft} onDraft={setDraft} duplicate={duplicate}/>}
  {!fixedSession&&!session&&<p className="helper">{sessionMode==="new"?draftError:"请选择发布到哪一场演出。"}</p>}
  <div className="upload-workspace"><div className="upload-media-panel">
  {!edit&&<><input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" aria-label="选择视频文件" onChange={e=>{const f=e.target.files?.[0];if(f)void choose(f);}}/><button className="upload-zone" onClick={()=>input.current?.click()}>{media?<><Video/><strong>{file?.name}</strong><small>{Math.round(media.duration)} 秒 · 点击更换</small></>:<><UploadCloud size={28}/><strong>选择你的现场视频</strong><small>MP4 / WebM / MOV · 最大 25 MB</small></>}</button></>}
  {edit&&<div className="upload-edit-note"><Video size={32}/><strong>编辑现场记录</strong><p>完善这段视频的歌曲、视角与现场记忆。</p></div>}
  </div><div className="upload-metadata-panel">
  <UploadChoices allowAdd={false} label="拍摄角度" options={VIEWS.map(v=>({id:v.id,name:v.name}))} selected={view==="unknown"?[]:[view]} onChange={values=>setView(values[0]||"unknown")}/>
  <UploadChoices key={session?.id||"songs"} label="歌曲名" options={(session?.songs||[]).map(name=>({id:name,name}))} selected={songs} onChange={setSongs} multiple maxLength={60}/>
  <UploadChoices label="现场环节" options={SEGMENTS.map(name=>({id:name,name}))} selected={segment?[segment]:[]} onChange={values=>setSegment(values[0]||"")}/>
  <label className="upload-description">写下这一刻<textarea className="field" rows={2} maxLength={500} value={description} onChange={e=>setDescription(e.target.value)} placeholder="留下你的现场记忆……"/></label>
  </div></div>
 </fieldset>
 {error&&<p className="error" role="alert">{error}</p>}{busy&&<p className="busy" role="status"><Loader2 className="spin" size={16}/>{busy}</p>}
 <div className="dialog-actions"><button className="primary" disabled={!!busy||!session||(!edit&&!media)} onClick={()=>void publish()}>{edit?"保存修改":"发布现场"}</button></div>
</DialogContent></Dialog>}
