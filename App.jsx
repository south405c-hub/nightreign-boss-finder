import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════
// DATA  ─  夜の王ごとの 1日目 / 2日目ボス対応表
// 出典: jbjbgame.com / game8.jp / DLC攻略情報
// ════════════════════════════════════════════════
const KINGS = [
  {
    id: "gladius",
    ja: "グラディウス",  sub_ja: "三つ首の獣",
    en: "Gladius",       sub_en: "Night's Beast",
    weak_ja: "聖属性",   weak_en: "Holy",
    color: "#d4a827",
    d1_ja: ["亜人の女王＋亜人の剣聖", "鈴玉狩り"],
    d1_en: ["Fell Twins", "Bell-Bearing Hunter"],
    d2_ja: ["忌み鬼", "ツリーガード"],
    d2_en: ["Erdtree Burial Watchdog", "Tree Sentinel"],
    desc_ja: "ナイトレインの最初の標的。三つの首を持つ獣の姿をした夜の王で、聖属性攻撃が有効。グラディウスを倒すと残り6体の夜の王が解放される。1日目に「亜人の女王＋亜人の剣聖」や「鈴玉狩り」が出現した場合はグラディウスが確定する。2日目は「忌み鬼」か「ツリーガード」が出現する。炎カット率も上げておくと安定しやすい。",
    desc_en: "The first target in Nightreign. A Night King with three heads. Holy damage is effective. Defeating Gladius unlocks the remaining 6 Night Kings. If Fell Twins or Bell-Bearing Hunter appear on Day 1, Gladius is confirmed. Day 2 brings Erdtree Burial Watchdog or Tree Sentinel. Raising fire damage reduction helps with stability.",
    tips_ja: ["聖属性武器を最優先で確保する", "炎カット率を上げておくと事故を減らせる", "2日目ボスの忌み鬼は広範囲攻撃が多いため立ち位置に注意"],
    tips_en: ["Prioritize holy damage weapons", "Raise fire damage reduction to reduce accidents", "Erdtree Burial Watchdog has wide-range attacks — watch positioning"],
  },
  {
    id: "edere",
    ja: "エデレ",        sub_ja: "喰らいつく顎",
    en: "Edre",          sub_en: "Devouring Maw",
    weak_ja: "毒・腐敗・冷気",  weak_en: "Poison / Rot / Frost",
    color: "#8a3fc0",
    d1_ja: ["英雄のガーゴイル", "ミミズ顔", "公のフレイディア", "貪食ドラゴン", "夜の騎兵たち"],
    d1_en: ["Valiant Gargoyle", "Wormface", "Duke Freydia", "Devouring Dragon", "Night Cavalryman"],
    d2_ja: ["古竜", "僻地の宿将", "坩堝の騎士＋黄金カバ"],
    d2_en: ["Ancient Dragon", "Veteran Knight", "Crucible Knight + Hippo"],
    desc_ja: "飛行しながら広範囲攻撃を繰り出す夜の王。毒・腐敗・冷気の状態異常が有効で、蓄積させながら戦うのが基本。1日目に「英雄のガーゴイル」「ミミズ顔」「公のフレイディア」「貪食ドラゴン」「夜の騎兵たち」のいずれかが出現した場合はエデレまたはマリスが候補となる。2日目には「古竜」「僻地の宿将」「坩堝の騎士＋黄金カバ」が出現する。",
    desc_en: "A Night King that attacks from the air with wide-area moves. Poison, rot, and frost status effects are effective. When Valiant Gargoyle, Wormface, Freydia, Devouring Dragon, or Night Cavalryman appear on Day 1, Edre or Maris are candidates. Day 2 brings Ancient Dragon, Veteran Knight, or Crucible Knight + Hippo.",
    tips_ja: ["毒・腐敗・冷気武器を複数用意して蓄積を狙う", "空中にいる間は攻撃チャンスが限られるため待ちの立ち回りも重要", "2日目の古竜は長期戦になるため聖杯瓶の使用は計画的に"],
    tips_en: ["Prepare multiple status effect weapons for buildup", "Edre spends time airborne — patient play is key", "Ancient Dragon on Day 2 is a long fight — ration your Crimsonwhorl Bubbles"],
  },
  {
    id: "gnostar",
    ja: "グノスター",    sub_ja: "知性の蟲",
    en: "Gnostar",       sub_en: "Intelligence Worm",
    weak_ja: "炎属性・腐敗・出血・冷気",  weak_en: "Fire / Rot / Bleed / Frost",
    color: "#3aaa45",
    d1_ja: ["百足のデーモン", "戦場の宿将", "溶鉄デーモン", "夜の騎兵たち", "爛れた樹霊", "ティビアの呼び舟"],
    d1_en: ["Centipede Demon", "Veteran Knight", "Smelter Demon", "Night Cavalryman", "Putrid Tree Spirit", "Tibia Mariner"],
    d2_ja: ["大土竜", "ノクスの竜人兵", "竜のツリーガード"],
    d2_en: ["Great Mole", "Nox Dragonman", "Dragon Tree Sentinel"],
    desc_ja: "巨大な蛾とサソリが合体した異形の夜の王。HPを3〜4割削ると合体形態に移行し、広範囲レーザーや地面攻撃が激化する。炎属性・腐敗・出血・冷気が有効。1日目に「百足のデーモン」「戦場の宿将」「溶鉄デーモン」「夜の騎兵たち」「爛れた樹霊」「ティビアの呼び舟」が出現した場合の候補のひとつ。",
    desc_en: "An aberrant Night King combining a giant moth and a scorpion. At 3–4 bars of HP remaining, it merges into a combined form with powerful laser and ground attacks. Fire, rot, bleed, and frost are effective. One of the candidates when Centipede Demon, Veteran Knight, Smelter Demon, Night Cavalryman, Putrid Tree Spirit, or Tibia Mariner appear on Day 1.",
    tips_ja: ["合体前に火力を集中させてHPを削っておくと安全", "合体後のレーザーは移動して回避する", "炎属性武器を2日目用にも1本確保しておく"],
    tips_en: ["Front-load damage before the merge phase", "Move laterally to dodge the merged form's laser", "Keep at least one fire weapon ready for Day 2 as well"],
  },
  {
    id: "fulgore",
    ja: "フルゴール",    sub_ja: "闇駆ける狩人",
    en: "Fulgore",       sub_en: "Night Knight",
    weak_ja: "雷属性・毒・腐敗・出血・冷気",  weak_en: "Lightning / Poison / Rot / Bleed / Frost",
    color: "#c4a022",
    d1_ja: ["王族の幽鬼", "貪食ドラゴン", "百足のデーモン", "夜の騎兵たち", "ミミズ顔"],
    d1_en: ["Royal Revenant", "Devouring Dragon", "Centipede Demon", "Night Cavalryman", "Wormface"],
    d2_ja: ["ノクスの竜人兵", "僻地の宿将", "無名の王"],
    d2_en: ["Nox Dragonman", "Veteran Knight", "Nameless King"],
    desc_ja: "高速移動と突進攻撃を多用する騎馬型の夜の王。雷属性が弱点で、毒・腐敗・出血・冷気も有効。1日目に「王族の幽鬼」「貪食ドラゴン」「百足のデーモン」「夜の騎兵たち」「ミミズ顔」が出現した場合の候補のひとつ。2日目に「無名の王」が出現した場合はフルゴールがほぼ確定する。",
    desc_en: "A mounted Night King known for high-speed charges. Lightning is its weakness; poison, rot, bleed, and frost also apply well. One of the candidates when Royal Revenant, Devouring Dragon, Centipede Demon, Night Cavalryman, or Wormface appear on Day 1. If Nameless King appears on Day 2, Fulgore is nearly confirmed.",
    tips_ja: ["雷属性武器を必ず1本用意する", "2日目に無名の王が出ればフルゴール確定と判断してよい", "高速突進はローリングで対応し、反撃の機会を逃さない"],
    tips_en: ["Always bring at least one lightning weapon", "Nameless King on Day 2 = Fulgore confirmed", "Roll through the charge and punish on recovery"],
  },
  {
    id: "caligo",
    ja: "カリゴ",        sub_ja: "霧の裂け目",
    en: "Caligo",        sub_en: "Mist Rift",
    weak_ja: "炎属性",   weak_en: "Fire",
    color: "#22a8c4",
    d1_ja: ["爛れた樹霊", "接ぎ木の君主", "溶鉄デーモン", "公のフレイディア", "ティビアの呼び舟"],
    d1_en: ["Putrid Tree Spirit", "Grafted Scion", "Smelter Demon", "Duke Freydia", "Tibia Mariner"],
    d2_ja: ["冷たい谷の踊り子", "竜のツリーガード", "神肌の貴種＋神肌の使徒"],
    d2_en: ["Dancer of the Boreal Valley", "Dragon Tree Sentinel", "Godkin Duo"],
    desc_ja: "霧と冷気を操る謎めいた夜の王。炎属性が明確な弱点。1日目に「爛れた樹霊」「接ぎ木の君主」「溶鉄デーモン」「公のフレイディア」「ティビアの呼び舟」が出現した場合の候補のひとつ。2日目に「冷たい谷の踊り子」が出現した場合はカリゴが有力候補となる。炎属性武器を優先的に集めることが重要。",
    desc_en: "A mysterious Night King commanding mist and cold. Fire is a clear weakness. Candidate when Putrid Tree Spirit, Grafted Scion, Smelter Demon, Duke Freydia, or Tibia Mariner appear on Day 1. Dancer of the Boreal Valley on Day 2 strongly indicates Caligo. Prioritize fire weapons throughout the run.",
    tips_ja: ["炎属性武器を最優先で確保する", "2日目に踊り子が出たらカリゴと判断して準備を進める", "冷気蓄積攻撃は炎エンチャントで相殺できる場面もある"],
    tips_en: ["Fire weapons are top priority", "Dancer on Day 2 = prepare for Caligo", "Fire enchants can help offset Caligo's frost buildup"],
  },
  {
    id: "libra",
    ja: "リブラ",        sub_ja: "調律の魔物",
    en: "Libra",         sub_en: "Tuned Beast",
    weak_ja: "発狂・炎・聖・毒・腐敗",  weak_en: "Madness / Fire / Holy / Poison / Rot",
    color: "#c43c3c",
    d1_ja: ["王族の幽鬼", "公のフレイディア", "ティビアの呼び舟", "百足のデーモン", "戦場の宿将"],
    d1_en: ["Royal Revenant", "Duke Freydia", "Tibia Mariner", "Centipede Demon", "Veteran Knight"],
    d2_ja: ["死儀礼の鳥", "坩堝の騎士＋黄金カバ", "神肌の貴種＋神肌の使徒"],
    d2_en: ["Death Rite Bird", "Crucible Knight + Hippo", "Godkin Duo"],
    desc_ja: "多くのプレイヤーが最強と評する夜の王。初見では何をしているかわからない複雑な行動パターンが特徴。発狂・炎・聖・毒・腐敗が有効。1日目に「王族の幽鬼」「公のフレイディア」「ティビアの呼び舟」「百足のデーモン」「戦場の宿将」が出現した場合の候補。2日目の「死儀礼の鳥」はリブラの重要なサイン。",
    desc_en: "The Night King most players rate as the toughest. Complex attack patterns that are baffling on first encounter. Madness, fire, holy, poison, and rot are all effective. Candidate when Royal Revenant, Duke Freydia, Tibia Mariner, Centipede Demon, or Veteran Knight appear on Day 1. Death Rite Bird on Day 2 is a strong indicator of Libra.",
    tips_ja: ["発狂属性武器があれば最優先で装備する", "炎・聖属性は共通して有効なため汎用性が高い", "2日目に死儀礼の鳥が出たらリブラを疑って発狂対策を進める"],
    tips_en: ["Madness weapons are top priority if available", "Fire and holy are broadly effective — good all-rounders", "Death Rite Bird on Day 2 → suspect Libra and prep madness resistance"],
  },
  {
    id: "maris",
    ja: "マリス",        sub_ja: "兆し",
    en: "Maris",         sub_en: "Omen",
    weak_ja: "雷属性",   weak_en: "Lightning",
    color: "#225bc4",
    d1_ja: ["英雄のガーゴイル", "貪食ドラゴン", "接ぎ木の君主", "ミミズ顔", "溶鉄デーモン"],
    d1_en: ["Valiant Gargoyle", "Devouring Dragon", "Grafted Scion", "Wormface", "Smelter Demon"],
    d2_ja: ["神肌の貴種＋神肌の使徒", "ツリーガード", "降る星の成獣"],
    d2_en: ["Godkin Duo", "Tree Sentinel", "Falling Star Beast"],
    desc_ja: "常に空中に浮遊している深海の夜の王。雷属性が弱点。ストームルーラーなど戦技の攻撃力強化が有効な場面が多い。1日目に「英雄のガーゴイル」「貪食ドラゴン」「接ぎ木の君主」「ミミズ顔」「溶鉄デーモン」が出現した場合の候補。攻撃チャンスが少ないため長期戦になりやすいが、マリス自体の攻撃パターンは比較的読みやすい。",
    desc_en: "The Night King of the deep sea, always hovering in the air. Lightning is its weakness. Weapon skill power boosts (e.g. Stormruler-type) work well. Candidate when Valiant Gargoyle, Devouring Dragon, Grafted Scion, Wormface, or Smelter Demon appear on Day 1. Attack windows are limited so fights run long, but Maris's patterns are relatively readable.",
    tips_ja: ["雷属性武器に加え、戦技攻撃力UPの付帯効果も探す", "攻撃チャンスが少ないため聖杯瓶を温存しながら戦う", "2日目の降る星の成獣はマリスのサインになりやすい"],
    tips_en: ["Look for lightning weapons and weapon-skill-power-up traits", "Ration flasks — low attack windows mean the fight takes time", "Falling Star Beast on Day 2 often signals Maris"],
  },
  {
    id: "nameless",
    ja: "ナメレス",      sub_ja: "夜を象る者",
    en: "Nameless",      sub_en: "Night's Shaper",
    weak_ja: "聖属性",   weak_en: "Holy",
    color: "#c48b22",
    d1_ja: ["完全ランダム（対応関係なし）"],
    d1_en: ["Fully random (no correspondence)"],
    d2_ja: ["完全ランダム（対応関係なし）"],
    d2_en: ["Fully random (no correspondence)"],
    isNameless: true,
    desc_ja: "本編のラスボスにあたる夜の王。1日目・2日目のボスとの対応関係がなく完全ランダム出現のため、1日目ボスから絞り込むことができない。聖属性が弱点で、聖属性攻撃を当て続けると攻撃・防御にデバフがかかる。第一形態・第二形態ともに聖属性が有効。2体の夜の王を倒すと解放されるラスボスで、難易度は中程度。",
    desc_en: "The final boss of the main story. Since Nameless appears completely at random with no correlation to Day 1 or Day 2 bosses, he cannot be narrowed down from earlier encounters. Holy is the weakness — sustained holy damage applies a debuff to his attack and defense. Effective in both forms. Unlocked after defeating 2 Night Kings; moderate difficulty.",
    tips_ja: ["聖属性武器を常に1本は持ち込む習慣をつける", "第一形態でHP・聖杯瓶を温存して第二形態に備える", "聖属性デバフを維持し続けると火力が大幅に上がる"],
    tips_en: ["Always bring at least one holy weapon as insurance", "Conserve HP and flasks in Phase 1 for Phase 2", "Maintaining the holy debuff dramatically increases your damage output"],
  },
];

