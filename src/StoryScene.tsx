import { useEffect,useState } from "react";
import { ArrowLeft, BookOpen, Gift, Sparkles, ChevronRight, X } from "lucide-react";
import { storyBeats, nextStory, chapterNames, type StoryBeat } from "./story";
import { useGame } from "./game";
import "./story.css";
const portraits: Record<string,string> = {
"Бри":"🌹","Изабелла":"💎","София":"🌸","Маргарет":"🗝️"
};
function stageTexture(name:string){
 return name==="Гардероб"?"wardrobe":name==="Кухня"?"kitchen":name==="Гостиная"?"lounge":"street";
}
export default function StoryScene({ onClose,onQuest }: {onClose:()=>void;onQuest:(id:string)=>void}) {
 const done=useGame(s=>s.done);
 const [seen,setSeen]=useState<string[]>(()=>{try{const value: unknown=JSON.parse(localStorage.getItem("wisteria-seen-stories-v1")||"[]");return Array.isArray(value)?value.filter((id): id is string=>typeof id==="string"):[]}catch{return []}});
 const [selected,setSelected]=useState<StoryBeat>(()=>nextStory(done,seen)||storyBeats[0]);
 const [page,setPage]=useState(0);
 const [reward,setReward]=useState(false);
 useEffect(()=>{try{localStorage.setItem("wisteria-seen-stories-v1",JSON.stringify(seen))}catch{/* Continue playing when storage is unavailable. */}},[seen]);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow="hidden";const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};window.addEventListener("keydown",close);return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",close)}},[onClose]);
 const advance=()=>{
 if(page<selected.lines.length-1){setPage(p=>p+1);return;}
 setSeen(v=>v.includes(selected.id)?v:[...v,selected.id]);setReward(true);
 };
 const change=(beat:StoryBeat)=>{setSelected(beat);setPage(0);setReward(false)};
 const available=storyBeats.filter(s=>!s.unlockAfter||done.includes(s.unlockAfter));
 return <div className="story-screen" role="dialog" aria-modal="true" aria-label="Сюжетные истории">
 <div className={"storybook-art "+stageTexture(selected.location)}>
 <div className="storybook-vines" aria-hidden="true">✿ ✿ ✿</div>
 <button className="story-close" onClick={onClose}><X size={20}/><span>Вернуться в мир</span></button>
 <div className="story-kicker"><BookOpen size={16}/> СЕЗОН 01 · ГЛАВА {String(selected.chapter).padStart(2,"0")}</div>
 <nav className="story-mobile-episodes" aria-label="Доступные сцены">{available.map(beat=><button key={beat.id} aria-pressed={selected.id===beat.id} onClick={()=>change(beat)}>{seen.includes(beat.id)?"✓ ":""}{beat.title}</button>)}</nav>
 <div className="story-cinematic">
 <div className="story-npc" aria-label={selected.speaker}><div className="story-npc-halo" /><div className="story-npc-portrait">{selected.speaker==="Бри"?<img src="/characters/bree-scene.jpg" alt="Бри"/>:portraits[selected.speaker]}</div><span>{selected.speaker}</span></div>
 <div className="story-alina"><img className="story-alina-real" src="/characters/alina.jpg" alt="Алина"/><span>Алина</span></div>
 </div>
 <div className="storybook-dialogue">
 <div className="storybook-dialogue-top"><span className="story-person">{selected.speaker}</span><span>{selected.mood}</span></div>
 <h2>{selected.title}</h2>
 {!reward?<><p key={page}>{selected.lines[page]}</p><div className="story-actions"><span>{page+1} / {selected.lines.length}</span><button onClick={advance}>{page===selected.lines.length-1?"Завершить сцену":"Продолжить"} <ChevronRight size={18}/></button></div></>:
 <div className="story-reward"><Sparkles size={24}/><p>Новая сцена в твоей истории!</p><div className="story-actions">
 {selected.rewardQuest&&!done.includes(selected.rewardQuest)&&<button onClick={()=>{onClose();onQuest(selected.rewardQuest!)}}><Gift size={18}/> Открыть миссию</button>}
 <button onClick={()=>{const n=nextStory(done,[...seen,selected.id]);if(n)change(n);else onClose()}}>Дальше <ChevronRight size={18}/></button>
 </div></div>}
 </div>
 </div>
 <aside className="story-episodes">
 <div className="story-episodes-title"><span>БИБЛИОТЕКА ИСТОРИЙ</span><h3>Твои главы</h3><p>Знакомься с соседками. История развивается вместе с тобой.</p></div>
 {chapterNames.map((name,i)=><div className="story-chapter" key={name}><div className="chapter-number">{String(i+1).padStart(2,"0")}</div><div><strong>{name}</strong><small>{storyBeats.filter(x=>x.chapter===i+1).length?storyBeats.filter(x=>x.chapter===i+1).length+" сцены":"Скоро"}</small></div></div>)}
 <div className="episode-title">СЦЕНЫ В ТВОЁМ ДОСТУПЕ</div>
 {available.map(s=><button key={s.id} className={"episode-button "+(s.id===selected.id?"selected":"")} onClick={()=>change(s)}><span>{seen.includes(s.id)?"✓":"✦"}</span><div><strong>{s.title}</strong><small>{s.speaker} · {s.location}</small></div><ArrowLeft size={15}/></button>)}
 </aside>
 </div>
}
