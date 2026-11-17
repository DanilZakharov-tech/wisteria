import { it, expect, vi } from "vitest";
it("сохраняет награду и восстанавливает её после перезагрузки хранилища", async () => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => values.set(k, v),
    removeItem: (k: string) => values.delete(k),
  });
  vi.stubGlobal("window", { localStorage });
  vi.resetModules();
  const { useGame } = await import("./game");
  useGame.getState().finish("hello");
  const saved = JSON.parse(values.get("wisteria-save-v1")!);
  expect(saved.state.xp).toBe(50);
  expect(saved.state.done).toContain("hello");
  useGame.setState({ xp: 999 }, false);
  values.set("wisteria-save-v1", JSON.stringify(saved));
  await useGame.persist.rehydrate();
  expect(useGame.getState().xp).toBe(50);
  expect(useGame.getState().coins).toBe(140);
  vi.unstubAllGlobals();
});
