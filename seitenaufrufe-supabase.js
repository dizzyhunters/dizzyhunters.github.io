/* Dizzy Hunters: Ein Startseitenaufruf = eine Erhoehung (auch bei Reload). */
(() => {
  const output = document.getElementById('dh-visit-number');
  if (!output) return;
  const url = 'https://grvvnzddvwobusaymljl.supabase.co/rest/v1/rpc/seitenaufruf_zaehlen';
  const key = 'sb_publishable_MMEmTYQLXYkUTPuTlReHdQ_vXTax1Q-';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': key },
    body: '{}',
    cache: 'no-store',
    keepalive: true
  })
    .then(async response => {
      if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + (await response.text()).slice(0, 200));
      return response.json();
    })
    .then(count => {
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Ungueltiger Zaehlerwert');
      output.textContent = new Intl.NumberFormat('de-DE').format(count);
    })
    .catch(error => {
      console.error('Dizzy Hunters Seitenaufrufe:', error);
      output.textContent = '–';
      output.title = 'Besucherzaehler derzeit nicht erreichbar';
    });
})();
