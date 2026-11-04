(()=>{
 const panel=document.getElementById('dh-admin-panel'),form=document.getElementById('dh-xp-form'),select=document.getElementById('dh-xp-trainer'),msg=document.getElementById('dh-xp-message'),history=document.getElementById('dh-xp-history'),trainerList=document.getElementById('dh-xp-trainer-list');
 if(!panel||!form||!select||!msg||!history)return;
 const client=window.dizzyClient,url=window.DIZZY_SUPABASE?.url+'/functions/v1/xp-admin';
 if(!client||!window.DIZZY_SUPABASE?.url){msg.textContent='Supabase-Verbindung fehlt. Bitte supabase-config.js und supabase-client.js prüfen.';return;}
 async function call(action,extra={}){
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError||!session)throw Error('Keine Supabase-Leitungssitzung erkannt. Bitte Leitungsanmeldung prüfen.');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':window.DIZZY_SUPABASE.key,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({action,...extra})});
  let result;try{result=await response.json()}catch{throw Error('Edge Function antwortet nicht mit JSON (HTTP '+response.status+'). Bitte Deployment prüfen.')}
  if(!response.ok)throw Error(result.error||'HTTP '+response.status);return result;
 }
 let trainers=[];
 async function load(){
  if(panel.hidden)return;
  msg.textContent='Trainerprofile werden geladen …';
  try{
   const result=await call('list');trainers=result.trainers||[];select.replaceChildren();history.replaceChildren();
   if(!trainers.length){
    const option=document.createElement('option');option.value='';option.textContent='Noch keine registrierten Trainer';select.append(option);
    
   }
   for(const t of trainers){
    const option=document.createElement('option');option.value=t.id;option.textContent=t.sso_name;select.append(option);

   }
   for(const b of result.bonuses||[]){const item=document.createElement('div');item.className='dh-xp-history-item';const label=document.createElement('span');label.textContent=`${trainers.find(t=>t.id===b.trainer_id)?.sso_name||'Trainer'} · +${b.xp} XP · ${b.grund} · ${new Date(b.created_at).toLocaleDateString('de-DE')}`;const remove=document.createElement('button');remove.type='button';remove.className='btn ghost';remove.textContent='Rückgängig';remove.addEventListener('click',async()=>{if(!confirm('Diese XP-Gutschrift wirklich rückgängig machen?'))return;try{await call('revoke',{id:b.id});await load()}catch(e){msg.textContent=e.message}});item.append(label,remove);history.append(item)}
   if(!result.bonuses?.length)history.textContent='Noch keine zusätzlichen XP vergeben.';
   msg.textContent=trainers.length+' registrierte Trainerprofile gefunden.';
  }catch(e){msg.textContent='Trainer konnten nicht geladen werden: '+e.message;select.replaceChildren();}
 }
 form.addEventListener('submit',async e=>{e.preventDefault();if(!select.value){msg.textContent='Bitte zuerst ein Trainerprofil registrieren.';return}const button=form.querySelector('[type=submit]');button.disabled=true;try{await call('grant',{trainerId:select.value,xp:Number(form.elements.xp.value),grund:form.elements.grund.value});form.reset();await load();msg.textContent='XP erfolgreich gutgeschrieben.'}catch(e){msg.textContent='Speichern fehlgeschlagen: '+e.message}finally{button.disabled=false}});
 document.getElementById('dh-xp-refresh')?.addEventListener('click',load);
 new MutationObserver(()=>{if(!panel.hidden)load()}).observe(panel,{attributes:true,attributeFilter:['hidden']});if(!panel.hidden)load();
})();
