export type SongRange={song:string;start:number;end:number};
export function validateRanges(ranges:SongRange[],duration:number){
  if(!ranges.length||ranges.length>8)throw new Error("请设置 1 至 8 个单曲片段");
  for(let i=0;i<ranges.length;i++){
    const r=ranges[i];
    if(!r.song.trim()||r.song.trim().length>60)throw new Error(`第 ${i+1} 段请填写歌曲名`);
    if(!Number.isFinite(r.start)||!Number.isFinite(r.end)||r.start<0||r.end>duration+.05||r.end-r.start<1)throw new Error(`第 ${i+1} 段的时间无效：至少 1 秒，且不能超出原视频`);
    if(i&&r.start<ranges[i-1].end-.01)throw new Error("片段按时间排列，不能重叠");
  }
  return ranges.map(r=>({...r,song:r.song.trim()}));
}
// Only proposes low-energy pauses. Applause, medleys and silent gaps need human review.
export function findPauseBoundaries(energy:number[],windowSeconds:number,duration:number){
  const sorted=[...energy].sort((a,b)=>a-b);
  const median=sorted[Math.floor(sorted.length*.5)]||0;
  if(median<.0001)return [];
  const threshold=Math.min(median*.25,.015);
  const candidates:{at:number;quiet:number}[]=[];
  let run=-1;
  for(let i=0;i<=energy.length;i++){
    if(i<energy.length&&energy[i]<threshold){if(run<0)run=i;}
    else if(run>=0){const quiet=(i-run)*windowSeconds;const at=(run+i)*windowSeconds/2;if(quiet>=1&&at>=5&&at<=duration-5)candidates.push({at,quiet});run=-1;}
  }
  const selected:number[]=[];
  for(const c of candidates.sort((a,b)=>b.quiet-a.quiet))if(selected.every(t=>Math.abs(t-c.at)>=10)){selected.push(Math.round(c.at*10)/10);if(selected.length===7)break;}
  return selected.sort((a,b)=>a-b);
}
