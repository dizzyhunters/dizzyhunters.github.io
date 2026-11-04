(()=>{
const client=window.dizzyClient;
const login=document.getElementById('dh-admin-login'),panel=document.getElementById('dh-admin-panel'),msg=document.getElementById('dh-admin-msg');
const statuses=[['offen','Noch nicht bearbeitet'],['angenommen','Angenommen'],['abgelehnt','Abgelehnt']];
let refreshing=false;
function notice(text){msg.textContent=text}
function button(label,kind,action){const b=document.createElement('button');b.type='button';b.className='dh-status-btn dh-status-'+kind;b.textContent=label;b.addEventListener('click',action);return b}
async function refresh(){if(refreshing)return;refreshing=true;
try{
const {data:{user},error:authError}=await client.auth.getUser();
if(authError||!user){login.hidden=false;panel.hidden=true;return}
const {data:permission,error:perr}=await client.from('leitung').select('user_id').eq('user_id',user.id).maybeSingle();
if(perr||!permission){login.hidden=false;panel.hidden=true;notice('Dieser Account ist nicht als Leitung freigeschaltet.');return}
login.hidden=true;panel.hidden=false;
const {data,error}=await client.from('bewerbungen').select('id,anzeigename,antworten,status,erstellt_am').order('erstellt_am',{ascending:false});
if(error){notice('Bewerbungen konnten nicht geladen werden: '+error.message);return}
for(const [status] of statuses){const el=document.querySelector('[data-items="'+status+'"]');el.replaceChildren();const entries=(data||[]).filter(x=>x.status===status);document.querySelector('[data-count="'+status+'"]').textContent=String(entries.length);if(!entries.length){const empty=document.createElement('p');empty.className='dh-admin-empty';empty.textContent='Keine Bewerbungen in diesem Bereich.';el.append(empty)}}
for(const entry of data||[]){const group=document.querySelector('[data-items="'+entry.status+'"]');if(!group)continue;
const card=document.createElement('article');card.className='dh-admin-entry';
const h=document.createElement('h4');h.textContent=entry.antworten?.sso||entry.anzeigename;
const sub=document.createElement('p');sub.className='dh-admin-sub';sub.textContent='Rufname: '+entry.anzeigename+' · Eingegangen: '+new Date(entry.erstellt_am).toLocaleString('de-DE');
const details=document.createElement('details');details.className='dh-admin-details';const summary=document.createElement('summary');summary.textContent='Bewerbung ansehen';const dl=document.createElement('dl');dl.className='dh-admin-answers';for(const [key,value] of Object.entries(entry.antworten||{})){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=String(value??'');dl.append(dt,dd)}details.append(summary,dl);
const actions=document.createElement('div');actions.className='dh-admin-entry-actions';
async function changeStatus(status){actions.querySelectorAll('button').forEach(b=>b.disabled=true);const {error}=await client.from('bewerbungen').update({status}).eq('id',entry.id);if(error){notice('Status konnte nicht gespeichert werden: '+error.message);actions.querySelectorAll('button').forEach(b=>b.disabled=false)}else{notice('Bewerbungsstatus gespeichert.');await refreshAfterChange()}}
for(const [status,label] of statuses){if(status!==entry.status)actions.append(button(status==='offen'?'Auf offen setzen':label,status,()=>changeStatus(status)))}
actions.append(button('Löschen','delete',async()=>{if(!confirm('Bewerbung von '+(entry.antworten?.sso||entry.anzeigename)+' endgültig löschen?'))return;actions.querySelectorAll('button').forEach(b=>b.disabled=true);const {error}=await client.from('bewerbungen').delete().eq('id',entry.id);if(error){notice('Löschen fehlgeschlagen: '+error.message);actions.querySelectorAll('button').forEach(b=>b.disabled=false)}else{notice('Bewerbung gelöscht.');await refreshAfterChange()}}));
card.append(h,sub,details,actions);group.append(card)
}
}catch(e){notice('Fehler beim Laden: '+e.message)}finally{refreshing=false}}
async function refreshAfterChange(){refreshing=false;await refresh()}
document.getElementById('dh-admin-form').addEventListener('submit',async e=>{e.preventDefault();const email=window.DIZZY_LEITUNG_EMAIL,password=document.getElementById('dh-admin-password').value;if(!email||email==='LEITUNGS_EMAIL_HIER_EINTRAGEN'){notice('Leitungs-E-Mail ist noch nicht in leitungs-login-config.js eingerichtet.');return}notice('Anmeldung läuft …');const {error}=await client.auth.signInWithPassword({email,password});document.getElementById('dh-admin-password').value='';if(error){notice('Anmeldung fehlgeschlagen: '+error.message);return}notice('');await refresh()});
document.getElementById('dh-admin-logout').addEventListener('click',async()=>{await client.auth.signOut();refresh()});document.getElementById('dh-admin-reload').addEventListener('click',refresh);refresh();
})();
