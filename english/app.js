(() => {
  "use strict";

  /* ═════════════ helpers ═════════════ */
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const isCJK = (s) => /[\u3400-\u9fff]/.test(s);
  const TODAY = ymd(new Date());

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // Pronunciation: play a real audio file (works on iPhone, unlike the browser speech engine
  // which is often silent there), fall back to the speech engine if the audio can't load.
  const player = new Audio();
  player.preload = "auto";
  function ttsFallback(text) {
    try {
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      u.voice = voices.find((v) => v.lang === "en-AU") || voices.find((v) => v.lang === "en-GB") || voices.find((v) => v.lang.startsWith("en")) || null;
      u.lang = u.voice ? u.voice.lang : "en-GB";
      u.rate = 0.92;
      if (synth.speaking) synth.cancel();
      synth.speak(u);
    } catch (e) { toast("这个浏览器不支持发音"); }
  }
  function speak(text, url) {
    const src = url || `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=1`;
    let fell = false;
    const fallback = () => { if (!fell) { fell = true; ttsFallback(text); } };
    player.onerror = fallback;
    player.src = src;
    const p = player.play();
    if (p && p.catch) p.catch(fallback);
  }

  /* ═════════════ state (localStorage) ═════════════ */
  const KEY = "zoey-english-desk.v1";
  const blank = () => ({ seen: {}, queue: {}, notebook: {}, newsVocab: {}, days: {}, stats: { answered: 0, correct: 0 } });
  let S;
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = blank(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } };
  const day = (d = TODAY) => (S.days[d] ||= { set: null, idx: 0, answers: [], newsRead: [] });

  /* ═════════════ word bank ═════════════ */
  const BANK = window.WORD_BANK;
  const KIND_OF = {};
  const ENTRY = {};
  for (const kind of Object.keys(BANK)) for (const e of BANK[kind]) { KIND_OF[e.w] = kind; ENTRY[e.w] = e; }
  const ALL_ENTRIES = Object.values(ENTRY);

  const KIND_LABEL = {
    review: ["chip-pink", "复习 · 上次答错"],
    lookup: ["chip-lav", "复习 · 你查过"],
    news: ["chip-lime", "新闻词"],
    mkt: ["chip-teal", "Marketing"],
    confuse: ["chip-pink", "易混词"],
    adv: ["chip-mint", "进阶词"],
  };

  function makeOptions(entry) {
    const answer = entry.zh;
    const used = new Set([answer]);
    const opts = [];
    const push = (zh) => { if (zh && !used.has(zh) && opts.length < 3) { used.add(zh); opts.push(zh); } };
    // 1) the look-alike word's meaning — the classic trap
    if (entry.like && ENTRY[entry.like]) push(ENTRY[entry.like].zh);
    // 2) same part of speech
    const pos0 = (entry.pos || "").split("/")[0];
    const pool = ALL_ENTRIES.filter((e) => e.w !== entry.w && e.w !== entry.like);
    for (const e of shuffle(pool.filter((e) => (e.pos || "").split("/")[0] === pos0))) push(e.zh);
    for (const e of shuffle(pool)) push(e.zh);
    const all = shuffle([answer, ...opts]);
    return { options: all, answer: all.indexOf(answer) };
  }

  function makeItem(entry, kind) {
    const e = { w: entry.w, ph: entry.ph || "", pos: entry.pos || "", zh: entry.zh, ex: entry.ex || "", tip: entry.tip || "", like: entry.like || "" };
    return { ...e, kind, ...makeOptions(e) };
  }

  function buildSet() {
    const items = [];
    const inSet = new Set();
    const add = (entry, kind) => { if (!entry || !entry.zh || inSet.has(entry.w)) return false; inSet.add(entry.w); items.push(makeItem(entry, kind)); return true; };

    // 1) reviews that are due: wrong answers first, then looked-up words (max 3)
    const due = Object.entries(S.queue)
      .filter(([, q]) => q.due <= TODAY && q.entry && q.entry.zh)
      .sort((a, b) => (a[1].src === "wrong" ? 0 : 1) - (b[1].src === "wrong" ? 0 : 1) || a[1].due.localeCompare(b[1].due));
    for (const [, q] of due) { if (items.length >= 3) break; add(q.entry, q.src === "wrong" ? "review" : "lookup"); }

    // 2) one word from an earlier news brief
    const nv = Object.values(S.newsVocab).filter((n) => n.date < TODAY && !S.seen[n.entry.w] && !S.queue[n.entry.w]);
    if (nv.length && items.length < 5) add(shuffle(nv)[0].entry, "news");

    // 3) fill with new bank words: marketing / confusables / advanced
    const pattern = ["mkt", "confuse", "mkt", "adv", "confuse", "mkt"];
    const fresh = (kind) => shuffle(BANK[kind].filter((e) => !S.seen[e.w] && !inSet.has(e.w) && !S.queue[e.w] && !(e.like && inSet.has(e.like))));
    let p = 0, guard = 0;
    while (items.length < 5 && guard++ < 30) {
      const kind = pattern[p++ % pattern.length];
      const pick = fresh(kind)[0];
      if (pick) add(pick, kind);
    }
    // 4) bank exhausted → recycle the oldest seen words
    if (items.length < 5) {
      const old = Object.entries(S.seen).sort((a, b) => a[1].localeCompare(b[1])).map(([w]) => ENTRY[w]).filter(Boolean);
      for (const e of old) { if (items.length >= 5) break; add(e, KIND_OF[e.w]); }
    }
    return items;
  }

  /* ═════════════ quiz UI ═════════════ */
  const DOODLES = [
    '<svg class="doodle" viewBox="0 0 60 60"><path d="M30 50 C 10 38, 6 22, 18 14 C 25 10, 30 16, 30 20 C 30 16, 35 10, 42 14 C 54 22, 50 38, 30 50 Z"/></svg>',
    '<svg class="doodle" viewBox="0 0 60 60"><circle cx="30" cy="30" r="10"/><path d="M30 6v8M30 46v8M6 30h8M46 30h8M13 13l6 6M41 41l6 6M47 13l-6 6M19 41l-6 6"/></svg>',
    '<svg class="doodle" viewBox="0 0 60 60"><path d="M12 36 C 12 26, 22 22, 28 26 C 30 16, 46 16, 46 28 C 54 28, 54 40, 46 40 L16 40 C 12 40, 10 38, 12 36 Z"/></svg>',
  ];

  // rounds of 5: the daily round, then optional "learn 5 more" rounds
  const roundStart = (d) => Math.floor(Math.min(d.idx, d.set.length - 1) / 5) * 5;
  function renderSteps(d) {
    const r0 = roundStart(d);
    $("#wordSteps").innerHTML = d.set.slice(r0, r0 + 5).map((it, k) => {
      const i = r0 + k;
      const a = d.answers[i];
      const cls = a ? (a.ok ? "ok" : "bad") : i === d.idx ? "cur" : "";
      return `<i class="${cls}"></i>`;
    }).join("");
  }

  function highlight(ex, w) {
    const safe = esc(ex);
    const stem = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/e$/, "e?");
    return safe.replace(new RegExp(`\\b(${stem}\\w*)`, "i"), "<b>$1</b>");
  }

  function renderQuiz() {
    const d = day();
    if (!d.set) { d.set = buildSet(); save(); }
    renderSteps(d);
    const box = $("#quiz");
    if (d.idx >= d.set.length) return renderSummary();

    const it = d.set[d.idx];
    const answered = d.answers[d.idx];
    const [chipCls, chipText] = KIND_LABEL[it.kind] || KIND_LABEL.adv;
    box.innerHTML = `
      <div class="flip ${answered ? "flipped" : ""}" id="flip">
        <div class="flip-inner">
          <div class="face front">
            <span class="chip ${chipCls} tag">${chipText}</span>
            <span class="counter">${d.idx - roundStart(d) + 1} / ${Math.min(5, d.set.length - roundStart(d))}</span>
            <div class="word-big">${esc(it.w)}</div>
            <div class="word-meta">
              ${it.ph ? `<span>${esc(it.ph)}</span>` : ""}<span>${esc(it.pos)}</span>
              <button class="speak" data-say="${esc(it.w)}" aria-label="发音">🔊</button>
            </div>
            ${DOODLES[d.idx % DOODLES.length]}
          </div>
          <div class="face back">
            <div class="verdict ${answered && !answered.ok ? "no" : ""}">${answered ? (answered.ok ? "Nice! 答对啦 ✓" : "差一点～ 1–3 天后再考你") : ""}</div>
            <div class="ans">${esc(it.w)}<small>${esc(it.pos)}</small></div>
            <div class="ans" style="font-size:18px">${esc(it.zh)}</div>
            ${it.ex ? `<p class="ex">${highlight(it.ex, it.w)}</p>` : ""}
            ${it.tip ? `<p class="tipline">${esc(it.tip)}</p>` : ""}
          </div>
        </div>
      </div>
      <div class="options">
        ${it.options.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${"ABCD"[i]}</span>${esc(o)}</button>`).join("")}
      </div>
      <div class="quiz-foot">
        <span class="hand-note">${answered ? "点卡片可以翻回去看单词" : "选出正确的中文意思"}</span>
        ${answered ? `<button class="btn" id="nextBtn">${d.idx === d.set.length - 1 ? "完成 ✓" : "下一个 →"}</button>` : ""}
      </div>`;

    if (answered) paintOptions(it, answered.choice);
    box.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => answer(+b.dataset.i)));
    $("#flip").addEventListener("click", (e) => { if (!e.target.closest(".speak") && d.answers[d.idx]) $("#flip").classList.toggle("flipped"); });
    $("#nextBtn")?.addEventListener("click", next);
  }

  function paintOptions(it, choice) {
    document.querySelectorAll("#quiz .opt").forEach((b, i) => {
      b.disabled = true;
      if (i === it.answer) b.classList.add("right");
      else if (i === choice) b.classList.add("wrong");
      else b.classList.add("dim");
    });
  }

  function answer(choice) {
    const d = day();
    if (d.answers[d.idx]) return;
    const it = d.set[d.idx];
    const ok = choice === it.answer;
    d.answers[d.idx] = { w: it.w, ok, choice };
    S.stats.answered++;
    if (ok) S.stats.correct++;
    S.seen[it.w] ||= TODAY;
    const entry = { w: it.w, ph: it.ph, pos: it.pos, zh: it.zh, ex: it.ex, tip: it.tip, like: it.like };
    if (ok) {
      delete S.queue[it.w];                         // right → done, no more tests
      if (S.notebook[it.w]) S.notebook[it.w].status = "mastered";
    } else {
      const again = rand(1, 3);                      // wrong → test again within 3 days
      S.queue[it.w] = { due: addDays(TODAY, again), src: "wrong", entry };
      d.answers[d.idx].again = again;
      bookAdd(it.w, entry, "wrong");
    }
    save();
    renderQuiz();
    $("#flip").classList.remove("flipped");
    requestAnimationFrame(() => setTimeout(() => $("#flip")?.classList.add("flipped"), 380));
    renderNotebook();
    renderStats();
  }

  function next() {
    const d = day();
    d.idx++;
    if (d.idx >= d.set.length) d.wordsDone = true;
    save();
    renderQuiz();
    renderProgress();
  }

  function renderSummary() {
    const d = day();
    const r0 = roundStart(d);
    const round = d.set.slice(r0);
    const okN = d.answers.slice(r0).filter((a) => a && a.ok).length;
    const extra = d.set.length - 5;
    $("#quiz").innerHTML = `
      <div class="summary">
        <div class="stamp">${r0 ? "BONUS" : "DONE"}<small>${okN} / ${round.length}</small></div>
        ${extra > 0 ? `<p class="hand-note" style="margin:-4px 0 10px">今天已经多学了 ${extra} 个词，厉害！</p>` : ""}
        <ul class="sum-list">
          ${round.map((it, k) => {
            const i = r0 + k;
            const a = d.answers[i] || {};
            return `<li><span class="mk ${a.ok ? "ok" : "bad"}">${a.ok ? "✓" : "✗"}</span><b>${esc(it.w)}</b><span class="zh">${esc(it.zh)}</span>${a.ok ? "" : `<span class="again">${a.again || 1} 天后再考</span>`}</li>`;
          }).join("")}
        </ul>
        <div class="sum-actions">
          <button class="btn" id="moreBtn">＋ 再学 5 个新词</button>
          <button class="btn ghost small" id="redoBtn">再过一遍（不计分）</button>
        </div>
      </div>`;
    $("#redoBtn").addEventListener("click", practice);
    $("#moreBtn").addEventListener("click", moreWords);
  }

  // bonus round: 5 more brand-new words (no reviews), counted toward "learned"
  function moreWords() {
    const d = day();
    const inSet = new Set(d.set.map((it) => it.w));
    const pick = [];
    const pattern = ["mkt", "confuse", "adv", "mkt", "confuse", "adv"];
    let p = 0, guard = 0;
    while (pick.length < 5 && guard++ < 40) {
      const kind = pattern[p++ % pattern.length];
      const e = shuffle(BANK[kind].filter((e) => !S.seen[e.w] && !inSet.has(e.w) && !S.queue[e.w] && !(e.like && inSet.has(e.like))))[0];
      if (e) { inSet.add(e.w); pick.push(makeItem(e, kind)); }
    }
    if (!pick.length) return toast("词库里的新词都学完啦，明天再来复习 🌷");
    d.set.push(...pick);
    d.idx = d.set.length - pick.length;
    save();
    renderQuiz();
    renderHome();
  }

  // practice mode: flip through today's cards again without affecting the schedule
  function practice() {
    const d = day();
    const r0 = roundStart(d);
    const cards = d.set.slice(r0);
    let i = 0;
    const show = () => {
      const it = cards[i];
      $("#quiz").innerHTML = `
        <div class="flip" id="flip"><div class="flip-inner">
          <div class="face front"><span class="counter">${i + 1} / ${cards.length}</span><div class="word-big">${esc(it.w)}</div>
            <div class="word-meta"><span>${esc(it.ph)}</span><button class="speak" data-say="${esc(it.w)}">🔊</button></div>${DOODLES[i % DOODLES.length]}</div>
          <div class="face back"><div class="ans">${esc(it.zh)}</div>${it.ex ? `<p class="ex">${highlight(it.ex, it.w)}</p>` : ""}${it.tip ? `<p class="tipline">${esc(it.tip)}</p>` : ""}</div>
        </div></div>
        <div class="quiz-foot"><span class="hand-note">点卡片翻面</span>
          <span><button class="btn ghost small" id="pExit">退出</button> <button class="btn small" id="pNext">${i < cards.length - 1 ? "下一张 →" : "结束"}</button></span></div>`;
      $("#flip").addEventListener("click", (e) => { if (!e.target.closest(".speak")) $("#flip").classList.toggle("flipped"); });
      $("#pExit").addEventListener("click", renderSummary);
      $("#pNext").addEventListener("click", () => (++i < cards.length ? show() : renderSummary()));
    };
    show();
  }

  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-say]");
    if (s) { e.stopPropagation(); speak(s.dataset.say); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea") || $('[data-view="words"]').hidden) return;
    const d = day();
    if (!d.set || d.idx >= d.set.length) return;
    if (!d.answers[d.idx] && "1234".includes(e.key)) answer(+e.key - 1);
    else if (d.answers[d.idx] && e.key === "Enter") next();
  });

  /* ═════════════ dictionary ═════════════ */
  // fetch with a hard timeout so one slow source never blocks the result
  async function fetchJ(url, ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) throw new Error(String(r.status));
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const stripTags = (s) => String(s || "").replace(/<[^>]+>/g, "");

  async function gtx(q, sl, tl, extra = false) {
    const dts = ["t", "bd"].concat(extra ? ["md", "ex"] : []).map((d) => `&dt=${d}`).join("");
    const j = await fetchJ(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}${dts}&dj=1&q=${encodeURIComponent(q)}`, 3500);
    return {
      text: (j.sentences || []).map((s) => s.trans || "").join("").trim(),
      dict: (j.dict || []).map((d) => ({ pos: d.pos, terms: (d.terms || []).slice(0, 5) })),
      defs: (j.definitions || []).flatMap((d) => (d.entry || []).slice(0, 2).map((e) => ({ pos: d.pos, def: e.gloss, eg: stripTags(e.example) }))).slice(0, 4),
      examples: ((j.examples && j.examples.example) || []).map((e) => stripTags(e.text)).slice(0, 3),
    };
  }
  async function myMemory(q, sl, tl) {
    const j = await fetchJ(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${sl}|${tl}`, 3500);
    return { text: j?.responseData?.translatedText || "", dict: [], defs: [], examples: [] };
  }
  // first source that answers wins: Google straight away, MyMemory joins in if Google is slow (>1.2s) or fails
  function translate(q, sl, tl, extra = false) {
    const empty = { text: "", dict: [], defs: [], examples: [] };
    return new Promise((resolve) => {
      let done = false, failures = 0, mmStarted = false;
      const finish = (r) => { if (!done) { done = true; resolve(r); } };
      const bad = () => { if (++failures >= 2) finish(empty); };
      const startMM = () => {
        if (mmStarted || done) return;
        mmStarted = true;
        myMemory(q, sl === "zh-CN" ? "zh-CN" : "en", tl).then((r) => (r.text ? finish(r) : bad()), bad);
      };
      gtx(q, sl, tl, extra).then((r) => (r.text || r.dict.length ? finish(r) : (bad(), startMM())), () => { bad(); startMM(); });
      setTimeout(startMM, 1200);
      setTimeout(() => finish(empty), 4000);
    });
  }
  async function englishEntry(w) {
    try {
      const j = await fetchJ(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`, 4000);
      const first = j[0] || {};
      const phs = j.flatMap((e) => e.phonetics || []);
      const ph = first.phonetic || (phs.find((p) => p.text) || {}).text || "";
      const audio = (phs.find((p) => p.audio && /-(au|uk)\.mp3/.test(p.audio)) || phs.find((p) => p.audio) || {}).audio || "";
      const defs = [];
      for (const e of j) for (const m of e.meanings || []) for (const d of m.definitions || []) {
        if (defs.length < 4 && defs.filter((y) => y.pos === m.partOfSpeech).length < 2) defs.push({ pos: m.partOfSpeech, def: d.definition, eg: d.example || "" });
      }
      return { ph, audio, defs };
    } catch (e) { return null; }
  }

  const POS_ZH = { noun: "n.", verb: "v.", adjective: "adj.", adverb: "adv.", preposition: "prep.", conjunction: "conj.", pronoun: "pron.", interjection: "int.", abbreviation: "abbr.", phrase: "phr." };

  // per-browser cache: a word you've looked up before shows instantly
  const DKEY = "zoey-english-desk.dict";
  let DCACHE = {};
  try { DCACHE = JSON.parse(localStorage.getItem(DKEY) || "{}"); } catch (e) {}
  function cachePut(k, v) {
    DCACHE[k] = v;
    const keys = Object.keys(DCACHE);
    if (keys.length > 400) delete DCACHE[keys[0]];
    try { localStorage.setItem(DKEY, JSON.stringify(DCACHE)); } catch (e) {}
  }

  // word book: every looked-up, saved or wrongly answered word
  function bookAdd(w, data, src) {
    const key = w.toLowerCase();
    const prev = S.notebook[key] || {};
    const srcs = new Set(prev.srcs || (prev.w ? ["lookup"] : []));
    srcs.add(src);
    S.notebook[key] = {
      w: key, ph: data.ph || prev.ph || "", pos: data.pos || prev.pos || "", zh: data.zh || prev.zh || "", ex: data.ex || prev.ex || "",
      added: prev.added || TODAY, last: Date.now(), status: "learning", srcs: [...srcs],
      wrong: (prev.wrong || 0) + (src === "wrong" ? 1 : 0),
    };
    save();
    renderBook();
    return S.notebook[key];
  }

  function addLookup(w, data, src = "lookup") {
    // data: { ph, pos, zh, ex }
    const key = w.toLowerCase();
    bookAdd(key, data, src);
    const inToday = (day().set || []).some((it) => it.w === key && !day().answers[day().set.indexOf(it)]);
    let days = null;
    if (S.notebook[key].zh && !inToday) {
      const q = S.queue[key];
      if (!q || q.src === "lookup") {
        days = q ? null : rand(1, 3);
        S.queue[key] = { due: q ? q.due : addDays(TODAY, days), src: q ? q.src : "lookup", entry: { ...S.notebook[key], tip: "你之前查过这个词" } };
      } else {
        S.queue[key].entry.zh = S.notebook[key].zh;
      }
    }
    save();
    renderNotebook();
    renderBook();
    renderStats();
    return days;
  }

  let lookupSeq = 0;
  async function lookup(raw) {
    const q = raw.trim();
    if (!q) return;
    const seq = ++lookupSeq;
    const out = $("#dictResult");
    const key = q.toLowerCase();

    if (isCJK(q)) {
      out.innerHTML = `<div class="dr-box"><div class="loading">查询中</div></div>`;
      const t = await translate(q, "zh-CN", "en");
      if (seq !== lookupSeq) return;
      const cands = [...new Set([...t.dict.flatMap((d) => d.terms), t.text].filter(Boolean))].slice(0, 8);
      out.innerHTML = `<div class="dr-box">
        <div class="dr-top"><h3>${esc(q)}</h3></div>
        <div class="dr-sec"><h5>英文表达 · 点击查看详情</h5>
          <div class="en-candidates">${cands.length ? cands.map((c) => `<button data-look="${esc(c)}">${esc(c)}</button>`).join("") : "没找到结果，换个说法试试"}</div>
        </div></div>`;
      return;
    }

    // r accumulates everything we know; render() is called each time a source answers
    const r = Object.assign({ zh: null, defs: [], examples: [], exZh: [], ph: "", audio: "" }, DCACHE[key] || {});
    let days = null, saved = false;
    const render = () => {
      if (seq !== lookupSeq) return;
      const chips = r.zh ? (r.zh.dict.length
        ? r.zh.dict.flatMap((d) => d.terms.slice(0, 4).map((term) => ({ pos: POS_ZH[d.pos] || d.pos, term })))
        : r.zh.text ? [{ pos: "", term: r.zh.text }] : []) : null;
      const bankEx = ENTRY[key]?.ex;
      const exs = [...new Set([...r.examples, ...r.defs.map((d) => d.eg).filter(Boolean), ...(bankEx ? [bankEx] : [])])].slice(0, 3);
      out.innerHTML = `<div class="dr-box">
        <div class="dr-top">
          <h3>${esc(q)}</h3>${r.ph ? `<span class="ph">${esc(r.ph)}</span>` : ""}
          <button class="speak" id="drSpeak" aria-label="发音">🔊</button>
          ${saved ? `<span class="dr-saved">✓ 已存入生词本${days ? `，${days} 天后考你` : ""}</span>` : ""}
        </div>
        <div class="dr-sec"><h5>中文释义</h5>${chips === null ? `<div class="loading">查询中</div>` : chips.length
          ? `<div class="zh-chips">${chips.map((c) => `<span class="zh-chip"><span class="pos">${esc(c.pos)}</span>${esc(c.term)}</span>`).join("")}</div>`
          : `<p class="dr-note">网络好像不太通，或者没有这个词 🤔</p>`}</div>
        ${exs.length ? `<div class="dr-sec"><h5>例句</h5><ul class="ex-list">
          ${exs.map((e, i) => `<li><span class="en">${highlight(e, key)}</span>${r.exZh[i] ? `<span class="zh">${esc(r.exZh[i])}</span>` : ""}<button class="speak sm" data-say="${esc(e)}" aria-label="朗读">🔊</button></li>`).join("")}
        </ul></div>` : ""}
        ${r.defs.length ? `<div class="dr-sec"><h5>English</h5><ol class="en-defs">
          ${r.defs.map((d) => `<li><span class="pos">${esc(d.pos)}</span>${esc(d.def)}</li>`).join("")}
        </ol></div>` : ""}
      </div>`;
      $("#drSpeak").addEventListener("click", (e) => {
        e.stopPropagation();
        speak(q, r.audio || null);
      });
      return exs;
    };
    const saveNow = () => {
      if (!r.zh || (!r.zh.text && !r.zh.dict.length)) return;
      const zh = r.zh.dict.length ? r.zh.dict[0].terms.slice(0, 2).join("；") : r.zh.text;
      const pos = r.zh.dict.length ? POS_ZH[r.zh.dict[0].pos] || "" : "";
      const ex = r.examples[0] || r.defs.find((d) => d.eg)?.eg || ENTRY[key]?.ex || "";
      const d = addLookup(key, { ph: r.ph, pos, zh, ex });
      if (!saved) days = d;
      saved = true;
    };
    let lastExs = [];
    const translateExamples = async (exs) => {
      if (!exs.length || exs.join("|") === lastExs.join("|")) return;
      lastExs = exs;
      // one small request per sentence, in parallel — robust and fast
      const lines = await Promise.all(exs.map((e) => translate(e, "en", "zh-CN").then((t) => t.text)));
      if (exs !== lastExs) return;
      r.examples = exs; r.exZh = lines;
      render();
      cachePut(key, { zh: r.zh, defs: r.defs, examples: exs, exZh: lines, ph: r.ph, audio: r.audio });
    };

    const first = render();
    if (r.zh) { saveNow(); render(); if (!r.exZh.length) translateExamples(first || []); }

    // Chinese meaning — the part that has to be fast
    const zhP = translate(q, "en", "zh-CN", true).then((t) => {
      r.zh = { text: t.text, dict: t.dict };
      if (t.examples.length) r.examples = t.examples;
      if (t.defs.length && !r.defs.length) r.defs = t.defs;
      saveNow();
      cachePut(key, { zh: r.zh, defs: r.defs, examples: r.examples, exZh: r.exZh, ph: r.ph, audio: r.audio });
      const exs = render();
      translateExamples(exs || []);
    });
    // phonetic, audio, extra definitions/examples — fills in whenever it arrives
    const enP = englishEntry(q).then((en) => {
      if (!en) return;
      r.ph = en.ph || r.ph; r.audio = en.audio || r.audio;
      if (!r.defs.length || r.defs.every((d) => !d.eg)) r.defs = en.defs;
      if (S.notebook[key] && r.ph) S.notebook[key].ph = r.ph;
      const exs = render();
      if (r.zh) translateExamples(exs || []);
    });
    await Promise.allSettled([zhP, enP]);
    if (r.zh && (r.zh.text || r.zh.dict.length)) cachePut(key, { zh: r.zh, defs: r.defs, examples: r.examples, exZh: r.exZh, ph: r.ph, audio: r.audio });
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-look]");
    if (!b) return;
    $("#dictInput").value = b.dataset.look;
    lookup(b.dataset.look);
    if (b.closest(".pop")) { closePop(); go("dict", false); }
  });
  $("#dictForm").addEventListener("submit", (e) => { e.preventDefault(); lookup($("#dictInput").value); $("#dictInput").blur(); });

  function renderNotebook() {
    const list = Object.values(S.notebook).filter((n) => !n.srcs || n.srcs.includes("lookup")).sort((a, b) => (b.last || 0) - (a.last || 0));
    $("#nbCount").textContent = list.length ? `· ${list.length} 个` : "";
    $("#nbList").innerHTML = list.length ? list.slice(0, 5).map((n) => {
      const q = S.queue[n.w];
      const st = n.status === "mastered" ? `<span class="st m">已掌握</span>` : q ? `<span class="st">${q.due <= TODAY ? "今天考" : `${q.due.slice(5).replace("-", "/")} 考`}</span>` : "";
      return `<li><span class="w" data-look="${esc(n.w)}">${esc(n.w)}</span><span class="z">${esc(n.zh) || "（无释义）"}</span>${st}<button class="x" data-del="${esc(n.w)}" aria-label="删除">×</button></li>`;
    }).join("") : `<li class="empty">还没有查过词～ 查过的词会出现在这里</li>`;
  }

  /* ═════════════ word book ═════════════ */
  let bookFilter = "all";
  let bookOpen = null;
  const srcsOf = (n) => n.srcs || ["lookup"];
  function renderBook() {
    const all = Object.values(S.notebook).sort((a, b) => (b.last || 0) - (a.last || 0));
    const isDue = (n) => n.status !== "mastered" && S.queue[n.w];
    const counts = {
      all: all.length,
      wrong: all.filter((n) => srcsOf(n).includes("wrong")).length,
      lookup: all.filter((n) => srcsOf(n).some((x) => x !== "wrong")).length,
      due: all.filter(isDue).length,
      mastered: all.filter((n) => n.status === "mastered").length,
    };
    $("#homeBook").innerHTML = `
      <div><b>${counts.all}</b><small>全部</small></div>
      <div><b>${counts.wrong}</b><small>答错过</small></div>
      <div><b>${counts.lookup}</b><small>查过/收藏</small></div>
      <div><b>${counts.due}</b><small>待复习</small></div>`;
    $("#bookCount").textContent = `${counts.all} 个`;
    document.querySelectorAll("#bookSeg button").forEach((b) => b.classList.toggle("on", b.dataset.f === bookFilter));
    const list = all.filter((n) =>
      bookFilter === "all" ? true :
      bookFilter === "wrong" ? srcsOf(n).includes("wrong") :
      bookFilter === "lookup" ? srcsOf(n).some((x) => x !== "wrong") :
      bookFilter === "due" ? isDue(n) : n.status === "mastered");
    const TAG = { wrong: ["t-wrong", "答错"], lookup: ["t-look", "查过"], news: ["t-news", "新闻"], picture: ["t-pic", "看图"] };
    $("#bookList").innerHTML = list.length ? list.map((n) => {
      const q = S.queue[n.w];
      const state = n.status === "mastered" ? `<span class="bst m">已掌握</span>` : q ? `<span class="bst">${q.due <= TODAY ? "今天复习" : `${q.due.slice(5).replace("-", "/")} 复习`}</span>` : "";
      const tags = srcsOf(n).map((s) => TAG[s] ? `<span class="btag ${TAG[s][0]}">${TAG[s][1]}${s === "wrong" && n.wrong > 1 ? ` ×${n.wrong}` : ""}</span>` : "").join("");
      const open = bookOpen === n.w;
      return `<li class="${open ? "open" : ""}" data-w="${esc(n.w)}">
        <div class="b-row">
          <div class="b-main"><b>${esc(n.w)}</b>${n.ph ? `<span class="b-ph">${esc(n.ph)}</span>` : ""}<div class="b-zh">${esc(n.pos)} ${esc(n.zh) || "（无释义）"}</div></div>
          <div class="b-side">${state}<div class="b-tags">${tags}</div></div>
        </div>
        ${open ? `<div class="b-more">
          ${n.ex ? `<p>${highlight(n.ex, n.w)}</p>` : ""}
          <div class="b-actions">
            <button class="btn ghost small" data-say="${esc(n.w)}">🔊 发音</button>
            <button class="btn ghost small" data-look="${esc(n.w)}">查词典</button>
            ${n.status === "mastered" ? `<button class="btn ghost small" data-relearn="${esc(n.w)}">重新学</button>` : `<button class="btn ghost small" data-master="${esc(n.w)}">标记已掌握</button>`}
            <button class="btn ghost small del" data-del="${esc(n.w)}">删除</button>
          </div>
        </div>` : ""}
      </li>`;
    }).join("") : `<li class="empty">${bookFilter === "all" ? "答错的词、查过的词、在新闻里收藏的词都会出现在这里" : "这里还没有词"}</li>`;
  }
  $("#bookSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    bookFilter = b.dataset.f;
    renderBook();
  });
  $("#bookList").addEventListener("click", (e) => {
    const t = e.target;
    const attr = (name) => t.closest(`[data-${name}]`)?.dataset[name];
    if (attr("del")) {
      const k = attr("del");
      delete S.notebook[k];
      if (S.queue[k]?.src !== "wrong") delete S.queue[k];
      save(); renderBook(); renderNotebook(); renderStats();
      return toast("已删除");
    }
    if (attr("master")) {
      const k = attr("master");
      S.notebook[k].status = "mastered"; delete S.queue[k];
      save(); renderBook(); renderStats();
      return toast("已标记为掌握，不再考这个词");
    }
    if (attr("relearn")) {
      const k = attr("relearn");
      addLookup(k, S.notebook[k], srcsOf(S.notebook[k])[0]);
      return toast("好的，1–3 天内会再考你");
    }
    if (t.closest("[data-say]")) return;
    if (t.closest("[data-look]")) { go("dict", false); return; }
    const li = t.closest("li[data-w]");
    if (li) { bookOpen = bookOpen === li.dataset.w ? null : li.dataset.w; renderBook(); }
  });

  $("#nbList").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (!del) return;
    const w = del.dataset.del;
    delete S.notebook[w];
    if (S.queue[w]?.src === "lookup") delete S.queue[w];
    save();
    renderNotebook();
    renderBook();
    renderStats();
  });

  /* ═════════════ news ═════════════ */
  const CAT = {
    world: { label: "🌏 国际", chip: "chip-lav", emo: "🌏", c1: "#cddde8", c2: "#cddde8" },
    australia: { label: "🦘 澳洲", chip: "chip-mint", emo: "🦘", c1: "#d3e3b6", c2: "#d3e3b6" },
    entertainment: { label: "🎬 娱乐", chip: "chip-pink", emo: "🎬", c1: "#f3b8bf", c2: "#f3b8bf" },
    markets: { label: "📈 市场", chip: "chip-lime", emo: "📈", c1: "#f1d27f", c2: "#f1d27f" },
    china: { label: "🇨🇳 国内", chip: "chip-pink", emo: "🏮", c1: "#eba07e", c2: "#eba07e" },
  };

  let LANG = "en";
  try { LANG = localStorage.getItem("zoey-english-desk.lang") || "en"; } catch (e) {}
  let newsDate = TODAY;
  let newsData = null;

  function art(cat, i) {
    const c = CAT[cat] || CAT.world;
    return `<div class="ni-art" style="background:linear-gradient(140deg, ${c.c1}, ${c.c2})">
      <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" style="filter:url(#wobble)">
        <circle cx="${60 + i * 70}" cy="50" r="38" fill="rgba(255,255,255,.35)"/>
        <circle cx="250" cy="${150 - i * 20}" r="60" fill="rgba(255,255,255,.25)"/>
      </svg>
      <span class="emo">${c.emo}</span></div>`;
  }

  function markVocab(text, vocab) {
    let html = esc(text);
    for (const v of vocab || []) {
      const w = v.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(new RegExp(`\\b(${w}\\w*)`, "i"), `<span class="vocab" data-v="${esc(v.word)}">$1</span>`);
    }
    // wrap every remaining English word so it can be tapped
    return html.replace(/(<[^>]+>)|([A-Za-z][A-Za-z'’-]*[A-Za-z]|[A-Za-z])/g, (m, tag, word) => (tag ? tag : `<span class="tw">${word}</span>`));
  }
  const paras = (text) => {
    // split 5–6 sentences into two short paragraphs for easier reading
    const s = text.match(/[^.!?。！？]+[.!?。！？]+["”’]?\s*/g) || [text];
    const half = Math.ceil(s.length / 2);
    return [s.slice(0, half).join(""), s.slice(half).join("")].filter((x) => x.trim());
  };

  // "30 秒看懂" card for politics / economy news
  function explainCard(x) {
    const REL = { good: ["rel-good", "🤝"], bad: ["rel-bad", "⚡"], neutral: ["rel-mid", "🤔"], cause: ["rel-cause", "→"] };
    return `<div class="explain">
      <div class="ex-head">🧩 30 秒看懂</div>
      ${x.one_liner ? `<p class="ex-one"><b>一句话：</b>${esc(x.one_liner)}</p>` : ""}
      ${x.facts?.length ? `<div class="ex-sec"><h6>先知道这几件事</h6><ul class="ex-facts">
        ${x.facts.map((f) => `<li><span class="ic">${esc(f.icon || "•")}</span><span><b>${esc(f.name)}</b>　${esc(f.text)}</span></li>`).join("")}
      </ul></div>` : ""}
      ${x.relations?.length ? `<div class="ex-sec"><h6>${x.relations.every((r) => r.type === "cause") ? "前因后果" : "人物关系"}</h6><div class="ex-rels">
        ${x.relations.map((r) => { const [c, ic] = REL[r.type] || REL.neutral; return `<div class="ex-rel ${c}"><span class="node">${esc(r.a)}</span><span class="link">${ic} ${esc(r.label || "")}</span><span class="node">${esc(r.b)}</span></div>`; }).join("")}
      </div></div>` : ""}
      ${x.points?.length ? `<div class="ex-sec"><h6>这次发生了什么</h6><ol class="ex-points">${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div>` : ""}
      ${x.relevance ? `<div class="ex-sec"><h6>跟我有什么关系</h6><p>${esc(x.relevance)}</p></div>` : ""}
      ${x.phrase ? `<p class="ex-phrase"><b>学一个表达：</b><i>${esc(x.phrase.en)}</i> = ${esc(x.phrase.zh)}</p>` : ""}
    </div>`;
  }

  function readKey(i) { return `${newsData.date}#${i}`; }

  function renderNews() {
    const list = $("#newsList");
    document.querySelectorAll("#langSeg button").forEach((b) => b.classList.toggle("on", b.dataset.lang === LANG));
    $('[data-view="news"]').classList.toggle("both", LANG === "both");
    $("#newsNext").disabled = newsDate >= TODAY;
    if (!newsData) {
      list.innerHTML = `<div class="news-empty">这一天没有热点存档 🌙</div>`;
      $("#newsDate").textContent = newsDate.slice(5).replace("-", "/");
      return;
    }
    $("#newsDate").textContent = newsData.date.slice(5).replace("-", "/") + (newsData.date === TODAY ? " · 今天" : "");
    const d = day();
    const late = newsDate === TODAY && newsData.date !== TODAY;
    list.innerHTML = (late ? `<p class="hand-note" style="margin:0">今天的热点 9:00 前更新，先看看 ${newsData.date.slice(5).replace("-", "/")} 的</p>` : "") +
      newsData.items.map((it, i) => {
        const c = CAT[it.category] || CAT.world;
        const read = d.newsRead.includes(readKey(i));
        const en = paras(it.summary_en).map((p) => `<p class="en-p">${markVocab(p, it.vocab)}</p>`);
        const zh = paras(it.summary_zh).map((p) => `<p class="zh-p">${esc(p)}</p>`);
        let body;
        if (LANG === "en") body = en.join("");
        else if (LANG === "zh") body = zh.join("");
        else body = en.map((p, k) => p + (zh[k] || "")).join("") + zh.slice(en.length).join("");
        return `<article class="news-item ${read ? "read" : ""}" data-i="${i}">
          <div class="ni-img">${it.image ? `<img src="${esc(it.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">${it.image_credit ? `<span class="credit">${esc(it.image_credit)}</span>` : ""}` : ""}${art(it.category, i)}</div>
          <div class="ni-body">
            <div class="ni-meta"><span class="chip ${c.chip}">${c.label}</span><span>${esc(it.source || "")}</span></div>
            <h3>${esc(LANG === "zh" ? it.title_zh : it.title_en)}</h3>
            <h4>${esc(LANG === "zh" ? it.title_en : it.title_zh)}</h4>
            ${it.explain ? explainCard(it.explain) + `<div class="read-label">读一读 · ${LANG === "zh" ? "中文" : LANG === "en" ? "English" : "双语"}</div>` : ""}
            <div class="ni-text">${body}</div>
            ${it.why_zh && !it.explain ? `<div class="ni-why">${esc(it.why_zh)}</div>` : ""}
            <div class="ni-foot">
              <div class="ni-links">
                ${it.url ? `<a href="${esc(it.url)}" target="_blank" rel="noopener">原文 ↗</a>` : ""}
              </div>
              <button class="btn small read-btn ${read ? "on" : ""}" data-read="${i}">${read ? "✓ 已读" : "读完了，打卡"}</button>
            </div>
          </div>
        </article>`;
      }).join("");
    // images sit above the illustration; hide the art when an image loads
    list.querySelectorAll(".ni-img img").forEach((img) => img.addEventListener("load", () => img.parentElement.querySelector(".ni-art")?.remove()));
  }

  async function fetchJSON(url) {
    try { const r = await fetch(url, { cache: "no-cache" }); return r.ok ? await r.json() : null; } catch (e) { return null; }
  }
  async function loadNews(date) {
    newsDate = date;
    let data = await fetchJSON(`news/${date}.json`);
    if (!data && date === TODAY) data = await fetchJSON("news/latest.json");
    newsData = data && Array.isArray(data.items) ? data : null;
    if (newsData) {
      for (const it of newsData.items) for (const v of it.vocab || []) {
        const w = v.word.toLowerCase();
        if (!S.newsVocab[w] && !ENTRY[w]) S.newsVocab[w] = { date: newsData.date, entry: { w, ph: v.phonetic || "", pos: v.pos || "", zh: v.zh, ex: v.example || "", tip: `来自 ${newsData.date.slice(5).replace("-", "/")} 的新闻：${it.title_zh}` } };
      }
      save();
    }
    renderNews();
    renderHome();
  }

  $("#langSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    LANG = b.dataset.lang;
    try { localStorage.setItem("zoey-english-desk.lang", LANG); } catch (err) {}
    renderNews();
  });
  $("#newsPrev").addEventListener("click", async () => {
    const from = newsData ? newsData.date : newsDate;
    for (let k = 1; k <= 7; k++) {
      const d = addDays(from, -k);
      if (await fetchJSON(`news/${d}.json`)) return loadNews(d);
    }
    toast("没有更早的热点了");
  });
  $("#newsNext").addEventListener("click", async () => {
    const from = newsData ? newsData.date : newsDate;
    for (let k = 1; k <= 7; k++) {
      const d = addDays(from, k);
      if (d > TODAY) break;
      if (await fetchJSON(`news/${d}.json`)) return loadNews(d);
    }
    loadNews(TODAY);
  });

  $("#newsList").addEventListener("click", (e) => {
    const rb = e.target.closest("[data-read]");
    if (rb) {
      const d = day();
      const k = readKey(+rb.dataset.read);
      if (!d.newsRead.includes(k)) d.newsRead.push(k);
      else d.newsRead = d.newsRead.filter((x) => x !== k);
      save();
      renderNews();
      renderProgress();
      return;
    }
    const v = e.target.closest(".vocab");
    const tw = e.target.closest(".tw");
    if (!v && !tw) return;
    e.stopPropagation();
    const item = newsData.items[+(v || tw).closest(".news-item").dataset.i];
    const voc = v && item.vocab.find((x) => x.word === v.dataset.v);
    // a plain word inside a highlighted phrase still opens the phrase
    if (voc) return wordPop(v, voc.word, { ph: voc.phonetic, pos: voc.pos, zh: voc.zh, ex: voc.example });
    const word = tw.textContent.replace(/[’']s$/, "");
    const p = tw.closest("p");
    const sentence = (p?.textContent.match(new RegExp(`[^.!?]*\\b${word.replace(/[^A-Za-z'’-]/g, "")}\\b[^.!?]*[.!?]`, "i")) || [""])[0].trim();
    wordPop(tw, word, null, sentence);
  });

  const tCache = {};
  async function wordPop(anchor, word, known, sentence = "") {
    document.querySelectorAll(".tw.on, .vocab.on").forEach((x) => x.classList.remove("on"));
    anchor.classList.add("on");
    const key = word.toLowerCase();
    let data = known;
    if (!data) {
      showPop(anchor, word, `<b>${esc(word)}</b><br><span class="loading">翻译中</span>`, null);
      if (!tCache[key]) {
        const t = await translate(word, "en", "zh-CN");
        tCache[key] = {
          zh: t.dict.length ? t.dict.slice(0, 2).map((d) => `${POS_ZH[d.pos] || d.pos} ${d.terms.slice(0, 3).join("；")}`).join("　") : t.text,
          short: t.dict.length ? t.dict[0].terms.slice(0, 2).join("；") : t.text,
          pos: t.dict.length ? POS_ZH[t.dict[0].pos] || "" : "",
        };
      }
      if (!anchor.classList.contains("on")) return; // user tapped something else meanwhile
      const c = tCache[key];
      data = { pos: c.pos, zh: c.short, ex: sentence, display: c.zh };
    }
    const html = `<b>${esc(word)}</b> ${esc(data.ph || "")} ${data.display ? "" : `<i>${esc(data.pos || "")}</i>`}<br>${esc(data.display || data.zh || "没查到")}`;
    showPop(anchor, word, html, data.zh ? data : null);
  }

  function showPop(anchor, word, html, saveData) {
    closePop(true);
    const key = word.toLowerCase();
    const inBook = !!S.notebook[key];
    const p = document.createElement("div");
    p.className = "pop";
    p.innerHTML = `${html}<div class="row2"><button data-say="${esc(word)}">🔊 发音</button>${saveData ? `<button data-addnb ${inBook ? "disabled" : ""}>${inBook ? "✓ 已在单词本" : "＋ 记到单词本"}</button>` : ""}<button data-look="${esc(word)}">详细</button></div>`;
    document.body.appendChild(p);
    const r = anchor.getBoundingClientRect();
    const left = Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - p.offsetWidth - 12);
    p.style.left = Math.max(12, left) + "px";
    p.style.top = window.scrollY + r.bottom + 8 + "px";
    p.querySelector("[data-addnb]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const days = addLookup(key, saveData, "news");
      toast(`已记到单词本${days ? `，${days} 天后考你` : ""}`);
      closePop();
    });
    setTimeout(() => document.addEventListener("click", outside), 0);
  }
  function outside(e) { if (!e.target.closest(".pop")) closePop(); }
  function closePop(keepMark) {
    document.querySelector(".pop")?.remove();
    document.removeEventListener("click", outside);
    if (!keepMark) document.querySelectorAll(".tw.on, .vocab.on").forEach((x) => x.classList.remove("on"));
  }

  /* ═════════════ progress / calendar ═════════════ */
  const newsCount = (d) => Math.min(3, (d?.newsRead || []).length);
  const status = (d) => {
    if (!d) return "";
    const w = !!d.wordsDone, n = newsCount(d) >= 3;
    if (w && n) return "full";
    if (w || n || (d.answers || []).length || newsCount(d)) return "part";
    return "";
  };

  function renderProgress() {
    const d = day();
    const wDone = d.set ? d.answers.filter(Boolean).length : 0;
    $("#pWords").textContent = `${Math.min(wDone, 5)}/5`;
    $("#pNews").textContent = `${newsCount(d)}/3`;
    $("#pillWords").classList.toggle("done", !!d.wordsDone);
    $("#pillNews").classList.toggle("done", newsCount(d) >= 3);
    if (status(d) === "full" && !d.celebrated) {
      d.celebrated = true;
      save();
      $("#celebrateDate").textContent = TODAY.slice(5).replace("-", "/");
      $("#celebrate").hidden = false;
    }
    renderCalendar();
    renderStats();
    renderHome();
  }
  $("#celebrate").addEventListener("click", () => ($("#celebrate").hidden = true));

  let calMonth = new Date(); calMonth.setDate(1);
  function renderCalendar() {
    const y = calMonth.getFullYear(), m = calMonth.getMonth();
    $("#calTitle").textContent = `${y} 年 ${m + 1} 月`;
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const daysIn = new Date(y, m + 1, 0).getDate();
    const cells = ["一", "二", "三", "四", "五", "六", "日"].map((w) => `<div class="wd">${w}</div>`);
    const total = Math.ceil((offset + daysIn) / 7) * 7;
    for (let i = 0; i < total; i++) {
      const d = new Date(y, m, i - offset + 1);
      const key = ymd(d);
      const out = d.getMonth() !== m;
      const cls = [out ? "out" : "", out ? "" : status(S.days[key]), key === TODAY ? "today" : ""].join(" ");
      cells.push(`<div class="cal-day ${cls}" title="${key}"><span>${d.getDate()}</span></div>`);
    }
    $("#calGrid").innerHTML = cells.join("");
    const now = new Date();
    $("#calNext").disabled = y === now.getFullYear() && m === now.getMonth();
  }
  $("#calPrev").addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCalendar(); });
  $("#calNext").addEventListener("click", () => { calMonth.setMonth(calMonth.getMonth() + 1); renderCalendar(); });

  function renderStats() {
    let streak = 0;
    let cur = status(S.days[TODAY]) === "full" ? TODAY : addDays(TODAY, -1);
    while (status(S.days[cur]) === "full") { streak++; cur = addDays(cur, -1); }
    $("#streakNum").textContent = streak;
    $("#statDays").textContent = Object.values(S.days).filter((d) => status(d) === "full").length;
    $("#statWords").textContent = Object.keys(S.seen).length;
    $("#statAcc").textContent = S.stats.answered ? Math.round((S.stats.correct / S.stats.answered) * 100) + "%" : "–";
    $("#statQueue").textContent = Object.keys(S.queue).length;
  }

  /* ═════════════ picture → speak ═════════════ */
  const THEMES = window.PIC_THEMES || [];
  S.pic ||= { seen: {}, next: 0, right: 0, total: 0 };
  S.pic.retry ||= [];          // groups to re-test: [{ due, words: [...] }]
  let PS = null; // current session
  const THEME_OF = {};
  const indexThemes = () => { for (const t of THEMES) for (const it of t.items) THEME_OF[it.w] = t; };
  indexThemes();
  const unseenIn = (t) => t.items.filter((it) => !S.pic.seen[it.w]);
  const unseenTotal = () => THEMES.reduce((n, t) => n + unseenIn(t).length, 0);

  // 4 English options from the item's own theme, look-alikes first (spill vs splash…)
  function optionsFor(it) {
    const others = THEME_OF[it.w].items.filter((o) => o.w !== it.w);
    const near = others.filter((o) => (it.near || []).includes(o.w));
    const pick = [...shuffle(near), ...shuffle(others.filter((o) => !near.includes(o)))].slice(0, 3).map((o) => o.w);
    return shuffle([it.w, ...pick]);
  }

  // what the next round will be (also used by the home tile)
  function planPicRound() {
    // 1) a group where you missed 3+ comes back once within 3 days
    const due = S.pic.retry.filter((r) => r.due <= TODAY).sort((a, b) => a.due.localeCompare(b.due))[0];
    if (due) {
      const items = due.words.map((w) => THEMES.flatMap((t) => t.items).find((it) => it.w === w)).filter(Boolean);
      if (items.length) return { label: { icon: "🔁", name: "复习上次错得多的那组" }, items, retry: due };
    }
    // 2) only pictures you've never seen: next theme (in rotation) that still has new ones
    for (let k = 0; k < THEMES.length; k++) {
      const t = THEMES[(S.pic.next + k) % THEMES.length];
      const fresh = shuffle(unseenIn(t));
      if (!fresh.length) continue;
      let items = fresh.slice(0, 5);
      let label = { icon: t.icon, name: t.name };
      if (items.length < 5) { // top up with new pictures from other themes
        const more = shuffle(THEMES.filter((o) => o !== t).flatMap(unseenIn)).slice(0, 5 - items.length);
        items = items.concat(more);
        if (more.length) label = { icon: "🎲", name: "混合" };
      }
      return { label, items, themeIndex: (S.pic.next + k) % THEMES.length };
    }
    // 3) everything seen: least-practised as a stopgap until new themes arrive
    const all = THEMES.flatMap((t) => t.items).sort((a, b) => (S.pic.seen[a.w] || 0) - (S.pic.seen[b.w] || 0) || Math.random() - 0.5);
    return { label: { icon: "📚", name: "温故知新" }, items: all.slice(0, 5), exhausted: true };
  }

  function newPicSession() {
    const plan = planPicRound();
    if (plan.themeIndex !== undefined) S.pic.next = plan.themeIndex;
    PS = { ...plan, opts: plan.items.map(optionsFor), idx: 0, res: [] };
  }

  function picImg(it) {
    return it.svg ? `<div class="pic-img">${it.svg}</div>` : `<div class="pic-img emoji">${it.emoji}</div>`;
  }

  function renderPicSteps() {
    $("#picSteps").innerHTML = PS ? PS.items.map((_, i) => {
      const r = PS.res[i];
      return `<i class="${r ? (r.ok === "wrong" ? "bad" : "ok") : i === PS.idx ? "cur" : ""}"></i>`;
    }).join("") : "";
  }

  function renderPic() {
    if (!THEMES.length) return;
    if (!PS) newPicSession();
    renderPicSteps();
    const box = $("#picBox");
    if (PS.idx >= PS.items.length) return renderPicSummary();
    const it = PS.items[PS.idx];
    const r = PS.res[PS.idx];
    const hint = `${it.w[0]}${it.w.slice(1).replace(/[a-z]/gi, " _")}`;
    box.innerHTML = `
      <div class="pic-card">
        <span class="chip chip-lav tag">${PS.label.icon} ${esc(PS.label.name)}</span>
        <span class="counter">${PS.idx + 1} / ${PS.items.length}</span>
        ${picImg(it)}
        <p class="pic-q">${esc(THEME_OF[it.w].prompt)}</p>
      </div>
      <div class="options pic-opts">
        ${PS.opts[PS.idx].map((o, i) => `<button class="opt" data-o="${esc(o)}"><span class="k">${"ABCD"[i]}</span>${esc(o)}</button>`).join("")}
      </div>
      ${r ? picResult(it, r) : `<div class="quiz-foot"><span class="hand-note">选出图片对应的英文</span></div>`}`;

    if (r) {
      box.querySelectorAll(".pic-opts .opt").forEach((btn) => {
        btn.disabled = true;
        if (btn.dataset.o === it.w) btn.classList.add("right");
        else if (btn.dataset.o === r.said) btn.classList.add("wrong");
        else btn.classList.add("dim");
      });
      $("#picNext").addEventListener("click", () => { PS.idx++; renderPic(); });
      return;
    }
    box.querySelectorAll(".pic-opts .opt").forEach((btn) => btn.addEventListener("click", () => setPicResult(btn.dataset.o === it.w ? "right" : "wrong", btn.dataset.o)));
  }

  function setPicResult(ok, said) {
    const it = PS.items[PS.idx];
    const prev = PS.res[PS.idx];
    PS.res[PS.idx] = { w: it.w, ok, said };
    if (!prev) { S.pic.total++; S.pic.seen[it.w] = (S.pic.seen[it.w] || 0) + 1; }
    if (ok === "right") S.pic.right++;
    const data = { ph: it.ph, pos: it.pos, zh: it.zh, ex: it.ex };
    if (ok === "wrong") addLookup(it.w, data, "picture");                       // into the word book + review in 1–3 days
    save();
    renderPic();
  }

  function picResult(it, r) {
    const other = r.ok === "wrong" ? THEME_OF[it.w].items.find((o) => o.w === r.said) : null;
    const head = r.ok === "right" ? `<div class="pic-verdict ok">✅ 答对了！</div>`
      : `<div class="pic-verdict no">❌ 答案是 <b>${esc(it.w)}</b></div>${other ? `<p class="pic-said">你选的 <b>${esc(other.w)}</b> 是「${esc(other.zh)}」</p>` : ""}`;
    return `${head}
      <div class="pic-answer">
        <div class="pa-top"><b>${esc(it.w)}</b><span>${esc(it.ph)}</span><i>${esc(it.pos)}</i><button class="speak" data-say="${esc(it.w)}" aria-label="发音">🔊</button></div>
        <div class="pa-zh">${esc(it.zh)}</div>
        <p class="pa-ex">${highlight(it.ex, it.w.split(" ")[0])}<button class="speak sm" data-say="${esc(it.ex)}" aria-label="朗读">🔊</button></p>
        ${it.tip ? `<p class="pa-tip">💡 ${esc(it.tip)}</p>` : ""}
        ${r.ok === "wrong" ? `<p class="pa-note">已记到单词本，1–3 天内会再考你</p>` : ""}
      </div>
      <div class="quiz-foot">
        <span></span>
        <button class="btn" id="picNext">${PS.idx === PS.items.length - 1 ? "完成 ✓" : "下一张 →"}</button>
      </div>`;
  }

  function renderPicSummary() {
    const okN = PS.res.filter((r) => r.ok !== "wrong").length;
    const wrongN = PS.items.length - okN;
    if (!PS.done) {
      PS.done = true;
      if (PS.retry) S.pic.retry = S.pic.retry.filter((r) => !(r.due === PS.retry.due && r.words.join() === PS.retry.words.join()));
      if (wrongN >= 3) { PS.again = rand(1, 3); S.pic.retry.push({ due: addDays(TODAY, PS.again), words: PS.items.map((it) => it.w) }); }
      if (!PS.retry && !PS.exhausted) S.pic.next++;   // next round starts from the next theme
      save();
    }
    const left = unseenTotal();
    $("#picBox").innerHTML = `
      <div class="summary">
        <div class="stamp">NICE<small>${okN} / ${PS.items.length}</small></div>
        <ul class="sum-list">
          ${PS.items.map((it, i) => {
            const r = PS.res[i] || {};
            const mk = r.ok === "right" ? `<span class="mk ok">✓</span>` : `<span class="mk bad">✗</span>`;
            return `<li>${mk}<span class="sum-emo">${it.emoji || THEME_OF[it.w].icon}</span><b>${esc(it.w)}</b><span class="zh">${esc(it.zh)}</span></li>`;
          }).join("")}
        </ul>
        <p class="pic-left">${PS.again ? `这组错了 ${wrongN} 个，${PS.again} 天后会再考你一次这组 🔁<br>` : ""}${left ? `还有 <b>${left}</b> 张新图没做过` : "题库都做完啦！每天早上会自动加新主题"}</p>
        <div class="sum-actions">
          <button class="btn" id="picMore">再来一组 →</button>
          <a class="btn ghost small" href="#/">回首页</a>
        </div>
      </div>`;
    $("#picMore").addEventListener("click", () => { newPicSession(); renderPic(); });
  }

  function renderPicTile() {
    if (!THEMES.length) return;
    const plan = planPicRound();
    const first = plan.items[0];
    $("#homePicThumb").innerHTML = first.svg || `<span>${first.emoji}</span>`;
    $("#homePicSub").textContent = plan.retry ? "🔁 今天复习上次错得多的那组"
      : plan.exhausted ? "题库做完啦，明早会加新主题"
      : `下一组：${plan.label.icon} ${plan.label.name} · 还有 ${unseenTotal()} 张新图`;
  }

  // new themes are added by the daily routine into pics/extra.json
  fetch("pics/extra.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : [])).then((extra) => {
    const have = new Set(THEMES.flatMap((t) => t.items.map((i) => i.w)));
    for (const t of extra || []) {
      if (!t || !Array.isArray(t.items) || THEMES.some((x) => x.id === t.id)) continue;
      const items = t.items.filter((i) => i.w && i.zh && (i.emoji || i.svg) && !have.has(i.w)).map((i) => ({ accept: [i.w], near: [], ...i }));
      if (items.length >= 4) { THEMES.push({ ...t, items }); items.forEach((i) => have.add(i.w)); }
    }
    indexThemes();
    renderPicTile();
  }).catch(() => {});

  /* ═════════════ home + router ═════════════ */
  function renderHome() {
    const d = day();
    const wDone = d.set ? d.answers.filter(Boolean).length : 0;
    const n = newsCount(d);
    const extra = d.set ? d.set.length - 5 : 0;
    $("#homeWordsSub").textContent = d.wordsDone ? `今日已完成 ✓${extra > 0 ? ` · 加练 ${extra}` : ""}` : wDone ? `已完成 ${Math.min(wDone, 5)}/5` : "5 个词 · 约 2 分钟";
    $("#homeWordsBar").style.width = (Math.min(wDone, 5) / 5) * 100 + "%";
    const lead = newsData?.items?.[0];
    $("#homeNewsSub").textContent = n >= 3 ? "今日已读完 ✓" : lead ? `${n}/3 · ${lead.title_zh}` : "3 条 · 中英双语";
    $("#homeNewsBar").style.width = (n / 3) * 100 + "%";
    $("#newsCount").textContent = `${n}/3`;
    // this week (Mon → Sun)
    const t = parseYmd(TODAY);
    const mon = addDays(TODAY, -((t.getDay() + 6) % 7));
    $("#homeWeek").innerHTML = ["一", "二", "三", "四", "五", "六", "日"].map((w, i) => {
      const k = addDays(mon, i);
      return `<div class="${status(S.days[k])} ${k === TODAY ? "today" : ""}">${w}<span>${parseYmd(k).getDate()}</span></div>`;
    }).join("");
    let streak = 0;
    let cur = status(S.days[TODAY]) === "full" ? TODAY : addDays(TODAY, -1);
    while (status(S.days[cur]) === "full") { streak++; cur = addDays(cur, -1); }
    $("#homeStreak").textContent = streak;
    renderPicTile();
  }

  const VIEWS = ["home", "dict", "words", "news", "pic", "book", "cal"];
  function route() {
    const v = (location.hash.match(/^#\/(\w+)/) || [])[1] || "home";
    const view = VIEWS.includes(v) ? v : "home";
    closePop();
    document.querySelectorAll(".view").forEach((el) => (el.hidden = el.dataset.view !== view));
    window.scrollTo(0, 0);
    if (view === "dict") setTimeout(() => $("#dictInput").focus(), 60);
    if (view === "home") renderHome();
    if (view === "book") renderBook();
    if (view === "pic") renderPic();
  }
  function go(view, replace) {
    const h = view === "home" ? "#/" : `#/${view}`;
    if (replace) history.replaceState(null, "", h); else location.hash = h;
    route();
  }
  window.addEventListener("hashchange", route);
  // back button: go back in history if we came from home, so the phone's back gesture feels natural
  document.querySelectorAll(".topbar .back").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (cameFromHome) { cameFromHome = false; history.back(); } else go("home", false);
  }));
  let cameFromHome = false;
  // home search bar → open the dictionary and focus the input inside the same tap,
  // otherwise iOS won't pop up the keyboard
  $("#homeSearch").addEventListener("click", (e) => {
    e.preventDefault();
    cameFromHome = true;
    closePop();
    document.querySelectorAll(".view").forEach((el) => (el.hidden = el.dataset.view !== "dict"));
    const input = $("#dictInput");
    input.focus();
    input.select();
    history.pushState(null, "", "#/dict");
    window.scrollTo(0, 0);
  });
  document.querySelectorAll('.home a[href^="#/"]').forEach((a) => a.addEventListener("click", () => (cameFromHome = true)));

  /* ═════════════ refresh (no browser reload button in the home-screen app) ═════════════ */
  const ASSETS = ["./", "index.html", "app.js", "style.css", "words.js", "pics.js", "pics/extra.json", "news/latest.json", `news/${TODAY}.json`];
  async function hardRefresh() {
    const btn = $("#refreshBtn");
    btn.classList.add("spin");
    // pull fresh copies past the browser cache, then reload
    await Promise.allSettled(ASSETS.map((u) => fetch(u, { cache: "reload" })));
    location.reload();
  }
  $("#refreshBtn").addEventListener("click", hardRefresh);
  // the home-screen app can stay open for days: reload by itself when you come back on a new day
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ymd(new Date()) !== TODAY) hardRefresh();
  });

  /* ═════════════ boot ═════════════ */
  const h = new Date().getHours();
  $("#greeting").textContent = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  $("#todayLabel").textContent = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  route();
  renderNotebook();
  renderBook();
  renderProgress();
  // build today's set after news vocab is known, so earlier news words can join the pool
  loadNews(TODAY).finally(renderQuiz);
  if ("speechSynthesis" in window) speechSynthesis.getVoices();
})();
