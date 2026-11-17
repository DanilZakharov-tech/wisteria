import {it,expect} from 'vitest';
import {seasonTasks} from './Season';
import {reward} from './game';
it('offers three tasks per day for thirty days with unique reward IDs',()=>{expect(seasonTasks).toHaveLength(90);expect(new Set(seasonTasks.map(t=>t.id)).size).toBe(90);});
it('awards real progression once per daily mission',()=>{const initial={done:[],xp:0,coins:0};const result=reward(initial,seasonTasks[0].id);expect(result.xp).toBe(100);expect(reward(result,seasonTasks[0].id)).toBe(result);});