// ════════════════════════════════════════════════
// TRANSLATIONS
// ════════════════════════════════════════════════
const T = {
  ja: {
    appTitle: "3日目ボス判別ツール",
    appSub: "エルデンリング ナイトレイン｜深き夜",
    modeForward: "▶ 順引き（1日目→3日目）",
    modeReverse: "◀ 逆引き（3日目→1日目）",
    fwd_step1: "STEP 1 ── 1日目の夜ボスを選択",
    fwd_step2: "STEP 2 ── 2日目の夜ボスを選択",
    fwd_result: "RESULT ── 3日目ボス候補",
    rev_step1: "STEP 1 ── 3日目ボス（夜の王）を選択",
    rev_result: "RESULT ── 1日目 / 2日目ボス一覧",
    hint_fwd1: "1日目の夜に出現したボスをタップ",
    hint_fwd2: "2日目の夜に出現したボスをタップ（省略可）",
    hint_rev1: "3日目に戦う夜の王をタップ",
    skip: "2日目をスキップ →",
    back: "← 戻る",
    reset: "最初からやり直す",
    weak: "有効属性",
    day1: "1日目",
    day2: "2日目",
    day3: "3日目",
    confirmed: "✔ 確定！",
    candidates: "候補",
    noMatch: "一致なし",
    namelessNote: "※ ナメレスは完全ランダム出現のため、1日目・2日目ボスから絞り込むことができません。他の候補が確定しない限り、常に可能性として残ります。",
    orLabel: "または",
    d1Bosses: "1日目に出現するボス",
    d2Bosses: "2日目に出現するボス",
    guideTitle: "深き夜 攻略ガイド",
    guideSub: "夜の王 解説・弱点一覧",
    guideIntro: "「深き夜」は深度3以上で3日目のボス（夜の王）が非表示になるモード。1日目・2日目に出現するボスの組み合わせから夜の王を絞り込み、事前に弱点属性を準備しておくことが攻略の鍵。このページでは全8体の夜の王の特徴・弱点・攻略ポイントを解説する。",
    tipsLabel: "攻略ポイント",
    descLabel: "解説",
    deepNightTitle: "深き夜とは",
    deepNightDesc: "深き夜は、通常の出撃とは異なるハードモード。深度が上がるほど敵が強化され、深度3以上では出撃時に3日目ボスが非表示になる「ボス隠しギミック」が発生する。1日目ボスから夜の王を絞り込み、適切な武器・状態異常を用意することが勝利への近道。",
    howToTitle: "このツールの使い方",
    howToDesc: "順引きモードでは、1日目の夜ボス → 2日目の夜ボスを選択すると3日目の夜の王候補が表示される。逆引きモードでは、戦いたい夜の王を選択すると1日目・2日目に何が出るかを確認できる。",
  },
  en: {
    appTitle: "Day 3 Boss Finder",
    appSub: "Elden Ring: Nightreign | Deep Night",
    modeForward: "▶ Forward (Day1 → Day3)",
    modeReverse: "◀ Reverse (Day3 → Day1)",
    fwd_step1: "STEP 1 ── Select Day 1 Night Boss",
    fwd_step2: "STEP 2 ── Select Day 2 Night Boss",
    fwd_result: "RESULT ── Day 3 Boss Candidates",
    rev_step1: "STEP 1 ── Select Day 3 Boss",
    rev_result: "RESULT ── Day 1 / Day 2 Boss List",
    hint_fwd1: "Tap the boss that appeared on Day 1",
    hint_fwd2: "Tap the boss that appeared on Day 2 (optional)",
    hint_rev1: "Tap the Night King you face on Day 3",
    skip: "Skip Day 2 →",
    back: "← Back",
    reset: "Start Over",
    weak: "Weakness",
    day1: "Day 1",
    day2: "Day 2",
    day3: "Day 3",
    confirmed: "✔ Confirmed!",
    candidates: "Candidates",
    noMatch: "No match",
    namelessNote: "※ Nameless appears completely at random — Day 1/2 bosses give no clues. He remains a candidate until all others are ruled out.",
    orLabel: "or",
    d1Bosses: "Day 1 Bosses",
    d2Bosses: "Day 2 Bosses",
    guideTitle: "Deep Night Strategy Guide",
    guideSub: "Night King Overview & Weakness List",
    guideIntro: "In Deep Night at Depth 3+, the Day 3 boss (Night King) is hidden at the start. The key to winning is narrowing down the Night King from Day 1 and Day 2 boss combinations, then preparing the right weapons and status effects in advance. This guide covers all 8 Night Kings — their traits, weaknesses, and key tips.",
    tipsLabel: "Key Tips",
    descLabel: "Overview",
    deepNightTitle: "What is Deep Night?",
    deepNightDesc: "Deep Night is a hard mode distinct from regular expeditions. Enemies grow stronger as depth increases, and at Depth 3+ a 'boss blind' mechanic hides the Day 3 boss at the start. Narrowing down the Night King from Day 1 bosses and preparing the right weapons and status effects is the fastest path to victory.",
    howToTitle: "How to Use This Tool",
    howToDesc: "In Forward mode, select the Day 1 night boss then the Day 2 boss to see Day 3 Night King candidates. In Reverse mode, select the Night King you want to fight to see what bosses appear on Days 1 and 2.",
  },
};

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════
function allDay1(lang) {
  const k = lang === "ja" ? "d1_ja" : "d1_en";
  const s = new Set();
  KINGS.forEach(ki => { if (!ki.isNameless) ki[k].forEach(b => s.add(b)); });
  return [...s].sort();
}

