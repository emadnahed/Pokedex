import { useState, useEffect, useCallback, useRef } from "react";

/*
  ╔══════════════════════════════════════════════════════╗
  ║  POKÉDEX — Original Design Identity                  ║
  ║  Direction: Warm editorial × premium field guide     ║
  ║  Fonts: Bricolage Grotesque (display) + Nunito (UI)  ║
  ║  Palette: Warm charcoal #1C1410 base, cream cards    ║
  ║  Layout: Spotlight card + filter chips + 2-col grid  ║
  ╚══════════════════════════════════════════════════════╝
*/

/* ── FONTS ───────────────────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Nunito:wght@400;500;600;700;800;900&display=swap');
`;

/* ── TYPE DATA ────────────────────────────────────────── */
const T = {
  fire:     { c: "#E8622A", bg: "#2E1508", soft: "#F5A06A", label: "Fire"     },
  water:    { c: "#3B8FD4", bg: "#081E30", soft: "#82C0EE", label: "Water"    },
  grass:    { c: "#3BAD5C", bg: "#0A2214", soft: "#7DD69A", label: "Grass"    },
  electric: { c: "#DDB321", bg: "#2A2004", soft: "#F5D76E", label: "Electric" },
  psychic:  { c: "#D4517A", bg: "#28091A", soft: "#EE92B0", label: "Psychic"  },
  ice:      { c: "#3AAFC0", bg: "#05202A", soft: "#7DD8E6", label: "Ice"      },
  dragon:   { c: "#6B5DD6", bg: "#130F2E", soft: "#A89AEE", label: "Dragon"   },
  dark:     { c: "#705090", bg: "#120A1C", soft: "#AA88C8", label: "Dark"     },
  fairy:    { c: "#CC6699", bg: "#280F1F", soft: "#EEB0CC", label: "Fairy"    },
  fighting: { c: "#CC5533", bg: "#280A05", soft: "#E89A7A", label: "Fighting" },
  poison:   { c: "#9944BB", bg: "#1C0828", soft: "#CC88DD", label: "Poison"   },
  ground:   { c: "#BB8833", bg: "#221608", soft: "#DDBB77", label: "Ground"   },
  rock:     { c: "#997755", bg: "#1A1008", soft: "#BBA088", label: "Rock"     },
  ghost:    { c: "#6655AA", bg: "#100E22", soft: "#AA99CC", label: "Ghost"    },
  bug:      { c: "#669922", bg: "#101C04", soft: "#99CC55", label: "Bug"      },
  steel:    { c: "#7788AA", bg: "#101622", soft: "#AABBCC", label: "Steel"    },
  flying:   { c: "#5577CC", bg: "#0A1030", soft: "#88AAEE", label: "Flying"   },
  normal:   { c: "#888870", bg: "#181810", soft: "#BBBBAA", label: "Normal"   },
};

const STATS = {
  hp:               { l: "HP",     c: "#E05555" },
  attack:           { l: "ATK",    c: "#E08830" },
  defense:          { l: "DEF",    c: "#4499DD" },
  "special-attack": { l: "Sp.A",   c: "#9944CC" },
  "special-defense":{ l: "Sp.D",   c: "#33AA66" },
  speed:            { l: "SPD",    c: "#CC4477" },
};

const gt  = ts  => ts?.[0]?.type?.name || "normal";
const gm  = n   => T[n] || T.normal;
const pad = n   => String(n).padStart(3, "0");
const gsp = p   => p?.sprites?.other?.["official-artwork"]?.front_default || p?.sprites?.front_default;

/* ── POKÉMON SETS ────────────────────────────────────── */
const SPOTLIGHT_IDS = [6,25,149,130,376,248,384,445,637,197,445,282];
const POPULAR_IDS   = [1,4,7,25,52,54,63,66,79,92,94,104,116,131,143,147,152,155,158,175,177,196,197,198,202,223,228,231,246,252,255,258,280,302,303,316,318,333,349,351,359,363,387,390,393,408,425,427,431,433,436,447,479,495,498,501,509,519,527,546,557,559,562,570,572,580,582,585,590,592,595,597,599,605,607,610,613,616,619,621,624,627,629,631,633,636,638,641,645,648,661,669,674,677,679,686,690,692,696,700,702,704,707,710,712,714,716,719,722,725,728,734,741,744,747,751,755,757,759,761,764,766,769,771,774,778,781,785,789,793,796,800];

const cache = {};
async function gp(id) {
  if (cache[id]) return cache[id];
  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const d = await r.json();
  cache[id] = d;
  return d;
}

