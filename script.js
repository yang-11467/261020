/**
 * ==========================================================================
 * TERRA-PULSE // FUTURISTIC SEISMIC SURVEY HUD ENGINE
 * Interactive Mechanics: Trace Gather Canvas, Subsurface Wavefront Simulator,
 * Telemetry HUD, Web Audio Synthesizer, and Lightbox
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. WEB AUDIO API SYNTHESIZER (Sci-Fi Audio Engine)
  // --------------------------------------------------------------------------
  let audioCtx = null;
  let isMuted = true; // default muted to be user-friendly

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioStatusText = document.getElementById('audioStatusText');

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function toggleAudio() {
    initAudio();
    isMuted = !isMuted;
    if (audioStatusText) {
      audioStatusText.textContent = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
    }
    if (audioToggleBtn) {
      audioToggleBtn.style.color = isMuted ? 'var(--text-muted)' : 'var(--cyan-core)';
      audioToggleBtn.style.borderColor = isMuted ? 'var(--border-subtle)' : 'var(--cyan-core)';
    }
    if (!isMuted) {
      playUiBeep(880, 0.08, 'sine');
    }
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleAudio);
  }

  function playUiBeep(freq = 1200, duration = 0.04, type = 'sine') {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playSeismicThump() {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, audioCtx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  }

  function playGeophonePing(freq = 1600) {
    if (isMuted || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  // Attach subtle audio blips to interactive buttons and cards
  document.querySelectorAll('.cyber-btn, .nav-link, .instrument-card, .pipeline-node, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => playUiBeep(1400, 0.03, 'sine'));
    el.addEventListener('click', () => playUiBeep(950, 0.08, 'triangle'));
  });

  // --------------------------------------------------------------------------
  // 2. HERO RADAR CANVAS (Real-Time Sensor HUD Sweep)
  // --------------------------------------------------------------------------
  const radarCanvas = document.getElementById('heroRadarCanvas');
  if (radarCanvas) {
    const ctx = radarCanvas.getContext('2d');
    let angle = 0;
    const geophones = [];
    for (let i = 0; i < 24; i++) {
      geophones.push({
        x: 0.1 + (i / 23) * 0.8,
        y: 0.5 + Math.sin(i * 0.5) * 0.08,
        chan: i + 1,
        offset: i * 2,
        pulse: 0
      });
    }

    function resizeRadar() {
      const rect = radarCanvas.getBoundingClientRect();
      radarCanvas.width = rect.width * window.devicePixelRatio;
      radarCanvas.height = rect.height * window.devicePixelRatio;
    }
    resizeRadar();
    window.addEventListener('resize', resizeRadar);

    function renderRadar() {
      const w = radarCanvas.width;
      const h = radarCanvas.height;
      ctx.clearRect(0, 0, w, h);

      // Cyber Grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 30 * window.devicePixelRatio;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Survey line connecting geophones
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      geophones.forEach((g, idx) => {
        const gx = g.x * w;
        const gy = g.y * h;
        if (idx === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Sweep Radar beam
      angle += 0.025;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const radius = Math.min(w, h) * 0.48;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle, angle + 0.35);
      ctx.lineTo(cx, cy);
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0.22)');
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Render geophone nodes
      geophones.forEach(g => {
        const gx = g.x * w;
        const gy = g.y * h;

        // Check if radar sweep just passed this geophone
        const dAngle = (Math.atan2(gy - cy, gx - cx) + Math.PI * 2) % (Math.PI * 2);
        const curAngle = angle % (Math.PI * 2);
        if (Math.abs(dAngle - curAngle) < 0.05) {
          g.pulse = 1.0;
        }

        // Draw geophone node
        ctx.beginPath();
        ctx.arc(gx, gy, 4 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = g.pulse > 0.1 ? '#00f0ff' : 'rgba(0, 240, 255, 0.5)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = g.pulse > 0.1 ? 12 : 2;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pulse ring
        if (g.pulse > 0.02) {
          ctx.beginPath();
          ctx.arc(gx, gy, (4 + (1 - g.pulse) * 16) * window.devicePixelRatio, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${g.pulse * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          g.pulse -= 0.02;
        }
      });

      // Shot Point at 0m (channel 1)
      const shotX = geophones[0].x * w;
      const shotY = geophones[0].y * h;
      ctx.beginPath();
      ctx.arc(shotX, shotY, 7 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.fillStyle = '#ff3366';
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(renderRadar);
    }
    renderRadar();
  }

  // --------------------------------------------------------------------------
  // 3. SEISMIC DATA EXPLORER (SEG-2 Wiggle Trace Gather Canvas)
  // --------------------------------------------------------------------------
  const seismicCanvas = document.getElementById('seismicCanvas');
  const shotSelect = document.getElementById('shotSelect');
  const gainSlider = document.getElementById('gainSlider');
  const gainValue = document.getElementById('gainValue');
  const timeZoomSlider = document.getElementById('timeZoomSlider');
  const timeZoomValue = document.getElementById('timeZoomValue');
  const vaToggle = document.getElementById('vaToggle');
  const pickLinesToggle = document.getElementById('pickLinesToggle');
  const compareOverlayToggle = document.getElementById('compareOverlayToggle');
  const traceTooltip = document.getElementById('traceTooltip');

  // Shot data fallback if window.SEISMIC_SHOTS is missing
  let seismicShots = window.SEISMIC_SHOTS || [];
  let currentShotIndex = 0;

  // Pre-load author annotated image for comparison overlay
  const annotatedImg = new Image();
  annotatedImg.src = 'assets/shot101_annotated.jpg';

  // Populate Shot Selector
  if (shotSelect && seismicShots.length > 0) {
    shotSelect.innerHTML = '';
    seismicShots.forEach((shot, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `File ${shot.shot_id} (Shot Offset: ${shot.shot_pos}m)`;
      shotSelect.appendChild(opt);
    });

    shotSelect.addEventListener('change', (e) => {
      currentShotIndex = parseInt(e.target.value, 10);
      highlightActiveTableRow(seismicShots[currentShotIndex].shot_id);
      renderSeismicGather();
      playUiBeep(1100, 0.05, 'sine');
    });
  }

  if (gainSlider && gainValue) {
    gainSlider.addEventListener('input', (e) => {
      gainValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
      renderSeismicGather();
    });
  }

  if (timeZoomSlider && timeZoomValue) {
    timeZoomSlider.addEventListener('input', (e) => {
      timeZoomValue.textContent = `${e.target.value} ms`;
      renderSeismicGather();
    });
  }

  if (vaToggle) vaToggle.addEventListener('change', renderSeismicGather);
  if (pickLinesToggle) pickLinesToggle.addEventListener('change', renderSeismicGather);
  if (compareOverlayToggle) compareOverlayToggle.addEventListener('change', renderSeismicGather);

  function resizeSeismicCanvas() {
    if (!seismicCanvas) return;
    const rect = seismicCanvas.getBoundingClientRect();
    seismicCanvas.width = rect.width * window.devicePixelRatio;
    seismicCanvas.height = rect.height * window.devicePixelRatio;
    renderSeismicGather();
  }
  window.addEventListener('resize', resizeSeismicCanvas);

  function renderSeismicGather() {
    if (!seismicCanvas || !seismicShots || seismicShots.length === 0) return;
    const ctx = seismicCanvas.getContext('2d');
    const w = seismicCanvas.width;
    const h = seismicCanvas.height;
    const dpr = window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    // Margins for axes
    const margin = {
      left: 70 * dpr,
      right: 40 * dpr,
      top: 50 * dpr,
      bottom: 50 * dpr
    };
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;

    const shotData = seismicShots[currentShotIndex];
    if (!shotData) return;

    const traces = shotData.traces;
    const numTraces = traces.length; // 24
    const gain = parseFloat(gainSlider ? gainSlider.value : 3.5);
    const maxTimeMs = parseFloat(timeZoomSlider ? timeZoomSlider.value : 100);
    const showVA = vaToggle ? vaToggle.checked : true;
    const showPicks = pickLinesToggle ? pickLinesToggle.checked : true;
    const showCompare = compareOverlayToggle ? compareOverlayToggle.checked : false;

    // Background Compare Mode
    if (showCompare && annotatedImg.complete && annotatedImg.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(annotatedImg, margin.left, margin.top, plotW, plotH);
      ctx.restore();
    }

    // Grid and Time Axis
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    // Time division lines (every 10ms or 20ms)
    const timeStep = maxTimeMs <= 80 ? 10 : 20;
    for (let t = 0; t <= maxTimeMs; t += timeStep) {
      const y = margin.top + (t / maxTimeMs) * plotH;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(w - margin.right, y);
      ctx.stroke();

      ctx.fillText(`${t} ms`, margin.left - 10 * dpr, y);
    }

    // Time axis label
    ctx.save();
    ctx.translate(20 * dpr, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'var(--cyan-core)';
    ctx.font = `${11 * dpr}px 'Orbitron', sans-serif`;
    ctx.fillText('TIME ELAPSED (ms)', 0, 0);
    ctx.restore();

    // Trace spacing
    const traceSpacing = plotW / (numTraces + 1);

    // Channel / Offset Axis (Top)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let i = 0; i < numTraces; i++) {
      const tx = margin.left + (i + 1) * traceSpacing;
      const tr = traces[i];

      // Vertical trace center guide
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(tx, margin.top);
      ctx.lineTo(tx, margin.top + plotH);
      ctx.stroke();

      // Top Channel # and offset
      if (i % 2 === 0 || i === numTraces - 1) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
        ctx.fillText(`Ch${tr.channel}`, tx, margin.top - 18 * dpr);
        ctx.fillStyle = 'var(--cyan-core)';
        ctx.fillText(`${tr.offset}m`, tx, margin.top - 6 * dpr);
      }
    }

    // Bottom Axis Title
    ctx.fillStyle = 'var(--cyan-core)';
    ctx.font = `${11 * dpr}px 'Orbitron', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('RECEIVER POSITION (METERS ALONG SURVEY LINE)', margin.left + plotW / 2, h - 15 * dpr);

    // Render Seismic Wiggle Traces
    const sampleDt = shotData.dt_ms; // 0.5 ms
    const maxSampleIdx = Math.floor(maxTimeMs / sampleDt);

    traces.forEach((tr, trIdx) => {
      const centerX = margin.left + (trIdx + 1) * traceSpacing;
      const samples = tr.samples;
      const maxPts = Math.min(samples.length, maxSampleIdx);

      // Variable Area (VA) Positive Lobe Fill (Seismic standard)
      if (showVA) {
        ctx.beginPath();
        let inLobe = false;
        let lobeStartT = 0;

        for (let s = 0; s < maxPts; s++) {
          const val = samples[s] * gain;
          const tMs = s * sampleDt;
          const y = margin.top + (tMs / maxTimeMs) * plotH;
          const x = centerX + val * (traceSpacing * 0.85);

          if (val > 0) {
            if (!inLobe) {
              ctx.moveTo(centerX, y);
              inLobe = true;
            }
            ctx.lineTo(x, y);
          } else {
            if (inLobe) {
              ctx.lineTo(centerX, y);
              inLobe = false;
            }
          }
        }
        if (inLobe) {
          ctx.lineTo(centerX, margin.top + (maxPts * sampleDt / maxTimeMs) * plotH);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.fill();
      }

      // Wiggle Line
      ctx.beginPath();
      for (let s = 0; s < maxPts; s++) {
        const val = samples[s] * gain;
        const tMs = s * sampleDt;
        const y = margin.top + (tMs / maxTimeMs) * plotH;
        const x = centerX + val * (traceSpacing * 0.85);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
    });

    // ------------------------------------------------------------------------
    // THEORETICAL FIRST ARRIVAL LINES (Direct Wave & Refracted Head Wave)
    // ------------------------------------------------------------------------
    if (showPicks && currentShotIndex === 0) {
      // In Shot 101 (shot at 0m):
      // Direct wave velocity V1 ~ 380 m/s => t = x / 380 * 1000 ms
      // Refracted wave velocity V2 ~ 1750 m/s, intercept time ti ~ 28 ms => t = ti + x / 1750 * 1000 ms
      const v1 = 0.38; // m/ms (380 m/s)
      const v2 = 1.75; // m/ms (1750 m/s)
      const ti = 28.0; // ms

      // 1. Direct Wave (Red Line) - prominent from 0 to 12m
      ctx.beginPath();
      for (let trIdx = 0; trIdx < numTraces; trIdx++) {
        const tr = traces[trIdx];
        const tx = margin.left + (trIdx + 1) * traceSpacing;
        const dist = tr.dist_to_shot;
        const directTime = dist / v1;
        if (directTime <= maxTimeMs) {
          const y = margin.top + (directTime / maxTimeMs) * plotH;
          if (trIdx === 0) ctx.moveTo(tx, y);
          else ctx.lineTo(tx, y);
        }
      }
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 3.5 * dpr;
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Direct Wave Label
      ctx.fillStyle = '#ff3366';
      ctx.font = `bold ${10 * dpr}px 'Orbitron', sans-serif`;
      ctx.textAlign = 'left';
      const dLabelX = margin.left + 5 * traceSpacing;
      const dLabelY = margin.top + ((8 / v1) / maxTimeMs) * plotH + 18 * dpr;
      ctx.fillText('DIRECT WAVE (直達波 V₁ ≈ 380 m/s)', dLabelX, dLabelY);

      // 2. Refracted Wave (Cyan/Blue Line) - prominent from 10m to 46m
      ctx.beginPath();
      let startedRefract = false;
      for (let trIdx = 0; trIdx < numTraces; trIdx++) {
        const tr = traces[trIdx];
        const tx = margin.left + (trIdx + 1) * traceSpacing;
        const dist = tr.dist_to_shot;
        if (dist >= 8) { // Blind zone / critical distance crossover
          const refractTime = ti + dist / v2;
          if (refractTime <= maxTimeMs) {
            const y = margin.top + (refractTime / maxTimeMs) * plotH;
            if (!startedRefract) {
              ctx.moveTo(tx, y);
              startedRefract = true;
            } else {
              ctx.lineTo(tx, y);
            }
          }
        }
      }
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3.5 * dpr;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Refraction Wave Label
      ctx.fillStyle = '#00f0ff';
      ctx.font = `bold ${10 * dpr}px 'Orbitron', sans-serif`;
      ctx.textAlign = 'left';
      const rLabelX = margin.left + 12 * traceSpacing;
      const rLabelY = margin.top + ((ti + 22 / v2) / maxTimeMs) * plotH - 12 * dpr;
      ctx.fillText('REFRACTED HEAD WAVE (折射波 V₂ ≈ 1750 m/s)', rLabelX, rLabelY);

      // Crossover Marker Circle at ~10m (between Ch 5 and Ch 6)
      const xCross = 10.2; // meters
      const tCross = xCross / v1; // ~26.8 ms
      const crossCanvasX = margin.left + (xCross / 2 + 1) * traceSpacing;
      const crossCanvasY = margin.top + (tCross / maxTimeMs) * plotH;

      ctx.beginPath();
      ctx.arc(crossCanvasX, crossCanvasY, 6 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#ffaa00';
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      ctx.fillStyle = '#ffaa00';
      ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
      ctx.fillText(`CROSSOVER (X_cross ≈ 10.2m)`, crossCanvasX + 10 * dpr, crossCanvasY - 8 * dpr);
    }
  }

  // Initial render
  setTimeout(() => {
    resizeSeismicCanvas();
  }, 100);

  // Hover Tooltip on Seismic Gather Canvas
  if (seismicCanvas && traceTooltip) {
    seismicCanvas.addEventListener('mousemove', (e) => {
      const rect = seismicCanvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * window.devicePixelRatio;
      const mouseY = (e.clientY - rect.top) * window.devicePixelRatio;
      const dpr = window.devicePixelRatio;

      const margin = {
        left: 70 * dpr,
        right: 40 * dpr,
        top: 50 * dpr,
        bottom: 50 * dpr
      };
      const plotW = seismicCanvas.width - margin.left - margin.right;
      const plotH = seismicCanvas.height - margin.top - margin.bottom;

      if (mouseX < margin.left || mouseX > seismicCanvas.width - margin.right ||
          mouseY < margin.top || mouseY > seismicCanvas.height - margin.bottom) {
        traceTooltip.style.display = 'none';
        return;
      }

      const numTraces = 24;
      const traceSpacing = plotW / (numTraces + 1);
      const approxTrIdx = Math.round((mouseX - margin.left) / traceSpacing) - 1;

      if (approxTrIdx >= 0 && approxTrIdx < numTraces) {
        const shotData = seismicShots[currentShotIndex];
        const tr = shotData.traces[approxTrIdx];
        const maxTimeMs = parseFloat(timeZoomSlider ? timeZoomSlider.value : 100);
        const timeAtCursor = ((mouseY - margin.top) / plotH) * maxTimeMs;

        // Sample amplitude at this time
        const sampleIdx = Math.floor(timeAtCursor / shotData.dt_ms);
        const amp = (sampleIdx >= 0 && sampleIdx < tr.samples.length) ? tr.samples[sampleIdx] : 0;
        const apparentVelocity = timeAtCursor > 0 ? (tr.dist_to_shot / (timeAtCursor / 1000)).toFixed(0) : 0;

        traceTooltip.style.display = 'block';
        traceTooltip.style.left = `${e.clientX + 15}px`;
        traceTooltip.style.top = `${e.clientY - 20}px`;

        traceTooltip.innerHTML = `
          <div class="t-head">RECEIVER CH ${tr.channel} // OFFSET ${tr.offset}m</div>
          <div>Offset to Shot: <span style="color:#00f0ff">${tr.dist_to_shot} m</span></div>
          <div>Time at Cursor: <span style="color:#ffaa00">${timeAtCursor.toFixed(2)} ms</span></div>
          <div>Normalized Amp: <span style="color:#00ff88">${amp.toFixed(3)}</span></div>
          <div>Apparent Vel (Va): <span style="color:#a855f7">${apparentVelocity} m/s</span></div>
        `;
      } else {
        traceTooltip.style.display = 'none';
      }
    });

    seismicCanvas.addEventListener('mouseleave', () => {
      traceTooltip.style.display = 'none';
    });
  }

  // --------------------------------------------------------------------------
  // 4. SUBSURFACE 2D WAVEFRONT & RAYPATH SIMULATOR
  // --------------------------------------------------------------------------
  const raypathCanvas = document.getElementById('raypathCanvas');
  const fireShotBtn = document.getElementById('fireShotBtn');
  const simV1Slider = document.getElementById('simV1Slider');
  const simV1Val = document.getElementById('simV1Val');
  const simV2Slider = document.getElementById('simV2Slider');
  const simV2Val = document.getElementById('simV2Val');
  const simHSlider = document.getElementById('simHSlider');
  const simHVal = document.getElementById('simHVal');

  const calcCritAngle = document.getElementById('calcCritAngle');
  const calcCritDist = document.getElementById('calcCritDist');
  const calcCrossDist = document.getElementById('calcCrossDist');
  const calcInterceptTime = document.getElementById('calcInterceptTime');
  const simTimeDisplay = document.getElementById('simTimeDisplay');

  let simTime = 0; // ms
  let isSimRunning = false;
  let simAnimId = null;

  function updatePhysicsTelemetry() {
    const v1 = parseFloat(simV1Slider ? simV1Slider.value : 380);
    const v2 = parseFloat(simV2Slider ? simV2Slider.value : 1750);
    const h = parseFloat(simHSlider ? simHSlider.value : 3.5);

    if (simV1Val) simV1Val.textContent = `${v1} m/s`;
    if (simV2Val) simV2Val.textContent = `${v2} m/s`;
    if (simHVal) simHVal.textContent = `${h.toFixed(1)} m`;

    if (v1 >= v2) {
      if (calcCritAngle) calcCritAngle.textContent = 'NO CRITICAL REFRACTION (V1 >= V2)';
      return;
    }

    // Critical Angle θc = arcsin(V1 / V2)
    const sinThetaC = v1 / v2;
    const thetaC_rad = Math.asin(sinThetaC);
    const thetaC_deg = (thetaC_rad * 180 / Math.PI).toFixed(1);

    // Critical Distance Xc = 2h * tan(θc)
    const xc = (2 * h * Math.tan(thetaC_rad)).toFixed(2);

    // Crossover Distance Xcross = 2h * sqrt((V2 + V1) / (V2 - V1))
    const xcross = (2 * h * Math.sqrt((v2 + v1) / (v2 - v1))).toFixed(2);

    // Intercept Time ti = 2h * sqrt(V2^2 - V1^2) / (V1 * V2) in ms
    const ti_sec = (2 * h * Math.sqrt(v2 * v2 - v1 * v1)) / (v1 * v2);
    const ti_ms = (ti_sec * 1000).toFixed(1);

    if (calcCritAngle) calcCritAngle.textContent = `${thetaC_deg}°`;
    if (calcCritDist) calcCritDist.textContent = `${xc} m`;
    if (calcCrossDist) calcCrossDist.textContent = `${xcross} m`;
    if (calcInterceptTime) calcInterceptTime.textContent = `${ti_ms} ms`;
  }

  if (simV1Slider) simV1Slider.addEventListener('input', () => { updatePhysicsTelemetry(); drawSimFrame(); });
  if (simV2Slider) simV2Slider.addEventListener('input', () => { updatePhysicsTelemetry(); drawSimFrame(); });
  if (simHSlider) simHSlider.addEventListener('input', () => { updatePhysicsTelemetry(); drawSimFrame(); });

  updatePhysicsTelemetry();

  function resizeRaypathCanvas() {
    if (!raypathCanvas) return;
    const rect = raypathCanvas.getBoundingClientRect();
    raypathCanvas.width = rect.width * window.devicePixelRatio;
    raypathCanvas.height = rect.height * window.devicePixelRatio;
    drawSimFrame();
  }
  window.addEventListener('resize', resizeRaypathCanvas);
  setTimeout(resizeRaypathCanvas, 150);

  function drawSimFrame() {
    if (!raypathCanvas) return;
    const ctx = raypathCanvas.getContext('2d');
    const w = raypathCanvas.width;
    const h = raypathCanvas.height;
    const dpr = window.devicePixelRatio;

    ctx.clearRect(0, 0, w, h);

    const v1 = parseFloat(simV1Slider ? simV1Slider.value : 380); // m/s
    const v2 = parseFloat(simV2Slider ? simV2Slider.value : 1750); // m/s
    const layerH = parseFloat(simHSlider ? simHSlider.value : 3.5); // meters

    // Geometry layout in canvas
    // Width represents 48 meters (0 to 48m)
    // Height represents 16 meters (0 to 16m)
    const meterScaleX = w / 50; // pixels per meter
    const meterScaleY = h / 16;
    const groundY = 55 * dpr;
    const interfaceY = groundY + layerH * meterScaleY;

    // Layer 1: Soil / 表土層
    const soilGrad = ctx.createLinearGradient(0, groundY, 0, interfaceY);
    soilGrad.addColorStop(0, '#1a1f2c');
    soilGrad.addColorStop(1, '#111827');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, groundY, w, interfaceY - groundY);

    // Layer 2: Bedrock / 基岩層
    const rockGrad = ctx.createLinearGradient(0, interfaceY, 0, h);
    rockGrad.addColorStop(0, '#0f172a');
    rockGrad.addColorStop(1, '#050914');
    ctx.fillStyle = rockGrad;
    ctx.fillRect(0, interfaceY, w, h - interfaceY);

    // Geological boundary interface line
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, interfaceY);
    ctx.lineTo(w, interfaceY);
    ctx.stroke();

    // Layer Labels
    ctx.font = `bold ${10 * dpr}px 'Orbitron', sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`LAYER 1: SURFACE WEATHERED SOIL (表土層) | V₁ = ${v1} m/s`, 15 * dpr, groundY + 22 * dpr);
    ctx.fillStyle = 'var(--cyan-core)';
    ctx.fillText(`LAYER 2: BEDROCK (基岩層) | V₂ = ${v2} m/s`, 15 * dpr, interfaceY + 24 * dpr);

    // Depth indicator
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(w - 60 * dpr, groundY);
    ctx.lineTo(w - 60 * dpr, interfaceY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffaa00';
    ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
    ctx.fillText(`h = ${layerH.toFixed(1)}m`, w - 55 * dpr, groundY + (interfaceY - groundY) / 2);

    // 24 Geophones at ground level
    const shotCanvasX = 25 * dpr;
    for (let ch = 0; ch < 24; ch++) {
      const dist = ch * 2.0; // meters
      const gx = shotCanvasX + dist * meterScaleX;

      // Draw sensor spike
      ctx.fillStyle = '#64748b';
      ctx.fillRect(gx - 2 * dpr, groundY - 6 * dpr, 4 * dpr, 6 * dpr);

      // Check arrival at this geophone at current simTime
      const tSec = simTime / 1000;
      const directArrTime = dist / v1;
      const sinC = v1 / v2;
      const cosC = Math.sqrt(Math.max(0, 1 - sinC * sinC));
      const headArrTime = (dist * sinC + 2 * layerH * cosC) / v1;

      let sensorColor = '#00f0ff';
      let isHit = false;

      if (dist >= (2 * layerH * Math.tan(Math.asin(sinC))) && Math.abs(tSec - headArrTime) < 0.006) {
        sensorColor = '#00f0ff'; // Head wave arrived!
        isHit = true;
      } else if (Math.abs(tSec - directArrTime) < 0.006) {
        sensorColor = '#ff3366'; // Direct wave arrived!
        isHit = true;
      }

      ctx.beginPath();
      ctx.arc(gx, groundY - 8 * dpr, (isHit ? 6 : 3.5) * dpr, 0, Math.PI * 2);
      ctx.fillStyle = sensorColor;
      if (isHit) {
        ctx.shadowColor = sensorColor;
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      if (ch % 4 === 0 || ch === 23) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = `${8 * dpr}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${dist}m`, gx, groundY - 16 * dpr);
      }
    }

    // Shot Hammer Source
    ctx.beginPath();
    ctx.arc(shotCanvasX, groundY, 6 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3366';
    ctx.shadowColor = '#ff3366';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ff3366';
    ctx.font = `bold ${9 * dpr}px 'Orbitron', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('SHOT (0m)', shotCanvasX + 10 * dpr, groundY - 14 * dpr);

    // ------------------------------------------------------------------------
    // PROPAGATING WAVEFRONTS (Direct Wave + Refracted Head Wavefront)
    // ------------------------------------------------------------------------
    if (simTime > 0) {
      const tSec = simTime / 1000;
      const directRadiusM = v1 * tSec;
      const directRadiusPx = directRadiusM * meterScaleX;

      // 1. Direct Circular Wavefront in Layer 1
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, groundY, w, interfaceY - groundY); // clip to Layer 1
      ctx.clip();

      ctx.beginPath();
      ctx.arc(shotCanvasX, groundY, directRadiusPx, 0, Math.PI);
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 3 * dpr;
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 2. Refracted Wavefront in Layer 2 (Faster circular wave + planar head wave)
      const timeToInterface = layerH / v1;
      if (tSec > timeToInterface) {
        const thetaC = Math.asin(v1 / v2);
        const critIncidenceDist = layerH * Math.tan(thetaC);
        const timeToCrit = Math.sqrt(layerH * layerH + critIncidenceDist * critIncidenceDist) / v1;

        if (tSec >= timeToCrit) {
          const tInBedrock = tSec - timeToCrit;
          const distInBedrock = v2 * tInBedrock; // meters along interface
          const headPointM = critIncidenceDist + distInBedrock;
          const headPointPx = shotCanvasX + headPointM * meterScaleX;

          // Gliding pulse in Bedrock along interface
          ctx.beginPath();
          ctx.arc(headPointPx, interfaceY, 5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Conical Head Wavefront radiating up into Layer 1 (angle = θc with vertical)
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, groundY, w, interfaceY - groundY);
          ctx.clip();

          // Head wave line from headPointPx backwards up to ground
          const dxToGround = (interfaceY - groundY) * Math.tan(thetaC);
          const headGroundX = headPointPx - dxToGround;

          ctx.beginPath();
          ctx.moveTo(headPointPx, interfaceY);
          ctx.lineTo(headGroundX, groundY);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3.5 * dpr;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();

          // Circular transmitted wave in Layer 2
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, interfaceY, w, h - interfaceY);
          ctx.clip();
          const rBedrockPx = (tSec - timeToInterface) * v2 * meterScaleX;
          ctx.beginPath();
          ctx.arc(shotCanvasX, interfaceY, rBedrockPx, 0, Math.PI);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 2 * dpr;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function startSimulation() {
    initAudio();
    playSeismicThump();
    simTime = 0;
    isSimRunning = true;

    if (simAnimId) cancelAnimationFrame(simAnimId);

    let lastTimestamp = performance.now();

    function step(currentTimestamp) {
      if (!isSimRunning) return;
      const dt = (currentTimestamp - lastTimestamp);
      lastTimestamp = currentTimestamp;

      // Time advance: slow motion physics playback (~0.12x real time for visual clarity)
      simTime += dt * 0.15; // ms

      if (simTimeDisplay) {
        simTimeDisplay.textContent = `${simTime.toFixed(1)} ms`;
      }

      drawSimFrame();

      if (simTime < 95.0) {
        simAnimId = requestAnimationFrame(step);
      } else {
        isSimRunning = false;
      }
    }

    simAnimId = requestAnimationFrame(step);
  }

  if (fireShotBtn) {
    fireShotBtn.addEventListener('click', startSimulation);
  }

  // --------------------------------------------------------------------------
  // 5. INTERACTIVE FIELD RECORD TABLE ROW SELECTION
  // --------------------------------------------------------------------------
  const tableRows = document.querySelectorAll('.cyber-table tbody tr');

  function highlightActiveTableRow(shotId) {
    tableRows.forEach(row => {
      if (row.dataset.shotId === shotId) {
        row.classList.add('active-shot');
      } else {
        row.classList.remove('active-shot');
      }
    });
  }

  tableRows.forEach(row => {
    row.addEventListener('click', () => {
      const shotId = row.dataset.shotId;
      const targetIdx = seismicShots.findIndex(s => s.shot_id === shotId);
      if (targetIdx !== -1) {
        currentShotIndex = targetIdx;
        if (shotSelect) shotSelect.value = targetIdx;
        highlightActiveTableRow(shotId);
        renderSeismicGather();
        playUiBeep(1250, 0.05, 'sine');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 6. MODAL LIGHTBOX FOR HIGH-RES FIELD PHOTOS & INSTRUMENTS
  // --------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, title, desc) {
    if (!lightboxModal) return;
    lightboxImg.src = src;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;
    lightboxModal.classList.add('active');
    playUiBeep(1300, 0.05, 'triangle');
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    playUiBeep(800, 0.04, 'sine');
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  // Attach lightbox trigger to instrument cards
  document.querySelectorAll('.instrument-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('.card-title') ? card.querySelector('.card-title').textContent : '儀器細節';
      const desc = card.querySelector('.card-text') ? card.querySelector('.card-text').textContent : '';
      if (img) openLightbox(img.src, title, desc);
    });
  });

  // Attach lightbox trigger to gallery items
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.dataset.title || '野外實習影像';
      const desc = item.dataset.desc || '現場實測記錄影像。';
      if (img) openLightbox(img.src, title, desc);
    });
  });
});
