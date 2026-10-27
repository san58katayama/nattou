/**
 * 極・3D納豆まぜまぜ職人 〜至高の一杯をご飯にのせて〜
 * Full 3D WebGL (Three.js) Game Engine - Ultra Enhanced
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. サウンドエンジン (Web Audio API プロシージャル合成)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.enabled = true;
      this.ctx = null;
      this.lastSquishTime = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playSquish(intensity = 1.0, pitchMod = 1.0) {
      if (!this.enabled || !this.ctx) return;
      const now = performance.now();
      if (now - this.lastSquishTime < 50) return;
      this.lastSquishTime = now;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      const baseFreq = (130 + Math.random() * 50) * pitchMod;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.07);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380 + Math.random() * 120, t);
      filter.Q.setValueAtTime(1.8, t);

      // ★ 混ぜる時のSEを心地よく小さく！(前回の1/5以下)
      const vol = Math.min(0.045, 0.016 * intensity);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    }

    playCondiment(type) {
      // 押したときのSEは消去
    }

    playWhoosh() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.18), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      node.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.18);
      filter.Q.value = 3;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      node.start(t);
    }

    playThunder() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    }

    // 炎が「ボオオォッ！」と燃え上がる大迫力音
    playFireBurst() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.4), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }
      node.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.linearRampToValueAtTime(250, t + 0.4);
      filter.Q.value = 2.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      node.start(t);
    }

    // 炎が「シューーーーーッ…」と消える消火・蒸気音
    playExtinguish() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const node = this.ctx.createBufferSource();
      const dur = 0.5;
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / buffer.length);
      }
      node.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + dur);
      filter.Q.value = 4.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      node.start(t);
    }

    // 稲妻放電スパーク音
    playLightning() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }

    // 黄金光線・至高のきらめき音
    playGoldGleam() {
      if (!this.enabled || !this.ctx) return;
      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    }

    playFireSound() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const node = this.ctx.createBufferSource();
      const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.12), this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
      }
      node.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450 + Math.random() * 200, t);
      filter.Q.value = 3.0;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      node.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      node.start(t);
    }

    playRockClank() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(820, t);
      osc1.frequency.exponentialRampToValueAtTime(200, t + 0.12);
      osc2.frequency.setValueAtTime(1380, t);
      osc2.frequency.exponentialRampToValueAtTime(320, t + 0.08);
      gain.gain.setValueAtTime(0.26, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.13);
      osc2.stop(t + 0.13);
    }

    playShockwave() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.45);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    }

    playMotorHum() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320 + Math.random() * 40, t);
      osc.frequency.linearRampToValueAtTime(440, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    }

    playAwaken() {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, t + 0.25); // C6
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    }

    playFanfare(rank) {
      if (!this.enabled || !this.ctx) return;
      const notes = rank === 'SSS' || rank === 'S' 
        ? [523.25, 659.25, 783.99, 1046.50]
        : [392.00, 440.00, 523.25];
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    }

    playClick() {
      // 押したときのSEは消去
    }
  }

  const sound = new SoundManager();

  // ==========================================================================
  // 2. 拡張形態定義マスタ (全24種・固有3D造形ID付き)
  // ==========================================================================
  const NATTO_FORMS = [
    {
      id: 'cosmic',
      name: '銀河創世納豆 (コズミック)',
      badge: '🌌',
      desc: '混ぜすぎにより宇宙の特異点が発生。青紫の星雲オーラを放つ納豆。',
      hint: '混ぜ回数が320回を超えるまで限界を突破して回し続けよう！',
      check: (s) => s.mixCount >= 320,
      visualType: 'cosmic'
    },
    {
      id: 'tornado_god',
      name: '超大型納豆台風 (神タイフーン)',
      badge: '🌪️',
      desc: '猛烈な暴風雨と稲妻を伴う巨大台風納豆！器ごと天高く大回転！',
      hint: '180回以上回して、猛烈な納豆の巨大竜巻を巻き起こそう！',
      check: (s) => s.mixCount >= 180,
      visualType: 'typhoon'
    },
    {
      id: 'hard_rock',
      name: '水分蒸発・カチコチ金剛納豆',
      badge: '🪨',
      desc: '極限の摩擦熱で水分完全蒸発！岩石・ダイヤモンドのように超硬化した伝説の塊。',
      hint: '薬味を入れず、100回〜179回までしっかり混ぜると水分が抜けて硬化するぞ！',
      check: (s) => s.mixCount >= 100 && s.mixCount < 180,
      visualType: 'rock'
    },
    {
      id: 'inferno_fire',
      name: '摩擦熱発火・業火納豆',
      badge: '🔥',
      desc: '超高速ミキシングの摩擦熱で大発火！燃え盛る炎をまとった熱狂の激アツ納豆。',
      hint: '50回〜99回ほど混ぜて、摩擦熱を蓄積させてみよう！',
      check: (s) => s.mixCount >= 50 && s.mixCount < 100,
      visualType: 'fire'
    },
    {
      id: 'tornado',
      name: 'トルネード納豆',
      badge: '🌀',
      desc: '高速回転で渦潮が発生！豆が美しくスパイラルを描いて舞い上がる。',
      hint: '200回の大台を目指して激しく高速で攪拌しよう！',
      check: (s) => s.mixCount >= 200,
      visualType: 'tornado'
    },
    {
      id: 'storm',
      name: 'ネバネバ暴風域',
      badge: '⚡',
      desc: '超強力な粘着力。箸を持ち上げると鉢ごと持ち上がるレベル。',
      hint: '粘り気が極まる120回以上までひたすら回そう！',
      check: (s) => s.mixCount >= 120,
      visualType: 'storm'
    },
    {
      id: 'chaos_supreme',
      name: '無限カオス全載せ納豆',
      badge: '👑',
      desc: 'タレ・からし・ネギを限界突破投入！すべてが渾然一体となった神の器。',
      hint: 'タレ・からし・ネギの全3種をそれぞれ5回以上ドッサリ大量投入しよう！',
      check: (s) => s.sauceCount >= 5 && s.mustardCount >= 5 && s.onionCount >= 5,
      visualType: 'chaos'
    },
    {
      id: 'mustard_bomb',
      name: '劇物指定・からし爆弾納豆',
      badge: '💥',
      desc: '全体が鮮烈な黄色に染まり、強烈な刺激で鼻腔が蒸発しそうな激辛納豆。',
      hint: 'からしを容赦なく8回以上投入して激辛爆弾を作ろう！',
      check: (s) => s.mustardCount >= 8,
      visualType: 'mustard_bomb'
    },
    {
      id: 'mustard_tower',
      name: 'からしタワー納豆',
      badge: '🟡',
      desc: 'からしが天高く積み上がった黄金の山！ピリリとした芳醇な刺激。',
      hint: 'からしを4回以上投入して黄色い山を作ろう！',
      check: (s) => s.mustardCount >= 4,
      visualType: 'mustard_tower'
    },
    {
      id: 'soup',
      name: '深海タレだく納豆スープ',
      badge: '🌊',
      desc: 'タレが多すぎて完全にスープ化。黒褐色の海で納豆が優雅に泳いでいる。',
      hint: 'タレを8回以上プッシュしてスープのようにしよう！',
      check: (s) => s.sauceCount >= 8,
      visualType: 'soup'
    },
    {
      id: 'sauce_lake',
      name: '秘伝タレ湖水納豆',
      badge: '🧴',
      desc: 'タレがたっぷり浸み込んだつゆだく仕様。喉越しが抜群。',
      hint: 'タレを4回以上プッシュしてつゆだくにしよう！',
      check: (s) => s.sauceCount >= 4,
      visualType: 'sauce_lake'
    },
    {
      id: 'negi_jungle',
      name: '超巨大ネギ樹海納豆',
      badge: '🌲',
      desc: 'ネギが山のようにそびえ立ち、納豆の姿がどこにも見当たらない。',
      hint: 'ネギを10回以上山盛りに投入してみよう！',
      check: (s) => s.onionCount >= 10,
      visualType: 'negi_jungle'
    },
    {
      id: 'negi_field',
      name: '青空ネギ畑納豆',
      badge: '🥬',
      desc: '一面がシャキシャキの刻み青ネギで覆われた清涼感あふれる一杯。',
      hint: 'ネギを5回以上たっぷり投入してみよう！',
      check: (s) => s.onionCount >= 5,
      visualType: 'negi_field'
    },
    {
      id: 'gelato',
      name: '極・納豆ジェラート',
      badge: '🍨',
      desc: 'ごますり棒で徹底的にすり潰され、信じられないほど滑らかなペーストに。',
      hint: '【ごますり棒】を使って豆を跡形もなく徹底的に粉砕すり潰そう（すり潰し75%以上）！',
      check: (s) => s.tool === 'pestle' && s.crushPercent >= 75,
      visualType: 'gelato'
    },
    {
      id: 'crushed_soul',
      name: 'すり潰されし魂',
      badge: '🪵',
      desc: 'ごますり棒の圧殺により豆が粉々。未知のコクと粘りが生まれている。',
      hint: '【ごますり棒】を使って豆をじっくり押し潰そう（すり潰し40%以上）！',
      check: (s) => s.tool === 'pestle' && s.crushPercent >= 40,
      visualType: 'crushed'
    },
    {
      id: 'meringue',
      name: 'メレンゲ雲海納豆',
      badge: '☁️',
      desc: '電動泡だて器が生んだ奇跡。純白の雲のようにフワッフワな極上食感。',
      hint: '【電動泡だて器】を使って極限まで高速ホイップ泡立てよう（泡立ち80%以上）！',
      check: (s) => s.tool === 'whisk' && s.viscosityPercent >= 80,
      visualType: 'meringue'
    },
    {
      id: 'whipped',
      name: 'ふわふわホイップ納豆',
      badge: '🧁',
      desc: '電動泡だて器の超高速モーターで空気がたっぷり含まれたクリーミーな仕上がり。',
      hint: '【電動泡だて器】を使ってふんわり泡立ててみよう（泡立ち50%以上）！',
      check: (s) => s.tool === 'whisk' && s.viscosityPercent >= 50,
      visualType: 'whipped'
    },
    {
      id: 'ladle_overflow',
      name: '豪快お玉のこぼれ納豆',
      badge: '🥄',
      desc: 'お玉の豪快なすくい上げで大粒の納豆が躍る！見た目の迫力が凄まじい。',
      hint: '【お玉】を使って豪快に80回以上かき回そう！',
      check: (s) => s.tool === 'ladle' && s.mixCount >= 80,
      visualType: 'ladle_overflow'
    },
    {
      id: 'ladle_mega',
      name: 'お玉のメガ盛り納豆',
      badge: '🏔️',
      desc: 'お玉で一気に集められた豪快な大盛り。食べごたえ満点！',
      hint: '【お玉】を使って30回以上ダイナミックに混ぜよう！',
      check: (s) => s.tool === 'ladle' && s.mixCount >= 30,
      visualType: 'ladle_mega'
    },
    {
      id: 'edge_hard',
      name: '端っこだけ固い納豆',
      badge: '🧱',
      desc: '外周ばかり混ぜたため中央が手つかず！カチカチとネバネバの激しいムラ。',
      hint: '中央を避けて、器のフチ（端っこ）ばかり偏って20回以上グルグル回そう！',
      check: (s) => s.edgeBiasScore >= 60 && s.mixCount >= 20,
      visualType: 'edge_hard'
    },
    {
      id: 'golden_supreme',
      name: '黄金の至高納豆',
      badge: '✨',
      desc: '絶妙な混ぜ回数と黄金比の薬味！黄金色の神々しい光を放つ究極の逸品。',
      hint: '全体を均等に40〜140回混ぜ、タレ2〜4・からし1〜3・ネギ2〜5回の黄金比に調味！',
      check: (s) => s.mixCount >= 40 && s.mixCount <= 140 && s.sauceCount >= 2 && s.sauceCount <= 4 && s.mustardCount >= 1 && s.mustardCount <= 3 && s.onionCount >= 2 && s.onionCount <= 5 && s.edgeBiasScore < 35,
      visualType: 'golden'
    },
    {
      id: 'heavy_dense',
      name: '箸が折れそうな極濃納豆',
      badge: '🥢',
      desc: '水分ゼロで糸が超強力に固結！一口一口が強烈に重厚。',
      hint: 'タレを一切入れず、70回以上混ぜて濃厚に仕上げよう！',
      check: (s) => s.mixCount >= 70 && s.sauceCount === 0,
      visualType: 'dense'
    },
    {
      id: 'morning_champion',
      name: '朝食の覇者納豆',
      badge: '☀️',
      desc: 'タレとネギが程よく効いた日本の朝の王道納豆。ご飯が何杯でもいける。',
      hint: 'タレとネギを1回以上入れ、25回以上手際よく混ぜよう！',
      check: (s) => s.mixCount >= 25 && s.sauceCount >= 1 && s.onionCount >= 1,
      visualType: 'morning'
    },
    {
      id: 'delicious',
      name: 'おいしい納豆',
      badge: '😋',
      desc: '糸が白くふんわり泡立ち、旨味成分のアミノ酸が最高潮に達した状態。',
      hint: '王道の基本！まずは30回ほどしっかり混ぜよう！',
      check: (s) => s.mixCount >= 30,
      visualType: 'delicious'
    },
    {
      id: 'slightly_mixed',
      name: 'チョット混ぜた納豆',
      badge: '🌱',
      desc: 'ほんのりと糸が引き始めた状態。まだ豆の硬さと素朴な味わいが残る。',
      hint: 'ほんの少し、8回以上混ぜてすぐご飯に乗せてみよう！',
      check: (s) => s.mixCount >= 8,
      visualType: 'slightly'
    },
    {
      id: 'raw_fresh',
      name: '全然は納豆 (生まれたて)',
      badge: '📦',
      desc: 'まだパックから出したばかり。糸も泡もほとんどない四角く素朴な状態。',
      hint: 'パックから出したそのまま！混ぜずにすぐご飯に乗せよう！',
      check: () => true,
      visualType: 'raw'
    }
  ];

  const TOOL_DATA = {
    chopsticks: { name: '伝統の割り箸', icon: '🥢', speed: 1.0, foamRate: 1.0, crushRate: 0.15 },
    whisk:      { name: '超電導の電動泡だて器', icon: '⚡', speed: 2.5, foamRate: 4.0, crushRate: 0.05, isElectric: true },
    ladle:      { name: '重量級のお玉', icon: '🥄', speed: 0.8, foamRate: 0.7, crushRate: 0.6 },
    pestle:     { name: '粉砕のごますり棒', icon: '🪵', speed: 0.85, foamRate: 0.35, crushRate: 2.0 }
  };

  // ==========================================================================
  // 3. ゲーム状態 (State)
  // ==========================================================================
  const state = {
    screen: 'select',
    tool: 'chopsticks',
    mixCount: 0,
    accumulatedAngle: 0,
    prevAngle: null,
    viscosityPercent: 0,
    crushPercent: 0,
    mustardBlendPercent: 0,
    edgeSamples: 0,
    edgeSum: 0,
    edgeBiasScore: 0,

    sauceCount: 0,
    mustardCount: 0,
    onionCount: 0,

    isInteracting: false,
    pointerNormX: 0,
    pointerNormY: 0,

    // マイルストーン達成記録
    awakenMilestones: new Set(),
    unlockedForms: new Set(['raw_fresh'])
  };

  // ★ 超動的演出エフェクトステート
  const effectState = {
    fireActive: false,            // 炎が燃え盛っているか (普段はfalse = いつも普通の納豆)
    fireExtinguishTimer: null,
    stirSamples: []               // 直近の秒間回転速度計測用
  };

  function triggerFireIgnite() {
    if (effectState.fireActive) return;
    effectState.fireActive = true;
    clearTimeout(effectState.fireExtinguishTimer);
    effectState.fireExtinguishTimer = null;

    const flameEl = document.getElementById('flame-overlay');
    if (flameEl) flameEl.classList.add('burst');
  }

  function triggerFireExtinguish() {
    if (!effectState.fireActive) return;
    effectState.fireActive = false;
    clearTimeout(effectState.fireExtinguishTimer);
    effectState.fireExtinguishTimer = null;

    const flameEl = document.getElementById('flame-overlay');
    if (flameEl) flameEl.classList.remove('burst');

    // 白い消火スモーク（蒸気）をモクモクと立ち昇らせる！
    const smokeEl = document.getElementById('smoke-overlay');
    if (smokeEl) {
      smokeEl.classList.remove('active');
      void smokeEl.offsetWidth;
      smokeEl.classList.add('active');
    }
  }

  function triggerLightningSpark() {
    // 稲妻SE消去
    const lightEl = document.getElementById('lightning-overlay');
    if (lightEl) {
      lightEl.classList.remove('flash');
      void lightEl.offsetWidth;
      lightEl.classList.add('flash');
    }
  }

  function triggerGoldGodray() {
    // 黄金SE消去
    const goldEl = document.getElementById('gold-overlay');
    if (goldEl) {
      goldEl.classList.add('active');
      setTimeout(() => goldEl.classList.remove('active'), 2000);
    }
  }

  try {
    const saved = localStorage.getItem('natto_unlocked_forms_v4');
    if (saved) {
      JSON.parse(saved).forEach(id => state.unlockedForms.add(id));
    }
  } catch (e) {
    console.warn('Storage load error', e);
  }

  function saveUnlocked() {
    try {
      localStorage.setItem('natto_unlocked_forms_v4', JSON.stringify([...state.unlockedForms]));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }

  // ==========================================================================
  // 4. 器具選択画面の 3D サムネイル生成
  // ==========================================================================
  function createToolThumbnail(containerId, toolType) {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 180;
    const height = container.clientHeight || 120;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xfff5e6, 1.0);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const toolGroup = build3DToolMesh(toolType);
    scene.add(toolGroup);

    let angle = 0;
    function animateThumb() {
      if (state.screen === 'select') {
        requestAnimationFrame(animateThumb);
        angle += 0.02;
        toolGroup.rotation.y = angle;
        toolGroup.rotation.x = Math.sin(angle * 0.7) * 0.2;
        if (toolGroup.userData && toolGroup.userData.isElectric) {
          if (toolGroup.userData.beaterL) toolGroup.userData.beaterL.rotation.y += 0.2;
          if (toolGroup.userData.beaterR) toolGroup.userData.beaterR.rotation.y -= 0.2;
        }
        renderer.render(scene, camera);
      }
    }
    requestAnimationFrame(animateThumb);

    window.addEventListener('resize', () => {
      if (state.screen !== 'select') return;
      const w = container.clientWidth || 100;
      const h = container.clientHeight || 80;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  function build3DToolMesh(toolType) {
    const group = new THREE.Group();

    if (toolType === 'chopsticks') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xd2a679, roughness: 0.5 });
      const geom = new THREE.CylinderGeometry(0.08, 0.15, 3.8, 8);
      
      const stick1 = new THREE.Mesh(geom, mat);
      stick1.position.x = -0.22;
      stick1.rotation.z = 0.08;
      
      const stick2 = new THREE.Mesh(geom, mat);
      stick2.position.x = 0.22;
      stick2.rotation.z = -0.08;
      
      group.add(stick1, stick2);
      group.rotation.z = Math.PI / 4;
    } else if (toolType === 'whisk') {
      // ===== 超電導の電動泡だて器 (Automatic Electric Mixer) =====
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.2,
        roughness: 0.3
      });
      const darkGripMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.3,
        roughness: 0.6
      });
      const cyanAccentMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00d4e6,
        emissiveIntensity: 1.2,
        metalness: 0.8,
        roughness: 0.2
      });
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        metalness: 0.95,
        roughness: 0.1
      });

      // 1. メインモーター本体 (Motor Housing Body)
      const motorBodyGeom = new THREE.CylinderGeometry(0.38, 0.42, 1.5, 18);
      const motorBody = new THREE.Mesh(motorBodyGeom, bodyMat);
      motorBody.position.y = 1.35;
      motorBody.rotation.z = Math.PI / 10;
      group.add(motorBody);

      // 上部丸みキャップ
      const topDomeGeom = new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const topDome = new THREE.Mesh(topDomeGeom, bodyMat);
      topDome.position.set(-0.23, 2.05, 0);
      topDome.rotation.z = Math.PI / 10;
      group.add(topDome);

      // 2. 人間工学グリップハンドル (Arch Handle)
      const handleGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.3, 12);
      const handle = new THREE.Mesh(handleGeom, darkGripMat);
      handle.position.set(0.48, 1.45, 0);
      handle.rotation.z = -Math.PI / 16;
      group.add(handle);

      const hTopGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 10);
      const hTop = new THREE.Mesh(hTopGeom, darkGripMat);
      hTop.position.set(0.3, 2.02, 0);
      hTop.rotation.z = Math.PI / 2.5;
      group.add(hTop);

      const hBot = new THREE.Mesh(hTopGeom, darkGripMat);
      hBot.position.set(0.32, 0.82, 0);
      hBot.rotation.z = -Math.PI / 2.5;
      group.add(hBot);

      // 3. パワーLED・スピードスイッチ
      const ledGeom = new THREE.SphereGeometry(0.08, 10, 10);
      const led = new THREE.Mesh(ledGeom, cyanAccentMat);
      led.position.set(-0.35, 2.05, 0.15);
      group.add(led);

      const switchGeom = new THREE.BoxGeometry(0.12, 0.18, 0.1);
      const sw = new THREE.Mesh(switchGeom, cyanAccentMat);
      sw.position.set(0.18, 2.15, 0);
      group.add(sw);

      // 4. 下部チャック接続部 (Ejection Collar)
      const collarGeom = new THREE.CylinderGeometry(0.36, 0.28, 0.35, 16);
      const collar = new THREE.Mesh(collarGeom, chromeMat);
      collar.position.set(0.12, 0.52, 0);
      group.add(collar);

      // 5. ツイン回転ビーター (Twin counter-rotating beaters)
      function createBeaterBlade() {
        const beaterSubGroup = new THREE.Group();

        // センター金属シャフト
        const shaftGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 10);
        const shaft = new THREE.Mesh(shaftGeom, chromeMat);
        shaft.position.y = -0.3;
        beaterSubGroup.add(shaft);

        // 4枚のステンレスワイヤーループ
        for (let i = 0; i < 4; i++) {
          const torusGeom = new THREE.TorusGeometry(0.24, 0.022, 8, 20);
          const wire = new THREE.Mesh(torusGeom, chromeMat);
          wire.rotation.y = (Math.PI / 4) * i;
          wire.scale.set(0.7, 1.45, 0.7);
          wire.position.y = -0.65;
          beaterSubGroup.add(wire);
        }

        // 下端チップ
        const tipGeom = new THREE.SphereGeometry(0.06, 8, 8);
        const tip = new THREE.Mesh(tipGeom, chromeMat);
        tip.position.y = -1.02;
        beaterSubGroup.add(tip);

        return beaterSubGroup;
      }

      const beaterL = createBeaterBlade();
      beaterL.position.set(0.02, 0.45, -0.16);
      group.add(beaterL);

      const beaterR = createBeaterBlade();
      beaterR.position.set(0.18, 0.45, 0.16);
      group.add(beaterR);

      group.userData.beaterL = beaterL;
      group.userData.beaterR = beaterR;
      group.userData.isElectric = true;

      group.rotation.z = -Math.PI / 12;
    } else if (toolType === 'ladle') {
      const metalMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.75, roughness: 0.25 });
      
      const cupGeom = new THREE.SphereGeometry(0.9, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const cup = new THREE.Mesh(cupGeom, metalMat);
      cup.rotation.x = Math.PI;
      cup.position.y = -0.6;
      group.add(cup);

      const handleGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 12);
      const handle = new THREE.Mesh(handleGeom, metalMat);
      handle.position.set(0, 0.7, 0.4);
      handle.rotation.x = -Math.PI / 8;
      group.add(handle);
      group.rotation.z = Math.PI / 5;
    } else {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
      const geom = new THREE.CylinderGeometry(0.4, 0.55, 3.2, 16);
      const pestle = new THREE.Mesh(geom, woodMat);
      group.add(pestle);
      group.rotation.z = Math.PI / 6;
    }

    return group;
  }

  // ==========================================================================
  // 5. メイン3Dシーン (Three.js WebGL)
  // ==========================================================================
  let mainScene, mainCamera, mainRenderer;
  let bowlMesh, toolMeshGroup;
  let beanInstancedMesh, beanMaterial;
  let stringLines;
  let foamInstancedMesh;
  let sauceLiquidMesh;
  let mustardGroup, onionGroup;
  let firePoints, fireLight;
  const FIRE_COUNT = 140;
  const fireVel = [];

  const BEAN_COUNT = 850;
  const FOAM_MAX = 500;
  const beansData = [];
  const foamData = [];

  const onionsPhysics = [];
  const mustardsPhysics = [];

  function initMain3DScene() {
    const container = document.getElementById('three-viewport');
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 500;

    mainScene = new THREE.Scene();
    mainScene.fog = new THREE.FogExp2(0x1a120c, 0.035);

    mainCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    mainCamera.position.set(0, 8.8, 7.8);
    mainCamera.lookAt(0, -0.6, 0);

    mainRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    mainRenderer.setSize(width, height);
    mainRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mainRenderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(mainRenderer.domElement);

    // DOM要素の追加 (枠・カードUI完全撤廃：純粋な映像演出)
    const sparklesLayer = document.createElement('div');
    sparklesLayer.id = 'mix-sparkles';
    sparklesLayer.className = 'mix-sparkles-layer';
    container.appendChild(sparklesLayer);

    const flameOverlay = document.createElement('div');
    flameOverlay.id = 'flame-overlay';
    flameOverlay.className = 'flame-overlay';
    flameOverlay.innerHTML = '<div class="flame-vignette"></div>';
    container.appendChild(flameOverlay);

    const rockOverlay = document.createElement('div');
    rockOverlay.id = 'rock-overlay';
    rockOverlay.className = 'rock-overlay';
    container.appendChild(rockOverlay);

    const typhoonOverlay = document.createElement('div');
    typhoonOverlay.id = 'typhoon-overlay';
    typhoonOverlay.className = 'typhoon-overlay';
    typhoonOverlay.innerHTML = '<div class="typhoon-wind"></div><div class="typhoon-lightning"></div>';
    container.appendChild(typhoonOverlay);

    const ambLight = new THREE.AmbientLight(0xfff0dd, 0.95);
    mainScene.add(ambLight);

    const mainLight = new THREE.DirectionalLight(0xfff8ee, 1.5);
    mainLight.position.set(5, 12, 6);
    mainLight.castShadow = true;
    mainScene.add(mainLight);

    const rimLight = new THREE.PointLight(0xffb366, 1.3, 16);
    rimLight.position.set(-6, 4, -4);
    mainScene.add(rimLight);

    // 炎演出用 3Dポイントライト
    fireLight = new THREE.PointLight(0xff3d00, 0, 14);
    fireLight.position.set(0, 0.6, 0);
    mainScene.add(fireLight);

    // 3D炎パーティクルシステム
    init3DFireParticles();

    create3DBowl();
    create3DBeans();
    create3DStrings();
    create3DFoam();
    create3DSauceLiquid();

    mustardGroup = new THREE.Group();
    onionGroup = new THREE.Group();
    mainScene.add(mustardGroup);
    mainScene.add(onionGroup);
    onionsPhysics.length = 0;
    mustardsPhysics.length = 0;

    create3DActiveTool();

    function handleResize() {
      if (!mainRenderer || state.screen !== 'mix') return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      mainCamera.aspect = w / h;
      if (w < 600) {
        mainCamera.fov = 55;
        mainCamera.position.set(0, 9.4, 8.4);
      } else {
        mainCamera.fov = 45;
        mainCamera.position.set(0, 8.8, 7.8);
      }
      mainCamera.updateProjectionMatrix();
      mainRenderer.setSize(w, h);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => setTimeout(handleResize, 100));
    handleResize();

    animateMain3D();
  }

  function create3DBowl() {
    const bowlGeom = new THREE.CylinderGeometry(3.6, 2.2, 2.3, 36, 1, true);
    const bowlMat = new THREE.MeshStandardMaterial({
      color: 0x241710,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    bowlMesh = new THREE.Mesh(bowlGeom, bowlMat);
    bowlMesh.position.y = -1.0;
    mainScene.add(bowlMesh);

    const bottomGeom = new THREE.CircleGeometry(2.2, 36);
    const bottom = new THREE.Mesh(bottomGeom, bowlMat);
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -2.15;
    mainScene.add(bottom);

    const tableGeom = new THREE.PlaneGeometry(30, 30);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x150f0c, roughness: 0.9 });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.rotation.x = -Math.PI / 2;
    table.position.y = -2.2;
    mainScene.add(table);
  }

  function create3DBeans() {
    // ふっくらと大粒で美味しそうな立体納豆ビーンズ
    const beanGeom = new THREE.SphereGeometry(0.25, 10, 8);
    beanGeom.scale(1.0, 0.68, 1.4);

    beanMaterial = new THREE.MeshStandardMaterial({
      color: 0x763e18,
      roughness: 0.28,
      metalness: 0.1
    });

    beanInstancedMesh = new THREE.InstancedMesh(beanGeom, beanMaterial, BEAN_COUNT);
    beanInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    beansData.length = 0;
    const dummy = new THREE.Object3D();

    // ★ 納豆が真ん中に固まらず、器の底全体（半径0.2〜2.1）にふっくらと自然に広がるように配置！
    for (let i = 0; i < BEAN_COUNT; i++) {
      // 均一な円盤分布 (フィボナッチ分布/黄金比スパイラル + 自然なジッター)
      const phi = i * 137.5 * (Math.PI / 180);
      const rRatio = Math.sqrt((i + 0.5) / BEAN_COUNT);
      const radius = 0.2 + rRatio * 1.9 + (Math.random() - 0.5) * 0.12;
      const angle = phi + (Math.random() - 0.5) * 0.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // 器の底面（y = -1.9 〜 -1.6）に自然に重なり合う
      const baseHeight = -1.95 + Math.pow(Math.max(0, radius - 1.5) / 0.7, 2) * 0.35;
      const layerOffset = (i % 4) * 0.08 + Math.random() * 0.05;
      const y = baseHeight + layerOffset;

      beansData.push({
        x: x, y: y, z: z,
        originR: radius,
        originAng: angle,
        vx: 0, vy: 0, vz: 0,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        scaleY: 1.0,
        crush: 0
      });

      dummy.position.set(x, y, z);
      dummy.rotation.set(beansData[i].rotX, beansData[i].rotY, beansData[i].rotZ);
      dummy.updateMatrix();
      beanInstancedMesh.setMatrixAt(i, dummy.matrix);
    }

    beanInstancedMesh.instanceMatrix.needsUpdate = true;
    mainScene.add(beanInstancedMesh);
  }

  function create3DStrings() {
    const lineCount = 260;
    const positions = new Float32Array(lineCount * 6);
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });

    stringLines = new THREE.LineSegments(lineGeom, lineMat);
    mainScene.add(stringLines);
  }

  function create3DFoam() {
    const foamGeom = new THREE.SphereGeometry(0.13, 8, 8);
    const foamMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92
    });

    foamInstancedMesh = new THREE.InstancedMesh(foamGeom, foamMat, FOAM_MAX);
    foamInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    foamData.length = 0;
    const dummy = new THREE.Object3D();
    dummy.scale.set(0.001, 0.001, 0.001);
    dummy.updateMatrix();

    for (let i = 0; i < FOAM_MAX; i++) {
      foamData.push({ active: false, x: 0, y: 0, z: 0, scale: 0 });
      foamInstancedMesh.setMatrixAt(i, dummy.matrix);
    }
    foamInstancedMesh.instanceMatrix.needsUpdate = true;
    mainScene.add(foamInstancedMesh);
  }

  function create3DSauceLiquid() {
    const liquidGeom = new THREE.CircleGeometry(2.5, 36);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x3d1706,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.0
    });
    sauceLiquidMesh = new THREE.Mesh(liquidGeom, liquidMat);
    sauceLiquidMesh.rotation.x = -Math.PI / 2;
    sauceLiquidMesh.position.y = -1.8;
    mainScene.add(sauceLiquidMesh);
  }

  function init3DFireParticles() {
    if (firePoints) mainScene.remove(firePoints);
    const fireGeom = new THREE.BufferGeometry();
    const firePos = new Float32Array(FIRE_COUNT * 3);
    const fireColors = new Float32Array(FIRE_COUNT * 3);
    fireVel.length = 0;

    for (let i = 0; i < FIRE_COUNT; i++) {
      const r = Math.random() * 2.1;
      const a = Math.random() * Math.PI * 2;
      firePos[i * 3] = Math.cos(a) * r;
      firePos[i * 3 + 1] = -1.2 + Math.random() * 2.5;
      firePos[i * 3 + 2] = Math.sin(a) * r;

      const isYellow = Math.random() > 0.45;
      fireColors[i * 3] = 1.0;
      fireColors[i * 3 + 1] = isYellow ? 0.8 : 0.25;
      fireColors[i * 3 + 2] = 0.05;

      fireVel.push({
        vy: 0.05 + Math.random() * 0.08,
        swaySpeed: 2 + Math.random() * 4
      });
    }

    fireGeom.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    fireGeom.setAttribute('color', new THREE.BufferAttribute(fireColors, 3));

    const fireMat = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    firePoints = new THREE.Points(fireGeom, fireMat);
    mainScene.add(firePoints);
  }

  function create3DActiveTool() {
    if (toolMeshGroup) mainScene.remove(toolMeshGroup);
    toolMeshGroup = build3DToolMesh(state.tool);
    toolMeshGroup.scale.set(1.4, 1.4, 1.4);
    toolMeshGroup.position.set(0, 1.5, 0);
    mainScene.add(toolMeshGroup);
  }

  // ==========================================================================
  // 6. 3D物理・流体メインループ
  // ==========================================================================
  let tornadoPhase = 0;

  function animateMain3D() {
    requestAnimationFrame(animateMain3D);
    if (state.screen !== 'mix') return;

    const dummy = new THREE.Object3D();

    // 1. 器具の追従 (手動操作時のみ傾き、静止時はピタッと止まる)
    if (toolMeshGroup) {
      const targetX = state.pointerNormX * 2.3;
      const targetZ = state.pointerNormY * 2.3;
      toolMeshGroup.position.x += (targetX - toolMeshGroup.position.x) * 0.25;
      toolMeshGroup.position.z += (targetZ - toolMeshGroup.position.z) * 0.25;

      const mixDepth = state.isInteracting ? -0.8 : -0.2;
      toolMeshGroup.position.y += (mixDepth - toolMeshGroup.position.y) * 0.2;

      if (state.isInteracting) {
        toolMeshGroup.rotation.z = Math.sin(performance.now() * 0.01) * 0.12;
      }

      // 電動泡だて器の自動超高速回転・モーター音＆自動加算アシスト
      if (state.tool === 'whisk' && toolMeshGroup.userData && toolMeshGroup.userData.isElectric) {
        if (state.isInteracting) {
          if (toolMeshGroup.userData.beaterL) toolMeshGroup.userData.beaterL.rotation.y += 0.9;
          if (toolMeshGroup.userData.beaterR) toolMeshGroup.userData.beaterR.rotation.y -= 0.9;

          // 自動モーター回転加算 (電動なので押しっぱなしでもグングン混ざる！)
          state.accumulatedAngle += 0.16 * TOOL_DATA.whisk.speed;
          const newMix = Math.floor(state.accumulatedAngle / (Math.PI * 2));
          if (newMix > state.mixCount) {
            state.mixCount = newMix;
            const rect = threeViewport.getBoundingClientRect();
            const px = ((state.pointerNormX + 1) * 0.5) * rect.width;
            const py = ((state.pointerNormY + 1) * 0.5) * rect.height;
            onMixStep(px, py);
          }

          // モーター微振動
          toolMeshGroup.position.x += (Math.random() - 0.5) * 0.04;
          toolMeshGroup.position.z += (Math.random() - 0.5) * 0.04;
        } else {
          if (toolMeshGroup.userData.beaterL) toolMeshGroup.userData.beaterL.rotation.y += 0.04;
          if (toolMeshGroup.userData.beaterR) toolMeshGroup.userData.beaterR.rotation.y -= 0.04;
        }
      }
    }

    // ★ 炎演出: 秒間で超高速で混ぜた時だけ発火！(常時燃焼や回数固定は完全撤廃し、普段は普通の納豆)
    const isFire = effectState.fireActive;
    const isRock = state.mixCount >= 90 && state.mixCount < 160;
    const isTyphoon = state.mixCount >= 160 && state.mixCount < 300;
    const isCosmic = state.mixCount >= 300;

    const isTornado = state.mixCount >= 160;
    if (isTornado) tornadoPhase += 0.22;

    const flameOverlay = document.getElementById('flame-overlay');
    const smokeOverlay = document.getElementById('smoke-overlay');
    const lightningOverlay = document.getElementById('lightning-overlay');
    const goldOverlay = document.getElementById('gold-overlay');
    const typhoonOverlay = document.getElementById('typhoon-overlay');
    const viewportCont = document.getElementById('three-viewport');

    // 炎演出 (ボワッと燃え上がり、消えるときはスッと煙が出る・画面揺れは完全廃止！)
    if (isFire) {
      if (flameOverlay) flameOverlay.classList.add('burst');
    } else {
      if (flameOverlay) flameOverlay.classList.remove('burst');
    }

    if (isTyphoon || isCosmic) {
      if (typhoonOverlay) typhoonOverlay.classList.add('active');
    } else {
      if (typhoonOverlay) typhoonOverlay.classList.remove('active');
    }

    // 炎パーティクル & 炎ライティングの更新
    if (firePoints && fireLight) {
      if (isFire) {
        firePoints.material.opacity = Math.min(0.98, firePoints.material.opacity + 0.12);
        const posAttr = firePoints.geometry.attributes.position;
        for (let i = 0; i < FIRE_COUNT; i++) {
          let y = posAttr.getY(i) + fireVel[i].vy * 1.3;
          if (y > 3.4) {
            y = -1.5 + Math.random() * 0.4;
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * 2.1;
            posAttr.setX(i, Math.cos(a) * r);
            posAttr.setZ(i, Math.sin(a) * r);
          } else {
            posAttr.setX(i, posAttr.getX(i) + Math.sin(performance.now() * 0.008 + i) * 0.025);
            posAttr.setZ(i, posAttr.getZ(i) + Math.cos(performance.now() * 0.008 + i) * 0.025);
          }
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
        fireLight.intensity = 3.5 + Math.sin(performance.now() * 0.025) * 1.5;
      } else {
        firePoints.material.opacity = Math.max(0, firePoints.material.opacity - 0.08);
        fireLight.intensity = Math.max(0, fireLight.intensity - 0.2);
      }
    }

    // 2. ★ 豆の物理更新 (真ん中に固まるのを完全にやめ、器全体にふっくら広げる！)
    for (let i = 0; i < BEAN_COUNT; i++) {
      const b = beansData[i];

      if (state.isInteracting) {
        const dx = b.x - toolMeshGroup.position.x;
        const dz = b.z - toolMeshGroup.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.3) {
          // ツール周辺の豆を力強く巻き上げ＆回転＆外向き拡散（真ん中に固まらせない！）
          const force = (1.3 - dist) * 0.45;
          b.vx += (dz / (dist + 0.1)) * force * 1.2;
          b.vz -= (dx / (dist + 0.1)) * force * 1.2;
          b.vx += (dx / (dist + 0.1)) * force * 0.4;
          b.vz += (dz / (dist + 0.1)) * force * 0.4;
          b.vy += force * 0.35;
          b.crush = Math.min(1.0, b.crush + 0.003 * TOOL_DATA[state.tool].crushRate);
        }
      }

      if (isCosmic) {
        // コズミック銀河スパイラル
        const t = i / BEAN_COUNT;
        const ringRad = 0.5 + t * 1.8;
        const ringAng = tornadoPhase * 1.5 + t * Math.PI * 6;
        b.x = Math.cos(ringAng) * ringRad;
        b.z = Math.sin(ringAng) * ringRad;
        b.y = -0.9 + Math.sin(ringAng * 2) * 0.7;
      } else if (isTyphoon) {
        // 台風スパイラル超竜巻
        const t = i / BEAN_COUNT;
        const height = -1.6 + t * 4.4;
        const radius = 0.4 + (t * 1.8);
        const angle = tornadoPhase * 3.2 + (t * 8.0);
        b.x = Math.cos(angle) * radius;
        b.z = Math.sin(angle) * radius;
        b.y = height + Math.sin(tornadoPhase * 2 + i * 0.3) * 0.18;
      } else if (isRock) {
        // カチコチ硬化
        const r = Math.sqrt(b.x * b.x + b.z * b.z);
        if (r > 1.9) {
          b.x *= 1.9 / r;
          b.z *= 1.9 / r;
        }
        b.vx = 0; b.vz = 0; b.vy = 0;
        b.y = -1.4 + (r * 0.15);
        if (state.isInteracting) {
          b.x += (Math.random() - 0.5) * 0.015;
          b.z += (Math.random() - 0.5) * 0.015;
        }
      } else {
        b.x += b.vx;
        b.y += b.vy;
        b.z += b.vz;
        b.vx *= 0.86;
        b.vy *= 0.86;
        b.vz *= 0.86;

        const r = Math.sqrt(b.x * b.x + b.z * b.z);
        // 器の側壁（半径2.15）での反発
        if (r > 2.15) {
          const norm = 2.15 / r;
          b.x *= norm;
          b.z *= norm;
          b.vx = -b.vx * 0.4;
          b.vz = -b.vz * 0.4;
        }

        // ★ 真ん中にギュッと固まるのを防止！中心（r < 0.45）に密集しすぎた豆を外側へ自然拡散
        if (r < 0.45) {
          const push = (0.45 - r) * 0.025;
          const pushAng = b.originAng || (i * 0.4);
          b.vx += Math.cos(pushAng) * push;
          b.vz += Math.sin(pushAng) * push;
        }

        // 器の底面（平らな底面 + フチだけ緩やかにせり上がる）
        const targetBaseY = -1.95 + Math.pow(Math.max(0, r - 1.5) / 0.7, 2) * 0.35 + (i % 4) * 0.08;
        b.y += (targetBaseY - b.y) * 0.1;
      }

      b.scaleY = Math.max(0.3, 1.0 - b.crush * 0.7);

      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(b.rotX, b.rotY, b.rotZ);
      dummy.scale.set(1.0 + b.crush * 0.35, b.scaleY, 1.0 + b.crush * 0.35);
      dummy.updateMatrix();
      beanInstancedMesh.setMatrixAt(i, dummy.matrix);
    }
    beanInstancedMesh.instanceMatrix.needsUpdate = true;

    // 形態ごとのマテリアル動的変化
    if (beanMaterial) {
      if (isCosmic) {
        const t = performance.now() * 0.002;
        beanMaterial.color.setHSL((t % 1.0), 0.8, 0.5);
        beanMaterial.emissive.setHSL((t % 1.0), 0.9, 0.4);
      } else if (isFire) {
        // 摩擦熱でマグマ灼熱発火
        beanMaterial.color.setRGB(0.95, 0.26, 0.05);
        beanMaterial.emissive.setRGB(0.65, 0.14, 0.0);
      } else if (isRock) {
        // 水分蒸発でカチコチ黒曜石・金属ダイヤモンド硬化
        beanMaterial.color.setRGB(0.24, 0.28, 0.36);
        beanMaterial.emissive.setRGB(0, 0, 0);
        beanMaterial.metalness = 0.88;
        beanMaterial.roughness = 0.18;
      } else if (state.mustardBlendPercent > 0) {
        const blend = Math.min(1.0, state.mustardBlendPercent / 100);
        const r = 0.48 + blend * 0.40;
        const g = 0.26 + blend * 0.42;
        const b = 0.10 + blend * 0.05;
        beanMaterial.color.setRGB(r, g, b);
        beanMaterial.emissive.setRGB(0, 0, 0);
        beanMaterial.metalness = 0.12;
        beanMaterial.roughness = 0.25;
      } else {
        beanMaterial.color.setRGB(0.48, 0.26, 0.1);
        beanMaterial.emissive.setRGB(0, 0, 0);
        beanMaterial.metalness = 0.12;
        beanMaterial.roughness = 0.25;
      }
    }

    // 3. ネギの混ざり合い物理
    if (state.isInteracting && onionsPhysics.length > 0) {
      for (const o of onionsPhysics) {
        const dx = o.mesh.position.x - toolMeshGroup.position.x;
        const dz = o.mesh.position.z - toolMeshGroup.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.3) {
          const force = (1.3 - dist) * 0.25;
          o.vx += (dz / (dist + 0.1)) * force;
          o.vz -= (dx / (dist + 0.1)) * force;
          o.mesh.rotation.y += 0.2;
        }
        o.mesh.position.x += o.vx;
        o.mesh.position.z += o.vz;
        o.vx *= 0.88;
        o.vz *= 0.88;

        const r = Math.sqrt(o.mesh.position.x ** 2 + o.mesh.position.z ** 2);
        if (r > 2.5) {
          o.mesh.position.x *= 2.5 / r;
          o.mesh.position.z *= 2.5 / r;
        }
      }
    }

    // 4. からしの混ざり合い物理
    if (state.isInteracting && mustardsPhysics.length > 0) {
      for (let i = mustardsPhysics.length - 1; i >= 0; i--) {
        const m = mustardsPhysics[i];
        const dx = m.mesh.position.x - toolMeshGroup.position.x;
        const dz = m.mesh.position.z - toolMeshGroup.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.3) {
          m.mesh.scale.x = Math.max(0.1, m.mesh.scale.x - 0.02);
          m.mesh.scale.y = Math.max(0.1, m.mesh.scale.y - 0.02);
          m.mesh.scale.z = Math.max(0.1, m.mesh.scale.z - 0.02);
          state.mustardBlendPercent = Math.min(100, state.mustardBlendPercent + 1.5);
          if (m.mesh.scale.x <= 0.15) {
            mustardGroup.remove(m.mesh);
            mustardsPhysics.splice(i, 1);
          }
        }
      }
    }

    // 5. 3D白い糸の更新 (8回以上から急激に激増！)
    if (stringLines && state.viscosityPercent > 3) {
      const posAttr = stringLines.geometry.attributes.position;
      const count = posAttr.count / 2;
      let ptr = 0;
      for (let i = 0; i < count; i++) {
        const b1 = beansData[i % BEAN_COUNT];
        const b2 = beansData[(i * 7 + 13) % BEAN_COUNT];
        posAttr.setXYZ(ptr++, b1.x, b1.y, b1.z);
        const midY = (b1.y + b2.y) * 0.5 - (0.15 * (1 - state.viscosityPercent / 100));
        posAttr.setXYZ(ptr++, b2.x, midY, b2.z);
      }
      posAttr.needsUpdate = true;
      stringLines.material.opacity = Math.min(0.88, state.viscosityPercent * 0.015);
    }

    // 6. 3D泡の更新・膨張
    const foamDummy = new THREE.Object3D();
    const foamActiveCount = Math.floor((state.viscosityPercent / 100) * FOAM_MAX);
    for (let i = 0; i < FOAM_MAX; i++) {
      const f = foamData[i];
      if (i < foamActiveCount) {
        if (!f.active) {
          f.active = true;
          const refBean = beansData[i % BEAN_COUNT];
          f.x = refBean.x + (Math.random() * 0.3 - 0.15);
          f.y = refBean.y + 0.15 + Math.random() * 0.2;
          f.z = refBean.z + (Math.random() * 0.3 - 0.15);
          f.scale = 0.5 + Math.random() * 1.2;
        }
        const extraMeringue = state.tool === 'whisk' ? 0.35 : 0;
        foamDummy.position.set(f.x, f.y + extraMeringue, f.z);
        foamDummy.scale.set(f.scale, f.scale, f.scale);
      } else {
        foamDummy.scale.set(0.001, 0.001, 0.001);
      }
      foamDummy.updateMatrix();
      foamInstancedMesh.setMatrixAt(i, foamDummy.matrix);
    }
    foamInstancedMesh.instanceMatrix.needsUpdate = true;

    // 7. タレの水位
    if (sauceLiquidMesh) {
      if (state.sauceCount > 0) {
        sauceLiquidMesh.material.opacity = Math.min(0.85, 0.25 + state.sauceCount * 0.08);
        const liquidLevel = Math.min(-0.8, -1.8 + state.sauceCount * 0.08);
        sauceLiquidMesh.position.y += (liquidLevel - sauceLiquidMesh.position.y) * 0.1;
      } else {
        sauceLiquidMesh.material.opacity = 0;
      }
    }

    mainRenderer.render(mainScene, mainCamera);
  }

  // ==========================================================================
  // 7. 薬味の無限投入
  // ==========================================================================
  function spawn3DSauceDrops() {
    if (!mainScene) return;
    for (let i = 0; i < 6; i++) {
      const dropGeom = new THREE.SphereGeometry(0.12, 8, 8);
      const dropMat = new THREE.MeshStandardMaterial({ color: 0x2b1003, roughness: 0.1 });
      const drop = new THREE.Mesh(dropGeom, dropMat);
      drop.position.set((Math.random() - 0.5) * 1.5, 4.0 + Math.random() * 1.5, (Math.random() - 0.5) * 1.5);
      mainScene.add(drop);

      let fallY = drop.position.y;
      const targetY = -1.2;
      const dropTimer = setInterval(() => {
        fallY -= 0.35;
        drop.position.y = fallY;
        if (fallY <= targetY) {
          clearInterval(dropTimer);
          mainScene.remove(drop);
        }
      }, 20);
    }
  }

  function spawn3DMustard() {
    if (!mustardGroup) return;
    const geom = new THREE.SphereGeometry(0.35, 12, 12);
    geom.scale(1.2, 0.6, 1.0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.35 });
    const dollop = new THREE.Mesh(geom, mat);
    
    const stackY = -1.2 + Math.min(2.0, state.mustardCount * 0.15);
    dollop.position.set((Math.random() - 0.5) * 0.8, stackY, (Math.random() - 0.5) * 0.8);
    mustardGroup.add(dollop);
    mustardsPhysics.push({ mesh: dollop });
  }

  function spawn3DOnions() {
    if (!onionGroup) return;
    for (let i = 0; i < 8; i++) {
      const geom = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 10);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
      const slice = new THREE.Mesh(geom, mat);
      
      const r = Math.random() * 2.2;
      const ang = Math.random() * Math.PI * 2;
      slice.position.set(Math.cos(ang) * r, -1.2 + Math.random() * 0.3 + (state.onionCount * 0.04), Math.sin(ang) * r);
      slice.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      onionGroup.add(slice);
      onionsPhysics.push({ mesh: slice, vx: 0, vz: 0 });
    }
  }

  function triggerSparkle(x, y) {
    // 押したときのエフェクトは完全消去
  }

  // ==========================================================================
  // 8. 混ぜる操作 (8回以上から超変化！)
  // ==========================================================================
  const threeViewport = document.getElementById('three-viewport');
  const mixCountEl = document.getElementById('mix-count');

  function getViewportCoords(e) {
    const rect = threeViewport.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((clientY - rect.top) / rect.height) * 2 - 1;
    return { normX, normY, px: clientX - rect.left, py: clientY - rect.top };
  }

  function handlePointerDown(e) {
    e.preventDefault();
    sound.init();
    state.isInteracting = true;

    const pos = getViewportCoords(e);
    state.pointerNormX = pos.normX;
    state.pointerNormY = pos.normY;
    state.prevAngle = Math.atan2(pos.normY, pos.normX);

    // ★ 押したときのエフェクト・SEは完全消去！
  }

  let lastStirSoundTime = 0;

  function handlePointerMove(e) {
    if (!state.isInteracting) return;
    e.preventDefault();

    const now = performance.now();
    const pos = getViewportCoords(e);
    state.pointerNormX = pos.normX;
    state.pointerNormY = pos.normY;

    // ★ 混ぜSE (ごく控えめな微小音のみ)
    if (now - lastStirSoundTime > 90) {
      lastStirSoundTime = now;
      sound.playSquish(Math.min(0.8, 0.25 + state.viscosityPercent / 80));
    }

    const dist = Math.sqrt(pos.normX * pos.normX + pos.normY * pos.normY);
    state.edgeSamples++;
    state.edgeSum += Math.min(1.0, dist);
    const avgDist = state.edgeSum / state.edgeSamples;
    state.edgeBiasScore = Math.min(100, Math.max(0, Math.round(((avgDist - 0.45) / 0.45) * 100)));

    const currentAngle = Math.atan2(pos.normY, pos.normX);
    if (state.prevAngle !== null) {
      let delta = currentAngle - state.prevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      const speed = Math.abs(delta);
      const tool = TOOL_DATA[state.tool];

      // ★ 秒間回転速度 (DPS) をリアルタイム精密計測！
      effectState.stirSamples.push({ t: now, d: speed });
      const windowMs = 650;
      while (effectState.stirSamples.length > 0 && now - effectState.stirSamples[0].t > windowMs) {
        effectState.stirSamples.shift();
      }

      // 直近の秒間回転数を計算 (turns/sec)
      let totalAngle = 0;
      for (let s of effectState.stirSamples) totalAngle += s.d;
      const timeSpanSec = Math.max(0.2, (now - effectState.stirSamples[0].t) / 1000);
      const turnsPerSec = (totalAngle / (Math.PI * 2)) / timeSpanSec;

      // ★ 条件: 秒間でめっちゃ混ぜた時だけ (秒間4.2回転以上の超猛スピード！) 燃える！
      // いつもは普通の納豆で、超高速ラッシュ時のみ発火！
      if (turnsPerSec >= 4.2) {
        triggerFireIgnite();
      } else if (turnsPerSec < 2.5 && effectState.fireActive) {
        // スピードを緩めたらスッと煙を出して鎮火！普通の納豆に戻る！
        if (!effectState.fireExtinguishTimer) {
          effectState.fireExtinguishTimer = setTimeout(() => {
            triggerFireExtinguish();
          }, 350);
        }
      } else if (turnsPerSec >= 3.0 && effectState.fireExtinguishTimer) {
        clearTimeout(effectState.fireExtinguishTimer);
        effectState.fireExtinguishTimer = null;
      }

      state.accumulatedAngle += speed * tool.speed;
      const newMix = Math.floor(state.accumulatedAngle / (Math.PI * 2));
      if (newMix > state.mixCount) {
        state.mixCount = newMix;
        onMixStep(pos.px, pos.py);
      }
    }
    state.prevAngle = currentAngle;
  }

  function handlePointerUp() {
    state.isInteracting = false;
    state.prevAngle = null;
    effectState.stirSamples.length = 0;

    // 手を離したらスッと鎮火していつもの普通の納豆へ！
    if (effectState.fireActive) {
      setTimeout(() => {
        if (!state.isInteracting && effectState.fireActive) {
          triggerFireExtinguish();
        }
      }, 200);
    }
  }

  threeViewport.addEventListener('mousedown', handlePointerDown);
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', handlePointerUp);

  threeViewport.addEventListener('touchstart', handlePointerDown, { passive: false });
  window.addEventListener('touchmove', handlePointerMove, { passive: false });
  window.addEventListener('touchend', handlePointerUp);

  function onMixStep(px, py) {
    const tool = TOOL_DATA[state.tool];

    // 粘り・泡立ちの加算
    const boost = state.mixCount >= 8 ? 1.6 : 0.8;
    state.viscosityPercent = Math.min(100, state.viscosityPercent + 0.8 * tool.foamRate * boost);
    state.crushPercent = Math.min(100, state.crushPercent + 0.4 * tool.crushRate);

    // ★ 混ぜ回数のSEは消す！(カウントアップで鳴っていた音を完全排除)
    // ここでは回数音は一切鳴らしません！

    // ★ 圧倒的な新演出トリガー (炎は秒間高速判定に移行、回数固定の燃焼は完全撤廃)
    const c = state.mixCount;
    if (c === 30 && !state.awakenMilestones.has(30)) {
      state.awakenMilestones.add(30);
      triggerGoldGodray();
    } else if (c === 90 && !state.awakenMilestones.has(90)) {
      state.awakenMilestones.add(90);
      triggerLightningSpark();
    } else if (c === 160 && !state.awakenMilestones.has(160)) {
      state.awakenMilestones.add(160);
    } else if (c === 240 && !state.awakenMilestones.has(240)) {
      state.awakenMilestones.add(240);
      triggerGoldGodray();
    } else if (c === 320 && !state.awakenMilestones.has(320)) {
      state.awakenMilestones.add(320);
      triggerLightningSpark();
      triggerGoldGodray();
    }

    if (px !== undefined && py !== undefined) {
      triggerSparkle(px, py);
    }

    mixCountEl.textContent = state.mixCount;
  }

  // ==========================================================================
  // 9. 無限調味料ボタンイベント
  // ==========================================================================
  const addSauceBtn = document.getElementById('add-sauce-btn');
  const sauceCountEl = document.getElementById('sauce-count');
  const addMustardBtn = document.getElementById('add-mustard-btn');
  const mustardCountEl = document.getElementById('mustard-count');
  const addOnionBtn = document.getElementById('add-green-onion-btn');
  const onionCountEl = document.getElementById('onion-count');

  addSauceBtn.addEventListener('click', () => {
    sound.init();
    state.sauceCount++;
    sauceCountEl.textContent = state.sauceCount;
    sound.playCondiment('sauce');
    spawn3DSauceDrops();
  });

  addMustardBtn.addEventListener('click', () => {
    sound.init();
    state.mustardCount++;
    mustardCountEl.textContent = state.mustardCount;
    sound.playCondiment('mustard');
    spawn3DMustard();
  });

  addOnionBtn.addEventListener('click', () => {
    sound.init();
    state.onionCount++;
    onionCountEl.textContent = state.onionCount;
    sound.playCondiment('onion');
    spawn3DOnions();
  });

  // ==========================================================================
  // 10. 3Dリザルト画面 (巨大白ドームを完全撤廃！本物の山盛り納豆ご飯！)
  // ==========================================================================
  let resultScene, resultCamera, resultRenderer;
  let resultRiceBowlGroup;

  function initResult3DScene(finalForm) {
    const container = document.getElementById('result-three-viewport');
    if (!container || !window.THREE) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 300;

    resultScene = new THREE.Scene();
    resultCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    resultCamera.position.set(0, 3.8, 5.4);
    resultCamera.lookAt(0, 0.35, 0);

    resultRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    resultRenderer.setSize(width, height);
    resultRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(resultRenderer.domElement);

    // ★ 白飛びを完全に防止！美しい陰影と立体感を際立たせる上品なライティング
    const ambLight = new THREE.AmbientLight(0xfff6ea, 0.85);
    resultScene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(3.5, 7.5, 4.5);
    resultScene.add(dirLight);

    const backLight = new THREE.PointLight(0xffaa55, 0.8, 12);
    backLight.position.set(-3.5, 2.5, -3);
    resultScene.add(backLight);

    resultRiceBowlGroup = new THREE.Group();

    // 1. 本格陶器 丼茶碗 (Donburi Bowl)
    const bowlGeom = new THREE.CylinderGeometry(2.3, 1.25, 1.7, 36, 1, false);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x18243c, roughness: 0.25, metalness: 0.12 });
    const donburi = new THREE.Mesh(bowlGeom, bowlMat);
    donburi.position.y = -0.55;
    resultRiceBowlGroup.add(donburi);

    const rimGeom = new THREE.TorusGeometry(2.3, 0.06, 8, 36);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.75, roughness: 0.25 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.3;
    resultRiceBowlGroup.add(rim);

    // 2. ほかほか白ご飯 (白飛びせず自然な高さの米山)
    const getRiceSurfaceY = (r) => 0.08 + Math.max(0, 0.58 - (r * r) * 0.26);

    const riceGeom = new THREE.SphereGeometry(1.9, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2);
    riceGeom.scale(1.08, 0.32, 1.08);
    const riceMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.88 });
    const rice = new THREE.Mesh(riceGeom, riceMat);
    rice.position.y = 0.08;
    resultRiceBowlGroup.add(rice);

    // ご飯表面のふっくら粒感 (ライスグレイン)
    for (let g = 0; g < 45; g++) {
      const gGeom = new THREE.SphereGeometry(0.08, 6, 6);
      gGeom.scale(1.0, 0.6, 1.5);
      const gMesh = new THREE.Mesh(gGeom, riceMat);
      const gr = 0.3 + Math.random() * 1.4;
      const ga = Math.random() * Math.PI * 2;
      gMesh.position.set(Math.cos(ga) * gr, getRiceSurfaceY(gr) + 0.02, Math.sin(ga) * gr);
      gMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      resultRiceBowlGroup.add(gMesh);
    }

    // 立ち上るアツアツの湯気 (Steam)
    for (let s = 0; s < 4; s++) {
      const steamGeom = new THREE.SphereGeometry(0.12 + Math.random() * 0.06, 6, 6);
      const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
      const steam = new THREE.Mesh(steamGeom, steamMat);
      steam.position.set((Math.random() - 0.5) * 0.8, 1.1 + Math.random() * 0.45, (Math.random() - 0.5) * 0.8);
      resultRiceBowlGroup.add(steam);
    }

    // 3. ★ ご飯の上にこんもりと山盛り立体納豆 (150個以上のふっくら立体豆粒！)
    let nattoColor = 0x783f19;
    let nattoMetal = 0.08;
    let nattoRough = 0.22;
    let nattoEmissive = 0x000000;
    let nattoEmissiveIntensity = 0.5;

    const isCosmicForm = (finalForm.id === 'cosmic' || state.mixCount >= 300);
    const isFireForm = (finalForm.id === 'inferno_fire' || finalForm.visualType === 'fire');
    const isGoldForm = (finalForm.id === 'golden_supreme' || finalForm.visualType === 'gold');
    const isRockForm = (finalForm.id === 'hard_rock' || finalForm.visualType === 'rock');
    const isTornadoForm = (finalForm.id === 'tornado_god' || finalForm.visualType === 'tornado' || finalForm.visualType === 'typhoon');

    if (isCosmicForm) {
      nattoColor = 0x8b5cf6;
      nattoEmissive = 0x3b82f6;
      nattoEmissiveIntensity = 0.8;
      nattoRough = 0.15;
    } else if (isFireForm) {
      nattoColor = 0xef4444;
      nattoEmissive = 0xf97316;
      nattoEmissiveIntensity = 0.9;
    } else if (isGoldForm) {
      nattoColor = 0xfacc15;
      nattoEmissive = 0xeab308;
      nattoMetal = 0.85;
      nattoRough = 0.15;
    } else if (isRockForm) {
      nattoColor = 0x334155;
      nattoMetal = 0.85;
      nattoRough = 0.18;
    } else if (state.mustardBlendPercent > 30) {
      nattoColor = 0xcfa022;
    } else if (state.viscosityPercent > 60 || finalForm.id === 'meringue') {
      nattoColor = 0xedd6be;
    } else if (state.sauceCount >= 5) {
      nattoColor = 0x3a1505;
    }

    const nattoMat = new THREE.MeshStandardMaterial({
      color: nattoColor,
      roughness: nattoRough,
      metalness: nattoMetal,
      emissive: nattoEmissive,
      emissiveIntensity: nattoEmissiveIntensity
    });

    // ★ 納豆粒をご飯の上に確実に立体的に山盛り配置！（埋もれを完全解消）
    const beanCount = isTornadoForm ? 180 : 150;
    for (let i = 0; i < beanCount; i++) {
      const bGeom = new THREE.SphereGeometry(0.18, 8, 6);
      bGeom.scale(1.0, 0.68, 1.45);
      const bMesh = new THREE.Mesh(bGeom, nattoMat);
      
      const rRatio = Math.sqrt((i + 1) / beanCount);
      const r = rRatio * 1.35;
      const ang = (i * 137.5 * Math.PI) / 180 + (Math.random() - 0.5) * 0.25;

      let yHeight;
      if (isTornadoForm) {
        // 竜巻状に天高く巻き上がる
        const t = i / beanCount;
        yHeight = 0.6 + t * 1.5;
        const torR = (1 - t * 0.6) * 0.9;
        bMesh.position.set(Math.cos(ang) * torR, yHeight, Math.sin(ang) * torR);
      } else {
        // ご飯の表面より確実に上にこんもりと乗る！
        const baseSurface = getRiceSurfaceY(r);
        yHeight = baseSurface + 0.12 + Math.max(0, 0.45 - r * 0.3) + Math.random() * 0.12;
        bMesh.position.set(Math.cos(ang) * r, yHeight, Math.sin(ang) * r);
      }

      bMesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      resultRiceBowlGroup.add(bMesh);
    }

    // 納豆の白いネバネバ糸 (3D LineSegments)
    const lineGeom = new THREE.BufferGeometry();
    const linePos = [];
    for (let i = 0; i < 35; i++) {
      const r1 = Math.random() * 1.1;
      const a1 = Math.random() * Math.PI * 2;
      const r2 = Math.random() * 1.1;
      const a2 = Math.random() * Math.PI * 2;
      const y1 = getRiceSurfaceY(r1) + 0.25 + Math.random() * 0.2;
      const y2 = getRiceSurfaceY(r2) + 0.25 + Math.random() * 0.2;
      linePos.push(Math.cos(a1) * r1, y1, Math.sin(a1) * r1);
      linePos.push(Math.cos(a2) * r2, y2, Math.sin(a2) * r2);
    }
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ 
      color: isCosmicForm ? 0x67e8f9 : 0xffffff, 
      transparent: true, 
      opacity: 0.85, 
      linewidth: 2 
    });
    const nattoStrings = new THREE.LineSegments(lineGeom, lineMat);
    resultRiceBowlGroup.add(nattoStrings);

    // ★ 形態固有のド迫力3Dオブジェクト群！
    if (isCosmicForm) {
      // 1. 神秘のコズミック銀河リング (Torus)
      const ringGeom = new THREE.TorusGeometry(1.65, 0.06, 12, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 3;
      ring.rotation.y = Math.PI / 6;
      ring.position.y = 1.0;
      resultRiceBowlGroup.add(ring);

      const ringGeom2 = new THREE.TorusGeometry(1.35, 0.04, 12, 48);
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xc084fc });
      const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
      ring2.rotation.x = -Math.PI / 4;
      ring2.position.y = 1.1;
      resultRiceBowlGroup.add(ring2);

      // 2. 宙を漂う星屑パーティクル
      for (let p = 0; p < 24; p++) {
        const pGeom = new THREE.OctahedronGeometry(0.06, 0);
        const pMat = new THREE.MeshBasicMaterial({ color: p % 2 === 0 ? 0x67e8f9 : 0xf472b6 });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        const pr = 1.0 + Math.random() * 0.9;
        const pa = Math.random() * Math.PI * 2;
        pMesh.position.set(Math.cos(pa) * pr, 0.6 + Math.random() * 1.0, Math.sin(pa) * pr);
        resultRiceBowlGroup.add(pMesh);
      }
    } else if (isFireForm) {
      // 業火の3D炎コーン
      for (let f = 0; f < 8; f++) {
        const fGeom = new THREE.ConeGeometry(0.18, 0.65, 8);
        const fMat = new THREE.MeshBasicMaterial({ color: f % 2 === 0 ? 0xff4500 : 0xffea00 });
        const flame = new THREE.Mesh(fGeom, fMat);
        const fr = Math.random() * 0.8;
        const fa = Math.random() * Math.PI * 2;
        flame.position.set(Math.cos(fa) * fr, 1.0 + Math.random() * 0.35, Math.sin(fa) * fr);
        flame.rotation.z = (Math.random() - 0.5) * 0.3;
        resultRiceBowlGroup.add(flame);
      }
    } else if (isGoldForm) {
      // 黄金の金粉パーティクル
      for (let g = 0; g < 30; g++) {
        const goldGeom = new THREE.OctahedronGeometry(0.05, 0);
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 });
        const gold = new THREE.Mesh(goldGeom, goldMat);
        const gr = Math.random() * 1.2;
        const ga = Math.random() * Math.PI * 2;
        gold.position.set(Math.cos(ga) * gr, 0.85 + Math.random() * 0.6, Math.sin(ga) * gr);
        resultRiceBowlGroup.add(gold);
      }
    }

    // ネギトッピング
    if (state.onionCount > 0 || finalForm.id === 'green_onion_bomb') {
      const onionCount = Math.min(80, Math.max(25, state.onionCount * 12));
      for (let i = 0; i < onionCount; i++) {
        const oGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8);
        const oMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
        const oMesh = new THREE.Mesh(oGeom, oMat);
        const r = Math.random() * 1.25;
        const ang = Math.random() * Math.PI * 2;
        oMesh.position.set(Math.cos(ang) * r, getRiceSurfaceY(r) + 0.35 + Math.random() * 0.25, Math.sin(ang) * r);
        oMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        resultRiceBowlGroup.add(oMesh);
      }
    }

    // からしトッピング
    if (state.mustardCount > 0 || finalForm.id === 'yellow_mustard_bomb') {
      const mGeom = new THREE.SphereGeometry(0.38 + Math.min(0.4, state.mustardCount * 0.06), 12, 10);
      const mMat = new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.25 });
      const mMesh = new THREE.Mesh(mGeom, mMat);
      mMesh.position.set(0.25, getRiceSurfaceY(0.25) + 0.58, 0.25);
      resultRiceBowlGroup.add(mMesh);
    }

    // 月見生卵黄トッピング（神話級・Sランク時または条件で出現！）
    if (finalForm.id === 'tsukimi' || finalForm.id === 'golden_supreme' || isCosmicForm) {
      const yolkGeom = new THREE.SphereGeometry(0.32, 16, 14);
      yolkGeom.scale(1.2, 0.65, 1.2);
      const yolkMat = new THREE.MeshStandardMaterial({ color: 0xff7700, roughness: 0.15, metalness: 0.05 });
      const yolk = new THREE.Mesh(yolkGeom, yolkMat);
      yolk.position.set(0, getRiceSurfaceY(0) + 0.52, 0);
      resultRiceBowlGroup.add(yolk);
    }

    resultScene.add(resultRiceBowlGroup);

    function handleResultResize() {
      if (!resultRenderer || state.screen !== 'result') return;
      const w = container.clientWidth || 450;
      const h = container.clientHeight || 300;
      resultCamera.aspect = w / h;
      resultCamera.updateProjectionMatrix();
      resultRenderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResultResize);

    function animateResult3D() {
      if (state.screen === 'result') {
        requestAnimationFrame(animateResult3D);
        resultRiceBowlGroup.rotation.y += 0.008;
        resultRenderer.render(resultScene, resultCamera);
      }
    }
    requestAnimationFrame(animateResult3D);
  }

  // ==========================================================================
  // 11. リザルト判定 & 画面遷移
  // ==========================================================================
  const screens = {
    select: document.getElementById('screen-select-tool'),
    mix: document.getElementById('screen-mix'),
    result: document.getElementById('screen-result')
  };

  function showScreen(name) {
    state.screen = name;

    if (name === 'mix') {
      document.body.classList.add('in-mix-mode');
    } else {
      document.body.classList.remove('in-mix-mode');
    }

    Object.keys(screens).forEach(key => {
      screens[key].classList.toggle('active', key === name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function determineCurrentForm() {
    for (const form of NATTO_FORMS) {
      if (form.check(state)) {
        return form;
      }
    }
    return NATTO_FORMS[NATTO_FORMS.length - 1];
  }

  function calculateScore(form) {
    let pts = 0;
    pts += Math.min(6000, state.mixCount * 30);
    pts += Math.round(state.viscosityPercent * 25);
    pts += (state.sauceCount * 120) + (state.mustardCount * 120) + (state.onionCount * 100);
    if (state.edgeBiasScore < 35) pts += 800;

    let rank = 'C';
    let evalTag = 'ふつうの一杯';
    let review = '「素朴で飾らない味わい。日常の朝ごはんにはこれで十分だね。」';

    if (pts >= 8500 || form.id === 'golden_supreme' || form.id === 'cosmic' || form.id === 'tornado_god') {
      rank = 'S';
      evalTag = '神話級の至高納豆ご飯';
      review = '「一口食べた瞬間、脳天を突き抜ける旨味の奔流！3D納豆の歴史が今日塗り替えられた…！」';
    } else if (pts >= 5500) {
      rank = 'A';
      evalTag = '極上の一杯';
      review = '「ふんわりとした泡立ちと絶妙な糸引き。ご飯との絡み合いが見事だ！」';
    } else if (pts >= 2500) {
      rank = 'B';
      evalTag = '美味なる一杯';
      review = '「なかなかの腕前！納豆の粒立ちがしっかりしていて箸が進むね。」';
    }

    if (form.id === 'tornado_god') {
      evalTag = '神タイフーンの一杯';
      review = '「口の中で超大型台風が暴れ狂う！もはや天変地異の極上アトラクションだ！」';
    } else if (form.id === 'mustard_bomb') {
      evalTag = '刺激爆発の一杯';
      review = '「ツーーーン！涙が止まらないが、なぜか次の一口が止まらない…！」';
    } else if (form.id === 'soup') {
      evalTag = 'つゆだくの極み';
      review = '「もはや飲み物！喉越し抜群の贅沢納豆ジュース丼だ！」';
    }

    return { rank, totalPoints: pts, evalTag, review };
  }

  function finishAndServe() {
    const finalForm = determineCurrentForm();
    state.unlockedForms.add(finalForm.id);
    saveUnlocked();
    updateCollectionProgress();

    const scoreData = calculateScore(finalForm);

    document.getElementById('res-eval-tag').textContent = scoreData.evalTag;
    document.getElementById('res-natto-name').textContent = `${finalForm.badge} ${finalForm.name} ご飯`;
    document.getElementById('res-rank').textContent = scoreData.rank;
    document.getElementById('res-rank').className = `rank-letter rank-${scoreData.rank.toLowerCase()}`;
    document.getElementById('res-points').textContent = scoreData.totalPoints.toLocaleString();
    document.getElementById('res-review-comment').textContent = scoreData.review;

    document.getElementById('res-used-tool').textContent = TOOL_DATA[state.tool].name;
    document.getElementById('res-mix-count').textContent = `${state.mixCount} 回`;
    document.getElementById('res-sauce-stat').textContent = `${state.sauceCount} プッシュ`;
    document.getElementById('res-mustard-stat').textContent = `${state.mustardCount} 絞り`;
    document.getElementById('res-onion-stat').textContent = `${state.onionCount} つまみ`;

    document.getElementById('res-form-badge').textContent = finalForm.badge;
    document.getElementById('res-form-title').textContent = finalForm.name;
    document.getElementById('res-form-flavor').textContent = finalForm.desc;

    showScreen('result');

    setTimeout(() => {
      initResult3DScene(finalForm);
    }, 60);

    sound.playFanfare(scoreData.rank);
    showToast(`新形態『${finalForm.name}』を図鑑に記録しました！`);
  }

  // ==========================================================================
  // 12. 3D納豆図鑑 (ツルツルドーム全廃！本物の豆粒たちと固有3D造形)
  // ==========================================================================
  function updateCollectionProgress() {
    const unlockedEl = document.getElementById('unlocked-count');
    const modalUnlockedEl = document.getElementById('modal-unlocked-count');
    const totalEl = document.getElementById('total-count');
    const modalTotalEl = document.getElementById('modal-total-count');
    if (unlockedEl) unlockedEl.textContent = state.unlockedForms.size;
    if (modalUnlockedEl) modalUnlockedEl.textContent = state.unlockedForms.size;
    if (totalEl) totalEl.textContent = NATTO_FORMS.length;
    if (modalTotalEl) modalTotalEl.textContent = NATTO_FORMS.length;
  }

  function createDistinctCollection3DThumb(canvasBox, form) {
    if (!window.THREE) return;
    const w = canvasBox.clientWidth || 150;
    const h = canvasBox.clientHeight || 105;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    camera.position.set(0, 2.3, 3.8);
    camera.lookAt(0, 0.22, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    canvasBox.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xfff8ee, 1.35);
    scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2.5, 4.5, 3.5);
    scene.add(dirLight);

    const group = new THREE.Group();

    // 1. 本格和風 陶器丼茶碗 (Authentic Japanese Ceramic Donburi Bowl)
    const bowlGeom = new THREE.CylinderGeometry(1.35, 0.72, 0.95, 28, 1, false);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x162035, roughness: 0.18, metalness: 0.15 });
    const bowl = new THREE.Mesh(bowlGeom, bowlMat);
    bowl.position.y = -0.38;
    group.add(bowl);

    // 高台（茶碗の足）
    const footGeom = new THREE.CylinderGeometry(0.72, 0.76, 0.14, 28);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
    const foot = new THREE.Mesh(footGeom, footMat);
    foot.position.y = -0.88;
    group.add(foot);

    // 金縁（高級感あふれるフチ）
    const rimGeom = new THREE.TorusGeometry(1.35, 0.045, 8, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.095;
    group.add(rim);

    // 2. ほかほか大盛り白ご飯 (Fluffy White Rice Dome - ご飯付き！)
    const riceGeom = new THREE.SphereGeometry(1.28, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    riceGeom.scale(1.02, 0.58, 1.02);
    const riceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
    const rice = new THREE.Mesh(riceGeom, riceMat);
    rice.position.y = 0.06;
    group.add(rice);

    // 米粒のリアルな立体凹凸テクスチャ
    for (let rg = 0; rg < 28; rg++) {
      const gGeom = new THREE.SphereGeometry(0.065, 4, 4);
      gGeom.scale(1.2, 0.7, 1.8);
      const gMesh = new THREE.Mesh(gGeom, riceMat);
      const gr = 0.3 + Math.random() * 0.85;
      const ga = Math.random() * Math.PI * 2;
      const gy = 0.08 + Math.max(0, 0.68 - (gr * gr) * 0.42);
      gMesh.position.set(Math.cos(ga) * gr, gy, Math.sin(ga) * gr);
      gMesh.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(gMesh);
    }

    // ご飯のドーム表面の高さ計算
    const getRiceY = (r) => 0.08 + Math.max(0, 0.68 - (r * r) * 0.42);

    // ほかほかの湯気 (Steam Wisps from Hot Rice)
    for (let s = 0; s < 3; s++) {
      const steamGeom = new THREE.SphereGeometry(0.09 + Math.random() * 0.05, 6, 6);
      const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 });
      const steam = new THREE.Mesh(steamGeom, steamMat);
      steam.position.set((Math.random() - 0.5) * 0.5, 0.85 + Math.random() * 0.35, (Math.random() - 0.5) * 0.5);
      group.add(steam);
    }

    const vt = form.visualType;

    // 3. ご飯の上に豪快に盛られた各納豆固有の立体造形
    if (vt === 'fire') {
      // 業火納豆ご飯
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xf97316, emissiveIntensity: 0.7 }));
        const r = Math.random() * 0.7;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.15, Math.sin(a) * r);
        group.add(b);
      }
      for (let i = 0; i < 6; i++) {
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
        flame.position.set((Math.random() - 0.5) * 0.7, 0.95 + Math.random() * 0.25, (Math.random() - 0.5) * 0.7);
        group.add(flame);
      }
    } else if (vt === 'rock') {
      // カチコチ金剛納豆ご飯
      for (let i = 0; i < 40; i++) {
        const b = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.88, roughness: 0.18 }));
        const r = Math.random() * 0.68;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.2, Math.sin(a) * r);
        group.add(b);
      }
    } else if (vt === 'cosmic') {
      // コズミック星雲納豆ご飯
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.2 }));
        const r = Math.random() * 0.75;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.2, Math.sin(a) * r);
        group.add(b);
      }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      ring.rotation.x = Math.PI / 3;
      ring.position.y = 0.85;
      group.add(ring);
    } else if (vt === 'typhoon' || vt === 'tornado') {
      // 竜巻台風納豆ご飯
      for (let i = 0; i < 45; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0x854d0e }));
        const t = i / 45;
        const a = t * Math.PI * 8;
        const r = (1 - t * 0.65) * 0.7;
        b.position.set(Math.cos(a) * r, 0.6 + t * 1.1, Math.sin(a) * r);
        group.add(b);
      }
    } else if (vt === 'storm') {
      // ネバネバ暴風域納豆ご飯
      for (let i = 0; i < 38; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 }));
        const r = Math.random() * 0.75;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.16, Math.sin(a) * r);
        group.add(b);
      }
      const sGeom = new THREE.BufferGeometry();
      const sPos = [];
      for (let i = 0; i < 28; i++) {
        const a1 = Math.random() * Math.PI * 2; const r1 = Math.random() * 0.7;
        const a2 = Math.random() * Math.PI * 2; const r2 = Math.random() * 0.7;
        sPos.push(Math.cos(a1) * r1, getRiceY(r1) + 0.18, Math.sin(a1) * r1);
        sPos.push(Math.cos(a2) * r2, getRiceY(r2) + 0.18, Math.sin(a2) * r2);
      }
      sGeom.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
      group.add(new THREE.LineSegments(sGeom, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 })));
    } else if (vt === 'mustard_bomb' || vt === 'mustard_tower') {
      // からし爆弾・タワー納豆ご飯
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
        const r = Math.random() * 0.72;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.12, Math.sin(a) * r);
        group.add(b);
      }
      const mTop = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.75, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
      mTop.position.set(0.1, getRiceY(0.15) + 0.45, 0.1);
      group.add(mTop);
    } else if (vt === 'negi_jungle' || vt === 'negi_field') {
      // ネギ樹海・ネギ畑納豆ご飯
      const nTotal = vt === 'negi_jungle' ? 55 : 30;
      for (let i = 0; i < nTotal; i++) {
        const oGeom = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 6);
        const oMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
        const oMesh = new THREE.Mesh(oGeom, oMat);
        const r = Math.random() * 0.75;
        const a = Math.random() * Math.PI * 2;
        oMesh.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.24, Math.sin(a) * r);
        oMesh.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(oMesh);
      }
    } else if (vt === 'soup' || vt === 'sauce_lake') {
      // 深海タレ・タレ湖水納豆ご飯
      const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 20), new THREE.MeshStandardMaterial({ color: 0x1c0c04, roughness: 0.08, metalness: 0.6 }));
      liquid.position.y = 0.58;
      group.add(liquid);
      for (let i = 0; i < 22; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0x451a03 }));
        const r = Math.random() * 0.7;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, 0.62 + Math.random() * 0.08, Math.sin(a) * r);
        group.add(b);
      }
    } else if (vt === 'meringue' || vt === 'whipped') {
      // メレンゲ雲海・ホイップ納豆ご飯
      for (let i = 0; i < 35; i++) {
        const foam = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 }));
        const r = Math.random() * 0.7;
        const a = Math.random() * Math.PI * 2;
        foam.position.set(Math.cos(a) * r, getRiceY(r) + 0.08 + Math.random() * 0.22, Math.sin(a) * r);
        group.add(foam);
      }
    } else if (vt === 'gelato' || vt === 'crushed') {
      // ジェラート・すり潰し魂納豆ご飯
      const gMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
      for (let i = 0; i < 30; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), gMat);
        p.scale.set(1.3, 0.45, 1.3);
        const r = Math.random() * 0.7;
        const a = Math.random() * Math.PI * 2;
        p.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.12, Math.sin(a) * r);
        group.add(p);
      }
    } else if (vt === 'golden') {
      // 黄金納豆ご飯
      for (let i = 0; i < 40; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.85, roughness: 0.2 }));
        const r = Math.random() * 0.72;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.18, Math.sin(a) * r);
        group.add(b);
      }
      const mustardDot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }));
      mustardDot.position.set(0.15, getRiceY(0.2) + 0.25, 0.15);
      group.add(mustardDot);
    } else if (vt === 'raw') {
      // 生まれたて納豆ご飯（四角いパックからポンと白ご飯の上に乗せたばかりの生まれたて納豆ご飯！）
      for (let x = -0.42; x <= 0.42; x += 0.18) {
        for (let z = -0.42; z <= 0.42; z += 0.18) {
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0x6e3b15, roughness: 0.35 }));
          const r = Math.sqrt(x * x + z * z);
          b.position.set(x, getRiceY(r) + 0.08 + Math.random() * 0.04, z);
          group.add(b);
        }
      }
    } else if (vt === 'morning') {
      // 朝食の覇者納豆ご飯 (タレのツヤ、刻みネギ、粘り糸が完璧に調和した王道の朝食納豆ご飯！)
      for (let i = 0; i < 38; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.18, metalness: 0.1 }));
        const r = Math.random() * 0.75;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.14, Math.sin(a) * r);
        group.add(b);
      }
      for (let i = 0; i < 14; i++) {
        const negi = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 }));
        const r = Math.random() * 0.65;
        const a = Math.random() * Math.PI * 2;
        negi.position.set(Math.cos(a) * r, getRiceY(r) + 0.16 + Math.random() * 0.06, Math.sin(a) * r);
        negi.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(negi);
      }
      const sGeom = new THREE.BufferGeometry();
      const sPos = [];
      for (let i = 0; i < 16; i++) {
        const a1 = Math.random() * Math.PI * 2; const r1 = Math.random() * 0.65;
        const a2 = Math.random() * Math.PI * 2; const r2 = Math.random() * 0.65;
        sPos.push(Math.cos(a1) * r1, getRiceY(r1) + 0.18, Math.sin(a1) * r1);
        sPos.push(Math.cos(a2) * r2, getRiceY(r2) + 0.18, Math.sin(a2) * r2);
      }
      sGeom.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
      group.add(new THREE.LineSegments(sGeom, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })));
    } else if (vt === 'slightly') {
      // チョット混ぜた納豆ご飯 (少し糸が引き始めた素朴な納豆ご飯)
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), new THREE.MeshStandardMaterial({ color: 0x733d16, roughness: 0.3 }));
        const r = Math.random() * 0.72;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.12, Math.sin(a) * r);
        group.add(b);
      }
      const sGeom = new THREE.BufferGeometry();
      const sPos = [];
      for (let i = 0; i < 10; i++) {
        const a1 = Math.random() * Math.PI * 2; const r1 = Math.random() * 0.6;
        const a2 = Math.random() * Math.PI * 2; const r2 = Math.random() * 0.6;
        sPos.push(Math.cos(a1) * r1, getRiceY(r1) + 0.15, Math.sin(a1) * r1);
        sPos.push(Math.cos(a2) * r2, getRiceY(r2) + 0.15, Math.sin(a2) * r2);
      }
      sGeom.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
      group.add(new THREE.LineSegments(sGeom, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })));
    } else if (vt === 'chaos') {
      // 無限カオス全載せ納豆ご飯
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), new THREE.MeshStandardMaterial({ color: 0x54260b, roughness: 0.2 }));
        const r = Math.random() * 0.72;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.14, Math.sin(a) * r);
        group.add(b);
      }
      for (let i = 0; i < 18; i++) {
        const oMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
        const r = Math.random() * 0.65; const a = Math.random() * Math.PI * 2;
        oMesh.position.set(Math.cos(a) * r, getRiceY(r) + 0.18 + Math.random() * 0.06, Math.sin(a) * r);
        group.add(oMesh);
      }
      const cMustard = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
      cMustard.position.set(0.2, getRiceY(0.25) + 0.3, 0.2);
      group.add(cMustard);
    } else if (vt === 'delicious') {
      // おいしい納豆ご飯
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), new THREE.MeshStandardMaterial({ color: 0x8a5229, roughness: 0.25 }));
        const r = Math.random() * 0.72;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.14, Math.sin(a) * r);
        group.add(b);
      }
      for (let i = 0; i < 12; i++) {
        const foam = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), new THREE.MeshStandardMaterial({ color: 0xfefefe, roughness: 0.2 }));
        const r = Math.random() * 0.6;
        const a = Math.random() * Math.PI * 2;
        foam.position.set(Math.cos(a) * r, getRiceY(r) + 0.16 + Math.random() * 0.08, Math.sin(a) * r);
        group.add(foam);
      }
    } else {
      // 通常の粒々納豆ご飯
      for (let i = 0; i < 35; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), new THREE.MeshStandardMaterial({ color: 0x733d16, roughness: 0.3 }));
        const r = Math.random() * 0.75;
        const a = Math.random() * Math.PI * 2;
        b.position.set(Math.cos(a) * r, getRiceY(r) + Math.random() * 0.16, Math.sin(a) * r);
        group.add(b);
      }
    }

    scene.add(group);

    function animateThumb() {
      if (document.getElementById('collection-modal').classList.contains('active')) {
        requestAnimationFrame(animateThumb);
        group.rotation.y += 0.015;
        renderer.render(scene, camera);
      }
    }
    requestAnimationFrame(animateThumb);
  }

  function renderCollectionModal() {
    const collectionGrid = document.getElementById('collection-grid');
    collectionGrid.innerHTML = '';

    NATTO_FORMS.forEach(form => {
      const isUnlocked = state.unlockedForms.has(form.id);
      const card = document.createElement('div');
      card.className = `collection-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      if (isUnlocked) {
        const thumbBox = document.createElement('div');
        thumbBox.className = 'collection-3d-box';
        card.appendChild(thumbBox);

        const title = document.createElement('div');
        title.className = 'c-title';
        const displayName = form.name.endsWith('ご飯') ? form.name : `${form.name} ご飯`;
        title.textContent = `${form.badge} ${displayName}`;
        card.appendChild(title);

        const desc = document.createElement('div');
        desc.className = 'c-desc';
        const riceDesc = form.desc.includes('ご飯') ? form.desc : `${form.desc} ほかほか白ご飯に豪快にのせて！`;
        desc.textContent = riceDesc;
        card.appendChild(desc);

        if (form.hint) {
          const unlockedHint = document.createElement('div');
          unlockedHint.className = 'c-unlocked-hint';
          unlockedHint.textContent = `💡 解放条件: ${form.hint}`;
          card.appendChild(unlockedHint);
        }

        collectionGrid.appendChild(card);
        setTimeout(() => createDistinctCollection3DThumb(thumbBox, form), 10);
      } else {
        card.innerHTML = `
          <div class="collection-3d-box">
            <span class="c-badge-icon">🔒</span>
          </div>
          <div class="c-title">？？？？？？</div>
          <div class="c-hint-box">
            <div class="c-hint-badge">💡 解放のヒント</div>
            <div class="c-hint-text">${form.hint || '特定の混ぜ方や薬味・器具で解放'}</div>
          </div>
        `;
        collectionGrid.appendChild(card);
      }
    });

    updateCollectionProgress();
  }

  function openModal() {
    sound.init();
    sound.playClick();
    renderCollectionModal();
    document.getElementById('collection-modal').classList.add('active');
  }

  function closeModal() {
    sound.playClick();
    document.getElementById('collection-modal').classList.remove('active');
  }

  // ==========================================================================
  // 13. 初期化
  // ==========================================================================
  const toolCards = document.querySelectorAll('.tool-card');
  const startMixBtn = document.getElementById('start-mix-btn');
  const serveRiceBtn = document.getElementById('serve-rice-btn');
  const restartBtn = document.getElementById('restart-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const collectionOpenBtn = document.getElementById('collection-open-btn');
  const viewCollectionResultBtn = document.getElementById('view-collection-result-btn');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const collectionModal = document.getElementById('collection-modal');
  const shareBtn = document.getElementById('share-btn');

  toolCards.forEach(card => {
    card.addEventListener('click', () => {
      sound.init();
      sound.playClick();
      toolCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.tool = card.getAttribute('data-tool');
    });
  });

  startMixBtn.addEventListener('click', () => {
    sound.init();
    sound.playClick();
    
    state.mixCount = 0;
    state.accumulatedAngle = 0;
    state.prevAngle = null;
    state.viscosityPercent = 0;
    state.crushPercent = 0;
    state.mustardBlendPercent = 0;
    state.edgeSamples = 0;
    state.edgeSum = 0;
    state.edgeBiasScore = 0;
    state.sauceCount = 0;
    state.mustardCount = 0;
    state.onionCount = 0;
    state.awakenMilestones.clear();

    mixCountEl.textContent = '0';
    sauceCountEl.textContent = '0';
    mustardCountEl.textContent = '0';
    onionCountEl.textContent = '0';
    document.getElementById('current-tool-display').textContent = `${TOOL_DATA[state.tool].icon} ${TOOL_DATA[state.tool].name}`;

    showScreen('mix');
    setTimeout(initMain3DScene, 50);
  });

  serveRiceBtn.addEventListener('click', () => {
    sound.init();
    sound.playClick();
    finishAndServe();
  });

  restartBtn.addEventListener('click', () => {
    sound.playClick();
    showScreen('select');
  });

  soundToggleBtn.addEventListener('click', () => {
    sound.init();
    sound.enabled = !sound.enabled;
    soundToggleBtn.textContent = sound.enabled ? '🔊 音: ON' : '🔇 音: OFF';
    if (sound.enabled) sound.playClick();
  });

  collectionOpenBtn.addEventListener('click', openModal);
  viewCollectionResultBtn.addEventListener('click', openModal);
  modalCloseBtn.addEventListener('click', closeModal);
  modalConfirmBtn.addEventListener('click', closeModal);
  collectionModal.addEventListener('click', (e) => {
    if (e.target === collectionModal) closeModal();
  });

  shareBtn.addEventListener('click', () => {
    sound.playClick();
    const finalForm = determineCurrentForm();
    const text = `【極・3D納豆まぜまぜ職人】\n形態: ${finalForm.badge} ${finalForm.name}\n器具: ${TOOL_DATA[state.tool].name} / 混ぜ回数: ${state.mixCount}回\nタレ:${state.sauceCount} / からし:${state.mustardCount} / ネギ:${state.onionCount}\nランク: ${document.getElementById('res-rank').textContent} (${document.getElementById('res-points').textContent} Pt)\n#3D納豆まぜまぜ職人 #WEBゲーム`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('結果をクリップボードにコピーしました！');
    }).catch(() => {
      showToast('コピーに失敗しました');
    });
  });

  function initThumbnails() {
    createToolThumbnail('thumb-chopsticks', 'chopsticks');
    createToolThumbnail('thumb-whisk', 'whisk');
    createToolThumbnail('thumb-ladle', 'ladle');
    createToolThumbnail('thumb-pestle', 'pestle');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initThumbnails();
      updateCollectionProgress();
    });
  } else {
    initThumbnails();
    updateCollectionProgress();
  }

})();
