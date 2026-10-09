"use client";
import {useState} from "react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import type {ConcertSession} from "@/lib/domain";
import {EMPTY_SESSION,validateSession,findExistingSession} from "@/lib/sessions";
import {api} from "@/lib/media";
import SessionChoice from "./session-choice";
export default function CreateSession({sessions,onClose,onCreated}:{sessions:ConcertSession[];onClose:()=>void;onCreated:(session:ConcertSession)=>Promise<void>}){
 const[draft,setDraft]=useState({...EMPTY_SESSION}),[busy,setBusy]=useState(false),[error,setError]=useState("");
 let valid=false,duplicate:ConcertSession|undefined;
 try{const data=validateSession(draft);valid=true;duplicate=findExistingSession(data,sessions);}catch{}
 async function create(){setBusy(true);setError("");try{const result=await api("sessions",validateSession(draft));await onCreated(result.session);onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <Dialog open onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent className="create-session-dialog"><DialogTitle>新增演唱会</DialogTitle><DialogDescription>记录这一次演出的信息，和同场观众一起留下现场。</DialogDescription><fieldset disabled={busy}><SessionChoice createOnly sessions={sessions} mode="new" onMode={()=>{}} sessionId="" onChoose={()=>{}} search="" onSearch={()=>{}} draft={draft} onDraft={setDraft} duplicate={duplicate}/></fieldset>{error&&<p className="error" role="alert">{error}</p>}<div className="dialog-actions"><button className="secondary" disabled={busy} onClick={onClose}>取消</button><button className="primary" disabled={busy||!valid} onClick={()=>void create()}>{busy?"正在进入场次…":duplicate?"进入已有场次":"创建并进入场次"}</button></div></DialogContent></Dialog>;
}
