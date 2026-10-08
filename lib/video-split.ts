import {findPauseBoundaries,validateRanges,type SongRange} from "./splitting";
import fixWebmDuration from "fix-webm-duration";

export async function suggestSongRanges(file:File,duration:number,songs:string[]){
  if(duration>900)throw new Error("自动分析支持 15 分钟以内的视频，更长的视频可手动设置分段时间");
  const audio=new AudioContext();
  try{
    const buffer=await audio.decodeAudioData(await file.arrayBuffer());
    const windowSeconds=.25,hop=Math.round(buffer.sampleRate*windowSeconds),energy:number[]=[];
    for(let start=0;start<buffer.length;start+=hop){let sum=0,count=0;for(let channel=0;channel<buffer.numberOfChannels;channel++){const data=buffer.getChannelData(channel);for(let i=start;i<Math.min(start+hop,data.length);i+=16){sum+=data[i]*data[i];count++;}}energy.push(Math.sqrt(sum/Math.max(1,count)));}
    const boundaries=findPauseBoundaries(energy,windowSeconds,duration);
    if(!boundaries.length)throw new Error("未找到明显的声音停顿，可能是连续演唱或掌声较大。请手动设置分界点");
    const points=[0,...boundaries,duration];
    return points.slice(0,-1).map((start,i)=>({song:songs[i]||"",start,end:points[i+1]}));
  }catch(e){if(e instanceof DOMException)throw new Error("浏览器无法解析这段音频，请手动设置分段时间");throw e;}
  finally{await audio.close();}
}

export type CutVideo={file:File;src:string;duration:number};
// Re-encode actual independent files locally; source is never uploaded during analysis.
export async function cutSongVideos(file:File,ranges:SongRange[],duration:number,onProgress:(index:number,percent:number)=>void):Promise<CutVideo[]>{
  validateRanges(ranges,duration);
  if(typeof MediaRecorder==="undefined")throw new Error("此浏览器不支持本地剪辑，请使用新版 Chrome 或 Edge");
  const mime=["video/webm;codecs=vp8,opus","video/webm;codecs=vp9,opus","video/mp4"].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime)throw new Error("此浏览器没有可用的视频剪辑编码器，请使用新版 Chrome 或 Edge");
  const audio=new AudioContext();await audio.resume();
  const video=document.createElement("video"),src=URL.createObjectURL(file),canvas=document.createElement("canvas");
  video.playsInline=true;video.preload="auto";video.src=src;
  let stream:MediaStream|undefined;const results:CutVideo[]=[];
  try{
    await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("视频读取超时")),15000);video.onloadeddata=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(new Error("视频读取失败"));};});
    const scale=Math.min(1,480/Math.max(video.videoWidth,video.videoHeight));canvas.width=Math.max(2,Math.round(video.videoWidth*scale/2)*2);canvas.height=Math.max(2,Math.round(video.videoHeight*scale/2)*2);
    const ctx=canvas.getContext("2d")!;
    const source=audio.createMediaElementSource(video),destination=audio.createMediaStreamDestination();source.connect(destination);
    stream=canvas.captureStream(15);destination.stream.getAudioTracks().forEach(t=>stream!.addTrack(t));
    for(let i=0;i<ranges.length;i++){
      const r=ranges[i];video.pause();
      if(Math.abs(video.currentTime-r.start)>.001)await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("无法定位分段起点")),10000);video.onseeked=()=>{clearTimeout(timer);resolve();};video.currentTime=r.start;});
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      const chunks:Blob[]=[];const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:350000,audioBitsPerSecond:48000});
      const recorded=await new Promise<Blob>((resolve,reject)=>{
        let interval:ReturnType<typeof setInterval>;let watchdog:ReturnType<typeof setTimeout>;let failure:Error|undefined;
        const stop=()=>{video.pause();clearInterval(interval);clearTimeout(watchdog);if(recorder.state!=="inactive")recorder.stop();};
        recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        recorder.onerror=()=>{failure=new Error("视频编码失败，请重试");stop();};
        recorder.onstop=()=>{if(failure)reject(failure);else resolve(new Blob(chunks,{type:mime}));};
        recorder.start(1000);
        interval=setInterval(()=>{ctx.drawImage(video,0,0,canvas.width,canvas.height);onProgress(i,Math.min(100,Math.round((video.currentTime-r.start)/(r.end-r.start)*100)));if(video.currentTime>=r.end||video.ended)stop();},67);
        watchdog=setTimeout(()=>{failure=new Error("剪辑超时，请保持页面在前台后重试");stop();},(r.end-r.start+30)*1000);
        void video.play().catch(()=>{failure=new Error("无法开始剪辑播放，请重试");stop();});
      });
      const output=mime.startsWith("video/webm")?await fixWebmDuration(recorded,(r.end-r.start)*1000,{logger:false}):recorded;
      if(output.size>25*1024*1024)throw new Error(`第 ${i+1} 段超过 25 MB，请缩短该片段后重试`);
      if(output.size<1000)throw new Error(`第 ${i+1} 段未生成有效视频，请重试`);
      const cutFile=new File([output],`${r.song}.${mime.startsWith("video/webm")?"webm":"mp4"}`,{type:mime.split(";")[0]});
      results.push({file:cutFile,src:URL.createObjectURL(cutFile),duration:r.end-r.start});
    }
    return results;
  }catch(e){results.forEach(r=>URL.revokeObjectURL(r.src));throw e;}
  finally{video.pause();stream?.getTracks().forEach(t=>t.stop());video.removeAttribute("src");video.load();video.remove();URL.revokeObjectURL(src);await audio.close();}
}
