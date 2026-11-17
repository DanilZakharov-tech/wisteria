import React, { useState, useEffect, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  Map,
  Home,
  BookOpen,
  Sparkles,
  Shirt,
  Instagram,
  Trophy,
  Calendar,
  Settings,
  ChevronRight,
  X,
  Coins,
  Heart,
  ArrowUpRight,
  Check,
  MessageCircle,
  Sun,
  Volume2,
  Compass,
  Plus,
} from "lucide-react";
import World from "./World";
import StoryScene from "./StoryScene";
import Season from "./Season";
import {
  useGame,
  quests,
  level,
  movement,
  player,
  avatarAnimation,
  npcs,
} from "./game";
import "./style.css";
import { CloudPanel, Admin, loadQuestConfig } from "./cloud";
const tabs = [
  ["Сегодня", Sun],
  ["Мир", Compass],
  ["Миссии", BookOpen],
  ["Карта", Map],
  ["Гардероб", Shirt],
  ["Дом", Home],
  ["Instagram", Instagram],
  ["Достижения", Trophy],
  ["Календарь", Calendar],
] as const;
function App() {
  const g = useGame();
  const [, refresh] = useState(0);
  useEffect(() => {
    loadQuestConfig()
      .then(() => refresh((x) => x + 1))
      .catch(console.warn);
  }, []);
  const [tab, setTab] = useState("Сегодня");
  const [near, setNear] = useState("");
  const [inside, setInside] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [dialogNpc, setDialogNpc] = useState("victoria");
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [format, setFormat] = useState("Экспертный");
  const [followers, setFollowers] = useState("");
  const [views, setViews] = useState("");
  const [topic, setTopic] = useState("Стиль");
  const [follows, setFollows] = useState("");
  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 4000);
  };
  const available = quests.filter(
    (q) =>
      !g.done.includes(q.id) && (!q.requires || g.done.includes(q.requires)),
  );
  const today = available.slice(0, 3);
  const day = Math.min(
    30,
    1 + Math.floor((Date.now() - new Date(g.started).getTime()) / 86400000),
  );
  const complete = (id: string) => {
    if (id === "hello") {
      notify("Сначала познакомься с Викторией у фонтана");
      return;
    }
    g.finish(id);
    notify("Задание выполнено · награда сохранена");
    setDetail(null);
  };
  const interact = () => {
    if (near.startsWith("npc:")) {
      setDialogNpc(near.split(":")[1]);
      movement.x = 0;
      movement.z = 0;
      setDialog(true);
      avatarAnimation.name = "talk";
      avatarAnimation.until = Date.now() + 5000;
    }
    if (near === "door") {
      setInside(!inside);
      player.x = 0;
      player.z = 5;
    }
    if (near === "room") {
      setTab("Дом");
    }
  };
  const neighbor = npcs.find((n) => n.id === dialogNpc) || npcs[0];
  const chosen = quests.find((q) => q.id === detail);
  const best = [...g.metrics].sort(
    (a, b) =>
      b.follows / Math.max(1, b.views) - a.follows / Math.max(1, a.views),
  )[0];
  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" onClick={() => setTab("Мир")}>
          <span className="brand-flower">✳</span> WISTERIA
          <small>ТВОЯ НОВАЯ ИСТОРИЯ</small>
        </a>
        <div className="season-mini">
          <span>СЕЗОН 01</span>
          <h3>Всё начинается с тебя</h3>
          <p>30 дней маленьких перемен</p>
        </div>
        <nav>
          {tabs.map(([name, Icon]) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              <Icon size={19} />
              {name}
              {name === "Миссии" && <i>{today.length}</i>}
            </button>
          ))}
        </nav>
        <button className="settings" onClick={() => setTab("Настройки")}>
          <Settings size={19} />
          Настройки
        </button>
        <div className="profile">
          <div className="avatar">А</div>
          <div>
            <b>Алина</b>
            <small>Новая соседка</small>
          </div>
          <span>⌃</span>
        </div>
      </aside>
      {storyOpen && <StoryScene onClose={() => setStoryOpen(false)} onQuest={(id) => { setTab("Миссии"); setDetail(id); }} />}
      <main>
{tab === "Сегодня" && <Season onStory={()=>setStoryOpen(true)} onInstagram={()=>setTab("Instagram")} />}
        <header>
          <div>
            <span className="eyebrow">ТВОЁ МЕСТО СИЛЫ</span>
            <h1>
              {tab === "Мир" ? "Добро пожаловать домой, Алина" : tab}
              <span className="heading-flower">✧</span>
            </h1>
          </div>
          <div className="currencies">
            <span>
              <Sparkles size={17} />
              {level(g.xp)} <small>уровень</small>
            </span>
            <span>
              <Coins size={18} />
              {g.coins}
            </span>
            <button onClick={() => setTab("Настройки")} aria-label="Настройки">
              <Settings size={20} />
            </button>
          </div>
        </header>
        <div className="game-layout">
          <section className="main-column">
            <div className="world-card">
              <World
                inside={inside}
                onNear={setNear}
                paused={dialog || !!detail || storyOpen}
              />
              <div className="world-top">
                <div className="location">
                  <span className="live-dot" />
                  {inside ? "Дом Алины" : "Wisteria Lane"}
                  <small>
                    <Sun size={13} /> 24° · Солнечно
                  </small>
                </div>
                <button
                  className="round"
                  onClick={() => setTab("Карта")}
                  aria-label="Открыть карту"
                >
                  <Map size={18} />
                </button>
              </div>
              <button className="story-launch" onClick={() => setStoryOpen(true)}><BookOpen size={17}/> История соседок <Sparkles size={15}/></button>
              <div className="chapter-chip">
                <span>{g.done.includes("dinner") ? "ГЛАВА 02" : "ГЛАВА 01"}</span>
                <b>{g.done.includes("dinner") ? "Свой ритм" : "Новая соседка"}</b>
                <small>
                  {g.done.includes("dinner")
                    ? "Приглашение получено"
                    : "У каждого дома есть своя история"}
                </small>
              </div>
              <div className="world-bottom">
                <div
                  className="joystick"
                  aria-label="Джойстик"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const r = e.currentTarget.getBoundingClientRect();
                    movement.x = (e.clientX - r.left - r.width / 2) / 40;
                    movement.z = (e.clientY - r.top - r.height / 2) / 40;
                  }}
                  onPointerMove={(e) => {
                    if (e.buttons) {
                      const r = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - r.left - r.width / 2) / 40,
                        z = (e.clientY - r.top - r.height / 2) / 40,
                        n = Math.max(1, Math.hypot(x, z));
                      movement.x = x / n;
                      movement.z = z / n;
                    }
                  }}
                  onPointerUp={() => {
                    movement.x = 0;
                    movement.z = 0;
                  }}
                  onPointerCancel={() => {
                    movement.x = 0;
                    movement.z = 0;
                  }}
                >
                  <span>✥</span>
                </div>
                <span className="controls-hint">
                  WASD / джойстик — идти
                  <br />
                  Потяни сцену — повернуть камеру
                </span>
                <button
                  className={"interact " + (!near ? "muted" : "")}
                  disabled={!near}
                  onClick={interact}
                >
                  <MessageCircle size={18} />
                  {near.startsWith("npc:")
                    ? "Поговорить"
                    : near === "door"
                      ? inside
                        ? "На улицу"
                        : "Войти в дом"
                      : near === "room"
                        ? "Осмотреть"
                        : "Подойди к соседке"}
                </button>
              </div>
            </div>
            {tab === "Мир" ? (
              <>
                <div className="section-title">
                  <div>
                    <span className="eyebrow">
                      МАЛЕНЬКИЕ ШАГИ — БОЛЬШАЯ ИСТОРИЯ
                    </span>
                    <h2>Сегодня в твоей истории</h2>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setTab("Миссии")}
                  >
                    Все миссии <ChevronRight size={16} />
                  </button>
                </div>
                <div className="quest-grid">
                  {today.map((q, i) => (
                    <button
                      className="quest-card"
                      key={q.id}
                      onClick={() => setDetail(q.id)}
                    >
                      <span className={"quest-icon c" + i}>
                        {i === 0 ? (
                          <Home />
                        ) : i === 1 ? (
                          <Shirt />
                        ) : (
                          <Instagram />
                        )}
                      </span>
                      <span className="quest-meta">
                        {q.category} · {q.minutes} мин
                      </span>
                      <h3>{q.title}</h3>
                      <p>{q.description.split(".")[0]}.</p>
                      <footer>
                        <span>✧ {q.xp} XP</span>
                        <span>◉ {q.coins}</span>
                        <ChevronRight size={16} />
                      </footer>
                    </button>
                  ))}
                </div>
                <div className="quote">
                  «Идеальная жизнь? Нет. Моя собственная? Определённо.»
                  <span>— Алина</span>
                  <span className="quote-flower">❋</span>
                </div>
              </>
            ) : (
              <div className="panel-content">
                {tab === "Миссии" && (
                  <>
                    <h2>Твой темп. Твои маленькие победы.</h2>
                    <p>
                      Реальные действия открывают новые возможности. Пропуски
                      без штрафов.
                    </p>
                    {available.slice(0, 9).map((q) => (
                      <button
                        className="list-row"
                        onClick={() => setDetail(q.id)}
                        key={q.id}
                      >
                        <span>
                          <b>{q.title}</b>
                          <small>
                            {q.category} · {q.minutes} мин
                          </small>
                        </span>
                        <span>
                          +{q.xp} XP <ChevronRight size={16} />
                        </span>
                      </button>
                    ))}
                  </>
                )}
                {tab === "Карта" && (
                  <>
                    <h2>Район Wisteria Lane</h2>
                    <div className="map-art">
                      <span>✿ Сад Виктории</span>
                      <span>⌂ Дом Алины</span>
                      <span>♧ Сквер и фонтан</span>
                      <span>⌂ Дом Изабеллы · скоро</span>
                    </div>
                    <p>
                      Дом Алины — слева от фонтана. Для входа подойди к калитке
                      и нажми «Войти в дом».
                    </p>
                    <button className="primary" onClick={() => setTab("Мир")}>
                      Вернуться в мир
                    </button>
                  </>
                )}
                {tab === "Гардероб" && (
                  <>
                    <h2>Тихая роскошь</h2>
                    <p>Выбери цвет платья — он сразу изменится в 3D-мире.</p>
                    <div className="outfits">
                      {["#79334c", "#e1d3b4", "#253f36", "#b3a0c2"].map(
                        (c, i) => (
                          <button
                            key={c}
                            onClick={() => g.dress(c)}
                            style={{ background: c }}
                            aria-label={
                              [
                                "Бордовое платье",
                                "Кремовое платье",
                                "Изумрудное платье",
                                "Лавандовое платье",
                              ][i]
                            }
                          >
                            {g.outfit === c && <Check />}
                          </button>
                        ),
                      )}
                    </div>
                  </>
                )}
                {tab === "Дом" && (
                  <>
                    <h2>Здесь всё по-твоему</h2>
                    <p>
                      Гостиная доступна.{" "}
                      {g.done.includes("unpack")
                        ? "Кухня открыта за порядок в реальном доме."
                        : "Разбери вещи, чтобы открыть кухню."}{" "}
                      Спальня и гардеробная — в следующих обновлениях.
                    </p>
                    <button
                      className="primary"
                      disabled={g.decor || g.coins < 80}
                      onClick={() => {
                        g.buy();
                        notify("Растение появилось в гостиной");
                      }}
                    >
                      {g.decor
                        ? "Растение куплено"
                        : "Купить растение · 80 монет"}
                    </button>
                    <button
                      className="dialog-choice"
                      onClick={() => {
                        avatarAnimation.name = "sit";
                        avatarAnimation.until = Date.now() + 4000;
                        notify("Маленькая пауза для себя");
                      }}
                    >
                      Отдохнуть · анимация сидения
                    </button>
                    <h3>Книга рецептов · брускетты с томатами</h3>
                    <p>15 минут · 2 порции</p>
                    <p>
                      4 ломтика хлеба, 2 помидора, 1 зубчик чеснока, 1 ст. л.
                      оливкового масла, базилик, щепотка соли.
                    </p>
                    <ol>
                      <li>Вымой и нарежь помидоры, смешай с маслом и солью.</li>
                      <li>
                        Подсуши хлеб на сухой сковороде по 2 минуты с каждой
                        стороны.
                      </li>
                      <li>
                        Натри хлеб чесноком, выложи томаты и базилик. Подавай
                        сразу.
                      </li>
                    </ol>
                    {g.done.includes("unpack") &&
                      !g.done.includes("dinner") && (
                        <button
                          className="primary"
                          onClick={() => complete("dinner")}
                        >
                          Я приготовила · получить награду
                        </button>
                      )}
                  </>
                )}
                {tab === "Instagram" && (
                  <>
                    <h2>Твой голос заслуживает внимания</h2>
                    <p>
                      Цель сезона — 5 000 подписчиков. Это ориентир, результат
                      зависит от многих факторов. Метрики вводятся вручную; Meta
                      не подключена.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        g.addMetric({
                          date: new Date().toISOString(),
                          format,
                          topic,
                          views: Number(views),
                          followers: Number(followers),
                          follows: Number(follows),
                        });
                        notify("Показатели сохранены");
                      }}
                    >
                      <label>
                        Формат
                        <select
                          value={format}
                          onChange={(e) => setFormat(e.target.value)}
                        >
                          {[
                            "Экспертный",
                            "Разговорный",
                            "Переодевашка",
                            "Трендовый",
                            "Лайфстайл",
                          ].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Тема
                        <input
                          required
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                        />
                      </label>
                      <label>
                        Просмотры
                        <input
                          required
                          min="0"
                          type="number"
                          value={views}
                          onChange={(e) => setViews(e.target.value)}
                        />
                      </label>
                      <label>
                        Подписки с публикации
                        <input
                          required
                          min="0"
                          type="number"
                          value={follows}
                          onChange={(e) => setFollows(e.target.value)}
                        />
                      </label>
                      <label>
                        Всего подписчиков
                        <input
                          required
                          min="0"
                          type="number"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                        />
                      </label>
                      <button className="primary">Сохранить аналитику</button>
                    </form>
                    {best && (
                      <div className="insight">
                        <b>Следующий эксперимент</b>
                        <p>
                          Формат «{best.format}», тема «{best.topic}» дали
                          наибольшую долю подписок среди введённых публикаций.
                          Попробуй продолжение: новая ситуация, три совета, один
                          пример. Пока это наблюдение на {g.metrics.length}{" "}
                          публикациях.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {tab === "Достижения" && (
                  <>
                    <h2>Твоя коллекция первых раз</h2>
                    {[
                      ["Добро пожаловать", g.done.includes("hello")],
                      ["Дом, милый дом", g.done.includes("unpack")],
                      ["Хозяйка вечера", g.done.includes("dinner")],
                      ["Первые заметки", g.metrics.length > 0],
                    ].map(([name, done]) => (
                      <div className="list-row" key={String(name)}>
                        <Trophy color={done ? "#ae8649" : "#c7c2b9"} />
                        <b>{name}</b>
                        <span>{done ? "Открыто" : "Впереди"}</span>
                      </div>
                    ))}
                  </>
                )}
                {tab === "Календарь" && (
                  <>
                    <h2>30 дней для новой истории</h2>
                    <p>День {day} · 6 глав · без штрафов за паузы</p>
                    <div className="calendar">
                      {Array.from({ length: 30 }, (_, i) => (
                        <span
                          className={i + 1 === day ? "current" : ""}
                          key={i}
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {tab === "Настройки" && (
                  <>
                    <h2>Пусть тебе будет удобно</h2>
                    <label>
                      Качество графики
                      <select
                        value={g.quality}
                        onChange={(e) => g.setQuality(e.target.value)}
                      >
                        {["Низкое", "Среднее", "Высокое"].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>
                    <p>
                      Прогресс сохраняется на этом устройстве. Для резервной
                      копии скачай сохранение.
                    </p>
                    <button
                      className="primary"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(
                          new Blob([JSON.stringify(g, null, 2)], {
                            type: "application/json",
                          }),
                        );
                        a.download = "wisteria-save.json";
                        a.click();
                        URL.revokeObjectURL(a.href);
                      }}
                    >
                      Скачать прогресс
                    </button>
                    <h3>Установка на iPhone</h3>
                    <p>
                      Открой игру по HTTPS в Safari → Поделиться → На экран
                      «Домой». После первого запуска ресурсы доступны офлайн.
                    </p>
                    <CloudPanel />
                    <p>
                      Фото Алины не использовались; персонажи временные и
                      процедурные.
                    </p>
                  </>
                )}
              </div>
            )}
          </section>
          <aside className="right-column">
            <div className="season-card">
              <span className="eyebrow">ТВОЙ ПЕРВЫЙ СЕЗОН</span>
              <span className="season-flower">✿</span>
              <h2>
                Расцветай
                <br />в своём темпе
              </h2>
              <p>
                Новая глава жизни начинается
                <br />с маленьких шагов.
              </p>
              <div className="day">
                <b>День {day}</b>
                <span>из 30</span>
              </div>
              <div className="progress">
                <i style={{ width: `${(day / 30) * 100}%` }} />
              </div>
              <footer>
                Твоя история только начинается <Sparkles size={15} />
              </footer>
            </div>
            <div className="progress-card">
              <div className="section-title">
                <h3>Ты растёшь</h3>
                <span>✧</span>
              </div>
              <div className="level-line">
                <div className="level-medal">{level(g.xp)}</div>
                <div>
                  <b>{g.done.includes("dinner") ? "Свой ритм" : "Новая соседка"}</b>
                  <small>Уровень {level(g.xp)} из 100</small>
                </div>
              </div>
              <div className="progress">
                <i style={{ width: `${(g.xp % 200) / 2}%` }} />
              </div>
              <div className="xp-caption">
                {g.xp % 200} / 200 XP <span>до следующего уровня</span>
              </div>
              <div className="stats">
                <span>
                  <b>{g.done.length}</b>миссий выполнено
                </span>
                <span>
                  <b>{g.friendship}</b>новая дружба
                </span>
              </div>
            </div>
            <div className="instagram-card">
              <span className="ig-icon">
                <Instagram size={21} />
              </span>
              <div>
                <b>Из игры — в твою жизнь</b>
                <p>
                  Создавай контент, который
                  <br />
                  похож на тебя.
                </p>
              </div>
              <div className="followers">
                <b>
                  {g.metrics.at(-1)?.followers.toLocaleString("ru") || "0"}{" "}
                  <small>/ 5 000</small>
                </b>
                <span>подписчиков · цель сезона</span>
              </div>
              <button
                className="text-button"
                onClick={() => setTab("Instagram")}
              >
                Мой Instagram <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="local-save">
              <span className="live-dot" /> Прогресс сохранён на устройстве
            </div>
          </aside>
        </div>
        <footer className="page-footer">
          СОЗДАВАЙ ЖИЗНЬ, В КОТОРУЮ ХОЧЕТСЯ ВОЗВРАЩАТЬСЯ <span>✧ WISTERIA</span>
        </footer>
      </main>
      {dialog && (
        <div className="overlay">
          <div className="modal">
            <button
              className="close"
              onClick={() => setDialog(false)}
              aria-label="Закрыть"
            >
              <X />
            </button>
            <span className="eyebrow">
              {neighbor.name.toUpperCase()} · {neighbor.role.toUpperCase()}
            </span>
            <h2>
              {neighbor.id === "victoria"
                ? g.done.includes("hello")
                  ? "Как обживаешься, дорогая?"
                  : "Так ты и есть наша новая соседка?"
                : "Привет, я " + neighbor.name + "!"}
            </h2>
            <p>
              {neighbor.id !== "victoria"
                ? neighbor.line
                : g.done.includes("unpack")
                  ? "Я вижу, дом уже стал твоим. Заглядывай на ужин — приготовим что-нибудь простое и очень вкусное."
                  : "Я Виктория. Добро пожаловать на Wisteria Lane! Не пытайся устроить идеальную жизнь за один день. Начни с одной коробки. И оставь место для красивого платья."}
            </p>
            <button
              className="dialog-choice"
              onClick={() => {
                g.meet(neighbor.id);
                if (neighbor.id === "victoria") g.finish("hello");
                ["unpack", "style", "reel"].forEach(g.accept);
                setDialog(false);
                notify(
                  neighbor.id === "victoria"
                    ? "Знакомство сохранено · миссии открыты"
                    : "Приятное знакомство! Первые задания — у Виктории",
                );
              }}
            >
              «Идеально не обещаю. Красиво — постараюсь!»{" "}
              <ChevronRight size={17} />
            </button>
            <button
              className="dialog-choice"
              onClick={() => {
                g.meet(neighbor.id);
                if (neighbor.id === "victoria") g.finish("hello");
                g.accept("unpack");
                setDialog(false);
                notify(
                  neighbor.id === "victoria"
                    ? "Виктория рада знакомству · награда сохранена"
                    : "Соседка рада знакомству",
                );
              }}
            >
              «Спасибо! Начну с малого.» <Heart size={16} />
            </button>
          </div>
        </div>
      )}
      {chosen && (
        <div className="overlay">
          <div className="modal">
            <button
              className="close"
              onClick={() => setDetail(null)}
              aria-label="Закрыть"
            >
              <X />
            </button>
            <span className="eyebrow">
              {chosen.category} · {chosen.minutes} МИНУТ
            </span>
            <h2>{chosen.title}</h2>
            <p>{chosen.description}</p>
            <div className="reward">
              ✧ {chosen.xp} XP · ◉ {chosen.coins} монет
            </div>
            {chosen.id === "hello" ? (
              <button
                className="primary"
                onClick={() => {
                  setDetail(null);
                  setTab("Мир");
                }}
              >
                Найти Викторию у фонтана
              </button>
            ) : (
              <>
                <p className="small">
                  Отмечай после действия в реальной жизни. Игра доверяет тебе.
                </p>
                <button className="primary" onClick={() => complete(chosen.id)}>
                  Я сделала это · получить награду
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {toast && (
        <div className="toast">
          <Check size={18} />
          {toast}
        </div>
      )}
      <div className="mobile-nav">
        {tabs.map(([name, Icon]) => (
          <button
            className={tab === name ? "active" : ""}
            onClick={() => setTab(name)}
            key={name}
          >
            <Icon size={20} />
            <small>{name}</small>
          </button>
        ))}
        <button className={tab === "Настройки" ? "active" : ""} onClick={() => setTab("Настройки")}><Settings size={20}/><small>Настройки</small></button>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div>WISTERIA · загружаем район…</div>}>
      {location.pathname === "/admin" ? <Admin /> : <App />}
    </Suspense>
  </React.StrictMode>,
);
if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("/sw.js"),
  );
