(()=>{
 const client=window.dizzyClient;
 const board=document.getElementById('dh-missions-board');
 const editor=document.getElementById('dh-missions-editor');
 const message=document.getElementById('dh-missions-message');
 if(!client||!board)return;
 const say=s=>{if(message)message.textContent=s};
 const dateString=d=>new Date(d+'T12:00:00').toLocaleDateString('de-DE');
 function missionCard(m,admin){
  const article=document.createElement('article');article.className='dh-mission-card';
  const title=document.createElement('h3');title.textContent=m.titel;
  const meta=document.createElement('p');meta.className='dh-mission-meta';meta.textContent=(m.mitglied||'Alle Mitglieder')+' · '+dateString(m.woche_vom)+(m.xp?' · '+m.xp+' XP':'');
  const desc=document.createElement('p');desc.className='dh-mission-description';desc.textContent=m.beschreibung;
  article.append(title,meta,desc);
  if(admin){const actions=document.createElement('div');actions.className='dh-admin-entry-actions';
   const edit=document.createElement('button');edit.className='dh-status-btn dh-status-angenommen';edit.textContent='Bearbeiten';edit.onclick=()=>{editor.elements.namedItem('mission_id').value=m.id;editor.elements.namedItem('titel').value=m.titel;editor.elements.namedItem('mitglied').value=m.mitglied||'';editor.elements.namedItem('beschreibung').value=m.beschreibung;editor.elements.namedItem('woche_vom').value=m.woche_vom;editor.elements.namedItem('xp').value=m.xp||0;editor.scrollIntoView({behavior:'smooth',block:'center'});};
   const del=document.createElement('button');del.className='dh-status-btn dh-status-delete';del.textContent='Löschen';del.onclick=async()=>{if(!confirm('Mission endgültig löschen?'))return;const {error}=await client.from('missionen').delete().eq('id',m.id);if(error)say('Löschen fehlgeschlagen: '+error.message);else await load()};actions.append(edit,del);article.append(actions)}return article;
 }
 async function load(){
  board.replaceChildren();const {data,error}=await client.from('missionen').select('id,titel,mitglied,beschreibung,woche_vom,xp').order('woche_vom',{ascending:false}).order('erstellt_am',{ascending:false});
  if(error){say('Missionen konnten nicht geladen werden: '+error.message);return}
  if(!data?.length){const p=document.createElement('p');p.textContent='Noch keine Missionen eingetragen.';board.append(p);return}
  const weeks=new Map();for(const m of data){if(!weeks.has(m.woche_vom))weeks.set(m.woche_vom,[]);weeks.get(m.woche_vom).push(m)}
  for(const [week,missions] of weeks){const section=document.createElement('section');section.className='dh-mission-week';const h=document.createElement('h3');h.className='dh-mission-week-title';h.textContent='Woche ab '+dateString(week);section.append(h);const cards=document.createElement('div');cards.className='dh-missions-grid';missions.forEach(m=>cards.append(missionCard(m,!!editor)));section.append(cards);board.append(section)}
 }
 if(editor){
  const reset=document.getElementById('dh-mission-reset');reset?.addEventListener('click',()=>{editor.reset();editor.elements.namedItem('mission_id').value=''});
  editor.addEventListener('submit',async e=>{e.preventDefault();const f=editor.elements;const record={titel:f.namedItem('titel').value.trim(),mitglied:f.namedItem('mitglied').value.trim()||null,beschreibung:f.namedItem('beschreibung').value.trim(),woche_vom:f.namedItem('woche_vom').value,xp:Number(f.namedItem('xp').value)||0};const id=f.namedItem('mission_id').value;
   if(!record.titel||!record.beschreibung||!record.woche_vom){say('Bitte Titel, Beschreibung und Woche ausfüllen.');return}
   const result=id?await client.from('missionen').update(record).eq('id',id):await client.from('missionen').insert(record);
   if(result.error){say('Speichern fehlgeschlagen: '+result.error.message);return}
   editor.reset();f.namedItem('mission_id').value='';say('Mission gespeichert.');await load();
  });
  // The existing leadership session must be authenticated and authorized by Supabase RLS.
  const panel=document.getElementById('dh-admin-panel');
  if(panel){const observer=new MutationObserver(()=>{const section=document.getElementById('dh-missions-admin');if(section)section.hidden=panel.hidden || document.querySelector('[data-tab="missionen"]')?.getAttribute('aria-pressed')!=='true';if(!panel.hidden)load()});observer.observe(panel,{attributes:true,attributeFilter:['hidden']});document.getElementById('dh-missions-admin').hidden=true;}
 }
 if(editor) load();
 else document.addEventListener('dizzy-member-authorized',load);
})();