function day2forDay1(d1, lang) {
  const k1 = lang === "ja" ? "d1_ja" : "d1_en";
  const k2 = lang === "ja" ? "d2_ja" : "d2_en";
  const s = new Set();
  KINGS.forEach(ki => {
    if (!ki.isNameless && ki[k1].includes(d1)) ki[k2].forEach(b => s.add(b));
  });
  return [...s].sort();
}

function getCandidates(d1, d2, lang) {
  if (!d1) return [];
  const k1 = lang === "ja" ? "d1_ja" : "d1_en";
  const k2 = lang === "ja" ? "d2_ja" : "d2_en";
  const regular = KINGS.filter(ki => {
    if (ki.isNameless) return false;
    if (!ki[k1].includes(d1)) return false;
    if (d2 && !ki[k2].includes(d2)) return false;
    return true;
  });
  const nameless = KINGS.find(k => k.isNameless);
  return [...regular, nameless];
}

// ════════════════════════════════════════════════
// COLOUR PALETTE
// ════════════════════════════════════════════════
const BG   = "#09090e";
const GOLD = "#c4a022";
const C = {
  card:    "rgba(255,255,255,0.026)",
  cardRed: "rgba(196,130,26,0.05)",
  border:  "rgba(196,130,26,0.18)",
  borderG: "rgba(196,130,26,0.42)",
  hint:    "#5a4e38",
  dim:     "#3a3020",
  text:    "#e0d4b8",
  sub:     "#8a7858",
  chip:    "rgba(255,255,255,0.036)",
  chipHov: "rgba(196,160,34,0.17)",
};

