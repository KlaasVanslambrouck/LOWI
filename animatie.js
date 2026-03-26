// ── LOWI Animatie — Deeltjes + Woorden ──
const WOORDEN = ['verwondering', 'wetenschap', 'verhaal', 'vraag', 'leven', 'verbeelding'];
let woordIdx = 0;

function initAnimatie() {
  const canvas = document.getElementById('animatieCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const AMBER = [212, 160, 72];
  const N = 55;
  let W, H, fase = 'chaos', faseTimer = 0, woordAlpha = 0;
  const FASE_DUUR = { chaos: 130, organiseer: 100, woord: 90, verval: 75 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  // Deeltjes in absolute pixels
  const deeltjes = [];
  function initDeeltjes() {
    deeltjes.length = 0;
    for (let i = 0; i < N; i++) {
      deeltjes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .6,
        vy: (Math.random() - .5) * .6,
        r: Math.random() * 2 + .8,
        alpha: Math.random() * .45 + .15,
        tx: 0, ty: 0,
      });
    }
  }

  function setDoelen() {
    deeltjes.forEach((d, i) => {
      const angle = (i / N) * Math.PI * 2;
      const rx = W * 0.18;
      const ry = H * 0.25;
      d.tx = W / 2 + Math.cos(angle) * rx * (Math.random() * .5 + .5);
      d.ty = H / 2 + Math.sin(angle) * ry * (Math.random() * .5 + .5);
    });
  }

  function rgba(a) { return `rgba(${AMBER[0]},${AMBER[1]},${AMBER[2]},${a})`; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    faseTimer++;
    const progress = Math.min(faseTimer / FASE_DUUR[fase], 1);

    if (faseTimer >= FASE_DUUR[fase]) {
      faseTimer = 0;
      if (fase === 'chaos') { fase = 'organiseer'; setDoelen(); }
      else if (fase === 'organiseer') { fase = 'woord'; woordAlpha = 0; }
      else if (fase === 'woord') { fase = 'verval'; }
      else {
        fase = 'chaos';
        woordIdx = (woordIdx + 1) % WOORDEN.length;
        deeltjes.forEach(d => {
          d.vx = (Math.random() - .5) * .6;
          d.vy = (Math.random() - .5) * .6;
        });
      }
    }

    // Update en teken verbindingen
    deeltjes.forEach((d, di) => {
      if (fase === 'chaos') {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) { d.x = 0; d.vx *= -1; }
        if (d.x > W) { d.x = W; d.vx *= -1; }
        if (d.y < 0) { d.y = 0; d.vy *= -1; }
        if (d.y > H) { d.y = H; d.vy *= -1; }
      } else if (fase === 'organiseer') {
        d.x += (d.tx - d.x) * .07;
        d.y += (d.ty - d.y) * .07;
      } else if (fase === 'woord') {
        d.x += (d.tx - d.x) * .02;
        d.y += (d.ty - d.y) * .02;
      } else {
        const fx = (d.x - W/2) * .002;
        const fy = (d.y - H/2) * .002;
        d.vx += fx; d.vy += fy;
        d.x += d.vx; d.y += d.vy;
      }

      // Verbindingen
      const maxDist = fase === 'chaos' ? 80 : 50;
      for (let j = di+1; j < deeltjes.length; j++) {
        const b = deeltjes[j];
        const dx = d.x - b.x, dy = d.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < maxDist) {
          const lineA = (1 - dist/maxDist) * (fase === 'woord' ? .2 : .07);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba(lineA);
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }

      // Deeltje
      const pA = fase === 'woord' ? d.alpha * .35 : d.alpha;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = rgba(pA);
      ctx.fill();
    });

    // Woord
    if (fase === 'woord') {
      woordAlpha = Math.min(woordAlpha + .035, .9);
      drawWoord(woordAlpha);
    } else if (fase === 'verval') {
      woordAlpha = Math.max(woordAlpha - .04, 0);
      if (woordAlpha > 0) drawWoord(woordAlpha);
    }

    requestAnimationFrame(draw);
  }

  function drawWoord(alpha) {
    const woord = WOORDEN[woordIdx];
    // Dynamische fontgrootte op basis van breedte
    let fontSize = Math.floor(H * 0.52);
    ctx.font = `italic ${fontSize}px 'EB Garamond', Georgia, serif`;
    // Pas aan als woord te breed is
    const maxW = W * 0.92;
    while (ctx.measureText(woord).width > maxW && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `italic ${fontSize}px 'EB Garamond', Georgia, serif`;
    }
    ctx.fillStyle = rgba(alpha);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(woord, W/2, H/2);
  }

  resize();
  initDeeltjes();
  window.addEventListener('resize', () => { resize(); initDeeltjes(); });
  draw();
}
