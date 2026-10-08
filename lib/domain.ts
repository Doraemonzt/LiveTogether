export const VIEWS = [{id:"front",name:"前排近景",short:"前排"},{id:"wide",name:"看台全景",short:"看台"},{id:"crowd",name:"观众合唱",short:"观众"}] as const;
export const TAGS=["歌曲演唱","全场合唱","歌手互动","舞台特效","安可","现场趣事"];
export const SEGMENTS=["开场","歌手互动","安可互动","谢幕","其他"];
export const ARTISTS={
 jay:{artist:"周杰伦",tour:"「嘉年华Ⅱ」世界巡回演唱会",avatar:"/artists/jay-chou.jpg"},
 joker:{artist:"薛之谦",tour:"「万兽之王」巡回演唱会",avatar:"/artists/joker-xue.jpg"},
 jj:{artist:"林俊杰",tour:"JJ20 FINAL LAP 世界巡回演唱会",avatar:"/artists/jj-lin.jpg"},
 gem:{artist:"邓紫棋",tour:"I AM GLORIA 2.0 世界巡回演唱会",avatar:"/artists/gem.jpg"},
 silence:{artist:"汪苏泷",tour:"「明日世界」世界巡回演唱会",avatar:"/artists/silence-wang.jpg"}
} as const;
export type ConcertSession={createdBy?:string;id:string;artist:string;avatar:string;tour:string;city:string;venue:string;date:string;time:string;night:string;songs:string[];kind:"concert"|"unconfirmed";cover:string;demo:boolean;tone:"forest"|"blue"|"rose"};
export const SESSIONS:ConcertSession[]=[
{id:"sh-1002",...ARTISTS.jay,city:"上海",venue:"星港演艺中心",date:"2026-10-02",time:"19:30",night:"第一晚",songs:["晴天","稻香","告白气球"],kind:"concert",cover:ARTISTS.jay.avatar,demo:true,tone:"forest"},
{id:"sh-1003",...ARTISTS.jay,city:"上海",venue:"星港演艺中心",date:"2026-10-03",time:"19:30",night:"第二晚",songs:["晴天","青花瓷","稻香"],kind:"concert",cover:ARTISTS.jay.avatar,demo:true,tone:"forest"},
{id:"hz-1006",...ARTISTS.joker,city:"杭州",venue:"云岸音乐馆",date:"2026-10-06",time:"19:00",night:"杭州场",songs:["演员","天外来物","认真的雪"],kind:"concert",cover:ARTISTS.joker.avatar,demo:true,tone:"rose"},
{id:"nj-1005",...ARTISTS.jj,city:"南京",venue:"江畔艺术中心",date:"2026-10-05",time:"19:30",night:"南京场",songs:["江南","修炼爱情","可惜没如果"],kind:"concert",cover:ARTISTS.jj.avatar,demo:true,tone:"blue"},
{id:"hz-1001",...ARTISTS.gem,city:"杭州",venue:"云岸音乐馆",date:"2026-10-01",time:"19:30",night:"杭州场",songs:["光年之外","泡沫","倒数"],kind:"concert",cover:ARTISTS.gem.avatar,demo:true,tone:"forest"},
{id:"sh-0926",...ARTISTS.silence,city:"上海",venue:"星港演艺中心",date:"2026-09-26",time:"19:00",night:"上海场",songs:["有点甜","不分手的恋爱","一笑倾城"],kind:"concert",cover:ARTISTS.silence.avatar,demo:true,tone:"rose"},
{id:"joker-sample",artist:"薛之谦",avatar:ARTISTS.joker.avatar,tour:"你的现场记忆",city:"城市待确认",venue:"场馆待确认",date:"",time:"",night:"场次待确认",songs:["歌曲待确认"],kind:"unconfirmed",cover:"/joker-cover.jpg",demo:false,tone:"blue"}
];
export type Clip={id:string;sessionId:string;songs:string[];segment:string;view:string;tags:string[];description:string;author:string;owner:string;src:string;poster:string;duration:number;aligned:boolean;fileStart:number;songStart:number;sample:boolean;createdAt:string};
export type Interaction={id:string;videoId:string;userId:string;kind:"like"|"save"|"comment"|"marker"|"report";text:string;at:number|null;status:string;createdAt:string};
const SAMPLE_VIEWS:Record<string,number[][]>={"sh-1002":[[0,0],[0,1],[1,0],[1,1],[1,2],[2,0],[2,1]],"sh-1003":[[0,0],[1,1]],"hz-1006":[[0,0],[1,1],[2,2]],"nj-1005":[[0,0],[0,1]],"sh-0926":[[0,1]]};
export function sampleClips():Clip[]{return [...SESSIONS.filter(s=>Boolean(SAMPLE_VIEWS[s.id])).flatMap(s=>SAMPLE_VIEWS[s.id].map(([song,view],i)=>({id:`sample-${s.id}-${song}-${view}`,sessionId:s.id,songs:[s.songs[song]],segment:"",view:VIEWS[view].id,tags:i%2?["全场合唱"]:["歌曲演唱","舞台特效"],description:["那一刻，灯光和我们一起亮起来。","再听一次，还是会被现场打动。","收藏这一段属于我们的声音。"][i%3],author:["一颗小星","晚风来信","看台上的橘子"][i%3],owner:"sample-author",src:view===0?"/sample-front-lite.mp4":view===2?"/sample-crowd-lite.mp4":"/sample-concert-lite.mp4",poster:view===0?"/sample-front-first.jpg":view===2?"/sample-crowd-first.jpg":"/sample-concert-first.jpg",duration:25,aligned:true,fileStart:0,songStart:0,sample:true,createdAt:s.id.startsWith("sh-100")?"2026-10-03T00:00:00Z":s.date+"T22:00:00+08:00"}))),{id:"joker-original",sessionId:"joker-sample",songs:["歌曲待确认"],segment:"",view:"wide",tags:["歌曲演唱","舞台特效"],description:"彩带落下的那一刻，我们都在现场。",author:"现场记录者",owner:"sample-author",src:"/joker-live-lite.mp4",poster:"/joker-first.jpg",duration:56.833333,aligned:false,fileStart:0,songStart:0,sample:true,createdAt:"2026-10-04T00:00:00Z"}];}
export function coverage(clips:Clip[],sessionId:string,sessions:ConcertSession[]=SESSIONS){const s=sessions.find(s=>s.id===sessionId);return s? s.songs.flatMap(song=>VIEWS.map(v=>({song,view:v.id,clip:clips.find(c=>c.sessionId===sessionId&&c.songs.includes(song)&&c.view===v.id&&c.src&&c.duration>0)}))):[];}
export function switchTime(from:Clip,to:Clip,time:number,song:string){if(from.sessionId!==to.sessionId||!from.aligned||!to.aligned||from.songs.length!==1||to.songs.length!==1||!from.songs.includes(song)||!to.songs.includes(song))return null;const canonical=time-from.fileStart+from.songStart;const target=canonical-to.songStart+to.fileStart;return target>=to.fileStart&&target<to.fileStart+to.duration?target:null;}
export function validateClip(input:any,sessions:ConcertSession[]=SESSIONS){const s=sessions.find(s=>s.id===input.sessionId);if(!s)throw new Error("请选择有效场次");const songs=Array.isArray(input.songs)? [...new Set(input.songs.map((x:any)=>String(x).trim()).filter(Boolean))].slice(0,8) as string[]:[];if(songs.some(x=>x.length>60))throw new Error("歌曲名称过长");const segment=SEGMENTS.includes(input.segment)?input.segment:"";if(!songs.length&&!segment)throw new Error("请选择歌曲或其他环节");if(songs.length&&segment)throw new Error("歌曲与其他环节不能同时选择");if(!VIEWS.some(v=>v.id===input.view))throw new Error("请选择拍摄视角");return {sessionId:s.id,songs,segment,view:input.view,tags:Array.isArray(input.tags)?input.tags.filter((x:any)=>TAGS.includes(x)).slice(0,6):[],description:String(input.description||"").trim().slice(0,500)};}
export const stamp=(n:number)=>`${Math.floor(n/60).toString().padStart(2,"0")}:${Math.floor(n%60).toString().padStart(2,"0")}`;