// ════════════════════════════════════════════════
// SMALL COMPONENTS
// ════════════════════════════════════════════════
function Glow() {
  return <>
    <div style={{position:"fixed",top:-200,right:-200,width:520,height:520,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(196,130,26,0.13) 0%,transparent 70%)",
      pointerEvents:"none",zIndex:0}} />
    <div style={{position:"fixed",bottom:-180,left:-180,width:460,height:460,borderRadius:"50%",
      background:"radial-gradient(circle,rgba(30,60,180,0.09) 0%,transparent 70%)",
      pointerEvents:"none",zIndex:0}} />
  </>;
}

// ── Google AdSense ────────────────────────────────
// 使い方:
//   1. https://adsense.google.com でアカウント作成・サイト審査を通す
//   2. 広告ユニットを作成し、下記 YOUR_CLIENT_ID / YOUR_AD_SLOT を置き換える
//   3. <head> に以下を追加:
//      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
// ────────────────────────────────────────────────
function AdSense({ slot, format = "auto", fullWidthResponsive = true, style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    try {
      if (ref.current && ref.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // adsbygoogle not loaded yet (dev環境では表示されない)
    }
  }, []);

  return (
    <div ref={ref} style={{ display:"block", textAlign:"center", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display:"block" }}
        data-ad-client="ca-pub-YOUR_CLIENT_ID"   // ← ここを自分のIDに変更
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={String(fullWidthResponsive)}
      />
    </div>
  );
}

