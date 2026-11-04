(()=>{
 const panel=document.getElementById('dh-admin-panel'),form=document.getElementById('dh-xp-form'),select=document.getElementById('dh-xp-trainer'),msg=document.getElementById('dh-xp-message'),history=document.getElementById('dh-xp-history'),trainerList=document.getElementById('dh-xp-trainer-list');
 if(!panel||!msg||!trainerList)return;
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
   const result=await call('list');trainers=result.trainers||[];trainerList.replaceChildren();
   if(!trainers.length){

    trainerList.textContent='Keine Trainerprofile vorhanden. Mitglieder müssen auf der Missionsseite zuerst ein Trainerprofil mit SSO-Namen und PIN erstellen.';
   }
   for(const t of trainers){

    const item=document.createElement('div');item.className='dh-trainer-item';
    const label=document.createElement('span');label.textContent=t.sso_name+' · '+(Number(t.total_xp)||0)+' XP';
    const actions=document.createElement('div');actions.className='dh-trainer-actions';
    const rename=document.createElement('button');rename.type='button';rename.className='btn ghost';rename.textContent='Umbenennen';
    rename.addEventListener('click',async()=>{const name=prompt('Neuer SSO-Name für '+t.sso_name+':',t.sso_name);if(name===null||name.trim()===t.sso_name)return;try{await call('rename',{trainerId:t.id,ssoName:name.trim()});await load();msg.textContent='Trainername geändert.'}catch(e){msg.textContent='Umbenennen fehlgeschlagen: '+e.message}});
    const del=document.createElement('button');del.type='button';del.className='btn ghost';del.textContent='Löschen';
    del.addEventListener('click',async()=>{const answer=prompt('ACHTUNG: Profil, PIN, Missionserfolge und XP werden endgültig gelöscht. Zur Bestätigung den SSO-Namen exakt eingeben: '+t.sso_name);if(answer!==t.sso_name)return;try{await call('delete_trainer',{trainerId:t.id,confirmation:answer});await load();msg.textContent='Trainerprofil gelöscht.'}catch(e){msg.textContent='Löschen fehlgeschlagen: '+e.message}});
    actions.append(rename,del);item.append(label,actions);trainerList.append(item);
   }
   msg.textContent=trainers.length+' registrierte Trainerprofile gefunden.';
  }catch(e){msg.textContent='Trainer konnten nicht geladen werden: '+e.message;trainerList.textContent='Bitte zuerst den angezeigten Fehler beheben.'}
 }
 document.getElementById('dh-xp-refresh')?.addEventListener('click',load);
 new MutationObserver(()=>{if(!panel.hidden)load()}).observe(panel,{attributes:true,attributeFilter:['hidden']});if(!panel.hidden)load();
})();
