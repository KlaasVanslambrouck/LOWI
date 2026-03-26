// ── LOWI Animatie — Deeltjes + Woorden ──
const WOORDEN = ['verwondering', 'wetenschap', 'verhaal', 'vraag', 'leven', 'verbeelding'];
let woordIdx = 0;

function initAnimatie() {
  const canvas = document.getElementById('animatieCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const AMBER = 'rgba(200,150,62,';
  const N = 48; // aantal deeltjes
  let AW, AH;
  let fase = 'chaos'; // chaos | organiseer | woord | verval
  let faseTimer = 0;
  const FASE_DUUR = { chaos: 120, organiseer: 90, woord: 80, verval: 70 };
  let woordAlpha = 0;

  function resize() {
    AW = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    AH = canvas.height = 100 * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  const W = () => canvas.offsetWidth;
  const H = () => 100;

  // Deeltjes
  const deeltjes = Array.from({ length: N }, () => ({
    x: Math.random(),   // 0-1 relatief
    y: Math.random(),
    vx: (Math.random() - .5) * .003,
    vy: (Math.random() - .5) * .003,
    r: Math.random() * 1.8 + .6,
    alpha: Math.random() * .4 + .1,
    // doelpositie voor organiseer fase
    tx: 0, ty: 0,
  }));

  function setDoelen() {
    // Cluster deeltjes losjes rond het midden
    deeltjes.forEach((d, i) => {
      const angle = (i / N) * Math.PI * 2;
      const radius = .08 + Math.random() * .12;
      d.tx = .5 + Math.cos(angle) * radius;
      d.ty = .5 + Math.sin(angle) * radius * .5;
    });
  }

  function draw() {
    const w = W(), h = H();
    ctx.clearRect(0, 0, w, h);

    faseTimer++;
    const progress = faseTimer / FASE_DUUR[fase];

    // Fase logica
    if (faseTimer >= FASE_DUUR[fase]) {
      faseTimer = 0;
      if (fase === 'chaos') { fase = 'organiseer'; setDoelen(); }
      else if (fase === 'organiseer') { fase = 'woord'; woordAlpha = 0; }
      else if (fase === 'woord') { fase = 'verval'; }
      else if (fase === 'verval') {
        fase = 'chaos';
        woordIdx = (woordIdx + 1) % WOORDEN.length;
        // Reset deeltjes naar willekeurige posities
        deeltjes.forEach(d => {
          d.vx = (Math.random() - .5) * .003;
          d.vy = (Math.random() - .5) * .003;
        });
      }
    }

    // Update deeltjes
    deeltjes.forEach(d => {
      if (fase === 'organiseer') {
        // Trek naar doel
        const ease = Math.min(progress * 1.5, 1);
        d.x += (d.tx - d.x) * .06 * ease;
        d.y += (d.ty - d.y) * .06 * ease;
      } else if (fase === 'woord') {
        // Blijf licht bewegen
        d.x += d.vx * .3;
        d.y += d.vy * .3;
      } else if (fase === 'verval') {
        // Explodeer zachtjes
        d.vx += (d.x - .5) * .0004;
        d.vy += (d.y - .5) * .0004;
        d.x += d.vx;
        d.y += d.vy;
      } else {
        // Chaos — drift
        d.x += d.vx;
        d.y += d.vy;
        // Bounce
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
        d.x = Math.max(0, Math.min(1, d.x));
        d.y = Math.max(0, Math.min(1, d.y));
      }

      // Verbindingen tussen nabije deeltjes
      deeltjes.forEach(b => {
        const dx = (d.x - b.x) * w;
        const dy = (d.y - b.y) * h;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = fase === 'organiseer' || fase === 'woord' ? 40 : 60;
        if (dist < maxDist && dist > 0) {
          const lineAlpha = (1 - dist / maxDist) * (fase === 'woord' ? .25 : .08);
          ctx.beginPath();
          ctx.moveTo(d.x * w, d.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.strokeStyle = AMBER + lineAlpha + ')';
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      });

      // Teken deeltje
      const a = fase === 'woord' ? d.alpha * .5 : d.alpha;
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fillStyle = AMBER + a + ')';
      ctx.fill();
    });

    // Woord
    if (fase === 'woord') {
      woordAlpha = Math.min(woordAlpha + .04, .75);
      const fontSize = Math.min(w * .055, 18);
      ctx.font = `italic ${fontSize}px 'EB Garamond', Georgia, serif`;
      ctx.fillStyle = AMBER + woordAlpha + ')';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(WOORDEN[woordIdx], w / 2, h / 2);
    } else if (fase === 'verval') {
      woordAlpha = Math.max(woordAlpha - .05, 0);
      if (woordAlpha > 0) {
        const fontSize = Math.min(w * .055, 18);
        ctx.font = `italic ${fontSize}px 'EB Garamond', Georgia, serif`;
        ctx.fillStyle = AMBER + woordAlpha + ')';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(WOORDEN[woordIdx], w / 2, h / 2);
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => { resize(); });
  draw();
}
