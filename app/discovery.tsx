"use client";
import {Camera,ChevronRight,MapPin,Music2,Plus,Search,Users} from "lucide-react";
import {type Clip,type ConcertSession} from "@/lib/domain";
import {DEFAULT_FILTERS,recentSessions,cityStops,sessionStats,type DiscoveryFilters} from "@/lib/discovery";

export default function Discovery({sessions,clips,filters,onFilters,onOpen,onCreate}:{sessions:ConcertSession[];clips:Clip[];filters:DiscoveryFilters;onFilters:(value:DiscoveryFilters)=>void;onOpen:(id:string)=>void;onCreate:()=>void}){
 const concerts=sessions.filter(s=>s.kind==="concert");
 const artists=[...new Set(concerts.map(s=>s.artist))];
 const cities=[...new Set(concerts.map(s=>s.city))];
 const matches=cityStops(recentSessions(sessions,filters));
 const change=(value:Partial<DiscoveryFilters>)=>onFilters({...filters,...value});
 function SessionCard({stop}:{stop:ReturnType<typeof cityStops>[number]}){
  const s=stop.session;
  const stats=sessionStats(clips,stop.sessions.map(s=>s.id));
  return <button className={`concert-card tone-${s.tone}`} onClick={()=>onOpen(s.id)} aria-label={`${s.artist} · ${s.city}站`}>
   <span className="concert-poster"><img src={s.cover} alt="" loading="lazy"/><span className="poster-live" aria-hidden="true">LIVE / {s.city}</span><span className="poster-word">{s.artist}</span><span className="poster-note">同 一 现 场</span></span>
   <span className="concert-copy"><span className="concert-topline"><strong>{s.artist} <span>· {s.city}</span></strong>{!s.demo&&<small className="demo-tag">社区共建</small>}</span><span className="concert-tour">{s.tour}</span><span className="concert-date">{s.city}站</span><span className="concert-venue">进入现场 · 选择日期与场次</span><span className="concert-stats">{stats.videos?<><span><Camera size={13}/>{stats.videos} 个视频</span><span><Users size={13}/>{stats.contributors} 位贡献者</span></>:<span>暂无视频，成为首位贡献者</span>}<ChevronRight size={16}/></span></span>
  </button>;
 }
 return <div className="discovery">
  <div className="discovery-heading"><div className="stage-heading-copy"><span className="eyebrow"><span className="live-dot"/> YOUR NIGHT. OUR STAGE.</span><h1>散场以后，<span>现场继续。</span></h1><p>找到你在场的那一晚，重温每个人镜头里的光。</p><span className="stage-caption">演唱会现场影像共创社区 <span> / </span> LIVE ARCHIVE</span></div><div className="stage-wordmark" aria-hidden="true"><span>LIVE</span><strong>TOGETHER</strong><small>每一个视角，都让现场更完整</small></div><span className="stage-coordinate" aria-hidden="true">REC ● &nbsp; MEMORIES NEVER FADE</span></div>
  <div className="discovery-search"><label className="city-picker"><MapPin size={17}/><select aria-label="筛选城市" value={filters.city} onChange={e=>change({city:e.target.value})}><option value="">全部城市</option>{cities.map(c=><option key={c}>{c}</option>)}</select></label><label className="discovery-input"><Search size={19}/><input aria-label="搜索演出" placeholder="搜索歌手、演唱会或场馆" value={filters.search} onChange={e=>change({search:e.target.value})}/>{filters.search&&<button aria-label="清除搜索" onClick={()=>change({search:""})}>×</button>}</label></div>
  <div className="artist-strip" aria-label="按歌手筛选"><button className={`artist-chip ${!filters.artist?"active":""}`} aria-pressed={!filters.artist} onClick={()=>change({artist:""})}><span className="artist-avatar all-artists"><Music2 size={22}/></span><span>全部歌手</span></button>{artists.map(name=>{const s=concerts.find(s=>s.artist===name)!;return <button key={name} className={`artist-chip tone-${s.tone} ${filters.artist===name?"active":""}`} aria-pressed={filters.artist===name} onClick={()=>change({artist:name})}><span className="artist-avatar">{s.avatar?<img src={s.avatar} alt="" width={48} height={48} decoding="async"/>:name.slice(0,1)}</span><span>{name}</span></button>;})}</div>
  <section className="recent-section"><div className="listing-heading"><div><h2><span className="stage-bars" aria-hidden="true"><i/><i/><i/><i/></span>{filters.period==="recent"?"近期演唱会":"历史演唱会"}<span>{matches.length} 站</span></h2><p>灯光熄灭，属于我们的回放刚刚开始</p></div><div className="listing-actions"><button className="secondary create-concert" onClick={onCreate}><Plus size={15}/>新增演唱会</button><div className="period-switch" aria-label="演出时间范围"><button className={filters.period==="recent"?"active":""} aria-pressed={filters.period==="recent"} onClick={()=>change({period:"recent"})}>近 30 天</button><button className={filters.period==="all"?"active":""} aria-pressed={filters.period==="all"} onClick={()=>change({period:"all"})}>全部历史</button></div></div></div>
   <div className="concert-grid">{matches.map(stop=><SessionCard key={stop.key} stop={stop}/>)}</div>
   {!matches.length&&<div className="empty"><Search/><h3>还没有找到这个现场</h3><p>换个歌手、城市，或看看全部历史演出。</p><button className="secondary" onClick={()=>onFilters(DEFAULT_FILTERS)}>清除筛选</button></div>}
   
  </section>
 </div>;
}
