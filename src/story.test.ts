import { describe,it,expect } from "vitest";
import { storyBeats, nextStory, unlockedStories } from "./story";
describe("Story episodes",()=>{
it("starts with arrival",()=>{expect(nextStory([],[])?.id).toBe("arrival");});
it("gates episodes by real quest progression",()=>{expect(unlockedStories([]).map(x=>x.id)).toEqual(["arrival"]);expect(unlockedStories(["hello"]).some(x=>x.id==="wardrobe")).toBe(true);});
it("unique IDs",()=>expect(new Set(storyBeats.map(x=>x.id)).size).toBe(storyBeats.length));
});
