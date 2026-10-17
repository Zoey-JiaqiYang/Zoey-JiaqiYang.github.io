// "看图说英文" picture themes.
// item: { w, ph, pos, zh, ex, tip, accept: [answers counted as right], near: [answers counted as "close"], svg | emoji }
(() => {
  const S = 'stroke="#22231f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
  const W = "#a9cbe0";   // water
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
        <path d="M118 150 q4 -6 8 0 M50 150 q4 -6 8 0" fill="none" stroke="#e2697f" stroke-width="2.4" stroke-linecap="round"/>`),
    },
    {
      w: "stir", ph: "/stɜː(r)/", pos: "v.", zh: "搅拌", accept: ["stir", "stirring", "stirred", "stir coffee", "stir it"], near: ["mix"],
      ex: "Give your tea a stir before you drink it.", tip: "mix 是「混合」，用勺子在杯子里转着搅是 stir",
      svg: svg(`
        <path d="M58 72 L63 140 Q64 146 71 146 L119 146 Q126 146 127 140 L132 72 Z" fill="#fff" ${S}/>
        <ellipse cx="95" cy="82" rx="35" ry="8" fill="#e2c3a4" ${S}/>
        <path d="M132 88 Q156 94 129 122" fill="none" ${S}/>
        <path d="M122 26 L100 84" fill="none" ${S}/>
        <path d="M66 60 A30 9 0 1 0 128 62" fill="none" stroke="#e2697f" stroke-width="3" stroke-linecap="round"/>
        <path d="M128 62 l-9 -5 M128 62 l-3 -10" fill="none" stroke="#e2697f" stroke-width="3" stroke-linecap="round"/>`),
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
        <circle cx="84" cy="64" r="3.5" fill="#22231f"/>
        <path d="M104 92 q6 2 10 -1" fill="none" ${S}/>
        <path d="M58 92 q6 4 12 0" fill="none" stroke="#e2697f" stroke-width="2.5" stroke-linecap="round"/>
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
        ${[[130, 50], [142, 40], [146, 58], [158, 46], [162, 64], [170, 34], [176, 54], [136, 64], [154, 30], [182, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${W}" stroke="#22231f" stroke-width="1.6"/>`).join("")}`),
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

  // compact emoji item: [emoji, word, phonetic, pos, 中文, example, tip, accept(extra, "|"-separated), near("|")]
  const E = (rows) => rows.map(([emoji, w, ph, pos, zh, ex, tip, acc = "", near = ""]) => ({
    emoji, w, ph, pos, zh, ex, tip, accept: [w, ...acc.split("|").filter(Boolean)], near: near.split("|").filter(Boolean),
  }));

  const FACES = E([
    ["🙄", "roll your eyes", "/rəʊl jɔːr aɪz/", "phr.", "翻白眼", "She rolled her eyes when he was late again.", "表示不耐烦、无语"],
    ["🥱", "yawn", "/jɔːn/", "v./n.", "打哈欠", "Sorry, I can't stop yawning — big night.", "big night = 昨晚玩得很晚（口语）"],
    ["😬", "cringe", "/krɪndʒ/", "v./adj.", "尴尬到脚趾抠地", "That ad was so cringe.", "年轻人常把 cringe 当形容词用", "", "awkward"],
    ["😳", "embarrassed", "/ɪmˈbærəst/", "adj.", "难为情的、脸红的", "I was so embarrassed when I called my boss 'Mum'.", "注意拼写：两个 r、两个 s", "", "awkward|shy"],
    ["🤧", "sneeze", "/sniːz/", "v.", "打喷嚏", "Bless you! That's your third sneeze.", "别人打喷嚏要说 Bless you"],
    ["🤢", "nauseous", "/ˈnɔːziəs/", "adj.", "恶心想吐的", "The boat ride made me feel nauseous.", "也可以说 I feel sick（澳洲常用）", "", "sick"],
    ["😵‍💫", "dizzy", "/ˈdɪzi/", "adj.", "头晕的", "I stood up too fast and felt dizzy.", "light-headed 也是「头晕」"],
    ["🥶", "freezing", "/ˈfriːzɪŋ/", "adj.", "冻死了、极冷的", "It's freezing this morning — grab a jumper.", "澳洲人把毛衣叫 jumper", "", "cold"],
    ["🥵", "boiling", "/ˈbɔɪlɪŋ/", "adj.", "热死了", "It's boiling outside, 40 degrees!", "口语「热死了」= It's boiling / scorching", "", "hot"],
    ["🤫", "shush", "/ʃʊʃ/", "v./int.", "嘘（让人安静）", "She shushed the kids during the movie.", "", "", "quiet"],
    ["🫠", "overwhelmed", "/ˌəʊvəˈwelmd/", "adj.", "被压垮了、应付不过来", "I'm a bit overwhelmed with work this week.", "职场高频：I'm swamped 也是「忙爆了」", "", "tired|melting"],
    ["🤦", "facepalm", "/ˈfeɪspɑːm/", "n./v.", "扶额（无语）", "His excuse was a total facepalm moment.", ""],
    ["🤷", "shrug", "/ʃrʌɡ/", "v.", "耸肩", "He just shrugged and said, 'No idea.'", "shrug it off = 不当回事"],
    ["😤", "huff", "/hʌf/", "v./n.", "（生气地）哼一声、气呼呼", "She walked off in a huff.", "in a huff = 气呼呼地", "", "angry"],
  ]);

  const GESTURES = E([
    ["🤞", "fingers crossed", "/ˈfɪŋɡəz ˌkrɒst/", "phr.", "祈祷好运", "Fingers crossed the weather holds for the weekend.", "说「祝好运」时直接说 Fingers crossed!", "cross my fingers"],
    ["👏", "clap", "/klæp/", "v.", "鼓掌", "Everyone clapped at the end of the pitch.", "applaud 更正式"],
    ["🙌", "high five", "/ˌhaɪ ˈfaɪv/", "n.", "击掌", "Nice work — high five!", "", "high-five"],
    ["🤝", "shake hands", "/ʃeɪk hændz/", "phr.", "握手", "We shook hands and agreed on the deal.", "", "handshake"],
    ["👋", "wave goodbye", "/weɪv ɡʊdˈbaɪ/", "phr.", "挥手告别", "She waved goodbye from the car.", "wave 也是「海浪」", "wave|waving"],
    ["🙇", "bow", "/baʊ/", "v.", "鞠躬", "The actors bowed to the audience.", "注意发音 /baʊ/；读 /bəʊ/ 时是「弓、蝴蝶结」"],
    ["🧎", "kneel", "/niːl/", "v.", "跪下", "He knelt down to tie his shoelace.", "过去式 knelt"],
    ["🙋", "raise your hand", "/reɪz jɔː hænd/", "phr.", "举手", "Raise your hand if you have a question.", "", "put your hand up|raise hand"],
    ["🫡", "salute", "/səˈluːt/", "v./n.", "敬礼", "The soldier saluted the flag.", ""],
    ["🤙", "call me", "/kɔːl miː/", "phr.", "（手势）打电话给我", "He made the 'call me' sign as he left.", "冲浪圈也叫 shaka，表示 hang loose", "shaka|hang loose"],
    ["🫶", "heart hands", "/hɑːt hændz/", "n.", "比心", "Fans made heart hands at the concert.", ""],
    ["🤸", "cartwheel", "/ˈkɑːtwiːl/", "n./v.", "侧手翻", "The kids were doing cartwheels on the grass.", ""],
    ["🧘", "meditate", "/ˈmedɪteɪt/", "v.", "冥想", "I try to meditate for ten minutes before work.", "", "meditation|meditating", "yoga"],
  ]);

  const HEALTH = E([
    ["🩹", "band-aid", "/ˈbænd eɪd/", "n.", "创可贴", "Have you got a Band-Aid? I've cut my finger.", "澳洲/美国说 Band-Aid，英国说 plaster", "bandaid|band aid|plaster", "bandage"],
    ["🩼", "crutch", "/krʌtʃ/", "n.", "拐杖", "He's on crutches after the footy injury.", "on crutches = 拄着拐", "crutches"],
    ["🩺", "stethoscope", "/ˈsteθəskəʊp/", "n.", "听诊器", "The GP listened to my chest with a stethoscope.", "澳洲看病先看 GP（全科医生）"],
    ["💉", "injection", "/ɪnˈdʒekʃn/", "n.", "打针、注射", "I had a flu injection at the chemist.", "口语也说 jab / shot；澳洲药房叫 chemist", "jab|shot|needle|vaccine|syringe"],
    ["💊", "tablet", "/ˈtæblət/", "n.", "药片", "Take two tablets after meals.", "澳洲多说 tablet，美国多说 pill", "pill|pills|tablets|medicine"],
    ["🌡️", "thermometer", "/θəˈmɒmɪtə(r)/", "n.", "温度计、体温计", "Use the thermometer to check her temperature.", "重音在第二个音节：ther-MO-meter"],
    ["🦷", "tooth", "/tuːθ/", "n.", "牙齿", "I chipped a tooth on a hard lolly.", "复数 teeth；澳洲糖果叫 lolly", "teeth"],
    ["🩻", "x-ray", "/ˈeks reɪ/", "n.", "X 光片", "The x-ray showed a small fracture.", "", "xray|x ray"],
    ["🦽", "wheelchair", "/ˈwiːltʃeə(r)/", "n.", "轮椅", "The venue is wheelchair accessible.", "accessible = 无障碍的"],
    ["🩸", "blood test", "/ˈblʌd test/", "n.", "验血", "The doctor ordered a blood test.", "", "blood", ""],
    ["🧑‍⚕️", "pharmacist", "/ˈfɑːməsɪst/", "n.", "药剂师", "Ask the pharmacist if it's safe to take with food.", "澳洲人也说 chemist", "chemist"],
    ["🚑", "ambulance", "/ˈæmbjələns/", "n.", "救护车", "Call triple zero for an ambulance.", "澳洲急救电话是 000，读作 triple zero"],
  ]);

  const SHOPPING = E([
    ["🛒", "trolley", "/ˈtrɒli/", "n.", "购物车", "Grab a trolley — we need heaps of stuff.", "澳洲/英国说 trolley，美国说 cart", "shopping trolley|cart|shopping cart"],
    ["🧾", "receipt", "/rɪˈsiːt/", "n.", "收据、小票", "Do you want your receipt?", "p 不发音！"],
    ["🏷️", "price tag", "/ˈpraɪs tæɡ/", "n.", "价签", "There's no price tag on this one.", "", "tag|label"],
    ["💳", "tap", "/tæp/", "v.", "（卡）感应支付", "Can I just tap? — Yep, go for it.", "澳洲付款几乎都说 tap", "tap and go|paywave", "card|swipe"],
    ["🥫", "tin", "/tɪn/", "n.", "罐头", "Grab a tin of tomatoes for the pasta.", "澳洲/英国说 tin，美国说 can", "can|canned food"],
    ["🧻", "toilet paper", "/ˈtɔɪlət ˌpeɪpə(r)/", "n.", "卫生纸", "We're out of toilet paper again.", "口语也说 loo roll；be out of = 用完了", "loo roll|toilet roll"],
    ["🧴", "moisturiser", "/ˈmɔɪstʃəraɪzə(r)/", "n.", "保湿霜、润肤露", "This moisturiser has SPF 30.", "澳洲拼法 -iser，美国 -izer", "moisturizer|lotion|sunscreen", "cream"],
    ["🫙", "jar", "/dʒɑː(r)/", "n.", "广口瓶", "Can you open this jar? The lid's stuck.", "lid = 盖子"],
    ["🥡", "takeaway", "/ˈteɪkəweɪ/", "n.", "外卖", "Let's just get takeaway tonight.", "澳洲说 takeaway，美国说 takeout", "takeout|take away|take-away"],
    ["🪙", "coin", "/kɔɪn/", "n.", "硬币", "I've only got coins, is that okay?", "零钱也叫 change / shrapnel（澳洲俚语）", "change"],
    ["🛍️", "shopping bag", "/ˈʃɒpɪŋ bæɡ/", "n.", "购物袋", "Do you need a bag? They're 20 cents.", "", "bag|bags"],
    ["🍼", "baby bottle", "/ˈbeɪbi ˌbɒtl/", "n.", "奶瓶", "The baby bottles are in aisle seven.", "aisle /aɪl/ = 货架通道，s 不发音", "bottle"],
  ]);

  const STREET = E([
    ["🚦", "traffic lights", "/ˈtræfɪk laɪts/", "n.", "红绿灯", "Turn left at the next set of traffic lights.", "", "traffic light|lights"],
    ["🚧", "roadworks", "/ˈrəʊdwɜːks/", "n.", "道路施工", "Sorry I'm late — roadworks on the freeway.", "", "road works|construction"],
    ["⛽", "servo", "/ˈsɜːvəʊ/", "n.", "加油站（澳洲口语）", "Let's stop at the servo for a coffee.", "service station 的澳洲简称；也可以说 petrol station", "petrol station|service station|gas station"],
    ["🅿️", "car park", "/ˈkɑː pɑːk/", "n.", "停车场", "The car park was full, so I parked on the street.", "美国说 parking lot", "carpark|parking|parking lot"],
    ["🚏", "bus stop", "/ˈbʌs stɒp/", "n.", "公交车站", "I'll meet you at the bus stop.", ""],
    ["🛴", "scooter", "/ˈskuːtə(r)/", "n.", "滑板车", "E-scooters are everywhere in the city now.", "", "e-scooter|kick scooter"],
    ["🛞", "tyre", "/ˈtaɪə(r)/", "n.", "轮胎", "I've got a flat tyre.", "澳洲拼 tyre，美国拼 tire；flat tyre = 爆胎", "tire|wheel"],
    ["🪪", "licence", "/ˈlaɪsns/", "n.", "驾照、执照", "Can I see your licence, please?", "澳洲名词拼 licence，动词拼 license", "license|driver's licence|ID|id card"],
    ["🎫", "ticket", "/ˈtɪkɪt/", "n.", "票", "Did you get a ticket for parking there?", "parking ticket 还可以指罚单"],
    ["🚒", "fire engine", "/ˈfaɪər ˌendʒɪn/", "n.", "消防车", "A fire engine raced past with its sirens on.", "", "fire truck"],
    ["🚇", "underground", "/ˈʌndəɡraʊnd/", "n.", "地铁", "Sydney Metro runs partly underground.", "澳洲多说 the train / Metro", "metro|subway|train|tube"],
    ["🛑", "stop sign", "/ˈstɒp saɪn/", "n.", "停车标志", "He rolled through the stop sign and got fined.", "fine = 罚款", "stop"],
  ]);

  const TOOLS = E([
    ["🔧", "spanner", "/ˈspænə(r)/", "n.", "扳手", "Pass me the spanner, would you?", "澳洲/英国说 spanner，美国说 wrench", "wrench"],
    ["🪛", "screwdriver", "/ˈskruːdraɪvə(r)/", "n.", "螺丝刀", "You'll need a Phillips-head screwdriver.", ""],
    ["🔨", "hammer", "/ˈhæmə(r)/", "n.", "锤子", "Use a hammer to hang the picture.", ""],
    ["🪚", "saw", "/sɔː/", "n.", "锯子", "He cut the plank in half with a saw.", ""],
    ["🔩", "bolt", "/bəʊlt/", "n.", "螺栓", "Tighten the nut on the bolt.", "nut = 螺母；nuts and bolts = 基本细节", "nut and bolt|nut|screw"],
    ["🧲", "magnet", "/ˈmæɡnət/", "n.", "磁铁", "Stick the note on the fridge with a magnet.", ""],
    ["🪝", "hook", "/hʊk/", "n.", "挂钩", "Hang your bag on the hook behind the door.", "off the hook = 脱身了"],
    ["🧰", "toolbox", "/ˈtuːlbɒks/", "n.", "工具箱", "The torch is in the toolbox.", "", "tool box|tool kit|toolkit"],
    ["🪓", "axe", "/æks/", "n.", "斧头", "He split the firewood with an axe.", "美国拼 ax"],
    ["⛓️", "chain", "/tʃeɪn/", "n.", "链子", "Lock your bike with a chain.", "supply chain = 供应链"],
    ["🪤", "mousetrap", "/ˈmaʊstræp/", "n.", "捕鼠夹", "We set a mousetrap under the sink.", "", "mouse trap|trap"],
    ["🗜️", "clamp", "/klæmp/", "n.", "夹钳", "Hold the wood in place with a clamp.", "clamp down on = 严厉打击"],
  ]);

  const NATURE = E([
    ["⛈️", "thunderstorm", "/ˈθʌndəstɔːm/", "n.", "雷暴", "A thunderstorm is forecast for this arvo.", "arvo = afternoon（澳洲口语）", "storm|thunder"],
    ["🌫️", "fog", "/fɒɡ/", "n.", "雾", "The fog was so thick I couldn't see the bridge.", "foggy (adj.)", "foggy|mist"],
    ["🌦️", "showers", "/ˈʃaʊəz/", "n.", "阵雨", "Expect a few showers later today.", "天气预报里的 showers = 阵雨", "shower|rain"],
    ["🌪️", "tornado", "/tɔːˈneɪdəʊ/", "n.", "龙卷风", "The tornado ripped roofs off houses.", "", "twister|whirlwind"],
    ["🌋", "volcano", "/vɒlˈkeɪnəʊ/", "n.", "火山", "Bali flights were cancelled after the volcano erupted.", "erupt = 喷发"],
    ["🌊", "wave", "/weɪv/", "n.", "海浪", "The waves are massive at Bondi today.", ""],
    ["🍂", "fallen leaves", "/ˌfɔːlən ˈliːvz/", "n.", "落叶", "The footpath is covered in fallen leaves.", "澳洲把人行道叫 footpath", "leaves|autumn"],
    ["🪸", "coral", "/ˈkɒrəl/", "n.", "珊瑚", "The Great Barrier Reef is the world's largest coral reef.", "", "coral reef|reef"],
    ["🌾", "wheat", "/wiːt/", "n.", "小麦", "Australia is a major wheat exporter.", "", "crop|grain"],
    ["🌵", "cactus", "/ˈkæktəs/", "n.", "仙人掌", "Don't touch the cactus!", "复数 cacti 或 cactuses"],
    ["🏜️", "desert", "/ˈdezət/", "n.", "沙漠", "Uluru is in the middle of the desert.", "dessert（甜点）多一个 s"],
    ["🌘", "crescent moon", "/ˈkresnt muːn/", "n.", "月牙", "There was a thin crescent moon last night.", "", "crescent|moon"],
  ]);

  const AUSSIE = E([
    ["🩴", "thongs", "/θɒŋz/", "n.", "人字拖（澳洲叫法）", "Don't wear thongs to the office!", "⚠️ 在美国 thong 是丁字裤，美国人叫 flip-flops", "thong|flip flops|flip-flops"],
    ["🕶️", "sunnies", "/ˈsʌniz/", "n.", "太阳镜（澳洲口语）", "Grab your sunnies, it's bright out.", "sunglasses 的澳洲叫法", "sunglasses"],
    ["🦟", "mozzie", "/ˈmɒzi/", "n.", "蚊子（澳洲口语）", "The mozzies are out in force tonight.", "mosquito 的澳洲叫法", "mosquito|mozzies"],
    ["🪰", "blowfly", "/ˈbləʊflaɪ/", "n.", "绿头苍蝇（澳洲口语 blowie）", "Shut the door before the blowies get in!", "", "blowie|fly"],
    ["🏄", "surf", "/sɜːf/", "v.", "冲浪", "We went for a surf before work.", "go for a surf = 去冲个浪", "surfing|surfer"],
    ["🏉", "footy", "/ˈfʊti/", "n.", "（澳式）橄榄球", "Are you watching the footy this weekend?", "澳洲人说 footy 一般指 AFL 或橄榄球联赛", "football|afl|rugby"],
    ["🏏", "cricket", "/ˈkrɪkɪt/", "n.", "板球", "The Boxing Day Test is a big cricket tradition.", "cricket 也是「蟋蟀」"],
    ["🌭", "snag", "/snæɡ/", "n.", "香肠（澳洲口语）", "Grab a snag at the Bunnings sausage sizzle.", "sausage sizzle = 烤香肠义卖，澳洲特色", "sausage|hot dog"],
    ["🍖", "barbie", "/ˈbɑːbi/", "n.", "烧烤（澳洲口语）", "We're having a barbie on Sunday, come over!", "barbecue / BBQ 的澳洲叫法", "barbecue|bbq"],
    ["🐨", "koala", "/kəʊˈɑːlə/", "n.", "考拉", "Koalas sleep up to 20 hours a day.", "不要叫 koala bear，它不是熊"],
    ["🦈", "shark", "/ʃɑːk/", "n.", "鲨鱼", "Swim between the flags — there's been a shark sighting.", "swim between the flags = 在救生员旗帜之间游泳"],
    ["☀️", "scorcher", "/ˈskɔːtʃə(r)/", "n.", "大热天", "Tomorrow's going to be a scorcher — 38 degrees.", "", "hot day|stinker", "sunny|hot"],
  ]);

  const OFFICE = E([
    ["📌", "drawing pin", "/ˈdrɔːɪŋ pɪn/", "n.", "图钉", "Pin the flyer up with a drawing pin.", "美国说 thumbtack；pushpin 是这种圆头的", "pushpin|thumbtack|pin"],
    ["📏", "ruler", "/ˈruːlə(r)/", "n.", "直尺", "Can I borrow your ruler?", "ruler 也是「统治者」"],
    ["🗂️", "folder", "/ˈfəʊldə(r)/", "n.", "文件夹", "Save it in the shared folder.", "", "file|dividers|binder"],
    ["🗄️", "filing cabinet", "/ˈfaɪlɪŋ ˌkæbɪnət/", "n.", "文件柜", "The contracts are in the filing cabinet.", "", "file cabinet|cabinet"],
    ["📋", "clipboard", "/ˈklɪpbɔːd/", "n.", "写字夹板；剪贴板", "Copy it to your clipboard.", "电脑里的「剪贴板」也叫 clipboard"],
    ["🖨️", "printer", "/ˈprɪntə(r)/", "n.", "打印机", "The printer's jammed again.", "jammed = 卡纸了"],
    ["🧮", "abacus", "/ˈæbəkəs/", "n.", "算盘", "My grandma could add faster on an abacus.", ""],
    ["🗓️", "calendar", "/ˈkælɪndə(r)/", "n.", "日历、日程", "I'll send you a calendar invite.", "calendar invite = 日程邀请（职场高频）", "diary|schedule"],
    ["📉", "downturn", "/ˈdaʊntɜːn/", "n.", "下滑、衰退", "Sales took a downturn in Q3.", "", "decline|drop|fall|graph", "chart"],
    ["💼", "briefcase", "/ˈbriːfkeɪs/", "n.", "公文包", "He left his briefcase on the train.", "", "", "bag|suitcase"],
    ["🖇️", "paperclips", "/ˈpeɪpəklɪps/", "n.", "回形针（复数）", "Keep the paperclips in the drawer.", "", "paperclip|paper clips|paper clip"],
    ["🔖", "bookmark", "/ˈbʊkmɑːk/", "n./v.", "书签；收藏网页", "Bookmark that page so you can find it later.", ""],
  ]);

  window.PIC_THEMES = [
    { id: "water", name: "一杯水", icon: "🥛", prompt: "这个动作怎么说？", items: WATER },
    { id: "faces", name: "表情与感受", icon: "😬", prompt: "这个表情怎么说？", items: FACES },
    { id: "home", name: "家里的东西", icon: "🏠", prompt: "这个东西叫什么？", items: HOME },
    { id: "aussie", name: "澳洲口语", icon: "🦘", prompt: "澳洲人会怎么说？", items: AUSSIE },
    { id: "gestures", name: "手势与动作", icon: "🤞", prompt: "这个动作怎么说？", items: GESTURES },
    { id: "shopping", name: "超市购物", icon: "🛒", prompt: "这个东西叫什么？", items: SHOPPING },
    { id: "health", name: "看病与健康", icon: "🩺", prompt: "这个怎么说？", items: HEALTH },
    { id: "street", name: "街上与交通", icon: "🚦", prompt: "这个怎么说？", items: STREET },
    { id: "office", name: "办公室", icon: "💼", prompt: "这个东西叫什么？", items: OFFICE },
    { id: "nature", name: "天气与自然", icon: "⛈️", prompt: "这个怎么说？", items: NATURE },
    { id: "tools", name: "工具", icon: "🔧", prompt: "这个工具叫什么？", items: TOOLS },
  ];
})();
