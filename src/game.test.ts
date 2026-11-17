import { describe, it, expect } from "vitest";
import { reward, quests, level } from "./game";
describe("Награды и сюжет", () => {
  it("не выдаёт награду дважды", () => {
    const a = reward({ done: [], xp: 0, coins: 0 }, "hello");
    expect(a.xp).toBe(50);
    expect(reward(a, "hello")).toBe(a);
  });
  it("блокирует награды до открытия задания", () => {
    const a = { done: [], xp: 0, coins: 0 };
    expect(reward(a, "dinner")).toBe(a);
    expect(reward(a, "missing")).toBe(a);
  });
  it("проходит первую главу без подписчиков", () => {
    let s = { done: [] as string[], xp: 0, coins: 120 };
    for (const id of ["hello", "unpack", "dinner"]) s = reward(s, id);
    expect(s.done).toContain("dinner");
    expect(s.xp).toBe(270);
    expect(s.coins).toBe(230);
  });
  it("содержит более 100 доступных по цепочке заданий", () => {
    expect(quests.length).toBeGreaterThan(100);
    expect(new Set(quests.map((q) => q.id)).size).toBe(quests.length);
    quests.forEach((q) => {
      if (q.requires)
        expect(quests.some((p) => p.id === q.requires)).toBe(true);
    });
  });
  it("ограничивает прогрессию сотым уровнем", () => {
    expect(level(0)).toBe(1);
    expect(level(200)).toBe(2);
    expect(level(999999)).toBe(100);
  });
});
