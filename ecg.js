// ── ECG Animatie ──
const DISCIPLINES = ['♥','⚗','✦','⊙','❧'];
let discIdx = 0;
let soundOn = false;
let audioCtx = null;

export function initEcg() {
  const canvas = document.getElementById('ecgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const H = 60;
  const MID = H / 2;
  const SPEED = 1.5;
  const BPM = 60;
  const BEAT_FRAMES = (60 / BPM) * 60;

  let xPos = 0;
  let points = [];
  let beatTimer = 0;
  let beatPhase = -1;
  let symbolFlash = null;

  function resize() {
    canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = H * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }
  resize();
  window.addEventListener('resize', () => { resize(); points = []; xPos = 0; });

  function ecgShape(t) {
    if (t < 0 || t > 1) return 0;
    if (t < 0.1)  return t * 3;
    if (t < 0.15) return 0.3 - (t - 0.1) * 6;
    if (t < 0.2)  return -(t - 0.15) * 8;
    if (t < 0.25) return -0.4 + (t - 0.2) * 2;
    if (t < 0.35) return -0.3 + (t - 0.25) * 19;
    if (t < 0.4)  return 1.6 - (t - 0.35) * 20;
    if (t < 0.5)  return 0.6 - (t - 0.4) * 6;
    if (t < 0.6)  return 0;
    if (t < 0.7)  return Math.sin((t - 0.6) * Math.PI * 10) * 0.12;
    return 0;
  }

  function playHeartbeat() {
    if (!soundOn) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function beat(time, freq, gain) {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.connect(g); g.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, time + 0.08);
      g.gain.setValueAtTime(gain, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.start(time); osc.stop(time + 0.13);
    }
    const now = audioCtx.currentTime;
    beat(now, 80, 0.4);
    beat(now + 0.15, 60, 0.25);
  }

  function draw() {
    const w = canvas.offsetWidth;
    ctx.clearRect(0, 0, w, H);

    // Grid
    ctx.strokeStyle = 'rgba(200,150,62,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 24) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, MID); ctx.lineTo(w, MID); ctx.stroke();

    // Beat
    beatTimer++;
    if (beatTimer >= BEAT_FRAMES) {
      beatTimer = 0;
      beatPhase = 0;
      discIdx = (discIdx + 1) % DISCIPLINES.length;
      symbolFlash = { sym: DISCIPLINES[discIdx], life: 55 };
      playHeartbeat();
    }

    // Punt
    let y = MID;
    if (beatPhase >= 0) {
      y = MID - ecgShape(beatPhase) * (H * 0.38);
      beatPhase += 0.018;
      if (beatPhase > 1) beatPhase = -1;
    }
    points.push({ x: xPos, y });
    xPos += SPEED;
    if (xPos > w + 10) { xPos = 0; points = []; }

    // Lijn
    for (let i = 1; i < points.length; i++) {
      const alpha = 0.06 + (i / points.length) * 0.8;
      ctx.beginPath();
      ctx.moveTo(points[i-1].x, points[i-1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = `rgba(200,150,62,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Stipje
    if (points.length > 0) {
      const last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,150,62,0.9)';
      ctx.fill();
    }

    // Symbool flash
    if (symbolFlash) {
      symbolFlash.life--;
      const alpha = Math.min(1, symbolFlash.life / 20);
      ctx.font = `${Math.floor(H * 0.38)}px serif`;
      ctx.fillStyle = `rgba(200,150,62,${alpha * 0.8})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbolFlash.sym, w / 2, MID);
      if (symbolFlash.life <= 0) symbolFlash = null;
    }

    requestAnimationFrame(draw);
  }
  draw();
}

export function toggleSound() {
  soundOn = !soundOn;
  const btn = document.getElementById('soundBtn');
  if (!btn) return;
  btn.textContent = soundOn ? '♪ geluid aan' : '♪ geluid uit';
  btn.classList.toggle('on', soundOn);
  if (soundOn && !audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
