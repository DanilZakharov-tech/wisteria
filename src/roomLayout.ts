import {shop} from './campaignData';
import type {Save} from './campaign';
export const roomSlots=[
 {id:'table-left',name:'Левый столик',x:25,y:61,items:[0,1]},
 {id:'table-right',name:'Правый столик',x:81,y:61,items:[0,1]},
 {id:'console',name:'Консоль',x:55,y:50,items:[0,1]},
 {id:'wall-left',name:'Стена слева',x:29,y:32,items:[2,3]},
 {id:'wall-right',name:'Стена справа',x:84,y:30,items:[2,3]},
 {id:'floor-left',name:'Пол слева',x:15,y:70,items:[4]},
 {id:'floor-right',name:'Пол справа',x:92,y:68,items:[4]},
 {id:'sofa',name:'Диван',x:51,y:65,items:[5]}
];
export function resolveLayout(s:Pick<Save,'placed'|'placements'>){const layout:Record<string,string>={};for(const id of s.placed){const item=shop.find(x=>x.id===id&&x.type==='decor');if(!item)continue;const saved=s.placements?.[id];const valid=roomSlots.find(slot=>slot.id===saved&&slot.items.includes(item.index)&&!Object.values(layout).includes(slot.id));const fallback=roomSlots.find(slot=>slot.items.includes(item.index)&&!Object.values(layout).includes(slot.id));if(valid||fallback)layout[id]=(valid||fallback)!.id}return layout}
export function putDecoration(s:Save,id:string,slotId:string):Save{const item=shop.find(x=>x.id===id&&x.type==='decor'),slot=roomSlots.find(x=>x.id===slotId);if(!s.owned.includes(id)||!item||!slot||!slot.items.includes(item.index))return s;const layout=resolveLayout(s);if(Object.entries(layout).some(([other,location])=>other!==id&&location===slotId))return s;return {...s,placed:[...new Set([...s.placed,id])],placements:{...layout,[id]:slotId}}}
export function removeDecoration(s:Save,id:string):Save{if(!s.placed.includes(id))return s;const layout={...s.placements};delete layout[id];return {...s,placed:s.placed.filter(x=>x!==id),placements:layout}}
