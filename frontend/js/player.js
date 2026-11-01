export function createPlayer(audio, ui) {
  let tracks=[], index=-1;
  const fmt=n=>Number.isFinite(n)?`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,"0")}`:"0:00";
  function load(i, autoplay=false){if(!tracks.length)return;index=(i+tracks.length)%tracks.length;const t=tracks[index];audio.pause();audio.src=t.preview_url||"";ui.title.textContent=t.title;ui.meta.textContent=`${t.genre||"Beat"} • ${t.bpm||"—"} BPM • ${t.key||"—"}`;ui.play.textContent="▶";if(autoplay)audio.play().catch(()=>{});}
  function toggle(){if(!audio.src){load(0,true);return;}if(audio.paused)audio.play().catch(()=>{});else audio.pause();}
  audio.addEventListener("play",()=>ui.play.textContent="Ⅱ");audio.addEventListener("pause",()=>ui.play.textContent="▶");
  audio.addEventListener("timeupdate",()=>{ui.current.textContent=fmt(audio.currentTime);ui.seek.value=audio.duration?audio.currentTime/audio.duration*1000:0;});
  audio.addEventListener("loadedmetadata",()=>ui.duration.textContent=fmt(audio.duration));
  audio.addEventListener("ended",()=>load(index+1,true));
  ui.play.addEventListener("click",toggle);ui.prev.addEventListener("click",()=>load(index-1,true));ui.next.addEventListener("click",()=>load(index+1,true));
  ui.seek.addEventListener("input",()=>{if(audio.duration)audio.currentTime=Number(ui.seek.value)/1000*audio.duration;});
  ui.volume.addEventListener("input",()=>audio.volume=Number(ui.volume.value));
  return {setTracks(v){tracks=v;if(index<0&&v.length)load(0);},playTrack(id){const i=tracks.findIndex(t=>String(t.id)===String(id));if(i>=0)load(i,true);},toggle};
}
