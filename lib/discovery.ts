import type {Clip,Interaction,ConcertSession} from "./domain";

export type DiscoveryFilters={search:string;artist:string;city:string;period:"recent"|"all"};
export const DEFAULT_FILTERS:DiscoveryFilters={search:"",artist:"",city:"",period:"recent"};
export function recentSessions(sessions:ConcertSession[],filters:DiscoveryFilters,now=new Date()){
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);
  const earliest=Date.parse(`${today}T00:00:00+08:00`)-29*86400000;
  const query=filters.search.trim().toLocaleLowerCase();
  return sessions.filter(s=>{
    if(s.kind!=="concert"||!s.date)return false;
    const start=Date.parse(`${s.date}T${s.time||"00:00"}:00+08:00`);
    return start<=now.getTime()&&(filters.period==="all"||start>=earliest)
      &&(!filters.artist||s.artist===filters.artist)&&(!filters.city||s.city===filters.city)
      &&[s.artist,s.city,s.tour,s.venue].join(" ").toLocaleLowerCase().includes(query);
  }).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)||a.id.localeCompare(b.id));
}
export function cityStops(sessions:ConcertSession[]){
  const stops=new Map<string,ConcertSession[]>();
  for(const session of sessions){
    const key=JSON.stringify([session.artist,session.city]);
    const group=stops.get(key);
    if(group)group.push(session);else stops.set(key,[session]);
  }
  return [...stops].map(([key,sessions])=>({key,session:sessions[0],sessions}));
}
export function sessionStats(clips:Clip[],sessionId:string|string[]){
  const ids=new Set(typeof sessionId==="string"?[sessionId]:sessionId);
  const unique=[...new Map(clips.filter(c=>ids.has(c.sessionId)).map(c=>[c.id,c])).values()];
  return {videos:unique.length,contributors:new Set(unique.map(c=>c.owner)).size};
}
export type VideoFilters={content:string;view:string;sort:"latest"|"likes"};
export const DEFAULT_VIDEO_FILTERS:VideoFilters={content:"",view:"",sort:"latest"};
export function listSessionVideos(clips:Clip[],interactions:Interaction[],sessionId:string,filters:VideoFilters){
  const likes=new Map<string,Set<string>>();
  for(const a of interactions)if(a.kind==="like"){if(!likes.has(a.videoId))likes.set(a.videoId,new Set());likes.get(a.videoId)!.add(a.userId);}
  return [...new Map(clips.filter(c=>c.sessionId===sessionId&&(!filters.view||c.view===filters.view)&&(!filters.content||(filters.content.startsWith("song:")?c.songs.includes(filters.content.slice(5)):c.segment===filters.content.slice(8)))).map(c=>[c.id,c])).values()]
    .sort((a,b)=>(filters.sort==="likes"?(likes.get(b.id)?.size||0)-(likes.get(a.id)?.size||0):0)||Date.parse(b.createdAt)-Date.parse(a.createdAt)||a.id.localeCompare(b.id));
}
