import { create } from "zustand";
import { persist } from "zustand/middleware";
export type Quest = {
  id: string;
  title: string;
  description: string;
  category: string;
  minutes: number;
  xp: number;
  coins: number;
  requires?: string;
  chapter: number;
};
export const quests: Quest[] = [
  {
    id: "hello",
    title: "Новая соседка",
    description: "Подойди к Виктории у фонтана и познакомься.",
    category: "Сюжет",
    minutes: 2,
    xp: 50,
    coins: 20,
    chapter: 1,
  },
  {
    id: "unpack",
    title: "Дом начинается с мелочей",
    description:
      "Разбери одну коробку или наведи порядок на любимой полке в реальной жизни.",
    category: "Дом",
    minutes: 10,
    xp: 100,
    coins: 40,
    requires: "hello",
    chapter: 1,
  },
  {
    id: "style",
    title: "Твой фирменный образ",
    description:
      "Собери реальный образ из трёх вещей. Выбери один основной цвет и два спокойных оттенка.",
    category: "Стиль",
    minutes: 15,
    xp: 80,
    coins: 35,
    requires: "hello",
    chapter: 1,
  },
  {
    id: "reel",
    title: "Знакомьтесь, это я",
    description:
      "Цель: познакомиться с аудиторией. Идея: три детали твоего стиля. Опорные пункты: любимый силуэт; сочетание цветов; доступная находка. Снимай у окна, 3 коротких плана. Готово: опубликуй Reels или сохрани готовый черновик.",
    category: "Instagram",
    minutes: 20,
    xp: 120,
    coins: 50,
    requires: "hello",
    chapter: 1,
  },
  {
    id: "dinner",
    title: "Приглашение на ужин",
    description:
      "Приготовь брускетты по книге рецептов. Виртуальная кухня откроется после порядка дома.",
    category: "Кулинария",
    minutes: 15,
    xp: 120,
    coins: 50,
    requires: "unpack",
    chapter: 1,
  },
  ...Array.from({ length: 115 }, (_, i) => ({
    id: `daily-${i}`,
    title: [
      "Десять минут для себя",
      "Палитра недели",
      "Уютный уголок",
      "Идея для Reels",
      "Маленький знак внимания",
    ][i % 5],
    description: [
      "Прогуляйся или спокойно потянись десять минут. Выбирай комфортную нагрузку.",
      "Составь сочетание из двух нейтральных оттенков и одного акцента.",
      "Убери одну небольшую поверхность дома.",
      "Запиши тему, три полезных тезиса и сними пробный кадр у окна.",
      "По желанию напиши близкому человеку тёплое сообщение.",
    ][i % 5],
    category: ["Забота о себе", "Стиль", "Дом", "Instagram", "Отношения"][
      i % 5
    ],
    minutes: 10,
    xp: 60,
    coins: 20,
    requires: i < 3 ? "dinner" : `daily-${i - 3}`,
    chapter: Math.min(6, 2 + Math.floor(i / 24)),
  })),
];
export const level = (xp: number) => Math.min(100, 1 + Math.floor(xp / 200));
export function reward(
  state: { done: string[]; xp: number; coins: number },
  id: string,
) {
  const q = quests.find((q) => q.id === id);
  if (
    !q ||
    state.done.includes(id) ||
    (q.requires && !state.done.includes(q.requires))
  )
    return state;
  return {
    ...state,
    done: [...state.done, id],
    xp: state.xp + q.xp,
    coins: state.coins + q.coins,
  };
}
export type Metric = {
  date: string;
  format: string;
  topic: string;
  views: number;
  follows: number;
  followers: number;
};
type Game = {
  xp: number;
  coins: number;
  done: string[];
  accepted: string[];
  friendship: number;
  met: string[];
  meet: (id: string) => void;
  outfit: string;
  decor: boolean;
  quality: string;
  metrics: Metric[];
  started: string;
  finish: (id: string) => void;
  accept: (id: string) => void;
  dress: (v: string) => void;
  buy: () => void;
  setQuality: (v: string) => void;
  addMetric: (m: Metric) => void;
};
export const avatarAnimation = { name: "idle", until: 0 };
export const useGame = create<Game>()(
  persist(
    (set) => ({
      xp: 0,
      coins: 120,
      done: [],
      accepted: ["hello"],
      friendship: 0,
      met: [],
      meet: (id) =>
        set((s) =>
          s.met.includes(id)
            ? s
            : { met: [...s.met, id], friendship: s.friendship + 1 },
        ),
      outfit: "#79334c",
      decor: false,
      quality: "Среднее",
      metrics: [],
      started: new Date().toISOString(),
      finish: (id) =>
        set((s) => {
          const r = reward(s, id);
          if (r !== s) {
            avatarAnimation.name = "joy";
            avatarAnimation.until = Date.now() + 2000;
          }
          return r === s ? s : { ...r, friendship: s.friendship };
        }),
      accept: (id) =>
        set((s) => ({ accepted: [...new Set([...s.accepted, id])] })),
      dress: (outfit) => set({ outfit }),
      buy: () =>
        set((s) =>
          s.coins >= 80 && !s.decor ? { coins: s.coins - 80, decor: true } : s,
        ),
      setQuality: (quality) => set({ quality }),
      addMetric: (m) => set((s) => ({ metrics: [...s.metrics, m] })),
    }),
    { name: "wisteria-save-v1", version: 1 },
  ),
);
export const movement = { x: 0, z: 0 };
export const player = { x: 0, z: 5 };

export const npcs = [
  {
    id: "victoria",
    name: "Виктория",
    role: "Элегантная перфекционистка",
    x: 2,
    z: 3,
    color: "#c1a36c",
    line: "Не пытайся устроить идеальную жизнь за один день. Начни с одной коробки. И оставь место для красивого платья.",
  },
  {
    id: "isabella",
    name: "Изабелла",
    role: "Наставница по стилю",
    x: 8,
    z: 3,
    color: "#354b40",
    line: "Дорогая, уверенность идёт ко всему. Начни с силуэта, который тебе нравится. А тренды пусть подождут.",
  },
  {
    id: "sofia",
    name: "София",
    role: "Романтичная соседка",
    x: -10,
    z: 3,
    color: "#bd91ab",
    line: "Я хотела принести пирог, но мы с духовкой пока в сложных отношениях. Может, для начала просто прогуляемся?",
  },
  {
    id: "margaret",
    name: "Маргарет",
    role: "Мастер маленьких планов",
    x: -4,
    z: 10,
    color: "#7b8f9f",
    line: "Один небольшой шаг лучше списка из тридцати пунктов. Выбери три дела на сегодня. Остальное подождёт.",
  },
];
