// Platinum roadmap for GTA VI: seven stages in the order to play them.
// Each stage names the trophies it covers by id, so the checklist stays the
// single source of truth for names, grades and guides.
export const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Play the story, and meditate in Chapter 1',
    text: 'Play Chapters 1 to 5 in order. The 12 story trophies pop as you go, and the 100% checklist only appears after the credits — but everything you do early already counts. One thing cannot wait: after the mission Down to Earth, look for Lucia at Jason’s house in the morning and meditate with her on the balcony. It is the only possibly missable step in the whole game.',
    trophyIds: [2, 3, 8, 4, 9, 10, 5, 11, 6, 12, 13, 7, 28],
  },
  {
    title: 'Stage 2 — Strangers and side quests',
    text: 'Work the stranger strands between story missions: Andy (5 missions, Lucia-only, from Chapter 3), Kenton (7 shipwreck dives), Billy (5 Thrillbilly Mudclub jobs), Randy (16 sports cars on his wish list), Tyrone (synthetic labs), Bret (15 hunting Target Decks), Moses (Scooter Bros), Yasmani (jewelry jobs) and Cal (fishing). Any 8 finished strands earn Strangers & Freaks.',
    trophyIds: [22, 23, 24, 25, 26, 27, 29, 20],
  },
  {
    title: 'Stage 3 — Robberies, the biggest grind',
    text: 'Clear all 39 gang operations, 22 bank jobs (unlocked after the Chapter 3 mission Credit Check), 7 payday loan jobs and 8 large-bank vaults (unlocked after the Chapter 4 optional mission That’s Where The Money Is...). Add 50 of 91 stick-ups and 34 of 35 Smash ’N’ Grabs, and fence $100,000 in narcotics, $100,000 in jewelry, $250,000 in marked bills and $200,000 in vehicles. Vaults pay up to about $205,000 each and always draw a 4-star wanted level.',
    trophyIds: [43, 40, 41, 39, 34, 52, 33],
  },
  {
    title: 'Stage 4 — Collectibles and scanning',
    text: 'Scan as you go: 100 WAiNK locations (31 Landmarks, 35 Curiosities, 23 Sculptures, 23 No Flusher Tags), 200 of 277 base-model vehicles, 100 of 255 animals studied through binoculars, 15 of 18 card sets, 15 of 18 meditations, all 33 underwater discoveries. The trophy targets are lower than the 100% targets for cards and meditations — but Positive Mental Attitude needs all 18 meditation spots.',
    trophyIds: [30, 31, 35, 42, 28],
  },
  {
    title: 'Stage 5 — Activities, races and stunts',
    text: 'Gold all 42 Shooting Range challenges (18 at Griffin, 24 at Rodgers Ranch), win a Top Fun drone race at all 14 locations, win 20 different races, try all 9 activity types, finish 50 of 80 challenges, and land 250 of 397 stunts (300 for 100%). Pick the quick challenges first and leave the long grinds for last.',
    trophyIds: [15, 16, 17, 18, 19, 21, 32, 36, 46, 51, 44, 45],
  },
  {
    title: 'Stage 6 — Money and properties',
    text: 'Launder $250,000 in marked bills through your contacts, spend $100,000 across all shops, buy all 8 garages through the Vice City Real Estate app (about $160,000 total, after the Chapter 2 mission Daily Driver), and register 10 vehicles to the Scooter Bros app. Criminal-profile actions add up on their own — 500 earns Actions Speak Louder — but never push toward the Irredeemable profile: it is permanent.',
    trophyIds: [52, 53, 54, 55, 48],
  },
  {
    title: 'Stage 7 — Clean up, 100%, Platinum',
    text: 'Open the 100% checklist (Progress, then Stats, then 100% Completion) and finish its 35 requirements. A Long Road is the gold for reaching 100% — and the moment it pops, the Platinum, Vice Got a Price!, follows. Mop up the odd unconfirmed trophies last: the Ocean Beach cocktail, the showroom smash-out, the second-try moment, the strange sighting and the melee drive-by.',
    trophyIds: [14, 1, 37, 38, 49, 50],
  },
];

// Render the roadmap stages into a container. `trophies` is the loaded list,
// `earned` a Set of earned trophy ids, `onSelect` opens a trophy's guide.
export function renderRoadmap(container, trophies, earned, onSelect) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    li.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const ul = document.createElement('ul');
    for (const id of stage.trophyIds) {
      const t = byId.get(id);
      if (!t) continue;
      const item = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = (earned.has(t.id) ? '✓ ' : '') + t.name + ' · ' + t.grade;
      if (earned.has(t.id)) b.classList.add('done');
      b.addEventListener('click', () => onSelect(t.id));
      item.append(b);
      ul.append(item);
    }
    li.append(h, p, ul);
    container.append(li);
  }
}