// 開発中はプレースホルダーを表示、本番はAdSenseに切り替える
const IS_DEV = !window?.adsbygoogle;

function Ad({ type }) {
  // type: "banner" (320×50相当) | "rectangle" (300×250相当)
  const slot = type === "banner" ? "YOUR_BANNER_SLOT" : "YOUR_RECT_SLOT"; // ← スロットIDを変更

  if (IS_DEV) {
    // 開発中プレースホルダー
    const h = type === "banner" ? 50 : 110;
    return (
      <div style={{
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
        height:h, borderRadius:6,
        border:"1px dashed rgba(255,255,255,0.08)",
        background:"rgba(255,255,255,0.012)",
        color:C.dim, fontSize:11,
      }}>
        <span style={{fontSize:9,padding:"1px 7px",borderRadius:2,
          background:"#141210",border:`1px solid ${C.dim}`,
          letterSpacing:"0.12em"}}>広告</span>
        <span>Google AdSense {type === "banner" ? "320×50" : "300×250"}（本番で表示）</span>
      </div>
    );
  }

  return (
    <AdSense
      slot={slot}
      format={type === "banner" ? "horizontal" : "rectangle"}
      style={{ minHeight: type === "banner" ? 50 : 110 }}
    />
  );
}

function ChipBtn({ label, active, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  const on = active || hov;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding:"8px 13px",borderRadius:6,fontFamily:"inherit",fontSize:13,
        cursor: disabled ? "default" : "pointer",
        border:`1px solid ${on ? GOLD : "#2a2216"}`,
        background: on ? "rgba(196,160,34,0.16)" : C.chip,
        color: on ? "#e8c547" : "#9a8868",
        transition:"all 0.14s",
        boxShadow: on ? `0 0 8px rgba(196,160,34,0.2)` : "none",
        opacity: disabled ? 0.4 : 1,
      }}>{label}</button>
  );
}

function SelTag({ label, value }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:5,
      padding:"3px 12px",borderRadius:20,marginBottom:8,marginRight:6,
      background:"rgba(196,160,34,0.09)",border:`1px solid rgba(196,160,34,0.28)`,
      fontSize:13}}>
      <span style={{color:C.hint,fontSize:10}}>{label}：</span>
      <span style={{color:"#e8c547",fontWeight:600}}>{value}</span>
    </div>
  );
}

function Badge({ text, gold, dlc }) {
  return (
    <div style={{display:"inline-block",padding:"2px 10px",borderRadius:3,marginBottom:9,
      background: dlc ? "rgba(200,80,120,0.18)" : gold ? "#3a1e00" : "#161206",
      border:`1px solid ${dlc ? "#e0709a" : gold ? "#c4821a" : "#4a3010"}`,
      fontSize:10,color: dlc ? "#e0709a" : gold ? "#e8a030" : "#c4821a",
      letterSpacing:"0.18em",fontFamily:"monospace"}}>
      {text}
    </div>
  );
}

