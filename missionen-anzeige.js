/* Eigenständige Anzeige der öffentlichen Clubmissionen, ohne Leitungs-Editor. */
(async () => {
  const board = document.getElementById('dh-missions-board');
  const message = document.getElementById('dh-missions-message');
  if (!board) return;
  const say = (s) => { if (message) message.textContent = s; };
  say('Missionen werden geladen …');
  try {
    // Verwende die veröffentlichte Supabase-Konfiguration direkt, statt auf
    // einen eventuell fehlenden oder zu spät initialisierten globalen Client zu vertrauen.
    const config = window.DIZZY_SUPABASE;
    if (!config?.url || !config?.key) throw new Error('Supabase-Konfiguration fehlt. Bitte supabase-config.js prüfen.');
    const response = await fetch(config.url.replace(/\/$/, '') + '/rest/v1/missionen?select=id,titel,mitglied,beschreibung,woche_vom,xp&order=woche_vom.desc', {
      headers: { apikey: config.key, Authorization: 'Bearer ' + config.key, Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error((body.message || response.statusText) + ' (HTTP ' + response.status + ')');
    }
    const missions = await response.json();
    board.replaceChildren();
    if (!Array.isArray(missions) || !missions.length) {
      say('');
      const p = document.createElement('p');
      p.textContent = 'Noch keine Missionen eingetragen.';
      board.append(p);
      return;
    }
    const weeks = new Map();
    for (const m of missions) {
      const key = m.woche_vom || 'Ohne Wochenangabe';
      if (!weeks.has(key)) weeks.set(key, []);
      weeks.get(key).push(m);
    }
    const date = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T12:00:00').toLocaleDateString('de-DE') : d;
    for (const [week, entries] of weeks) {
      const section = document.createElement('section');
      section.className = 'dh-mission-week';
      const heading = document.createElement('h3');
      heading.className = 'dh-mission-week-title';
      heading.textContent = 'Woche ab ' + date(week);
      section.append(heading);
      const grid = document.createElement('div');
      grid.className = 'dh-missions-grid';
      for (const m of entries) {
        const card = document.createElement('article');
        card.className = 'dh-mission-card';
        const title = document.createElement('h3'); title.textContent = m.titel || 'Mission';
        const meta = document.createElement('p'); meta.className = 'dh-mission-meta';
        meta.textContent = (m.mitglied || 'Alle Mitglieder') + (m.xp ? ' · ' + m.xp + ' XP' : '');
        const desc = document.createElement('p'); desc.className = 'dh-mission-description';
        desc.textContent = m.beschreibung || '';
        card.append(title, meta, desc); grid.append(card);
      }
      section.append(grid); board.append(section);
    }
    say('');
  } catch (error) {
    say('Missionen konnten nicht geladen werden: ' + error.message);
    console.error('Dizzy Hunters Missionen:', error);
  }
})();
