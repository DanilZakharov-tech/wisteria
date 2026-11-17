import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useGame, quests } from "./game";
const env = (import.meta as unknown as { env: Record<string, string> }).env;
export const cloud =
  env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
    ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
    : null;
export function CloudPanel() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  async function sync() {
    if (!cloud) return;
    const {
      data: { user },
    } = await cloud.auth.getUser();
    if (!user) throw Error("Сначала войди по ссылке из письма.");
    const { data, error } = await cloud
      .from("player_saves")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    const local = useGame.getState();
    if (data) {
      const { error: conflict } = await cloud
        .from("player_saves")
        .update({
          payload: { ...local },
          revision: data.revision + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("revision", data.revision)
        .select()
        .single();
      if (conflict)
        throw Error(
          "Сохранение изменилось на другом устройстве. Повтори синхронизацию.",
        );
      setMessage(
        "Локальная копия сохранена в облаке. Скачай резервную копию перед переносом.",
      );
    } else {
      const { error } = await cloud
        .from("player_saves")
        .insert({ user_id: user.id, payload: { ...local } });
      if (error) throw error;
      setMessage("Первая облачная копия сохранена.");
    }
  }
  async function restore() {
    if (!cloud) return;
    const {
      data: { user },
    } = await cloud.auth.getUser();
    if (!user) throw Error("Сначала войди.");
    const { data, error } = await cloud
      .from("player_saves")
      .select("payload")
      .eq("user_id", user.id)
      .single();
    if (error) throw error;
    const p = data.payload;
    if (
      !p ||
      !Array.isArray(p.done) ||
      typeof p.xp !== "number" ||
      typeof p.coins !== "number"
    )
      throw Error("Неизвестный формат сохранения");
    useGame.setState({
      xp: p.xp,
      coins: p.coins,
      done: p.done,
      accepted: p.accepted || [],
      friendship: p.friendship || 0,
      met: p.met || [],
      outfit: p.outfit || "#79334c",
      decor: !!p.decor,
      quality: p.quality || "Среднее",
      metrics: p.metrics || [],
      started: p.started || new Date().toISOString(),
    });
    setMessage("Облачная копия восстановлена.");
  }
  return (
    <div className="cloud-panel">
      <h3>Облачное сохранение · Supabase</h3>
      {cloud ? (
        <>
          <p>
            Синхронизация по запросу: загрузка и восстановление отдельно, чтобы
            случайно не затереть прогресс другого устройства.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const { error } = await cloud!.auth.signInWithOtp({
                  email,
                  options: { emailRedirectTo: location.origin },
                });
                if (error) throw error;
                setMessage("Ссылка для входа отправлена на почту.");
              });
            }}
          >
            <input
              required
              type="email"
              placeholder="Твоя почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="primary" disabled={busy}>
              Войти по ссылке
            </button>
          </form>
          <div className="cloud-actions">
            <button
              className="primary"
              disabled={busy}
              onClick={() => run(sync)}
            >
              Сохранить в облако
            </button>
            <button
              className="dialog-choice"
              disabled={busy}
              onClick={() => run(restore)}
            >
              Восстановить из облака
            </button>
            <button
              className="text-button"
              onClick={() =>
                run(async () => {
                  await cloud!.auth.signOut();
                  setMessage("Вы вышли из аккаунта");
                })
              }
            >
              Выйти
            </button>
          </div>
          <p>{message}</p>
        </>
      ) : (
        <p>
          Не подключено. Укажи VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY при
          сборке и выполни миграцию из supabase/schema.sql.
        </p>
      )}
    </div>
  );
}
export function Admin() {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState("");
  const [text, setText] = useState(JSON.stringify(quests, null, 2));
  async function check() {
    if (!cloud) {
      setMessage("Supabase не настроен. Административные операции недоступны.");
      return;
    }
    const {
      data: { user },
    } = await cloud.auth.getUser();
    setAllowed(user?.app_metadata?.role === "admin");
    setChecked(true);
  }
  async function save() {
    try {
      const parsed = JSON.parse(text);
      if (
        !Array.isArray(parsed) ||
        parsed.some(
          (q) =>
            typeof q.id !== "string" ||
            typeof q.title !== "string" ||
            typeof q.description !== "string" ||
            !Number.isInteger(q.xp) ||
            q.xp < 0 ||
            q.xp > 10000,
        )
      )
        throw Error("Проверь ID, название, описание и XP (0–10000).");
      const { error } = await cloud!
        .from("game_config")
        .upsert({ id: "quests", payload: parsed });
      if (error) throw error;
      setMessage(
        "Конфигурация сохранена. Игровые клиенты загрузят её при следующем запуске.",
      );
    } catch (e) {
      setMessage(String(e));
    }
  }
  return (
    <main style={{ margin: "auto", maxWidth: 800, width: "100%", padding: 30 }}>
      <h1>WISTERIA · администрирование</h1>
      <p>Доступ проверяется JWT и серверными RLS-политиками.</p>
      <CloudPanel />
      <button className="primary" onClick={check}>
        Проверить роль администратора
      </button>
      {checked && !allowed && (
        <p>Доступ запрещён: необходима серверная роль admin.</p>
      )}
      {allowed && (
        <>
          <label>
            Конфигурация заданий
            <textarea
              rows={20}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <button className="primary" onClick={save}>
            Сохранить конфигурацию
          </button>
        </>
      )}
      <p>{message}</p>
      <a href="/">Вернуться в игру</a>
    </main>
  );
}
export async function loadQuestConfig() {
  if (!cloud) return;
  const { data, error } = await cloud
    .from("game_config")
    .select("payload")
    .eq("id", "quests")
    .maybeSingle();
  if (error) throw error;
  if (!data) return;
  const list = data.payload;
  if (
    !Array.isArray(list) ||
    list.length === 0 ||
    list.some(
      (q) =>
        typeof q.id !== "string" ||
        typeof q.title !== "string" ||
        typeof q.description !== "string" ||
        typeof q.category !== "string" ||
        !Number.isFinite(q.xp) ||
        q.xp < 0 ||
        !Number.isFinite(q.coins) ||
        q.coins < 0 ||
        !Number.isFinite(q.minutes),
    )
  )
    throw Error("Некорректная конфигурация заданий");
  quests.splice(0, quests.length, ...list);
}
