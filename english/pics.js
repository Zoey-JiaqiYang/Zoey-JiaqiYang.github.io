// "看图说英文" picture themes.
// item: { w, ph, pos, zh, ex, tip, accept: [answers counted as right], near: [answers counted as "close"], svg | emoji }
(() => {
  const S = 'stroke="#0f4a59" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
  const W = "#bfe3f0";   // water
  const svg = (body) => `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const drop = (x, y, s = 1) => `<path d="M${x} ${y} q${-7 * s} ${12 * s} 0 ${16 * s} q${7 * s} ${-4 * s} 0 ${-16 * s} z" fill="${W}" ${S}/>`;

  const WATER = [
    {
      w: "pour", ph: "/pɔː(r)/", pos: "v.", zh: "倒（液体）", accept: ["pour", "pouring", "poured", "pour water"],
      ex: "Could you pour me a glass of water?", tip: "故意倒出来是 pour；不小心洒了是 spill",
      svg: svg(`
        <g transform="rotate(35 70 60)">
          <path d="M40 30 L44 90 Q45 96 52 96 L88 96 Q95 96 96 90 L100 30 Z" fill="#fff" ${S}/>
          <path d="M43 52 L45 90 Q46 94 52 94 L88 94 Q94 94 95 90 L98 52 Z" fill="${W}"/>
          <path d="M100 30 L113 23" fill="none" ${S}/>
          <path d="M41 42 Q20 52 42 74" fill="none" ${S}/>
        </g>
        <path d="M125 57 Q143 72 145 118" fill="none" stroke="${W}" stroke-width="7" stroke-linecap="round"/>
        <path d="M123 114 L126 145 L164 145 L167 114 Z" fill="${W}"/>
        <path d="M120 88 L126 145 L164 145 L170 88" fill="none" ${S}/>`),
    },
    {
      w: "spill", ph: "/spɪl/", pos: "v.", zh: "（不小心）洒出、溢出", accept: ["spill", "spilled", "spilt", "spilling", "spill water"], near: ["knock over", "pour"],
      ex: "Oops, I spilled my coffee all over the desk.", tip: "spill 强调「意外」；名词也可以说 a spill",
      svg: svg(`
        <path d="M14 146 L190 146" fill="none" ${S}/>
        <path d="M108 128 Q128 148 166 144 Q190 141 176 133 Q160 128 140 131 Q124 130 110 118 Z" fill="${W}"/>
        <path d="M46 112 L108 102 L108 140 L46 134 Z" fill="#fff" ${S}/>
        <path d="M108 104 L108 140" fill="none" ${S}/>
        ${drop(150, 96, 0.8)}${drop(172, 108, 0.6)}${drop(128, 88, 0.6)}`),
    },
    {
      w: "drip", ph: "/drɪp/", pos: "v.", zh: "（一滴一滴地）滴落", accept: ["drip", "dripping", "drips", "dripped"], near: ["drop", "leak"],
      ex: "The kitchen tap has been dripping all night.", tip: "水龙头漏水滴答滴答就是 drip；leak 是「漏」",
      svg: svg(`
        <path d="M18 36 L96 36 L96 50 L18 50 Z" fill="#fff" ${S}/>
        <path d="M80 50 L80 70 L96 70 L96 50" fill="#fff" ${S}/>
        <path d="M66 36 L66 20 M54 20 L78 20" fill="none" ${S}/>
        ${drop(88, 82)}${drop(88, 112, 0.8)}
        <ellipse cx="88" cy="148" rx="26" ry="5" fill="${W}" ${S}/>
        <path d="M118 150 q4 -6 8 0 M50 150 q4 -6 8 0" fill="none" stroke="#c77fb3" stroke-width="2.4" stroke-linecap="round"/>`),
    },
    {
      w: "stir", ph: "/stɜː(r)/", pos: "v.", zh: "搅拌", accept: ["stir", "stirring", "stirred", "stir coffee", "stir it"], near: ["mix"],
      ex: "Give your tea a stir before you drink it.", tip: "mix 是「混合」，用勺子在杯子里转着搅是 stir",
      svg: svg(`
        <path d="M58 72 L63 140 Q64 146 71 146 L119 146 Q126 146 127 140 L132 72 Z" fill="#fff" ${S}/>
        <ellipse cx="95" cy="82" rx="35" ry="8" fill="#e2c3a4" ${S}/>
        <path d="M132 88 Q156 94 129 122" fill="none" ${S}/>
        <path d="M122 26 L100 84" fill="none" ${S}/>
        <path d="M66 60 A30 9 0 1 0 128 62" fill="none" stroke="#c77fb3" stroke-width="3" stroke-linecap="round"/>
        <path d="M128 62 l-9 -5 M128 62 l-3 -10" fill="none" stroke="#c77fb3" stroke-width="3" stroke-linecap="round"/>`),
    },
    {
      w: "splash", ph: "/splæʃ/", pos: "v./n.", zh: "（水）溅起、泼溅", accept: ["splash", "splashing", "splashed"], near: ["spray", "spill"],
      ex: "The kids were splashing around in the pool.", tip: "东西掉进水里、水花四溅就是 splash",
      svg: svg(`
        <path d="M20 112 L20 146 Q20 150 26 150 L174 150 Q180 150 180 146 L180 112 Z" fill="${W}"/>
        <path d="M20 112 Q40 106 60 112 T100 112 T140 112 T180 112" fill="none" ${S}/>
        <path d="M70 112 Q74 82 82 108 Q90 66 100 104 Q110 66 118 108 Q126 82 130 112 Z" fill="${W}" ${S}/>
        ${drop(64, 70, 0.7)}${drop(100, 40, 0.8)}${drop(138, 64, 0.7)}${drop(84, 50, 0.5)}${drop(118, 46, 0.5)}`),
    },
    {
      w: "overflow", ph: "/ˌəʊvəˈfləʊ/", pos: "v.", zh: "（满得）溢出来", accept: ["overflow", "overflowing", "overflows", "overflowed"], near: ["spill", "full"],
      ex: "Turn the tap off — the sink is about to overflow!", tip: "装太满冒出来是 overflow；碰倒洒了是 spill",
      svg: svg(`
        <path d="M40 22 L112 22 L112 34 L40 34 Z" fill="#fff" ${S}/>
        <path d="M96 34 L96 48 L112 48 L112 34" fill="#fff" ${S}/>
        <path d="M104 50 L104 70" fill="none" stroke="${W}" stroke-width="7" stroke-linecap="round"/>
        <path d="M73 72 L79 140 L129 140 L135 72 Z" fill="${W}"/>
        <path d="M72 70 L79 140 L129 140 L136 70" fill="none" ${S}/>
        <path d="M70 70 Q66 96 64 120 M138 70 Q142 96 144 122" fill="none" stroke="${W}" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="104" cy="148" rx="58" ry="5" fill="${W}" ${S}/>`),
    },
    {
      w: "sip", ph: "/sɪp/", pos: "v./n.", zh: "小口喝、抿", accept: ["sip", "sipping", "sipped", "take a sip", "have a sip"], near: ["drink", "drinking"],
      ex: "She sipped her flat white while reading the news.", tip: "drink 是泛指「喝」；小口小口慢慢喝是 sip，大口灌是 gulp",
      svg: svg(`
        <circle cx="72" cy="78" r="44" fill="#fde6f1" ${S}/>
        <circle cx="84" cy="64" r="3.5" fill="#0f4a59"/>
        <path d="M104 92 q6 2 10 -1" fill="none" ${S}/>
        <path d="M58 92 q6 4 12 0" fill="none" stroke="#c77fb3" stroke-width="2.5" stroke-linecap="round"/>
        <g transform="rotate(-18 140 100)">
          <path d="M116 86 L120 122 Q121 128 128 128 L148 128 Q155 128 156 122 L160 86 Z" fill="#fff" ${S}/>
          <path d="M160 96 Q174 100 158 114" fill="none" ${S}/>
          <path d="M118 92 L158 92" fill="none" stroke="#e2c3a4" stroke-width="6"/>
        </g>
        <path d="M150 64 q-6 -8 0 -16 M162 66 q-6 -8 0 -16" fill="none" stroke="#94a1a8" stroke-width="2.4" stroke-linecap="round"/>`),
    },
    {
      w: "spray", ph: "/spreɪ/", pos: "v.", zh: "喷、喷洒", accept: ["spray", "spraying", "sprayed", "spray water", "mist"], near: ["splash", "squirt"],
      ex: "Spray the plants with a bit of water every morning.", tip: "喷雾瓶「呲呲」喷出来是 spray；水枪那种一股射出是 squirt",
      svg: svg(`
        <path d="M58 76 L58 142 Q58 148 64 148 L96 148 Q102 148 102 142 L102 76 Q102 70 96 70 L64 70 Q58 70 58 76 Z" fill="${W}" ${S}/>
        <path d="M70 70 L70 60 L90 60 L90 70" fill="#fff" ${S}/>
        <path d="M60 44 L106 44 L116 52 L106 60 L60 60 Z" fill="#fff" ${S}/>
        <path d="M78 60 L70 82" fill="none" ${S}/>
        ${[[130, 50], [142, 40], [146, 58], [158, 46], [162, 64], [170, 34], [176, 54], [136, 64], [154, 30], [182, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${W}" stroke="#0f4a59" stroke-width="1.6"/>`).join("")}`),
    },
  ];

  const HOME = [
    { emoji: "🔦", w: "torch", ph: "/tɔːtʃ/", pos: "n.", zh: "手电筒", accept: ["torch", "flashlight"], ex: "Grab a torch, the power's out.", tip: "澳洲/英国说 torch，美国说 flashlight" },
    { emoji: "🧽", w: "sponge", ph: "/spʌndʒ/", pos: "n.", zh: "海绵", accept: ["sponge", "kitchen sponge"], ex: "Use the sponge to wipe down the bench.", tip: "注意发音 /spʌndʒ/，中间是 ʌ" },
    { emoji: "🧹", w: "broom", ph: "/bruːm/", pos: "n.", zh: "扫帚", accept: ["broom"], near: ["brush", "mop"], ex: "There's a broom in the laundry.", tip: "mop 是拖把；sweep 是「扫地」这个动作" },
    { emoji: "🪣", w: "bucket", ph: "/ˈbʌkɪt/", pos: "n.", zh: "水桶", accept: ["bucket", "pail"], ex: "Fill the bucket with warm, soapy water.", tip: "kick the bucket 是俚语「翘辫子」" },
    { emoji: "🪜", w: "ladder", ph: "/ˈlædə(r)/", pos: "n.", zh: "梯子", accept: ["ladder", "step ladder", "stepladder"], ex: "Can you hold the ladder while I change the light bulb?", tip: "career ladder 职业阶梯" },
    { emoji: "🧷", w: "safety pin", ph: "/ˈseɪfti pɪn/", pos: "n.", zh: "别针", accept: ["safety pin", "safety-pin"], near: ["pin"], ex: "I fixed my strap with a safety pin.", tip: "普通大头针是 pin，带扣的是 safety pin" },
    { emoji: "🧯", w: "fire extinguisher", ph: "/ˈfaɪər ɪkˌstɪŋɡwɪʃə(r)/", pos: "n.", zh: "灭火器", accept: ["fire extinguisher", "extinguisher"], ex: "The fire extinguisher is next to the lift.", tip: "extinguish = 熄灭" },
    { emoji: "📎", w: "paperclip", ph: "/ˈpeɪpəklɪp/", pos: "n.", zh: "回形针", accept: ["paperclip", "paper clip"], near: ["clip"], ex: "Clip the receipts together with a paperclip.", tip: "订书机是 stapler，订书钉是 staple" },
    { emoji: "🧺", w: "laundry basket", ph: "/ˈlɔːndri ˌbɑːskɪt/", pos: "n.", zh: "脏衣篮", accept: ["laundry basket", "washing basket", "hamper", "clothes basket"], near: ["basket"], ex: "Chuck your dirty clothes in the laundry basket.", tip: "澳洲人也常说 washing basket；chuck = 扔（口语）" },
    { emoji: "🪫", w: "flat battery", ph: "/ˌflæt ˈbætəri/", pos: "n.", zh: "没电的电池", accept: ["flat battery", "low battery", "dead battery", "flat"], near: ["battery"], ex: "My phone's flat — can I borrow your charger?", tip: "澳洲人说手机没电：My phone's flat / died" },
    { emoji: "🪥", w: "toothbrush", ph: "/ˈtuːθbrʌʃ/", pos: "n.", zh: "牙刷", accept: ["toothbrush", "tooth brush"], ex: "Don't forget to pack your toothbrush.", tip: "牙膏 toothpaste；牙线 floss" },
    { emoji: "🔌", w: "plug", ph: "/plʌɡ/", pos: "n.", zh: "插头", accept: ["plug", "power plug"], near: ["socket", "power point"], ex: "Is it plugged in? The plug looks loose.", tip: "墙上的插座澳洲叫 power point；美国叫 outlet" },
  ];

  window.PIC_THEMES = [
    { id: "water", name: "一杯水", icon: "🥛", prompt: "这个动作怎么说？", items: WATER },
    { id: "home", name: "家里的东西", icon: "🏠", prompt: "这个东西叫什么？", items: HOME },
  ];
})();
