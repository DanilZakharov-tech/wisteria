export type StoryBeat = {
  id: string;
  chapter: number;
  title: string;
  speaker: string;
  mood: string;
  location: string;
  lines: string[];
  unlockAfter?: string;
  rewardQuest?: string;
};
export const storyBeats: StoryBeat[] = [
  {
    id:"arrival",chapter:1,title:"За белым забором",speaker:"Бри",mood:"Первое знакомство",location:"Вистерия-Лейн",
    lines:["По этой улице быстро расходятся новости, дорогая.","Но сегодня у нас не сплетня. Сегодня у нас новая соседка.","У тебя есть возможность начать собственную историю — без попыток понравиться каждому."],
    rewardQuest:"hello"
  },
  {
    id:"wardrobe",chapter:1,title:"Секрет первого впечатления",speaker:"Изабелла",mood:"Стиль и уверенность",location:"Гардероб",
    lines:["Не нужно покупать новый гардероб, чтобы произвести впечатление.","Начни с трёх вещей, которые уже любишь. Покажи, почему они работают вместе."],
    unlockAfter:"hello",rewardQuest:"style"
  },
  {
    id:"reels",chapter:1,title:"Все будут говорить",speaker:"София",mood:"Твой голос",location:"Гостиная",
    lines:["Говорят, в этом районе все умеют хранить секреты. Я — определённо нет!","А ты умеешь рассказывать истории. Давай покажем это миру.","Назови три детали своего стиля и сними короткий Reels — своими словами."],
    unlockAfter:"style",rewardQuest:"reel"
  },
  {
    id:"dinner",chapter:1,title:"Приглашение на ужин",speaker:"Бри",mood:"Уют и ритуалы",location:"Кухня",
    lines:["Кухня — лучшее место для настоящих разговоров.","Мне хватило бы даже нескольких брускетт, чтобы устроить прекрасный вечер.","Хочешь попробовать рецепт и заработать ключ от следующей главы?"],
    unlockAfter:"unpack",rewardQuest:"dinner"
  },
  {
    id:"newchapter",chapter:2,title:"Слишком много секретов",speaker:"Маргарет",mood:"Новая глава",location:"Вистерия-Лейн",
    lines:["Ты обустроилась. Теперь пора выбрать, кем ты хочешь стать на этой улице.","У твоей истории есть два направления: известность и жизнь, которой ты наслаждаешься.","И они вовсе не должны мешать друг другу."],
    unlockAfter:"dinner"
  }
];
export const chapterNames = ["Новая соседка","Слишком много секретов","Идеальный образ","Нежданный гость","Дом, полный историй","Большой вечер"];
export function unlockedStories(done: string[]) {return storyBeats.filter(s=>!s.unlockAfter||done.includes(s.unlockAfter));}
export function nextStory(done:string[],seen:string[]) {return unlockedStories(done).find(s=>!seen.includes(s.id));}
