/* Mathis Pernias — "burn" easter egg: the page catches fire, chars and turns to ash. */
(function () {
    'use strict';

    const isFr = () => document.documentElement.lang === 'fr';
    const t = (en, fr) => (isFr() ? fr : en);
    let active = null;

    /* ---------- tiny value-noise fbm for ragged burn fronts ---------- */
    function makeNoise(seed) {
        const p = new Uint8Array(512);
        let s = seed >>> 0;
        const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
        const perm = [...Array(256).keys()].sort(() => rnd() - 0.5);
        for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
        const grad = i => (p[i] / 255) * 2 - 1;
        const fade = x => x * x * (3 - 2 * x);
        const v2 = (x, y) => {
            const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
            const a = grad(p[(xi & 255) + p[yi & 255]]), b = grad(p[((xi + 1) & 255) + p[yi & 255]]);
            const c = grad(p[(xi & 255) + p[(yi + 1) & 255]]), d = grad(p[((xi + 1) & 255) + p[(yi + 1) & 255]]);
            const u = fade(xf), v = fade(yf);
            return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
        };
        return (x, y) => v2(x, y) * 0.55 + v2(x * 2.1, y * 2.1) * 0.28 + v2(x * 4.3, y * 4.3) * 0.17;
    }

    function sprite(size, stops) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const g = c.getContext('2d');
        const rg = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        stops.forEach(([o, col]) => rg.addColorStop(o, col));
        g.fillStyle = rg;
        g.fillRect(0, 0, size, size);
        return c;
    }

    function crackle() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        const ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
        master.connect(ctx.destination);
        // low roar: brown noise
        const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
        const roar = ctx.createBufferSource(); roar.buffer = buf; roar.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
        const rg = ctx.createGain(); rg.gain.value = 0.55;
        roar.connect(lp).connect(rg).connect(master); roar.start();
        // crackles: short filtered noise bursts at random times
        const white = ctx.createBuffer(1, ctx.sampleRate / 4, ctx.sampleRate), w = white.getChannelData(0);
        for (let i = 0; i < w.length; i++) w[i] = Math.random() * 2 - 1;
        let stopped = false;
        const pop = () => {
            if (stopped) return;
            const n = 1 + Math.floor(Math.random() * 3);
            for (let k = 0; k < n; k++) {
                const at = ctx.currentTime + Math.random() * 0.05;
                const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
                s.buffer = white; f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 4500; f.Q.value = 2;
                g.gain.setValueAtTime(0.25 + Math.random() * 0.6, at);
                g.gain.exponentialRampToValueAtTime(0.001, at + 0.01 + Math.random() * 0.03);
                s.connect(f).connect(g).connect(master);
                s.start(at, Math.random() * 0.2); s.stop(at + 0.05);
            }
            setTimeout(pop, 30 + Math.random() * 140);
        };
        pop();
        return {
            fade(sec) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, sec / 3); },
            close() { stopped = true; try { ctx.close(); } catch (e) { /* already closed */ } },
        };
    }

    function burn(origin, onEnd) {
        if (active) return false;
        const W = window.innerWidth, H = window.innerHeight;
        const CELL = 4, GW = Math.ceil(W / CELL), GH = Math.ceil(H / CELL);
        const noise = makeNoise(Math.random() * 1e9);

        const wrap = document.createElement('div');
        wrap.className = 'burn-layer';
        wrap.setAttribute('aria-hidden', 'true');
        const field = document.createElement('canvas');   // low-res char map, scaled up smoothly
        field.width = GW; field.height = GH; field.className = 'burn-field';
        const fx = document.createElement('canvas');      // flames, smoke, sparks at full res
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        fx.width = W * dpr; fx.height = H * dpr; fx.className = 'burn-fx';
        wrap.append(field, fx);
        document.body.appendChild(wrap);
        document.documentElement.classList.add('burning');

        const fctx = field.getContext('2d');
        const img = fctx.createImageData(GW, GH);
        const px = img.data;
        const g = fx.getContext('2d');
        g.scale(dpr, dpr);

        // ignition time per cell: distance from origin(s) + noise => ragged, organic front
        const ox = origin.x / CELL, oy = origin.y / CELL;
        const far = Math.max(Math.hypot(ox, oy), Math.hypot(GW - ox, oy), Math.hypot(ox, GH - oy), Math.hypot(GW - ox, GH - oy));
        const SPREAD = 6.2;  // seconds for the front to reach the farthest corner
        const sx = GW * (0.15 + Math.random() * 0.2), sy = GH * (0.75 + Math.random() * 0.2); // second ignition point
        const ig = new Float32Array(GW * GH);
        const grain = new Uint8Array(GW * GH);
        const phase = new Float32Array(GW * GH);
        let maxIg = 0;
        for (let y = 0; y < GH; y++) {
            for (let x = 0; x < GW; x++) {
                const i = y * GW + x;
                const d1 = Math.hypot(x - ox, (y - oy) * 1.1) / far;
                const d2 = 0.35 + Math.hypot(x - sx, y - sy) / far;
                const n = noise(x * 0.035, y * 0.035);
                const v = Math.max(0, (Math.min(d1, d2) + n * 0.22) * SPREAD + 0.15);
                ig[i] = v;
                if (v > maxIg) maxIg = v;
                grain[i] = Math.floor(Math.random() * 14);
                phase[i] = Math.random() * 6.283;
            }
        }

        const flameHot = sprite(64, [[0, 'rgba(255,250,220,1)'], [0.25, 'rgba(255,205,90,.9)'], [0.6, 'rgba(255,110,20,.35)'], [1, 'rgba(255,60,0,0)']]);
        const flameMid = sprite(64, [[0, 'rgba(255,170,60,.9)'], [0.45, 'rgba(240,80,10,.45)'], [1, 'rgba(200,30,0,0)']]);
        const smoke = sprite(64, [[0, 'rgba(60,56,52,.5)'], [0.6, 'rgba(40,38,36,.18)'], [1, 'rgba(30,30,30,0)']]);
        const parts = [];
        const audio = crackle();

        const t0 = performance.now();
        let raf = 0, finished = false, last = t0;

        function frame(now) {
            const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            // ---- char map ----
            for (let i = 0, j = 0; i < ig.length; i++, j += 4) {
                const d = t - ig[i];
                let r = 0, gg = 0, b = 0, a = 0;
                if (d < -1.1) { a = 0; }
                else if (d < 0) {                       // scorching: paper browns ahead of the flame
                    const k = (d + 1.1) / 1.1;
                    r = 92 - 40 * k; gg = 52 - 30 * k; b = 18 - 8 * k; a = 255 * Math.pow(k, 1.6) * 0.92;
                } else if (d < 0.38) {                  // burning band: white-hot edge -> orange -> red embers
                    const k = d / 0.38, f = 0.8 + 0.2 * Math.sin(t * 17 + phase[i]);
                    r = 255 * f; gg = (238 - 190 * k) * f; b = (150 - 145 * k) * f; a = 255;
                } else if (d < 1.5) {                   // cooling char, embers dying out unevenly
                    const k = Math.min(1, (d - 0.38) / 1.12 + (Math.sin(phase[i] * 3) * 0.12));
                    r = 170 * (1 - k) + 16 * k; gg = 36 * (1 - k) + 13 * k; b = 6 * (1 - k) + 11 * k; a = 255;
                } else if (d < 1.6) {
                    const k = 1;
                    r = 150 * (1 - k) + 16 * k; gg = 34 * (1 - k) + 13 * k; b = 6 * (1 - k) + 11 * k; a = 255;
                } else {                                // ash with grain and the odd ember
                    const e = grain[i] === 0 && Math.sin(t * 3 + i * 7.1) > 0.92 ? 1 : 0;
                    r = 12 + grain[i] + e * 120; gg = 11 + grain[i] * 0.9 + e * 35; b = 10 + grain[i] * 0.8; a = 255;
                }
                px[j] = r; px[j + 1] = gg; px[j + 2] = b; px[j + 3] = a;
            }
            fctx.putImageData(img, 0, 0);

            // ---- spawn flames / smoke / sparks along the active front ----
            if (t < maxIg + 0.6) {
                for (let k = 0; k < 900 && parts.length < 1400; k++) {
                    const i = (Math.random() * ig.length) | 0;
                    const d = t - ig[i];
                    if (d < 0 || d > 0.45) continue;
                    const x = (i % GW) * CELL + Math.random() * CELL, y = ((i / GW) | 0) * CELL;
                    const roll = Math.random();
                    if (roll < 0.62) parts.push({ k: 'f', x, y, vx: (Math.random() - 0.5) * 30, vy: -70 - Math.random() * 110, life: 0, max: 0.35 + Math.random() * 0.6, s: 10 + Math.random() * 26 });
                    else if (roll < 0.9) parts.push({ k: 's', x, y, vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 40, life: 0, max: 1.4 + Math.random() * 1.6, s: 18 + Math.random() * 24 });
                    else parts.push({ k: 'e', x, y, vx: (Math.random() - 0.5) * 80, vy: -90 - Math.random() * 160, life: 0, max: 0.8 + Math.random() * 1.4, s: 1 + Math.random() * 1.8 });
                }
            }

            g.clearRect(0, 0, W, H);
            // smoke first (normal blending), then flames + sparks (additive)
            g.globalCompositeOperation = 'source-over';
            for (const p of parts) {
                if (p.k !== 's') continue;
                const q = p.life / p.max;
                g.globalAlpha = 0.55 * (1 - q);
                const s = p.s * (1 + q * 2.4);
                g.drawImage(smoke, p.x - s / 2, p.y - s / 2, s, s);
            }
            g.globalCompositeOperation = 'lighter';
            for (const p of parts) {
                const q = p.life / p.max;
                if (p.k === 'f') {
                    g.globalAlpha = Math.max(0, 1 - q) * 0.9;
                    const s = p.s * (1 - q * 0.6);
                    g.drawImage(q < 0.35 ? flameHot : flameMid, p.x - s / 2, p.y - s * 0.65, s, s * 1.3);
                } else if (p.k === 'e') {
                    g.globalAlpha = Math.max(0, 1 - q);
                    g.fillStyle = q < 0.5 ? '#ffd27a' : '#ff7a2a';
                    g.fillRect(p.x, p.y, p.s, p.s);
                }
            }
            g.globalAlpha = 1;
            g.globalCompositeOperation = 'source-over';

            for (let k = parts.length - 1; k >= 0; k--) {
                const p = parts[k];
                p.life += dt;
                if (p.life >= p.max) { parts.splice(k, 1); continue; }
                const turb = Math.sin((p.y + now * 0.12) * 0.04 + p.x * 0.02) * 40;
                p.vx += (turb - p.vx) * dt * 2;
                p.x += p.vx * dt; p.y += p.vy * dt;
                if (p.k === 'f') p.vy -= 60 * dt;
            }

            if (!finished && t > maxIg + 1.8) {
                finished = true;
                if (audio) audio.fade(2.5);
                showRebuild();
            }
            raf = requestAnimationFrame(frame);
        }

        function showRebuild() {
            const box = document.createElement('div');
            box.className = 'burn-end';
            box.innerHTML = '<p>' + t('Website burnt to ashes 🔥', 'Site réduit en cendres 🔥') + '</p>' +
                '<button type="button">↻ ' + t('Rebuild the site', 'Reconstruire le site') + '</button>';
            box.querySelector('button').addEventListener('click', () => stop(true));
            wrap.appendChild(box);
            box.querySelector('button').focus({ preventScroll: true });
        }

        function stop(fadeOut) {
            if (!active) return;
            active = null;
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', onResize);
            if (audio) { audio.fade(0.6); setTimeout(() => audio.close(), 900); }
            const end = () => {
                cancelAnimationFrame(raf);
                wrap.remove();
                document.documentElement.classList.remove('burning');
                if (onEnd) onEnd();
            };
            if (fadeOut) { wrap.classList.add('burn-out'); setTimeout(end, 1300); }
            else end();
        }
        const onKey = e => { if (e.key === 'Escape') stop(true); };
        const onResize = () => stop(false);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', onResize);

        active = { stop };
        raf = requestAnimationFrame(frame);
        return true;
    }

    window.siteBurn = {
        start: burn,
        get active() { return !!active; },
        stop() { if (active) active.stop(true); },
    };
})();
