/* Footer buttons: search, heal, weapon, end of turn.
   The effect (act) is injected by main.js. */
import { actions } from '../rules/actions.js';

export function bindButtons(app, { act }){
  const click=(id,fn)=>document.getElementById(id).addEventListener('click',fn);
  click('btnSearch', ()=>act(app, actions(app.S).find(a=>a.type==='search')));
  click('btnHeal',   ()=>act(app, actions(app.S).find(a=>a.type==='heal')));
  click('btnCombine',()=>act(app, actions(app.S).find(a=>a.type==='combine')));
  click('btnWeapon', ()=>{
    const S = app.S;
    const order=['knife','pistol','shotgun'].filter(w=>w!=='shotgun'||S.bag.some(i=>i.id==='shotgun'));
    const next=order[(order.indexOf(S.player.weapon)+1)%order.length];
    act(app, actions(S).find(a=>a.type==='weapon'&&a.weapon===next));
  });
  click('btnEndTurn',()=>act(app, actions(app.S).find(a=>a.type==='end')));
}