// ── King Card (Result / Reverse) ─────────────────
function KingCard({ king, lang, t, showBosses }) {
  const [exp, setExp] = useState(false);
  const isJa = lang === "ja";
  const d1 = isJa ? king.d1_ja : king.d1_en;
  const d2 = isJa ? king.d2_ja : king.d2_en;

  return (
    <div style={{
      borderRadius:8,border:`1px solid ${king.isNameless ? "rgba(196,130,26,0.3)" : king.color}`,
      padding:"12px 14px",
      background:"rgba(0,0,0,0.35)",
      boxShadow:`0 0 18px ${king.color}25`,
      opacity: king.isNameless ? 0.72 : 1,
    }}>
      {/* header */}
      <div style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap",marginBottom:6}}>
        <div style={{width:4,height:22,borderRadius:2,background:king.color,flexShrink:0}}/>
        <span style={{fontSize:16,fontWeight:700,color:king.color,
          textShadow:`0 0 10px ${king.color}50`}}>
          {isJa ? king.ja : king.en}
        </span>
        <span style={{fontSize:11,color:C.hint}}>
          {isJa ? king.sub_ja : king.sub_en}
        </span>
        {king.isNameless && <span style={{fontSize:10,padding:"1px 8px",borderRadius:20,
          background:"rgba(196,130,26,0.15)",border:`1px solid ${GOLD}55`,color:"#c4a022"}}>
          {isJa?"出現条件不定":"Appears randomly"}</span>}
      </div>
      {/* weakness */}
      <div style={{fontSize:13,color:C.sub,marginBottom: showBosses ? 8 : 0}}>
        <span style={{fontSize:11,color:C.hint}}>{t.weak}：</span>
        {isJa ? king.weak_ja : king.weak_en}
      </div>
      {/* Day 1 / Day 2 boss list (reverse mode) */}
      {showBosses && !king.isNameless && (
        <div style={{borderTop:`1px solid rgba(196,130,26,0.15)`,paddingTop:8,marginTop:4}}>
          <button onClick={() => setExp(!exp)} style={{
            background:"none",border:"none",color:GOLD,cursor:"pointer",
            fontSize:12,fontFamily:"inherit",padding:0,marginBottom: exp ? 8 : 0,
          }}>{exp ? "▼" : "▶"} {t.d1Bosses} / {t.d2Bosses}</button>
          {exp && (
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <div>
                <p style={{fontSize:11,color:C.hint,margin:"0 0 4px"}}>{t.day1}</p>
                {d1.map(b => (
                  <div key={b} style={{fontSize:12,color:C.text,padding:"2px 0"}}>{b}</div>
                ))}
              </div>
              <div>
                <p style={{fontSize:11,color:C.hint,margin:"0 0 4px"}}>{t.day2}</p>
                {d2.map(b => (
                  <div key={b} style={{fontSize:12,color:C.text,padding:"2px 0"}}>{b}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// STEP BAR
// ════════════════════════════════════════════════
function StepBar({ total, current }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",
      padding:"10px 0 6px",gap:0,position:"relative",zIndex:1}}>
      {Array.from({length:total}).map((_, i) => {
        const n = i + 1;
        const on = current >= n, act = current === n;
        return (
          <div key={n} style={{display:"flex",alignItems:"center"}}>
            <div style={{
              width:28,height:28,borderRadius:"50%",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,fontWeight:700,fontFamily:"monospace",
              border:`2px solid ${act ? "#e8c547" : on ? GOLD : "#1e1c14"}`,
              color: act ? "#09090e" : on ? GOLD : "#2e2c1a",
              background: act ? GOLD : "#0d0d12",
              boxShadow: act ? `0 0 12px rgba(196,160,34,0.5)` : "none",
              transition:"all 0.3s",
            }}>{n}</div>
            {n < total && <div style={{width:36,height:2,
              background: current > n ? GOLD : "#1a1810",transition:"background 0.3s"}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════
// MODE SELECTOR
// ════════════════════════════════════════════════
function ModeSelector({ mode, setMode, t }) {
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {[["forward", t.modeForward], ["reverse", t.modeReverse]].map(([m, label]) => (
        <button key={m} onClick={() => setMode(m)} style={{
          padding:"8px 16px",borderRadius:6,fontFamily:"inherit",fontSize:13,
          cursor:"pointer",transition:"all 0.2s",
          border:`1px solid ${mode===m ? GOLD : "#2a2216"}`,
          background: mode===m ? "rgba(196,160,34,0.14)" : C.chip,
          color: mode===m ? "#e8c547" : C.hint,
          fontWeight: mode===m ? 700 : 400,
        }}>{label}</button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════
// FORWARD MODE (1日目→3日目)
// ════════════════════════════════════════════════
function ForwardMode({ lang, t }) {
  const [step, setStep] = useState(1);
  const [d1, setD1] = useState(null);
  const [d2, setD2] = useState(null);

  const d1List = allDay1(lang);
  const d2List = d1 ? day2forDay1(d1, lang) : [];
  const cands = getCandidates(d1, d2, lang);
  const reg = cands.filter(c => !c.isNameless);
  const confirmed = reg.length === 1;

  function pick1(name) { setD1(name); setD2(null); setStep(2); }
  function pick2(name) { setD2(name); setStep(3); }
  function skip()  { setD2(null); setStep(3); }
  function reset() { setD1(null); setD2(null); setStep(1); }

  return (
    <div>
      <StepBar total={3} current={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div style={S.card}>
          <Badge text="STEP 01" />
          <h2 style={S.cardH}>{t.fwd_step1}</h2>
          <p style={S.hint}>{t.hint_fwd1}</p>
          <div style={S.chipGrid}>
            {d1List.map(b => <ChipBtn key={b} label={b} onClick={() => pick1(b)} />)}
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div style={S.card}>
          <Badge text="STEP 02" />
          <h2 style={S.cardH}>{t.fwd_step2}</h2>
          <SelTag label={t.day1} value={d1} />
          <p style={S.hint}>{t.hint_fwd2}</p>
          <div style={S.chipGrid}>
            {d2List.map(b => <ChipBtn key={b} label={b} onClick={() => pick2(b)} />)}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
            <button onClick={skip}  style={S.skipBtn}>{t.skip}</button>
            <button onClick={() => setStep(1)} style={S.backBtn}>{t.back}</button>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 3 && (
        <div style={S.resultCard}>
          <Badge text="RESULT" gold />
          <h2 style={S.cardH}>{t.fwd_result}</h2>

          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>
            <SelTag label={t.day1} value={d1} />
            {d2 && <SelTag label={t.day2} value={d2} />}
          </div>

          {reg.length > 0 && (
            <div style={{
              ...S.statusBox,
              background: confirmed ? "rgba(60,200,60,0.1)" : "rgba(196,160,34,0.09)",
              borderColor: confirmed ? "#3cc43c" : GOLD,
            }}>
              <span style={{color: confirmed ? "#5de05d" : GOLD, fontWeight:700, fontSize:15}}>
                {confirmed
                  ? `${t.confirmed} ${lang==="ja" ? reg[0].ja : reg[0].en}`
                  : `${reg.length} ${t.candidates}`}
              </span>
            </div>
          )}
          {cands.length === 0 && <p style={{color:C.hint,fontSize:14}}>{t.noMatch}</p>}

          <div style={S.kingGrid}>
            {cands.map(k => <KingCard key={k.id} king={k} lang={lang} t={t} showBosses={false} />)}
          </div>

          <p style={S.note}>{t.namelessNote}</p>

          <Ad type="rectangle" />
          <button onClick={reset} style={S.resetBtn}>↩ {t.reset}</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// REVERSE MODE（3日目→1日目/2日目）
// ════════════════════════════════════════════════
function ReverseMode({ lang, t }) {
  const [step, setStep] = useState(1);
  const [king, setKing] = useState(null);
  const isJa = lang === "ja";

  function pick(k) { setKing(k); setStep(2); }
  function reset() { setKing(null); setStep(1); }

  return (
    <div>
      <StepBar total={2} current={step} />

      {step === 1 && (
        <div style={S.card}>
          <Badge text="STEP 01" />
          <h2 style={S.cardH}>{t.rev_step1}</h2>
          <p style={S.hint}>{t.hint_rev1}</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {KINGS.map(k => (
              <button key={k.id} onClick={() => pick(k)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                borderRadius:8,border:`1px solid ${k.color}44`,
                background: C.chip, cursor:"pointer",fontFamily:"inherit",
                textAlign:"left",transition:"all 0.16s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = k.color; e.currentTarget.style.background = `${k.color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${k.color}44`; e.currentTarget.style.background = C.chip; }}
              >
                <div style={{width:4,height:20,borderRadius:2,background:k.color,flexShrink:0}}/>
                <div>
                  <span style={{fontSize:15,fontWeight:700,color:k.color}}>
                    {isJa ? k.ja : k.en}
                  </span>
                  <span style={{fontSize:11,color:C.hint,marginLeft:8}}>
                    {isJa ? k.sub_ja : k.sub_en}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && king && (
        <div style={S.resultCard}>
          <Badge text="RESULT" gold />
          <h2 style={S.cardH}>{t.rev_result}</h2>

          {/* 選んだ夜の王 */}
          <KingCard king={king} lang={lang} t={t} showBosses={false} />

          {/* 1日目・2日目ボス一覧 */}
          {!king.isNameless && (
            <div style={{marginTop:16,display:"flex",gap:14,flexWrap:"wrap"}}>
              {/* 1日目 */}
              <div style={{flex:1,minWidth:180}}>
                <div style={{marginBottom:8}}>
                  <Badge text={`▸ ${t.day1}`} />
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {(isJa ? king.d1_ja : king.d1_en).map(b => (
                    <div key={b} style={{padding:"7px 12px",borderRadius:6,fontSize:13,
                      color:C.text,background:C.chip,border:`1px solid #2a2216`}}>{b}</div>
                  ))}
                </div>
              </div>
              {/* 2日目 */}
              <div style={{flex:1,minWidth:180}}>
                <div style={{marginBottom:8}}>
                  <Badge text={`▸ ${t.day2}`} />
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {(isJa ? king.d2_ja : king.d2_en).map(b => (
                    <div key={b} style={{padding:"7px 12px",borderRadius:6,fontSize:13,
                      color:C.text,background:C.chip,border:`1px solid #2a2216`}}>{b}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {king.isNameless && (
            <p style={{...S.note,marginTop:12}}>{t.namelessNote}</p>
          )}

          <Ad type="rectangle" />
          <button onClick={reset} style={S.resetBtn}>↩ {t.reset}</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// GUIDE SECTION  ─  アドセンス対策の解説コンテンツ
// ════════════════════════════════════════════════
function GuideSection({ lang, t }) {
  const [openId, setOpenId] = useState(null);
  const isJa = lang === "ja";

  return (
    <section style={{marginTop:8}}>
      {/* ── イントロ ── */}
      <div style={{
        background:"rgba(255,255,255,0.022)",border:`1px solid rgba(196,130,26,0.2)`,
        borderRadius:10,padding:"16px 16px 14px",marginBottom:14,
      }}>
        <h2 style={{margin:"0 0 6px",fontSize:"clamp(15px,3.8vw,20px)",
          fontWeight:700,color:GOLD,letterSpacing:"0.05em"}}>
          ⚔ {t.guideTitle}
        </h2>
        <p style={{margin:"0 0 12px",fontSize:11,color:C.sub,letterSpacing:"0.1em"}}>
          {t.guideSub}
        </p>
        <p style={{margin:0,fontSize:13,color:C.text,lineHeight:1.85}}>
          {t.guideIntro}
        </p>
      </div>

      {/* ── 深き夜とは / 使い方 ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          { title: t.deepNightTitle, body: t.deepNightDesc, icon: "🌑" },
          { title: t.howToTitle,     body: t.howToDesc,     icon: "🔍" },
        ].map(({ title, body, icon }) => (
          <div key={title} style={{
            background:"rgba(255,255,255,0.018)",border:`1px solid rgba(196,130,26,0.15)`,
            borderRadius:8,padding:"12px 13px",
          }}>
            <h3 style={{margin:"0 0 7px",fontSize:13,color:GOLD,fontWeight:700}}>
              {icon} {title}
            </h3>
            <p style={{margin:0,fontSize:12,color:C.text,lineHeight:1.8}}>{body}</p>
          </div>
        ))}
      </div>

      {/* ── 広告 ── */}
      <Ad type="banner" />

      {/* ── 夜の王一覧 ── */}
      <h3 style={{margin:"16px 0 10px",fontSize:15,color:GOLD,fontWeight:700,
        borderLeft:`3px solid ${GOLD}`,paddingLeft:10}}>
        {isJa ? "夜の王 個別解説" : "Night King Details"}
      </h3>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {KINGS.map(king => {
          const isOpen = openId === king.id;
          const desc = isJa ? king.desc_ja : king.desc_en;
          const tips = isJa ? king.tips_ja : king.tips_en;

          return (
            <div key={king.id} style={{
              borderRadius:8,border:`1px solid ${isOpen ? king.color : king.color+"44"}`,
              overflow:"hidden",transition:"border-color 0.2s",
            }}>
              {/* アコーディオンヘッダー */}
              <button
                onClick={() => setOpenId(isOpen ? null : king.id)}
                style={{
                  width:"100%",display:"flex",alignItems:"center",gap:10,
                  padding:"11px 14px",cursor:"pointer",
                  background: isOpen ? `${king.color}18` : "rgba(0,0,0,0.3)",
                  border:"none",fontFamily:"inherit",textAlign:"left",
                  transition:"background 0.2s",
                }}
              >
                <div style={{width:4,height:20,borderRadius:2,background:king.color,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <span style={{fontSize:15,fontWeight:700,color:king.color}}>
                    {isJa ? king.ja : king.en}
                  </span>
                  <span style={{fontSize:11,color:C.hint,marginLeft:8}}>
                    {isJa ? king.sub_ja : king.sub_en}
                  </span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <span style={{
                    fontSize:11,padding:"2px 9px",borderRadius:20,
                    background:`${king.color}22`,border:`1px solid ${king.color}66`,
                    color:king.color,
                  }}>
                    {isJa ? king.weak_ja : king.weak_en}
                  </span>
                  <span style={{color:C.hint,fontSize:14,transition:"transform 0.2s",
                    transform: isOpen ? "rotate(180deg)" : "none"}}>▾</span>
                </div>
              </button>

              {/* アコーディオン本文 */}
              {isOpen && (
                <div style={{
                  padding:"12px 16px 14px",
                  background:"rgba(0,0,0,0.25)",
                  borderTop:`1px solid ${king.color}33`,
                }}>
                  {/* 解説テキスト */}
                  <p style={{margin:"0 0 12px",fontSize:13,color:C.text,lineHeight:1.85}}>
                    {desc}
                  </p>

                  {/* 攻略ポイント */}
                  <div style={{
                    background:`${king.color}0d`,
                    border:`1px solid ${king.color}33`,
                    borderRadius:6,padding:"10px 13px",
                  }}>
                    <p style={{margin:"0 0 7px",fontSize:11,color:king.color,
                      fontWeight:700,letterSpacing:"0.1em"}}>
                      ▸ {t.tipsLabel}
                    </p>
                    {tips.map((tip, i) => (
                      <div key={i} style={{
                        display:"flex",gap:7,alignItems:"flex-start",
                        fontSize:12,color:C.text,lineHeight:1.7,
                        marginBottom: i < tips.length-1 ? 4 : 0,
                      }}>
                        <span style={{color:king.color,flexShrink:0,marginTop:1}}>•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>

                  {/* 1日目・2日目ボス小まとめ */}
                  {!king.isNameless && (
                    <div style={{
                      display:"flex",gap:10,marginTop:10,flexWrap:"wrap",
                    }}>
                      {[
                        { label: isJa?"1日目":"Day 1", list: isJa?king.d1_ja:king.d1_en },
                        { label: isJa?"2日目":"Day 2", list: isJa?king.d2_ja:king.d2_en },
                      ].map(({ label, list }) => (
                        <div key={label} style={{flex:1,minWidth:150}}>
                          <p style={{margin:"0 0 5px",fontSize:11,color:C.hint,
                            fontWeight:700,letterSpacing:"0.08em"}}>{label}</p>
                          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                            {list.map(b => (
                              <span key={b} style={{
                                fontSize:11,padding:"2px 8px",borderRadius:3,
                                background:"rgba(255,255,255,0.04)",
                                border:"1px solid rgba(255,255,255,0.08)",
                                color:C.sub,
                              }}>{b}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 下部広告 ── */}
      <div style={{marginTop:16}}>
        <Ad type="rectangle" />
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useState("ja");
  const [mode, setMode] = useState("forward"); // forward | reverse
  const t = T[lang];

  return (
    <div style={{minHeight:"100vh",background:BG,color:C.text,
      fontFamily:"'Noto Serif JP','Georgia',serif",position:"relative",overflowX:"hidden"}}>
      <Glow />

      {/* ── HEADER ── */}
      <header style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",
        flexWrap:"wrap",gap:10,padding:"16px 18px 12px",
        borderBottom:`1px solid rgba(196,130,26,0.22)`,
        background:"rgba(0,0,0,0.55)",backdropFilter:"blur(10px)",
        position:"sticky",top:0,zIndex:100,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:28,filter:"sepia(1) hue-rotate(-20deg) brightness(1.3)"}}>⚔</span>
          <div>
            <h1 style={{margin:0,fontSize:"clamp(14px,4vw,21px)",fontWeight:700,
              letterSpacing:"0.06em",color:GOLD,textShadow:`0 0 18px ${GOLD}44`}}>
              {t.appTitle}
            </h1>
            <p style={{margin:"1px 0 0",fontSize:10,color:C.dim,letterSpacing:"0.12em"}}>
              {t.appSub}
            </p>
          </div>
        </div>
        <div style={{display:"flex",gap:7}}>
          {["ja","en"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding:"5px 11px",borderRadius:4,border:`1px solid ${lang===l ? GOLD : "#2a2218"}`,
              background: lang===l ? GOLD : "transparent",
              color: lang===l ? "#09090e" : C.dim,
              fontSize:12,cursor:"pointer",fontFamily:"inherit",
              fontWeight: lang===l ? 700 : 400,
            }}>{l==="ja" ? "日本語" : "English"}</button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:700,margin:"0 auto",padding:"14px 12px 60px",
        display:"flex",flexDirection:"column",gap:14,position:"relative",zIndex:1}}>

        <Ad type="banner" />

        <ModeSelector mode={mode} setMode={m => { setMode(m); }} t={t} />

        {mode === "forward"
          ? <ForwardMode key="fwd" lang={lang} t={t} />
          : <ReverseMode key="rev" lang={lang} t={t} />}

        {/* ── 攻略ガイド（SEO・AdSense対策コンテンツ） ── */}
        <GuideSection lang={lang} t={t} />

      </main>

      <footer style={{textAlign:"center",padding:"12px 20px",
        fontSize:10,color:"#252014",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
        データ出典: jbjbgame.com / game8.jp / gamewith.jp ｜ 非公式ファンツール ｜ ©FromSoftware
      </footer>
    </div>
  );
}

// ════════════════════════════════════════════════
// SHARED STYLES
// ════════════════════════════════════════════════
const S = {
  card: {
    background:C.card,border:`1px solid ${C.border}`,
    borderRadius:10,padding:"15px 14px",
  },
  resultCard: {
    background:C.cardRed,border:`1px solid ${C.borderG}`,
    borderRadius:10,padding:"15px 14px",
  },
  cardH: {
    margin:"0 0 10px",fontSize:"clamp(13px,3.5vw,17px)",
    fontWeight:600,color:C.text,letterSpacing:"0.04em",
  },
  hint: { margin:"0 0 12px",fontSize:12,color:C.hint,lineHeight:1.6 },
  chipGrid: { display:"flex",flexWrap:"wrap",gap:8,marginBottom:14 },
  kingGrid: { display:"flex",flexDirection:"column",gap:10,marginBottom:12 },
  statusBox: { padding:"8px 14px",borderRadius:6,border:"1px solid",
    marginBottom:14,display:"inline-block" },
  note: { fontSize:11,color:"#403828",borderTop:`1px solid rgba(196,130,26,0.1)`,
    paddingTop:10,marginTop:4,lineHeight:1.8 },
  skipBtn: { padding:"8px 16px",borderRadius:6,border:`1px solid rgba(196,160,34,0.3)`,
    background:"rgba(196,160,34,0.07)",color:GOLD,fontSize:13,cursor:"pointer",fontFamily:"inherit" },
  backBtn: { padding:"8px 14px",borderRadius:6,border:`1px solid #2a2418`,
    background:"transparent",color:C.hint,fontSize:13,cursor:"pointer",fontFamily:"inherit" },
  resetBtn: { marginTop:14,padding:"9px 20px",borderRadius:6,
    border:`1px solid #382e1c`,background:"transparent",
    color:"#7a6848",fontSize:13,cursor:"pointer",fontFamily:"inherit" },
};
