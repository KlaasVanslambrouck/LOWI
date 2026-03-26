function initAnimatie() {
  const canvas = document.getElementById('animatieCanvas');
  if (!canvas) return;

  // Stel canvas dimensies in vóór alles
  const W = canvas.offsetWidth || 480;
  const H = 120;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  const AMBER = [212, 160, 72];
  const N = 55;

  const WOORDEN = ['verwondering', 'wetenschap', 'verhaal', 'vraag', 'leven', 'verbeelding'];
  let woordIdx = 0;
  let fase = 'drift';
  let faseTimer = 0;
  let woordAlpha = 0;
  const FASE_DUUR = { drift: 160, inklapt: 90, woord: 100, verval: 70 };

  function rgba(a) { return `rgba(${AMBER[0]},${AMBER[1]},${AMBER[2]},${a})`; }

  // Maak deeltjes
  const deeltjes = Array.from({ length: N }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - .5) * .55,
    vy: (Math.random() - .5) * .55,
    r: Math.random() * 2.2 + .8,
    alpha: Math.random() * .4 + .45,
    tx: 0, ty: 0,
  }));

  function setDoelen() {
    deeltjes.forEach((d, i) => {
      const angle = (i / N) * Math.PI * 2;
      const rx = W * 0.15;
      const ry = H * 0.22;
      d.tx = W / 2 + Math.cos(angle) * rx * (.6 + Math.random() * .4);
      d.ty = H / 2 + Math.sin(angle) * ry * (.6 + Math.random() * .4);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    faseTimer++;

    // Fase wissel
    if (faseTimer >= FASE_DUUR[fase]) {
      faseTimer = 0;
      if (fase === 'drift') {
        fase = 'inklapt';
        setDoelen();
      } else if (fase === 'inklapt') {
        fase = 'woord';
        woordAlpha = 0;
      } else if (fase === 'woord') {
        fase = 'verval';
      } else {
        fase = 'drift';
        woordIdx = (woordIdx + 1) % WOORDEN.length;
        deeltjes.forEach(d => {
          d.vx = (Math.random() - .5) * .55;
          d.vy = (Math.random() - .5) * .55;
        });
      }
    }

    // Update posities
    deeltjes.forEach(d => {
      if (fase === 'drift') {
        d.x += d.vx; d.y += d.vy;
        // Wraparound in plaats van bounce
        if (d.x < -5) d.x = W + 5;
        if (d.x > W + 5) d.x = -5;
        if (d.y < -5) d.y = H + 5;
        if (d.y > H + 5) d.y = -5;
      } else if (fase === 'inklapt') {
        d.x += (d.tx - d.x) * .07;
        d.y += (d.ty - d.y) * .07;
      } else if (fase === 'woord') {
        d.x += (d.tx - d.x) * .02;
        d.y += (d.ty - d.y) * .02;
      } else {
        const fx = (d.x - W/2) * .003;
        const fy = (d.y - H/2) * .003;
        d.vx += fx; d.vy += fy;
        d.x += d.vx; d.y += d.vy;
      }
    });

    // Verbindingen
    const maxDist = fase === 'inklapt' || fase === 'woord' ? 50 : 85;
    const lineAlphaFactor = fase === 'woord' ? .18 : .08;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const a = deeltjes[i], b = deeltjes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba((1 - dist/maxDist) * lineAlphaFactor);
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }

    // Deeltjes
    deeltjes.forEach(d => {
      const a = fase === 'woord' ? d.alpha * .35 : d.alpha;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = rgba(a);
      ctx.fill();
    });

    // Woord
    if (fase === 'woord') {
      woordAlpha = Math.min(woordAlpha + .04, .95);
      tekenWoord(woordAlpha);
    } else if (fase === 'verval') {
      woordAlpha = Math.max(woordAlpha - .045, 0);
      if (woordAlpha > 0) tekenWoord(woordAlpha);
    }

    requestAnimationFrame(draw);
  }

  function tekenWoord(alpha) {
    const woord = WOORDEN[woordIdx];
    let fontSize = Math.floor(H * 0.52);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic ${fontSize}px 'EB Garamond', Georgia, serif`;
    // Pas aan als woord te breed is
    while (ctx.measureText(woord).width > W * 0.9 && fontSize > 24) {
      fontSize -= 2;
      ctx.font = `italic ${fontSize}px 'EB Garamond', Georgia, serif`;
    }
    ctx.fillStyle = rgba(alpha);
    ctx.fillText(woord, W / 2, H / 2);
  }

  draw();
}
