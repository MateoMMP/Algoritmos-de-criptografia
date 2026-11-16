import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Theme='light'|'dark';
interface AppState {theme:Theme; completed:string[]; sidebar:boolean; theory:boolean; setTheme:(v:Theme)=>void; toggleCompleted:(id:string)=>void; setSidebar:(v:boolean)=>void; setTheory:(v:boolean)=>void; clear:()=>void}
export const useAppStore=create<AppState>()(persist((set)=>({theme:'light',completed:[],sidebar:false,theory:true,setTheme:(theme)=>set({theme}),toggleCompleted:(id)=>set(s=>({completed:s.completed.includes(id)?s.completed.filter(x=>x!==id):[...s.completed,id]})),setSidebar:(sidebar)=>set({sidebar}),setTheory:(theory)=>set({theory}),clear:()=>set({completed:[],theme:'light',sidebar:false})}),{name:'cryptolab-state',partialize:s=>({theme:s.theme,completed:s.completed})}));
