import {useState} from 'react';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {useGame,level} from './game';
import AlinaPortrait from './AlinaPortrait';
import Season from './Season';
import './season.css';
import './story.css';
import './game2d.css';
const people=['Бри','Габриэль','Сьюзан','Линетт','Виктория','Оливия','Мия','Алекс','Нора','Елена'];
const scenes=[
 ['Белый конверт','Бри','Добро пожаловать, Алина. Кто-то оставил письмо у твоего дома. Здесь все знают друг друга — но не все говорят правду.','Показать письмо Бри','Сначала изучить самой'],
 ['Первое впечатление','Габриэль','На конверте нет имени. Зато есть приглашение на вечер соседей. Начнём с образа: что ты хочешь сказать о себе?','Выбрать смелый образ','Остаться собой'],
 ['Смешной случай','Сьюзан','Я тоже однажды получила загадочное письмо. Оказалось, счёт за газ. Но здесь бумага слишком красивая.','Рассказать о волнении','Пошутить в ответ'],
 ['План на завтра','Линетт','Тайны подождут. Выбери одно дело, которое действительно сделаешь завтра. Иначе этот район съест всё твоё время.','Сначала контент','Сначала порядок дома'],
 ['За живой изгородью','Виктория','Этот конверт я уже видела. У прежней хозяйки дома. Она уехала после большого вечера.','Спросить о хозяйке','Спросить о вечере'],
 ['Дружеский вызов','Оливия','Давай каждая снимет ролик о первом дне здесь. Без соревнования по просмотрам. Просто найдём свой голос.','Предложить совместный ролик','Снять личную историю'],
 ['Свет из окна','Мия','У тебя есть всё для первого ролика: свет, три вещи и история. Не прячься за идеальным монтажом.','Попросить помочь со съёмкой','Попробовать самостоятельно'],
 ['Кофе и слухи','Нора','За этим столиком прежняя хозяйка встречалась с человеком, которого никто не знал. Она оставила мне ключ.','Попросить сохранить ключ','Спросить, можно ли взять ключ'],
 ['Случайная встреча','Алекс','Я видел, как письмо положили к тебе. Это была женщина в светлом пальто. Но лица я не разглядел.','Попросить помочь найти её','Поблагодарить и не торопиться'],
 ['Время для себя','Елена','Ты весь день думаешь о других. Сделай паузу. Уверенность начинается не с чужого одобрения.','Признаться, что устала','Рассказать о своих целях'],
 ['Ужин соседей','Бри','Теперь ты знаешь наш район чуть лучше. Но прежде чем вскрыть конверт, подумай: кому ты доверишь свой секрет?','Довериться Бри','Поделиться с новыми подругами'],
 ['Дом помнит','Виктория','В конверте фотография твоего дома. На обороте: «Не открывай дверь после полуночи». На снимке в окне стоишь ты. Но фотография сделана год назад.','Сохранить улику','Позвонить соседкам']
];
type StoryState={scene:number;choices:Record<number,number>;relations:Record<string,number>;started:boolean;select:(choice:number)=>void;start:()=>void};
const useStory=create<StoryState>()(persist((set)=>({scene:0,choices:{},relations:{},started:false,start:()=>set({started:true}),select:(choice)=>set(s=>{if(s.choices[s.scene]!==undefined)return s;const person=scenes[s.scene][1];return {choices:{...s.choices,[s.scene]:choice},relations:{...s.relations,[person]:(s.relations[person]||0)+(choice===0?2:1)},scene:Math.min(s.scene+1,scenes.length)}})}),{name:'wisteria-story-2d-v2'}));
export default function Game2D(){const s=useStory();const g=useGame();const [screen,setScreen]=useState('start');const [message,setMessage]=useState('');const [followers,setFollowers]=useState('');const [views,setViews]=useState('');const scene=scenes[Math.min(s.scene,11)];const completed=s.scene===12;
 const notify=(text:string)=>{setMessage(text);setTimeout(()=>setMessage(''),3000)};
 return <div className="novel-app"><div className="novel-backdrop"/>{message&&<div className="novel-toast" role="status">{message}</div>}
 {screen==='start'?<section className="novel-start"><small>ИНТЕРАКТИВНАЯ ИСТОРИЯ АЛИНЫ</small><h1>WISTERIA</h1><p>За красивыми фасадами всегда есть история.<br/>Сегодня начинается твоя.</p><button onClick={()=>{s.start();setScreen('story')}}>{s.started?'Продолжить историю':'Начать историю'}</button><button onClick={()=>setScreen('today')}>Мои задания сегодня</button><small>Версия 2D · 17.11 · f41+story</small></section>:<>
 <header className="novel-hud"><button onClick={()=>setScreen('start')}>WISTERIA</button><span>Алина · ур. {level(g.xp)}</span><span>✦ {g.xp} XP · {g.coins} монет</span></header>
 {screen==='story'&&<section className="novel-stage"><div className="novel-chapter">ГЛАВА 1 · НОВАЯ СОСЕДКА · {Math.min(s.scene+1,12)}/12</div><div className="novel-character"><AlinaPortrait emotion={s.scene%2?'thoughtful':'smile'}/><span>Алина</span></div><article className="novel-dialog"><small>{scene[1]}</small><h2>{completed?'Продолжение следует…':scene[0]}</h2><p>{completed?'Первая глава завершена. Твои решения сохранены в дневнике. Выполняй реальные задания и развивай свою жизнь на Вистерия-Лейн.':scene[2]}</p>{!completed?<div className="novel-choices">{[0,1].map(c=><button key={c} onClick={()=>{s.select(c);notify(`Отношения: ${scene[1]} +${c===0?2:1}`)}}>{scene[3+c]}</button>)}</div>:<button onClick={()=>setScreen('today')}>Перейти к заданиям</button>}</article></section>}
 {screen==='today'&&<Season onStory={()=>setScreen('story')} onInstagram={()=>setScreen('phone')}/>}
 {screen==='journal'&&<section className="novel-panel"><h1>Дневник Алины</h1><p>Пройдено сцен: {s.scene}/12</p>{Object.entries(s.choices).map(([id,c])=><article key={id}><h3>{scenes[+id][0]}</h3><p>{scenes[+id][3+c]}</p></article>)}<h2>Отношения</h2>{people.map(p=><p key={p}>{p} · {s.relations[p]||0} · {(s.relations[p]||0)>=3?'Знакомая':'Первое знакомство'}</p>)}</section>}
 {screen==='phone'&&<section className="novel-panel"><h1>Мой Instagram</h1><p>Цель сезона: 5 000 подписчиков. Это ориентир, а не обещание роста.</p><label>Подписчики<input type="number" min="0" value={followers} onChange={e=>setFollowers(e.target.value)}/></label><label>Просмотры ролика<input type="number" min="0" value={views} onChange={e=>setViews(e.target.value)}/></label><button onClick={()=>{if(!followers||!Number.isFinite(+followers)||+followers<0||+views<0){notify('Введи корректные показатели');return}g.addMetric({date:new Date().toISOString(),followers:+followers,views:+views,follows:0,format:'Ручной отчёт',topic:'Личный блог'});notify('Показатели сохранены')}}>Сохранить показатели</button>{g.metrics.map((m,i)=><p key={i}>{new Date(m.date).toLocaleDateString('ru')} · {m.followers} подписчиков · {m.views} просмотров</p>)}</section>}
 <nav className="novel-nav">{[['story','История'],['today','Задания'],['phone','Телефон'],['journal','Дневник']].map(([id,label])=><button key={id} aria-pressed={screen===id} onClick={()=>setScreen(id)}>{label}</button>)}</nav></>}
 </div>
}
