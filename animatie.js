function initAnimatie() {
  const canvas = document.getElementById('animatieCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const N = 60;
  const AMBER = 'rgba(212,160,72,';
  let W, H, fase = 'drift', faseTimer = 0;
  const FASE_DUUR = { drift: 180, inklapt: 80, expand: 60 };

  const deeltjes = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = 160;
  }

  function maakDeeltje() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
      r: Math.random() * 2.5 + 1,
      alpha: Math.random() * .5 + .4,
      tx: 0, ty: 0,
    };
  }

  function setInklapDoelen() {
    deeltjes.forEach((d, i) => {
      const angle = (i / N) * Math.PI * 2;
      const radius = 18 + Math.random() * 12;
      d.tx = W / 2 + Math.cos(angle) * radius;
      d.ty = H / 2 + Math.sin(angle) * radius * .45;
    });
  }

  resize();
  for (let i = 0; i < N; i++) deeltjes.push(maakDeeltje());
  window.addEventListener('resize', () => { resize(); });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    faseTimer++;

    if (faseTimer >= FASE_DUUR[fase]) {
      faseTimer = 0;
      if (fase === 'drift') { fase = 'inklapt'; setInklapDoelen(); }
      else if (fase === 'inklapt') { fase = 'expand'; }
      else {
        fase = 'drift';
        deeltjes.forEach(d => {
          d.vx = (Math.random() - .5) * .5;
          d.vy = (Math.random() - .5) * .5;
        });
      }
    }

    // Update posities
    deeltjes.forEach(d => {
      if (fase === 'drift') {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) { d.x = 0; d.vx *= -1; }
        if (d.x > W) { d.x = W; d.vx *= -1; }
        if (d.y < 0) { d.y = 0; d.vy *= -1; }
        if (d.y > H) { d.y = H; d.vy *= -1; }
      } else if (fase === 'inklapt') {
        d.x += (d.tx - d.x) * .08;
        d.y += (d.ty - d.y) * .08;
      } else {
        // expand — beweeg weg van centrum
        const dx = d.x - W/2, dy = d.y - H/2;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        d.vx += (dx/dist) * .15;
        d.vy += (dy/dist) * .15;
        d.x += d.vx;
        d.y += d.vy;
      }
    });

    // Verbindingen
    for (let i = 0; i < deeltjes.length; i++) {
      for (let j = i+1; j < deeltjes.length; j++) {
        const a = deeltjes[i], b = deeltjes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = fase === 'inklapt' ? 45 : 90;
        if (dist < maxDist) {
          const alpha = (1 - dist/maxDist) * (fase === 'inklapt' ? .5 : .15);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = AMBER + alpha + ')';
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }

    // Deeltjes
    deeltjes.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = AMBER + d.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}
