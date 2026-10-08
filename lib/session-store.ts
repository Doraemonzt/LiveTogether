import {database} from "./server";
import {SESSIONS,type ConcertSession} from "./domain";
import {validateSession,sessionKey,findExistingSession,createCommunitySession} from "./sessions";

export async function communitySessions(){
 const rows=await database().prepare("SELECT payload FROM concert_sessions ORDER BY created_at DESC").all<{payload:string}>();
 return [...SESSIONS,...rows.results.map(r=>JSON.parse(r.payload) as ConcertSession)];
}
export async function prepareSession(input:unknown,sessions:ConcertSession[],owner:string){
 if(!input)return null;
 const draft=validateSession(input),existing=findExistingSession(draft,sessions);
 if(existing)return existing;
 const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(sessionKey(draft)));
 const id="community-"+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");
 return createCommunitySession(draft,id,owner);
}
export function insertSession(session:ConcertSession){return database().prepare("INSERT OR IGNORE INTO concert_sessions(id,owner,payload,created_at) VALUES(?,?,?,?)").bind(session.id,session.createdBy,JSON.stringify(session),new Date().toISOString());}
