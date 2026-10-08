import {ARTISTS,type ConcertSession,type Clip} from "./domain.ts";

export type SessionDraft=Pick<ConcertSession,"artist"|"tour"|"city"|"venue"|"date"|"time"|"night">;
export const EMPTY_SESSION:SessionDraft={artist:"",tour:"",city:"",venue:"",date:"",time:"",night:""};
export function validateSession(input:unknown):SessionDraft{
 if(!input||typeof input!=="object")throw new Error("请填写新场次信息");
 const row=input as Record<string,unknown>;
 const field=(key:string,label:string,max:number,optional=false)=>{
  if(typeof row[key]!=="string")throw new Error(`请填写${label}`);
  const value=row[key].normalize("NFKC").trim().replace(/\s+/g," ");
  if((!optional&&!value)||value.length>max)throw new Error(`${label}${value.length>max?`不能超过 ${max} 字`:"不能为空"}`);
  return value;
 };
 const artist=field("artist","歌手或乐队",60),tour=field("tour","演唱会名称",100),city=field("city","城市",40),venue=field("venue","场馆",100),date=field("date","演出日期",10),time=field("time","开演时间",5),night=field("night","场次备注",40,true);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<"1900-01-01")throw new Error("请填写有效的演出日期");
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error("请填写有效的开演时间");
 return {artist,tour,city,venue,date,time,night};
}
// Tour display names and optional night labels do not split the same performance.
export function sessionKey(s:Pick<SessionDraft,"artist"|"city"|"venue"|"date"|"time">){return JSON.stringify([s.artist,s.city,s.venue,s.date,s.time].map(x=>x.normalize("NFKC").replace(/\s+/g,"").toLocaleLowerCase()));}
export function findExistingSession(draft:SessionDraft,sessions:ConcertSession[]){return sessions.find(s=>s.kind==="concert"&&sessionKey(s)===sessionKey(draft));}
export function createCommunitySession(draft:SessionDraft,id:string,owner:string):ConcertSession{
 const artist=Object.values(ARTISTS).find(a=>a.artist===draft.artist);
 return {...draft,id,night:draft.night||"现场",songs:[],kind:"concert",avatar:artist?.avatar||"",cover:artist?.avatar||"/concert.jpg",demo:false,tone:"forest",createdBy:owner};
}
export function includeContributedSongs(sessions:ConcertSession[],clips:Clip[]){return sessions.map(s=>s.createdBy?{...s,songs:[...new Set([...s.songs,...clips.filter(c=>c.sessionId===s.id).flatMap(c=>c.songs)])]}:s);}
