/* Einfacher Komfort-Zugang, KEINE Sicherheitsgrenze. Passwort-Hash ist öffentlich. */
(()=>{
 const form=document.getElementById('dh-member-login');
 const privateArea=document.getElementById('dh-member-private');
 const msg=document.getElementById('dh-member-login-message');
 const logout=document.getElementById('dh-member-logout');
 if(!form||!privateArea)return;
 // SHA-256 von DIZZY4EVER; jeder mit Zugriff auf die Website kann die Prüfung umgehen.
 const expected='32c3eb7b18c1b57a923853fcc7a67f8ff9c128d70037b27a304ca1ec9e039843';
 async function digest(value){const bytes=new TextEncoder().encode(value);const data=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(data)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 function show(){form.closest('section').hidden=true;privateArea.hidden=false;logout.hidden=false;document.dispatchEvent(new Event('dizzy-member-authorized'));}
 form.addEventListener('submit',async e=>{e.preventDefault();const password=form.elements.namedItem('password').value; if(await digest(password)===expected){sessionStorage.setItem('dizzyMemberOpen','1');show();}else{msg.textContent='Das Passwort ist leider falsch.';form.elements.namedItem('password').value='';}});
 logout.addEventListener('click',()=>{sessionStorage.removeItem('dizzyMemberOpen');location.reload();});
 if(sessionStorage.getItem('dizzyMemberOpen')==='1')show();
})();
