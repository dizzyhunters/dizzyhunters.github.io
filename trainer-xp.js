(()=>{
const cfg=window.DIZZY_SUPABASE, status=document.getElementById('xp-status'), gate=document.getElementById('xp-login'), privateArea=document.getElementById('xp-private');
if(!cfg?.url||!cfg?.key){status.textContent='Supabase-Konfiguration fehlt.';return;}
const endpoint=cfg.url.replace(/\/$/,'')+'/functions/v1/trainer-xp';
let token=sessionStorage.getItem('dizzyTrainerToken')||'',mode='login',busy=false;
const say=s=>status.textContent=s;
async function call(action,params={}){const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.key},body:JSON.stringify({action,...params})});let data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||'HTTP '+res.status);return data;}
const rankSteps=[{name:'Newbie',xp:0},{name:'Rookie',xp:150},{name:'Pokétrainer',xp:300},{name:'Pokémeister',xp:1000},{name:'Arenaleiter',xp:1500}];
function renderRankProgress(rawXp){
 const xp=Math.max(0,Number(rawXp)||0);
 let panel=document.getElementById('xp-rank-progress');
 if(!panel){panel=document.createElement('section');panel.id='xp-rank-progress';panel.className='xp-rank-progress';panel.setAttribute('aria-label','Fortschritt zum nächsten Rang');document.getElementById('xp-rank').insertAdjacentElement('afterend',panel);}
 const current=[...rankSteps].reverse().find(r=>xp>=r.xp)||rankSteps[0];
 const next=rankSteps.find(r=>r.xp>xp);
 panel.replaceChildren();
 const heading=document.createElement('div');heading.className='xp-progress-heading';
 const label=document.createElement('strong');label.textContent=next?`Nächster Rang: ${next.name}`:'Höchster XP-Rang erreicht!';
 const count=document.createElement('span');count.textContent=next?`${xp} / ${next.xp} XP`:`${xp} XP`;
 heading.append(label,count);panel.append(heading);
 const track=document.createElement('div');track.className='xp-progress-track';track.setAttribute('role','progressbar');
 const pct=next?Math.min(100,Math.max(0,(xp-current.xp)/(next.xp-current.xp)*100)):100;
 track.setAttribute('aria-valuemin',String(current.xp));track.setAttribute('aria-valuemax',String(next?.xp??Math.max(xp,1500)));track.setAttribute('aria-valuenow',String(xp));
 track.setAttribute('aria-label',next?`Fortschritt zu ${next.name}`:'Höchster XP-Rang erreicht');
 const fill=document.createElement('div');fill.className='xp-progress-fill';fill.style.width=pct+'%';track.append(fill);panel.append(track);
 const detail=document.createElement('small');detail.textContent=next?`Noch ${next.xp-xp} XP bis ${next.name} · ${Math.round(pct)} % dieser Rangstufe geschafft`:'Du hast alle XP-Ränge freigeschaltet. Weiter so!';panel.append(detail);
}
function renderBoard(data){document.getElementById('xp-trainer').textContent=data.name;document.getElementById('xp-total').textContent=data.xp+' XP';document.getElementById('xp-rank').textContent='Rang: '+data.rank;renderRankProgress(data.xp);const board=document.getElementById('dh-missions-board');board.replaceChildren();if(!data.missions.length){board.textContent='Noch keine Missionen für dich vorhanden.';return;}const done=new Set(data.completed);for(const m of data.missions){const card=document.createElement('article');card.className='dh-mission-card xp-card';const label=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.checked=done.has(m.id);const heading=document.createElement('strong');heading.textContent=' '+m.titel+' · '+m.xp+' XP';label.append(cb,heading);const desc=document.createElement('p');desc.textContent=m.beschreibung||'';const week=document.createElement('small');week.textContent='Woche ab '+(m.woche_vom||'–');card.append(label,desc,week);cb.addEventListener('change',async()=>{const wanted=cb.checked;cb.disabled=true;try{await call('toggle',{token,missionId:m.id,done:wanted});await loadState();}catch(e){cb.checked=!wanted;say(e.message);}finally{cb.disabled=false;}});board.append(card);}}
function renderLeaderboard(rows){const root=document.getElementById('xp-leaderboard');root.replaceChildren();if(!rows.length){root.textContent='Noch keine Trainer registriert.';return;}const table=document.createElement('table');table.className='xp-table';const thead=document.createElement('thead'),head=document.createElement('tr');for(const x of ['Platz','Trainer','XP','Rang']){const th=document.createElement('th');th.textContent=x;head.append(th);}thead.append(head);table.append(thead);const tbody=document.createElement('tbody');rows.forEach((x,i)=>{const tr=document.createElement('tr');[String(i+1),x.name,String(x.xp),x.rank].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});tbody.append(tr)});table.append(tbody);root.append(table);}
async function loadState(){if(!token)return;const data=await call('state',{token});gate.hidden=true;privateArea.hidden=false;renderBoard(data);renderLeaderboard(data.leaderboard);say('');}
async function refreshLeaderboard(){try{const data=await call('leaderboard');renderLeaderboard(data.leaderboard);}catch(e){document.getElementById('xp-leaderboard').textContent=e.message;}}
function choose(next){mode=next;document.getElementById('xp-submit').textContent=next==='register'?'Trainerprofil erstellen':'Anmelden';document.getElementById('xp-pin').setAttribute('autocomplete',next==='register'?'new-password':'current-password');say('');}
document.getElementById('xp-show-login').addEventListener('click',()=>choose('login'));
document.getElementById('xp-show-register').addEventListener('click',()=>choose('register'));
document.getElementById('xp-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;const btn=document.getElementById('xp-submit');btn.disabled=true;say('Bitte warten …');try{const data=await call(mode,{name:document.getElementById('xp-name').value,pin:document.getElementById('xp-pin').value});token=data.token;sessionStorage.setItem('dizzyTrainerToken',token);document.getElementById('xp-pin').value='';await loadState();}catch(err){say(err.message);}finally{busy=false;btn.disabled=false;}});
document.getElementById('xp-logout').addEventListener('click',async()=>{try{await call('logout',{token});}catch{}token='';sessionStorage.removeItem('dizzyTrainerToken');privateArea.hidden=true;gate.hidden=false;say('Abgemeldet.');});
(async()=>{await refreshLeaderboard();if(token)try{await loadState();}catch{token='';sessionStorage.removeItem('dizzyTrainerToken');gate.hidden=false;privateArea.hidden=true;}setInterval(async()=>{if(!document.hidden){if(token)try{await loadState();}catch{}else await refreshLeaderboard();}},30000);})();
})();