/* ── STYLES ──────────────────────────────────────────── */
const CSS = `
${FONTS}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #1C1410;
  --bg2:      #231A14;
  --bg3:      #2C211A;
  --card:     #2A1F18;
  --border:   rgba(255,255,255,0.07);
  --text:     #F0EBE3;
  --text2:    rgba(240,235,227,0.55);
  --text3:    rgba(240,235,227,0.28);
  --radius:   18px;
  --radius-sm:10px;
}

body, #root {
  font-family: 'Nunito', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow: hidden;
}

.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #120E0A;
}

/* PHONE SHELL */
.phone {
  width: 393px;
  height: 852px;
  background: var(--bg);
  border-radius: 50px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 0 0 1px rgba(255,220,180,0.06),
    0 0 0 8px rgba(255,220,180,0.018),
    0 48px 120px rgba(0,0,0,0.92);
}

/* NOTCH */
.notch {
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 34px;
  background: #0A0704;
  border-radius: 0 0 22px 22px;
  z-index: 999;
}

/* SCREEN SLIDE */
.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.42s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease;
  background: var(--bg);
}
.screen.gone-left  { transform: translateX(-100%); opacity: 0; pointer-events: none; }
.screen.gone-right { transform: translateX(110%);  opacity: 0; pointer-events: none; }
.screen.here       { transform: translateX(0);      opacity: 1; }

/* STATUS BAR */
.status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 38px 26px 0;
  font-family: 'Nunito', sans-serif;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--text3);
  flex-shrink: 0;
  letter-spacing: 0.2px;
}
.status-right { display: flex; align-items: center; gap: 5px; }
.batt {
  width: 20px; height: 10px;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 2.5px;
  padding: 1.5px 2px;
  display: flex; align-items: center;
}
.batt-fill { width: 65%; height: 100%; background: rgba(255,255,255,0.45); border-radius: 1px; }


/* ══════════════════════════════════════════
   HOME SCREEN
══════════════════════════════════════════ */

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 22px 14px;
  flex-shrink: 0;
}
.wordmark {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.5px;
  line-height: 1;
}
.wordmark em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(240,235,227,0.4);
}
.hdr-right { display: flex; gap: 8px; }
.icon-pill {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text2);
  transition: all 0.18s;
}
.icon-pill:hover { background: var(--bg3); color: var(--text); }

.home-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  padding: 0 0 90px;
}
.home-body::-webkit-scrollbar { display: none; }

/* SPOTLIGHT CARD */
.spotlight-wrap {
  padding: 0 16px 20px;
}
.spotlight {
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  height: 250px;
  cursor: pointer;
  transition: transform 0.22s ease;
}
.spotlight:hover { transform: scale(1.01); }
.spotlight:active { transform: scale(0.99); }

.spotlight-bg {
  position: absolute;
  inset: 0;
  transition: background 0.6s ease;
}
.spotlight-texture {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 40%);
}
.spotlight-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 50%, transparent 100%);
}
.spotlight-sprite {
  position: absolute;
  right: -8px;
  bottom: -8px;
  height: 210px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(0,0,0,0.55));
  transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1);
}
.spotlight:hover .spotlight-sprite { transform: scale(1.05) translateY(-5px); }

.spotlight-info {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  padding: 22px 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 2;
  max-width: 210px;
}
.sp-top {}
.sp-eyebrow {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin-bottom: 6px;
}
.sp-name {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 38px;
  font-weight: 800;
  line-height: 0.9;
  color: #fff;
  text-transform: capitalize;
  letter-spacing: -1px;
  margin-bottom: 12px;
}
.sp-type-row { display: flex; gap: 6px; margin-bottom: 0; }
.sp-type {
  padding: 4px 11px;
  border-radius: 6px;
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
  letter-spacing: 0.4px;
  backdrop-filter: blur(6px);
}
.sp-bottom { display: flex; align-items: center; gap: 8px; }
.sp-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 8px;
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  font-weight: 800;
  background: rgba(255,255,255,0.92);
  color: #1C1410;
  border: none;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: background 0.18s;
}
.sp-cta:hover { background: #fff; }

.sp-dots { display: flex; gap: 4px; }
.sp-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  cursor: pointer;
  transition: all 0.3s;
}
.sp-dot.lit { background: rgba(255,255,255,0.8); width: 14px; border-radius: 3px; }

/* FILTER CHIPS */
.chips-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 0 16px 16px;
  scrollbar-width: none;
}
.chips-row::-webkit-scrollbar { display: none; }
.chip {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.18s;
  white-space: nowrap;
  letter-spacing: 0.2px;
}
.chip.off {
  background: var(--card);
  border-color: var(--border);
  color: var(--text3);
}
.chip.off:hover { color: var(--text2); border-color: rgba(255,255,255,0.14); }
.chip.on { border-color: transparent; }

/* SECTION HEADING */
.sec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 6px 20px 12px;
}
.sec-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.4px;
}
.sec-count {
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--text3);
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 16px;
}

.gcard {
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  background: var(--card);
  border: 1px solid var(--border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}
.gcard:hover { transform: translateY(-4px); }
.gcard:active { transform: scale(0.97); }

.gcard-img {
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.gcard-img-bg { position: absolute; inset: 0; transition: background 0.3s; }
.gcard-circle {
  position: absolute;
  right: -18px; bottom: -18px;
  width: 90px; height: 90px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.gcard-sprite {
  width: 80px; height: 80px;
  object-fit: contain;
  position: relative; z-index: 1;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.45));
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.gcard:hover .gcard-sprite { transform: scale(1.1) translateY(-3px); }

.gcard-body { padding: 10px 12px 12px; }
.gcard-num {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: var(--text3);
  margin-bottom: 2px;
}
.gcard-name {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  text-transform: capitalize;
  letter-spacing: -0.3px;
  line-height: 1.1;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gcard-types { display: flex; gap: 5px; flex-wrap: wrap; }
.mini-type {
  padding: 2.5px 8px;
  border-radius: 5px;
  font-family: 'Nunito', sans-serif;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}

.skeleton {
  border-radius: var(--radius);
  background: var(--card);
  border: 1px solid var(--border);
  height: 190px;
  overflow: hidden;
  position: relative;
}
.skeleton::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: sk 1.8s ease infinite;
}
@keyframes sk { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* SEARCH */
.search-sheet {
  position: absolute; inset: 0;
  background: var(--bg);
  z-index: 200;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}
.search-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 14px;
  flex-shrink: 0;
}
.s-box {
  flex: 1;
  position: relative;
}
.s-input {
  width: 100%;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px 12px 42px;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}
.s-input:focus { border-color: rgba(255,255,255,0.2); }
.s-input::placeholder { color: var(--text3); }
.s-icon-pos { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); }
.s-cancel {
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: var(--text2);
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.18s;
}
.s-cancel:hover { color: var(--text); }
.s-results { flex: 1; overflow-y: auto; scrollbar-width: none; }
.s-results::-webkit-scrollbar { display: none; }
.s-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.14s;
  border-radius: 0;
}
.s-row:hover { background: var(--card); }
.s-thumb {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative; overflow: hidden;
}
.s-thumb-bg { position: absolute; inset: 0; }
.s-thumb-img { width: 42px; height: 42px; object-fit: contain; position: relative; z-index: 1; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.4)); }
.s-info { flex: 1; min-width: 0; }
.s-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); text-transform: capitalize; letter-spacing: -0.3px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-sub { font-size: 12px; font-weight: 600; color: var(--text3); display: flex; gap: 5px; align-items: center; }
.s-hint { padding: 20px 16px; font-size: 13px; font-weight: 600; color: var(--text3); }
.s-empty { text-align: center; padding: 60px 20px; font-size: 14px; font-weight: 700; color: var(--text3); }


/* ══════════════════════════════════════════
   DETAIL SCREEN
══════════════════════════════════════════ */

.d-scroll { flex: 1; overflow-y: auto; scrollbar-width: none; }
.d-scroll::-webkit-scrollbar { display: none; }

.d-hero {
  position: relative;
  height: 310px;
  flex-shrink: 0;
  overflow: hidden;
}
.d-hero-bg { position: absolute; inset: 0; transition: background 0.4s; }
.d-hero-pattern {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(circle at 10% 90%, rgba(255,255,255,0.04) 0%, transparent 45%),
    radial-gradient(circle at 90% 10%, rgba(255,255,255,0.025) 0%, transparent 35%);
}
.d-hero-fade {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(28,20,16,0.2) 0%, transparent 40%, rgba(28,20,16,0.65) 75%, var(--bg) 100%);
}
.d-topbar {
  position: absolute;
  top: 48px; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  z-index: 3;
}
.d-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.85);
  transition: all 0.18s;
}
.d-btn:hover { background: rgba(0,0,0,0.5); color: #fff; }
.d-btn.lit { background: rgba(229,56,59,0.55); color: #fff; }

.d-sprite {
  position: absolute;
  right: 10px; bottom: 20px;
  width: 165px; height: 165px;
  object-fit: contain;
  z-index: 2;
  filter: drop-shadow(0 16px 32px rgba(0,0,0,0.55));
  animation: pf 3.8s ease-in-out infinite;
}
@keyframes pf { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-13px); } }

.d-hero-text {
  position: absolute;
  bottom: 22px; left: 20px;
  z-index: 3;
}
.d-n-tag {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 4px;
}
.d-pname {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 46px;
  font-weight: 800;
  line-height: 0.87;
  color: #fff;
  text-transform: capitalize;
  letter-spacing: -1.5px;
  margin-bottom: 13px;
}
.d-types-row { display: flex; gap: 6px; }
.d-type-pill {
  padding: 5px 14px;
  border-radius: 7px;
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-weight: 800;
  text-transform: capitalize;
  letter-spacing: 0.5px;
}

/* DETAIL BODY */
.d-body { background: var(--bg); padding-bottom: 110px; }

.d-desc {
  padding: 18px 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text2);
  line-height: 1.65;
  border-bottom: 1px solid var(--border);
}

/* VITALS ROW */
.vitals {
  display: flex;
  padding: 16px 20px;
  gap: 0;
  border-bottom: 1px solid var(--border);
}
.vital {
  flex: 1;
  text-align: center;
  position: relative;
}
.vital + .vital::before {
  content: '';
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 1px; background: var(--border);
}
.vital-val {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}
.vital-key {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text3);
}

/* TABS */
.d-tabs {
  display: flex;
  padding: 16px 20px 0;
  gap: 4px;
  border-bottom: 1px solid var(--border);
}
.d-tab {
  padding: 9px 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 12.5px;
  font-weight: 800;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  border: none;
  background: none;
  transition: all 0.2s;
  letter-spacing: 0.3px;
}

/* STATS */
.stats-wrap { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.stat-row { display: flex; align-items: center; gap: 12px; }
.s-lbl { font-family: 'Nunito', sans-serif; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text3); width: 48px; flex-shrink: 0; }
.s-num { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); width: 34px; text-align: right; flex-shrink: 0; letter-spacing: -0.5px; }
.s-track { flex: 1; height: 5px; background: rgba(255,255,255,0.07); border-radius: 99px; overflow: hidden; }
.s-fill { height: 100%; border-radius: 99px; transition: width 1.1s cubic-bezier(0.16,1,0.3,1); }

/* ABILITIES */
.ab-wrap { padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
.ab-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.ab-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 15px; font-weight: 600; color: var(--text); text-transform: capitalize; letter-spacing: -0.3px; }
.ab-tag { font-size: 9.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; padding: 3px 8px; border-radius: 5px; background: rgba(255,255,255,0.05); color: var(--text3); }

/* EVO BANNER */
.evo-banner {
  margin: 4px 20px 20px;
  padding: 16px 18px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border: none;
  width: calc(100% - 40px);
  transition: opacity 0.2s;
  position: relative;
  overflow: hidden;
}
.evo-banner:hover { opacity: 0.82; }
.evo-banner-bg { position: absolute; inset: 0; }
.evo-banner-body { position: relative; z-index: 1; }
.evo-banner-label { font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; opacity: 0.55; margin-bottom: 4px; }
.evo-banner-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }


/* ══════════════════════════════════════════
   EVOLUTION SCREEN
══════════════════════════════════════════ */

.evo-header {
  padding: 10px 20px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid var(--border);
}
.evo-back {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text2);
  flex-shrink: 0;
  transition: all 0.18s;
}
.evo-back:hover { background: var(--bg3); color: var(--text); }
.evo-header-text {}
.evo-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 21px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
.evo-subtitle { font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 600; color: var(--text3); text-transform: capitalize; margin-top: 2px; }

.evo-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 24px 20px 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.evo-body::-webkit-scrollbar { display: none; }

.evo-stage { width: 100%; }
.evo-stage-label {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 8px;
  padding-left: 2px;
}

.evo-ec {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.22s;
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-bottom: 8px;
}
.evo-ec:hover { background: var(--bg3); transform: translateX(5px); }
.evo-ec:active { transform: scale(0.98); }
.evo-ec.is-me {
  background: var(--bg3);
  border-color: rgba(255,255,255,0.14);
}
.evo-ec-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 1px;
}
.evo-ec-img {
  width: 66px; height: 66px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; position: relative;
}
.evo-ec-imgbg { position: absolute; inset: 0; }
.evo-ec-sprite {
  width: 55px; height: 55px;
  object-fit: contain;
  position: relative; z-index: 1;
  filter: drop-shadow(0 3px 7px rgba(0,0,0,0.45));
  transition: transform 0.3s;
}
.evo-ec:hover .evo-ec-sprite { transform: scale(1.1); }
.evo-ec-info { flex: 1; min-width: 0; }
.evo-ec-num { font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--text3); margin-bottom: 2px; }
.evo-ec-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 19px; font-weight: 700; color: var(--text); text-transform: capitalize; letter-spacing: -0.5px; margin-bottom: 7px; line-height: 1; }
.evo-ec-types { display: flex; gap: 5px; }
.evo-etype { padding: 3px 9px; border-radius: 5px; font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 800; text-transform: capitalize; }
.evo-me-badge { font-family: 'Nunito', sans-serif; font-size: 9px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 9px; border-radius: 6px; flex-shrink: 0; }

.evo-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 6px 0 10px;
  width: 100%;
}
.evo-conn-line { width: 1.5px; height: 14px; background: var(--border); }
.evo-conn-tag {
  font-family: 'Nunito', sans-serif;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text3);
  background: var(--card);
  border: 1px solid var(--border);
  padding: 4px 12px;
  border-radius: 20px;
  margin: 4px 0;
}

/* BOTTOM NAV */
.bnav {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: rgba(22,16,12,0.97);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,220,180,0.06);
  display: flex;
  padding: 8px 0 24px;
  z-index: 100;
}
.bnav-item {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center;
  gap: 5px; padding: 7px 0;
  cursor: pointer;
  border: none; background: none;
  color: var(--text3);
  transition: color 0.18s;
}
.bnav-item.on { color: var(--text); }
.bnav-item:hover:not(.on) { color: var(--text2); }
.bnav-label { font-family: 'Nunito', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 0.3px; }
.bnav-dot { width: 4px; height: 4px; border-radius: 2px; background: var(--text); margin-top: -2px; }

/* ANIMATIONS */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fu { animation: fadeUp 0.32s ease forwards; }
.fu2 { animation: fadeUp 0.32s 0.08s ease both; }
.fu3 { animation: fadeUp 0.32s 0.14s ease both; }
`;

