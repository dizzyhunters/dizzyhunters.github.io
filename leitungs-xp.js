(()=>{
 const panel=document.getElementById('dh-admin-panel'),form=document.getElementById('dh-xp-form'),select=document.getElementById('dh-xp-trainer'),msg=document.getElementById('dh-xp-message'),history=document.getElementById('dh-xp-history');
 if(!panel||!form||!window.dizzyClient)return;
 const client=window.dizzyClient;
 const url=window.DIZZY_SUPABASE?.url+'/functions/v1/trainer-xp-admin';
 async function call(action,extra={}){
  const {data:{session}}=await client.auth.getSession();if(!session)throw Error('Bitte als Leitung anmelden.');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':window.DIZZY_SUPABASE.key,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({action,...extra})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Fehler '+response.status);return result;
 }
 let trainers=[];
 async function load(){if(panel.hidden)return;msg.textContent='XP-Verwaltung wird geladen …';try{
  const result=await call('list');trainers=result.trainers||[];select.replaceChildren();
  for(const t of trainers){const option=document.createElement('option');option.value=t.id;option.textContent=t.sso_name;select.append(option)}
  history.replaceChildren();for(const b of result.bonuses||[]){const item=document.createElement('div');item.className='dh-xp-history-item';const label=document.createElement('span');label.textContent=`${trainers.find(t=>t.id===b.trainer_id)?.sso_name||'Trainer'} · +${b.xp} XP · ${b.grund} · ${new Date(b.created_at).toLocaleDateString('de-DE')}`;const remove=document.createElement('button');remove.type='button';remove.className='btn ghost';remove.textContent='Rückgängig';remove.addEventListener('click',async()=>{if(!confirm('Diese XP-Gutschrift wirklich rückgängig machen?'))return;try{await call('revoke',{id:b.id});await load()}catch(e){msg.textContent=e.message}});item.append(label,remove);history.append(item)}
  if(!result.bonuses?.length)history.textContent='Noch keine zusätzlichen XP vergeben.';
  msg.textContent= `${trainers.length} Trainerprofile gefunden.`;
 }catch(e){msg.textContent='XP konnten nicht geladen werden: '+e.message}}
 form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;try{await call('grant',{trainerId:select.value,xp:Number(form.elements.xp.value),grund:form.elements.grund.value});form.reset();await load();msg.textContent='XP erfolgreich gutgeschrieben.'}catch(e){msg.textContent='Speichern fehlgeschlagen: '+e.message}finally{button.disabled=false}});
 document.getElementById('dh-xp-refresh')?.addEventListener('click',load);
 new MutationObserver(()=>{if(!panel.hidden)load()}).observe(panel,{attributes:true,attributeFilter:['hidden']});if(!panel.hidden)load();
})();
