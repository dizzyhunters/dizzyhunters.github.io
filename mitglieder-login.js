(()=>{
 const client=window.dizzyClient,form=document.getElementById('dh-member-login'),gate=document.getElementById('dh-member-gate'),privateArea=document.getElementById('dh-member-private'),msg=document.getElementById('dh-member-login-message'),logout=document.getElementById('dh-member-logout');
 if(!form||!client)return;
 const say=t=>{msg.textContent=t||''};
 const show=ok=>{gate.hidden=ok;privateArea.hidden=!ok;logout.hidden=!ok};
 async function verify(){
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user){show(false);return}
  const {data, error:roleError}=await client.from('club_mitglieder').select('user_id').eq('user_id',user.id).maybeSingle();
  if(roleError||!data){show(false);say('Dieser Account ist noch nicht für den Mitgliederbereich freigeschaltet.');return}
  show(true);say('');document.dispatchEvent(new Event('dizzy-member-authorized'));
 }
 form.addEventListener('submit',async e=>{e.preventDefault();say('Anmeldung wird geprüft …');const email=form.elements.namedItem('email').value.trim(),password=form.elements.namedItem('password').value;const {error}=await client.auth.signInWithPassword({email,password});form.elements.namedItem('password').value='';if(error){say('Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.');return}await verify()});
 logout.addEventListener('click',async()=>{await client.auth.signOut();show(false);document.getElementById('dh-missions-board')?.replaceChildren();say('Du bist abgemeldet.')});
 show(false);verify();
})();