/* ── STATUS BAR ──────────────────────────────────────── */
function SBar() {
  const [t, setT] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setT(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="status">
      <span>{t}</span>
      <div className="status-right">
        <svg width="14" height="11" viewBox="0 0 24 18" fill="rgba(240,235,227,0.35)">
          <rect x="0"  y="9"  width="5" height="9"  rx="1.5"/>
          <rect x="7"  y="6"  width="5" height="12" rx="1.5"/>
          <rect x="14" y="3"  width="5" height="15" rx="1.5"/>
          <rect x="21" y="0"  width="3" height="18" rx="1.5"/>
        </svg>
        <div className="batt"><div className="batt-fill" /></div>
      </div>
    </div>
  );
}

/* ── GRID CARD ────────────────────────────────────────── */
function GCard({ pokemon, onClick }) {
  const tn = gt(pokemon.types);
  const m  = gm(tn);
  const sp = gsp(pokemon);
  return (
    <div className="gcard fu" onClick={() => onClick(pokemon)}>
      <div className="gcard-img">
        <div className="gcard-img-bg" style={{ background: `linear-gradient(135deg, ${m.c}22 0%, ${m.c}0d 100%)` }} />
        <div className="gcard-circle" />
        {sp && <img src={sp} className="gcard-sprite" alt={pokemon.name} loading="lazy" />}
      </div>
      <div className="gcard-body">
        <div className="gcard-num">#{pad(pokemon.id)}</div>
        <div className="gcard-name">{pokemon.name}</div>
        <div className="gcard-types">
          {pokemon.types.map(t => {
            const tm = gm(t.type.name);
            return (
              <span key={t.type.name} className="mini-type"
                style={{ background: `${tm.c}22`, color: tm.soft }}>
                {t.type.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── HOME SCREEN ──────────────────────────────────────── */
const ALL_TYPES = ["fire","water","grass","electric","psychic","ice","dragon","dark","fairy","fighting","poison","ground","rock","ghost","bug","steel","flying","normal"];

function HomeScreen({ visible, onSelect }) {
  const [spots,  setSpots]  = useState([]);
  const [si,     setSi]     = useState(0);
  const [grid,   setGrid]   = useState([]);
  const [filter, setFilter] = useState(null);
  const [showS,  setShowS]  = useState(false);
  const [sq,     setSq]     = useState("");
  const [sRes,   setSRes]   = useState([]);
  const [all,    setAll]    = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    Promise.all(SPOTLIGHT_IDS.slice(0, 8).map(gp)).then(setSpots);
    Promise.all(POPULAR_IDS.slice(0, 40).map(gp)).then(setGrid);
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
      .then(r => r.json())
      .then(d => Promise.all(d.results.map((_, i) => gp(i + 1))))
      .then(setAll);
  }, [visible]);

  useEffect(() => {
    if (spots.length < 2) return;
    timerRef.current = setInterval(() => setSi(i => (i + 1) % spots.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [spots.length]);

  useEffect(() => {
    if (!sq.trim()) { setSRes([]); return; }
    const q = sq.toLowerCase();
    setSRes(all.filter(p => p.name.includes(q) || String(p.id).includes(q)).slice(0, 18));
  }, [sq, all]);

  const hero = spots[si];
  const hm   = hero ? gm(gt(hero.types)) : gm("normal");

  const shown = filter
    ? grid.filter(p => p.types.some(t => t.type.name === filter))
    : grid;

  return (
    <div className={`screen ${visible ? "here" : "gone-left"}`}>
      <SBar />
      <div className="home-header">
        <div className="wordmark">pokéd<em>ex</em></div>
        <div className="hdr-right">
          <div className="icon-pill" onClick={() => setShowS(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div className="icon-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="home-body">
        {/* SPOTLIGHT */}
        <div className="spotlight-wrap">
          <div className="spotlight" onClick={() => hero && onSelect(hero)}>
            <div className="spotlight-bg"
              style={{ background: `radial-gradient(ellipse at 80% 30%, ${hm.c}45 0%, ${hm.c}18 50%, ${hm.bg} 100%)` }}
            />
            <div className="spotlight-texture" />
            <div className="spotlight-fade" />
            {hero && gsp(hero) && (
              <img key={hero.id} src={gsp(hero)} className="spotlight-sprite" alt={hero.name} />
            )}
            {hero && (
              <div className="spotlight-info">
                <div className="sp-top">
                  <div className="sp-eyebrow" style={{ color: hm.soft }}>Featured Pokémon</div>
                  <div className="sp-name">{hero.name}</div>
                  <div className="sp-type-row">
                    {hero.types.map(t => {
                      const tm = gm(t.type.name);
                      return (
                        <span key={t.type.name} className="sp-type"
                          style={{ background: `${tm.c}30`, color: tm.soft }}>
                          {t.type.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="sp-bottom">
                  <button className="sp-cta" onClick={e => { e.stopPropagation(); onSelect(hero); }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                    Explore
                  </button>
                  <div className="sp-dots">
                    {spots.slice(0, 5).map((_, i) => (
                      <div key={i} className={`sp-dot ${i === si % 5 ? "lit" : ""}`}
                        onClick={e => { e.stopPropagation(); setSi(i); }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!hero && (
              <div style={{ position: "absolute", inset: 0, background: "var(--card)" }} className="skeleton" />
            )}
          </div>
        </div>

        {/* TYPE FILTER CHIPS */}
        <div className="chips-row">
          <div className={`chip ${filter === null ? "on" : "off"}`}
            style={filter === null ? { background: "rgba(240,235,227,0.12)", color: "var(--text)", borderColor: "rgba(240,235,227,0.2)" } : {}}
            onClick={() => setFilter(null)}>
            All
          </div>
          {ALL_TYPES.map(tn => {
            const m = gm(tn);
            const on = filter === tn;
            return (
              <div key={tn} className={`chip ${on ? "on" : "off"}`}
                style={on ? { background: `${m.c}28`, color: m.soft, borderColor: `${m.c}55` } : {}}
                onClick={() => setFilter(filter === tn ? null : tn)}>
                {m.label}
              </div>
            );
          })}
        </div>

        {/* GRID */}
        <div className="sec-head">
          <div className="sec-title">
            {filter ? `${gm(filter).label} Types` : "All Pokémon"}
          </div>
          <div className="sec-count">{shown.length} shown</div>
        </div>
        <div className="grid">
          {grid.length === 0
            ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton" />)
            : shown.map(p => <GCard key={p.id} pokemon={p} onClick={onSelect} />)
          }
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      {showS && (
        <div className="search-sheet fu">
          <div className="search-bar-row">
            <div className="s-box">
              <svg className="s-icon-pos" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input autoFocus className="s-input" placeholder="Search by name or number…"
                value={sq} onChange={e => setSq(e.target.value)} />
            </div>
            <div className="s-cancel" onClick={() => { setShowS(false); setSq(""); }}>Cancel</div>
          </div>
          <div className="s-results">
            {!sq && <div className="s-hint">Type to search all Pokémon</div>}
            {sq && sRes.length === 0 && <div className="s-empty">Nothing found for "{sq}"</div>}
            {sRes.map(p => {
              const m = gm(gt(p.types));
              return (
                <div key={p.id} className="s-row"
                  onClick={() => { setShowS(false); setSq(""); onSelect(p); }}>
                  <div className="s-thumb">
                    <div className="s-thumb-bg" style={{ background: `${m.c}22` }} />
                    {gsp(p) && <img src={gsp(p)} className="s-thumb-img" alt={p.name} />}
                  </div>
                  <div className="s-info">
                    <div className="s-name">{p.name}</div>
                    <div className="s-sub">
                      <span style={{ color: m.soft }}>#{pad(p.id)}</span>
                      <span>·</span>
                      <span style={{ textTransform: "capitalize" }}>
                        {p.types.map(t => t.type.name).join(", ")}
                      </span>
                    </div>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(240,235,227,0.2)" strokeWidth="2.5">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DETAIL SCREEN ────────────────────────────────────── */
function DetailScreen({ visible, slide, pokemon, onBack, onEvo }) {
  const [tab,     setTab]     = useState("stats");
  const [animSt,  setAnimSt]  = useState(false);
  const [species, setSpecies] = useState(null);
  const [fav,     setFav]     = useState(false);

  useEffect(() => {
    if (!pokemon || !visible) return;
    setTab("stats"); setAnimSt(false); setSpecies(null); setFav(false);
    const t = setTimeout(() => setAnimSt(true), 380);
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
      .then(r => r.json()).then(setSpecies);
    return () => clearTimeout(t);
  }, [pokemon?.id, visible]);

  if (!pokemon) return null;

  const tn     = gt(pokemon.types);
  const m      = gm(tn);
  const sp     = gsp(pokemon);
  const flavor = species?.flavor_text_entries
    ?.find(f => f.language.name === "en")
    ?.flavor_text?.replace(/\f/g, " ");
  const genus  = species?.genera?.find(g => g.language.name === "en")?.genus || "";

  return (
    <div className={`screen ${visible ? "here" : slide === "left" ? "gone-left" : "gone-right"}`}>
      <SBar />
      <div className="d-hero">
        <div className="d-hero-bg"
          style={{ background: `radial-gradient(ellipse at 65% 35%, ${m.c}44 0%, ${m.c}18 55%, ${m.bg} 100%)` }} />
        <div className="d-hero-pattern" />
        <div className="d-hero-fade" />
        <div className="d-topbar">
          <button className="d-btn" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button className={`d-btn ${fav ? "lit" : ""}`} onClick={() => setFav(f => !f)}>
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        {sp && <img src={sp} className="d-sprite" alt={pokemon.name} />}
        <div className="d-hero-text">
          <div className="d-n-tag">#{pad(pokemon.id)}</div>
          <div className="d-pname">{pokemon.name}</div>
          <div className="d-types-row">
            {pokemon.types.map(t => {
              const tm = gm(t.type.name);
              return (
                <span key={t.type.name} className="d-type-pill"
                  style={{ background: `${tm.c}30`, color: tm.soft }}>
                  {t.type.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="d-scroll">
        <div className="d-body">
          {flavor && <div className="d-desc fu">{flavor}</div>}

          <div className="vitals fu2">
            {[
              { v: `${(pokemon.height / 10).toFixed(1)}m`, k: "Height" },
              { v: `${(pokemon.weight / 10).toFixed(1)}kg`, k: "Weight" },
              { v: pokemon.base_experience ?? "—", k: "Base EXP" },
              { v: genus.split(" ")[0] || "—", k: "Category" },
            ].map(({ v, k }) => (
              <div key={k} className="vital">
                <div className="vital-val">{v}</div>
                <div className="vital-key">{k}</div>
              </div>
            ))}
          </div>

          <div className="d-tabs">
            {["stats", "abilities"].map(t => (
              <button key={t} className="d-tab"
                style={{
                  color: tab === t ? m.soft : "var(--text3)",
                  background: tab === t ? `${m.c}18` : "none",
                  borderBottom: tab === t ? `2px solid ${m.c}` : "2px solid transparent",
                }}
                onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === "stats" && (
            <div className="stats-wrap fu">
              {pokemon.stats.map(s => {
                const sm = STATS[s.stat.name] || { l: s.stat.name, c: "#888" };
                const pct = Math.min((s.base_stat / 255) * 100, 100);
                return (
                  <div key={s.stat.name} className="stat-row">
                    <div className="s-lbl">{sm.l}</div>
                    <div className="s-num">{s.base_stat}</div>
                    <div className="s-track">
                      <div className="s-fill"
                        style={{ width: animSt ? `${pct}%` : "0%", background: sm.c }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "abilities" && (
            <div className="ab-wrap fu">
              {pokemon.abilities.map(a => (
                <div key={a.ability.name} className="ab-card">
                  <div className="ab-name">{a.ability.name.replace(/-/g, " ")}</div>
                  {a.is_hidden && <span className="ab-tag">Hidden</span>}
                </div>
              ))}
            </div>
          )}

          {species?.evolution_chain && (
            <button className="evo-banner" onClick={onEvo}>
              <div className="evo-banner-bg"
                style={{ background: `linear-gradient(135deg, ${m.c}22 0%, ${m.c}0e 100%)` }} />
              <div className="evo-banner-body">
                <div className="evo-banner-label" style={{ color: m.soft }}>Evolutionary Line</div>
                <div className="evo-banner-title">See Full Chain →</div>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={m.soft} strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── EVOLUTION SCREEN ─────────────────────────────────── */
function EvoScreen({ visible, slide, pokemon, onBack, onSelect }) {
  const [stages,  setStages]  = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pokemon || !visible) return;
    setStages([]); setDetails({}); setLoading(true);
    async function run() {
      try {
        const spec = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
          .then(r => r.json());
        const evo  = await fetch(spec.evolution_chain.url).then(r => r.json());
        const flat = [];
        function walk(node, idx = 0) {
          flat.push({ name: node.species.name, stage: idx, trigger: node.evolution_details });
          node.evolves_to.forEach(n => walk(n, idx + 1));
        }
        walk(evo.chain);
        setStages(flat);
        const dm = {};
        await Promise.all(flat.map(async s => { dm[s.name] = await gp(s.name); }));
        setDetails(dm);
      } catch(e) {}
      setLoading(false);
    }
    run();
  }, [pokemon?.id, visible]);

  if (!pokemon) return null;

  const grouped = {};
  stages.forEach(s => { if (!grouped[s.stage]) grouped[s.stage] = []; grouped[s.stage].push(s); });
  const keys = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const LABELS = ["Base Form", "First Evolution", "Final Form", "Alternate Form"];

  const getTrigger = (trigs) => {
    if (!trigs?.length) return null;
    const d = trigs[0];
    if (d.min_level) return `Level ${d.min_level}`;
    if (d.item) return d.item.name.replace(/-/g, " ");
    const name = d.trigger?.name;
    if (name === "level-up") return "Level up";
    if (name === "trade")    return "Trade";
    if (name === "use-item") return "Use item";
    return name?.replace(/-/g, " ") || "Evolve";
  };

  return (
    <div className={`screen ${visible ? "here" : slide === "left" ? "gone-left" : "gone-right"}`}>
      <SBar />
      <div className="evo-header">
        <button className="evo-back" onClick={onBack}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="evo-header-text">
          <div className="evo-title">Evolution Chain</div>
          <div className="evo-subtitle">{pokemon.name}</div>
        </div>
      </div>

      <div className="evo-body">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: "100%", height: 94, borderRadius: 16, marginBottom: 8 }} />
        ))}

        {!loading && keys.map((stg, si) => {
          const mons = grouped[stg];
          return (
            <div key={stg} className="evo-stage">
              {si > 0 && (
                <div className="evo-connector">
                  <div className="evo-conn-line" />
                  {mons[0]?.trigger?.length > 0 && (
                    <div className="evo-conn-tag">{getTrigger(mons[0].trigger)}</div>
                  )}
                  <div className="evo-conn-line" />
                </div>
              )}
              <div className="evo-stage-label">{LABELS[stg] || `Stage ${stg + 1}`}</div>
              {mons.map(mon => {
                const d    = details[mon.name];
                const m    = d ? gm(gt(d.types)) : gm("normal");
                const sp   = d ? gsp(d) : null;
                const isMe = mon.name === pokemon.name;
                return (
                  <div key={mon.name} className={`evo-ec fu ${isMe ? "is-me" : ""}`}
                    onClick={() => d && onSelect(d)}>
                    <div className="evo-ec-accent" style={{ background: m.c }} />
                    <div className="evo-ec-img">
                      <div className="evo-ec-imgbg" style={{ background: `${m.c}1e` }} />
                      {sp
                        ? <img src={sp} className="evo-ec-sprite" alt={mon.name} />
                        : <div style={{ width: 55, height: 55, borderRadius: 10, background: "var(--bg3)" }} />
                      }
                    </div>
                    <div className="evo-ec-info">
                      <div className="evo-ec-num" style={{ color: m.soft }}>
                        #{d ? pad(d.id) : "???"}
                      </div>
                      <div className="evo-ec-name">{mon.name}</div>
                      {d && (
                        <div className="evo-ec-types">
                          {d.types.map(t => {
                            const tm = gm(t.type.name);
                            return (
                              <span key={t.type.name} className="evo-etype"
                                style={{ background: `${tm.c}22`, color: tm.soft }}>
                                {t.type.name}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {isMe
                      ? <span className="evo-me-badge"
                          style={{ background: `${m.c}22`, color: m.soft }}>
                          Viewing
                        </span>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="rgba(240,235,227,0.18)" strokeWidth="2.5">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                    }
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── BOTTOM NAV ───────────────────────────────────────── */
const NAV_ITEMS = [
  {
    id: "home", label: "Home",
    icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    id: "explore", label: "Explore",
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    )
  },
  {
    id: "saved", label: "Saved",
    icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      </svg>
    )
  },
  {
    id: "profile", label: "Trainer",
    icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
];

/* ── ROOT APP ─────────────────────────────────────────── */
export default function App() {
  const [screen,   setScreen]   = useState("home");
  const [selected, setSelected] = useState(null);
  const [navActive,setNavActive] = useState("home");

  const goDetail   = useCallback(p  => { setSelected(p); setScreen("detail"); }, []);
  const goEvo      = useCallback(()  => setScreen("evo"), []);
  const goHome     = useCallback(()  => setScreen("home"), []);
  const goDetail2  = useCallback(()  => setScreen("detail"), []);
  const evoSelect  = useCallback(p  => { setSelected(p); setScreen("detail"); }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="stage">
        <div className="phone">
          <div className="notch" />

          <HomeScreen
            visible={screen === "home"}
            onSelect={goDetail}
          />
          <DetailScreen
            visible={screen === "detail"}
            slide={screen === "evo" ? "left" : "right"}
            pokemon={selected}
            onBack={goHome}
            onEvo={goEvo}
          />
          <EvoScreen
            visible={screen === "evo"}
            slide="right"
            pokemon={selected}
            onBack={goDetail2}
            onSelect={evoSelect}
          />

          <div className="bnav">
            {NAV_ITEMS.map(({ id, label, icon }) => {
              const isOn = navActive === id ||
                (id === "home" && ["detail","evo"].includes(screen));
              return (
                <button
                  key={id}
                  className={`bnav-item ${isOn ? "on" : ""}`}
                  onClick={() => { setNavActive(id); if (id === "home") setScreen("home"); }}
                >
                  {icon(isOn)}
                  <span className="bnav-label">{label}</span>
                  {isOn && <div className="bnav-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
