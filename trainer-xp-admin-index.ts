import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const url=Deno.env.get('SUPABASE_URL')!;
const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anon=Deno.env.get('SUPABASE_ANON_KEY')!;
const db=createClient(url,service,{auth:{persistSession:false}});
const headers={'Access-Control-Allow-Origin':'https://dizzyhunters.github.io','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
  const jwt=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  if(!jwt)return reply({error:'Bitte als Leitung anmelden.'},401);
  const authClient=createClient(url,anon,{auth:{persistSession:false}});
  const {data:{user},error:ue}=await authClient.auth.getUser(jwt);
  if(ue||!user)return reply({error:'Anmeldung ungültig.'},401);
  const {data:leader,error:le}=await db.from('leitung').select('user_id').eq('user_id',user.id).maybeSingle();
  if(le||!leader)return reply({error:'Nur die Leitung darf XP verwalten.'},403);
  const body=await req.json();
  if(body.action==='list'){
   const [a,b,c,d]=await Promise.all([
    db.from('dizzy_trainer').select('id,sso_name').order('sso_name'),
    db.from('dizzy_xp_bonus').select('id,trainer_id,xp,grund,created_at').order('created_at',{ascending:false}).limit(100),
    db.from('dizzy_xp_bonus').select('trainer_id,xp'),
    db.from('dizzy_mission_completions').select('trainer_id,mission_id,missionen(xp)')
   ]);
   if(a.error||b.error||c.error||d.error)throw a.error||b.error||c.error||d.error;
   const totals=new Map<string,number>();
   for(const row of c.data||[])totals.set(row.trainer_id,(totals.get(row.trainer_id)||0)+Number(row.xp||0));
   for(const row of d.data||[]){const m=row.missionen as unknown as {xp:number}|null;totals.set(row.trainer_id,(totals.get(row.trainer_id)||0)+Number(m?.xp||0));}
   return reply({trainers:(a.data||[]).map(t=>({...t,total_xp:totals.get(t.id)||0})),bonuses:b.data});
  }
  if(body.action==='rename'){
   const id=String(body.trainerId||''),ssoName=String(body.ssoName||'').trim();
   if(!/^[0-9a-f-]{36}$/i.test(id)||ssoName.length<2||ssoName.length>80)return reply({error:'Gültigen Trainernamen (2–80 Zeichen) angeben.'},400);
   const {data,error}=await db.from('dizzy_trainer').update({sso_name:ssoName}).eq('id',id).select('id').maybeSingle();
   if(error?.code==='23505')return reply({error:'Dieser SSO-Name ist bereits registriert.'},409);
   if(error)throw error;if(!data)return reply({error:'Trainer nicht gefunden.'},404);
   return reply({ok:true});
  }
  if(body.action==='delete_trainer'){
   const id=String(body.trainerId||''),confirmation=String(body.confirmation||'');
   if(!/^[0-9a-f-]{36}$/i.test(id))return reply({error:'Ungültiges Profil.'},400);
   const {data:trainer,error:findError}=await db.from('dizzy_trainer').select('sso_name').eq('id',id).maybeSingle();
   if(findError)throw findError;if(!trainer)return reply({error:'Trainer nicht gefunden.'},404);
   if(confirmation!==trainer.sso_name)return reply({error:'Bestätigung stimmt nicht überein.'},400);
   const {error}=await db.from('dizzy_trainer').delete().eq('id',id);if(error)throw error;
   return reply({ok:true});
  }
  if(body.action==='grant'){
   const id=String(body.trainerId||'');const xp=Number(body.xp);const grund=String(body.grund||'').trim();
   if(!/^[0-9a-f-]{36}$/i.test(id)||!Number.isInteger(xp)||xp<1||xp>1000||grund.length<3||grund.length>160)return reply({error:'Trainer, Grund und 1–1000 XP angeben.'},400);
   const {data:trainer}=await db.from('dizzy_trainer').select('id').eq('id',id).maybeSingle();if(!trainer)return reply({error:'Trainer nicht gefunden.'},404);
   const {error}=await db.from('dizzy_xp_bonus').insert({trainer_id:id,xp,grund,awarded_by:user.id});if(error)throw error;
   return reply({ok:true});
  }
  if(body.action==='revoke'){
   const id=String(body.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))return reply({error:'Ungültige Buchung.'},400);
   const {error}=await db.from('dizzy_xp_bonus').delete().eq('id',id);if(error)throw error;
   return reply({ok:true});
  }
  return reply({error:'Unbekannte Aktion.'},400);
 }catch(e){console.error(e);return reply({error:'Serverfehler – bitte Function Logs prüfen.'},500);}
});
