"use client";
import type {ConcertSession} from "@/lib/domain";
import type {SessionDraft} from "@/lib/sessions";

export default function SessionChoice({sessions,mode,onMode,sessionId,onChoose,search,onSearch,draft,onDraft,duplicate,createOnly=false}:{sessions:ConcertSession[];mode:"existing"|"new";onMode:(mode:"existing"|"new")=>void;sessionId:string;onChoose:(id:string)=>void;search:string;onSearch:(value:string)=>void;draft:SessionDraft;onDraft:(value:SessionDraft)=>void;duplicate?:ConcertSession;createOnly?:boolean}){
 const choices=sessions.filter(s=>s.kind==="concert");
 const matches=choices.filter(s=>[s.artist,s.city,s.tour,s.venue,s.date].join(" ").toLowerCase().includes(search.trim().toLowerCase()));
 const selected=choices.find(s=>s.id===sessionId);
 const shown=selected&&!matches.some(s=>s.id===sessionId)?[selected,...matches]:matches;
 const set=(field:keyof SessionDraft,value:string)=>onDraft({...draft,[field]:value});
 return <div className="session-choice">
  {!createOnly&&<div className="upload-modes" aria-label="场次归档方式"><button type="button" aria-pressed={mode==="existing"} className={mode==="existing"?"selected":""} onClick={()=>onMode("existing")}>选择已有场次</button><button type="button" aria-pressed={mode==="new"} className={mode==="new"?"selected":""} onClick={()=>onMode("new")}>新建演出场次</button></div>}
  {mode==="existing"?<>
   <label>搜索社区场次<input className="field" placeholder="搜索歌手、城市、演唱会或日期" value={search} onChange={e=>onSearch(e.target.value)}/></label>
   <label>具体场次<select className="field" aria-label="具体场次" value={sessionId} onChange={e=>onChoose(e.target.value)}><option value="">请选择具体场次</option>{shown.map(s=><option key={s.id} value={s.id}>{s.artist} · {s.city} · {s.date} {s.time} · {s.venue} · {s.night}</option>)}</select></label>
   {!matches.length&&<p className="helper">没有找到匹配场次。试试其他关键词，或新建你拍摄的演出场次。</p>}
   <button type="button" className="text-button create-session-link" onClick={()=>onMode("new")}>找不到这场演出？成为第一位贡献者</button>
  </>:<>
   {!createOnly&&<p className="helper">填写这一次演出的信息，发布第一条视频时创建。之后其他观众可以选择这场演出继续上传。</p>}
   <div className="new-session-grid">
    <label>歌手或乐队<input className="field" aria-label="新场次歌手" list="community-artists" maxLength={60} value={draft.artist} onChange={e=>{const value=e.target.value;const match=choices.find(s=>s.artist===value);onDraft({...draft,artist:value,tour:match?.tour||draft.tour});}} placeholder="例如：周杰伦" required/></label>
    <datalist id="community-artists">{[...new Set(choices.map(s=>s.artist))].map(a=><option key={a} value={a}/>)}</datalist>
    <label>演唱会名称<input className="field" aria-label="新场次演唱会名称" maxLength={100} value={draft.tour} onChange={e=>set("tour",e.target.value)} placeholder="例如：嘉年华世界巡回演唱会" required/></label>
    <label>城市<input className="field" aria-label="新场次城市" maxLength={40} value={draft.city} onChange={e=>set("city",e.target.value)} placeholder="例如：上海" required/></label>
    <label>场馆<input className="field" aria-label="新场次场馆" maxLength={100} value={draft.venue} onChange={e=>set("venue",e.target.value)} placeholder="填写实际演出场馆" required/></label>
    <label>演出日期<input className="field" aria-label="新场次日期" type="date" value={draft.date} onInput={e=>set("date",e.currentTarget.value)} onChange={e=>set("date",e.target.value)} required/></label>
    <label>开演时间<input className="field" aria-label="新场次时间" type="time" value={draft.time} onInput={e=>set("time",e.currentTarget.value)} onChange={e=>set("time",e.target.value)} required/></label>
    <label className="session-night-field">场次备注（选填）<input className="field" aria-label="新场次备注" maxLength={40} value={draft.night} onChange={e=>set("night",e.target.value)} placeholder="例如：第二晚、下午场"/></label>
   </div>
   {duplicate&&<p className="ai-note">社区已有同一场演出：{duplicate.artist} · {duplicate.date} {duplicate.time}。{createOnly?"可以直接进入已有场次。":"发布时将加入已有场次，不会重复创建。"}</p>}
  </>}
 </div>;
}
