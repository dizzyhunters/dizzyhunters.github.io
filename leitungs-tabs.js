(()=>{
 const tabs=[...document.querySelectorAll('.dh-section-tab')];
 const admin=document.getElementById('dh-admin-panel');
 const missions=document.getElementById('dh-missions-admin');
 const applications=document.getElementById('dh-admin-board');
 if(!tabs.length||!admin||!missions||!applications)return;
 function show(which){
   tabs.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===which)));
   applications.hidden=which!=='bewerbungen';
   missions.hidden=admin.hidden||which!=='missionen';
 }
 tabs.forEach(b=>b.addEventListener('click',()=>show(b.dataset.tab)));
 new MutationObserver(()=>show(document.querySelector('.dh-section-tab[aria-pressed="true"]')?.dataset.tab||'bewerbungen')).observe(admin,{attributes:true,attributeFilter:['hidden']});
 show('bewerbungen');
})();
