/* Mathis Pernias — terminal easter eggs: DROP TABLE, winter, gravity, run. */
(function () {
    'use strict';

    const root = document.documentElement;
    const isFr = () => root.lang === 'fr';
    const t = (en, fr) => (isFr() ? fr : en);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const rand = (a, b) => a + Math.random() * (b - a);
    const css = name => getComputedStyle(root).getPropertyValue(name).trim();

    let current = null;                       // { name, stop }
    function claim(name, stop) { if (current) current.stop(); current = { name, stop }; }
    function release(name) { if (current && current.name === name) current = null; }
    const lock = on => root.classList.toggle('egg-lock', on);
    const shown = el => el.getClientRects().length > 0;
    const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0; };

    function banner(text, label, onClick, cls) {
        const b = document.createElement('div');
        b.className = 'egg-banner' + (cls ? ' ' + cls : '');
        const s = document.createElement('span'); s.textContent = text;
        const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = label;
        btn.addEventListener('click', onClick);
        b.append(s, btn);
        document.body.appendChild(b);
        return b;
    }

    function onEsc(fn) {
        const h = e => { if (e.key === 'Escape') fn(); };
        document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }

    /* =====================================================================
       1. DROP TABLE portfolio;  — rows fall off the page, then ROLLBACK
       ===================================================================== */
    function dropTable(done) {
        if (current && current.name === 'drop') return;
        const rows = [...document.querySelectorAll(
            '.topbar .brand, .topbar .nav, .topbar-actions, .hero-main > *, .term, .metrics > div, main > section:not(.hero), .footer')]
            .filter(shown)
            .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        const saved = rows.map(el => ({ el, tr: el.style.transition, tf: el.style.transform, op: el.style.opacity }));
        let cancelled = false, overlay = null;

        const restore = animate => {
            saved.slice().reverse().forEach((s, i) => {
                s.el.style.transition = animate
                    ? `transform .9s cubic-bezier(.2,1.25,.35,1) ${i * 70}ms, opacity .35s ease ${i * 70}ms`
                    : 'none';
                s.el.style.transform = s.tf;
                s.el.style.opacity = s.op;
            });
            const finish = () => { saved.forEach(s => { s.el.style.transition = s.tr; }); lock(false); root.classList.remove('egg-drop'); };
            if (animate) setTimeout(finish, 900 + saved.length * 70); else finish();
        };
        const stop = () => {
            if (cancelled) return;
            cancelled = true;
            unEsc();
            if (overlay) overlay.remove();
            restore(false);
            release('drop');
        };
        claim('drop', stop);
        const unEsc = onEsc(stop);
        lock(true);
        root.classList.add('egg-drop');

        (async () => {
            let vis = 0;
            rows.forEach(el => {
                const d = inView(el) ? (vis++) * 150 : 0;
                setTimeout(() => {
                    if (cancelled) return;
                    el.classList.add('egg-wobble');
                    setTimeout(() => {
                        el.classList.remove('egg-wobble');
                        el.style.transition = 'transform 1s cubic-bezier(.5,0,.9,.4), opacity .35s ease .65s';
                        el.style.transform = `translateY(${innerHeight + 300}px) rotate(${rand(-14, 14).toFixed(1)}deg)`;
                        el.style.opacity = '0';
                    }, 230);
                }, d);
            });
            await wait(vis * 150 + 1400);
            if (cancelled) return;

            overlay = document.createElement('div');
            overlay.className = 'egg-sql';
            overlay.setAttribute('role', 'status');
            document.body.appendChild(overlay);
            const say = async (html, typed) => {
                const p = document.createElement('div');
                overlay.appendChild(p);
                if (!typed) { p.innerHTML = html; return; }
                p.innerHTML = '<span class="t-prompt">portfolio=#</span> ';
                for (const ch of html) { if (cancelled) return; p.insertAdjacentText('beforeend', ch); await wait(55); }
            };
            await say('DROP TABLE portfolio;', true);
            await wait(350);
            await say(`<span class="t-key">DROP TABLE · ${rows.length} rows deleted</span>`);
            await wait(1600);
            if (cancelled) return;
            await say('ROLLBACK;', true);
            await wait(300);
            await say('<span class="t-key">ROLLBACK</span>');
            await say('<span class="t-cm">' + t('-- phew, it was all inside a transaction 😅', '-- ouf, tout était dans une transaction 😅') + '</span>');
            await wait(1300);
            if (cancelled) return;
            overlay.classList.add('out');
            setTimeout(() => overlay && overlay.remove(), 500);
            restore(true);
            unEsc();
            release('drop');
            cancelled = true;
            setTimeout(() => done && done(rows.length), 900);
        })();
    }

    /* =====================================================================
       2. Winter in Montréal — snow piles up on the page, the cursor melts it
       ===================================================================== */
    function winter(onStop) {
        if (current && current.name === 'winter') { current.stop(); return false; }
        const cv = document.createElement('canvas');
        cv.className = 'egg-snow';
        cv.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cv);
        const g = cv.getContext('2d');
        let W = 0, H = 0, dpr = 1;
        const size = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            W = innerWidth; H = innerHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        size();

        const BIN = 4;
        const surfaces = [...document.querySelectorAll(
            'h1, h2, .btn, .term, .featured, .case, .project, .metrics, .prs, .eucor, .journey, .gallery, .stack, .contact-mail')]
            .filter(shown).map(el => ({ el, bins: new Float32Array(Math.ceil(el.getBoundingClientRect().width / BIN) + 1) }));
        let ground = new Float32Array(Math.ceil(W / BIN) + 1);
        const flakes = [];
        const mouse = { x: -999, y: -999 };
        const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
        window.addEventListener('pointermove', onMove, { passive: true });
        const onResize = () => { size(); ground = new Float32Array(Math.ceil(W / BIN) + 1); };
        window.addEventListener('resize', onResize);

        // −30 % → −30 °C, and the status bar gets a temperature
        const metric = document.querySelector('.metrics dt');
        const metricText = metric ? metric.textContent : '';
        if (metric) metric.textContent = '−30 °C ❄️';
        const status = document.querySelector('.term-status > span');
        const temp = document.createElement('span');
        temp.textContent = ' · −30 °C';
        if (status) status.appendChild(temp);

        const deposit = (bins, b, amount, cap) => {
            for (let k = -3; k <= 3; k++) {
                const j = b + k;
                if (j < 0 || j >= bins.length) continue;
                bins[j] = Math.min(cap, bins[j] + amount * (1 - Math.abs(k) / 4));
            }
        };
        const melt = (bins, left, top, dt) => {
            if (Math.abs(mouse.y - top) > 70) return;
            const b0 = Math.floor((mouse.x - 60 - left) / BIN), b1 = Math.ceil((mouse.x + 60 - left) / BIN);
            for (let j = Math.max(0, b0); j <= Math.min(bins.length - 1, b1); j++) {
                const dx = left + j * BIN - mouse.x;
                bins[j] = Math.max(0, bins[j] - (1 - Math.abs(dx) / 60) * 90 * dt);
            }
        };
        const smooth = bins => {
            for (let j = 1; j < bins.length - 1; j++) bins[j] = bins[j] * 0.9 + (bins[j - 1] + bins[j + 1]) * 0.05;
        };
        const pile = (bins, left, top, right) => {
            g.beginPath();
            g.moveTo(left, top);
            for (let j = 0; j < bins.length; j++) {
                const x = Math.min(right, left + j * BIN);
                g.lineTo(x, top - bins[j]);
            }
            g.lineTo(right, top);
            g.closePath();
            g.fill();
            g.stroke();
        };

        let raf = 0, last = performance.now(), stopped = false;
        function frame(now) {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const tt = now / 1000;
            while (flakes.length < Math.min(420, W * 0.3)) {
                flakes.push({ x: rand(-20, W + 20), y: rand(-H, 0), r: rand(1.2, 3.4), vy: rand(35, 85), ph: rand(0, 6.3), sw: rand(10, 35) });
            }
            const rects = surfaces.map(s => ({ s, r: s.el.getBoundingClientRect() }))
                .filter(o => o.r.top > -40 && o.r.top < H + 40 && o.r.width > 0);

            for (let i = flakes.length - 1; i >= 0; i--) {
                const f = flakes[i];
                const py = f.y;
                f.y += f.vy * f.r * 0.45 * dt;
                f.x += (Math.sin(tt * 1.3 + f.ph) * f.sw + 8) * dt;
                let landed = false;
                for (const o of rects) {
                    const { r, s } = o;
                    if (f.x < r.left || f.x > r.right) continue;
                    const b = Math.floor((f.x - r.left) / BIN);
                    const topY = r.top - s.bins[b];
                    if (py < topY && f.y >= topY) { deposit(s.bins, b, f.r * 0.55, 26); landed = true; break; }
                }
                if (!landed && f.y >= H - ground[Math.max(0, Math.min(ground.length - 1, Math.floor(f.x / BIN)))]) {
                    deposit(ground, Math.floor(f.x / BIN), f.r * 0.5, 46);
                    landed = true;
                }
                if (landed || f.x > W + 40) { flakes.splice(i, 1); }
            }

            g.clearRect(0, 0, W, H);
            g.fillStyle = 'rgba(255,255,255,.97)';
            g.strokeStyle = 'rgba(120,140,170,.45)';
            g.lineWidth = 1;
            for (const { s, r } of rects) {
                melt(s.bins, r.left, r.top, dt);
                smooth(s.bins);
                pile(s.bins, r.left, r.top, r.right);
            }
            melt(ground, 0, H, dt);
            smooth(ground);
            pile(ground, 0, H + 1, W);
            for (const f of flakes) {
                g.beginPath();
                g.arc(f.x, f.y, f.r, 0, 6.283);
                g.fill();
                g.stroke();
            }
            if (!stopped) raf = requestAnimationFrame(frame);
        }
        const bar = banner(t('❄️ Montréal winter · −30 °C', '❄️ Hiver montréalais · −30 °C'), t('stop', 'arrêter'), () => stop(), 'egg-banner--cold');
        const stop = () => {
            if (stopped) return;
            stopped = true;
            cancelAnimationFrame(raf);
            unEsc();
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('resize', onResize);
            cv.classList.add('out');
            setTimeout(() => cv.remove(), 700);
            bar.remove();
            temp.remove();
            if (metric) metric.textContent = metricText;
            release('winter');
            if (onStop) onStop();
        };
        claim('winter', stop);
        const unEsc = onEsc(stop);
        raf = requestAnimationFrame(frame);
        return true;
    }

    /* =====================================================================
       3. Gravity — page elements fall, pile up, can be grabbed and thrown
       ===================================================================== */
    function gravity(done) {
        if (current && current.name === 'gravity') return;
        const pool = [...document.querySelectorAll(
            '.brand, .nav a, .lang, .status, .hero h1, .lead, .actions .btn, .term, .metrics > div, .section-head > *, ' +
            '.featured, .stage, .case-meta, .case-body, .fig, .project, .stack-row, .role, .pr, .eucor, .gallery, .contact > *, .footer > span')]
            .filter(el => shown(el) && inView(el));
        const set = new Set(pool);
        const els = pool.filter(el => {
            for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false;
            const r = el.getBoundingClientRect();
            return r.height < innerHeight * 0.85 && r.width > 4 && r.height > 4;
        });
        if (!els.length) return;

        lock(true);
        root.classList.add('egg-gravity');
        const bodies = els.map(el => {
            const r = el.getBoundingClientRect();
            const b = {
                el, x: r.left, y: r.top, w: r.width, h: r.height, x0: r.left, y0: r.top,
                vx: rand(-60, 60), vy: rand(-180, 0), rot: 0, m: r.width * r.height,
                saved: { tr: el.style.transition, tf: el.style.transform, cur: el.style.cursor, ta: el.style.touchAction, wc: el.style.willChange, z: el.style.zIndex, pos: el.style.position },
            };
            el.style.transition = 'none';
            el.style.willChange = 'transform';
            el.style.cursor = 'grab';
            el.style.touchAction = 'none';
            if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
            return b;
        });

        const G = 2300;
        let drag = null, dragOff = { x: 0, y: 0 }, lastP = null, stopped = false, raf = 0, last = performance.now();
        const byEl = new Map(bodies.map(b => [b.el, b]));
        const findBody = target => { for (let n = target; n; n = n.parentElement) if (byEl.has(n)) return byEl.get(n); return null; };

        const down = e => {
            const b = findBody(e.target);
            if (!b) return;
            e.preventDefault();
            drag = b;
            dragOff = { x: e.clientX - b.x, y: e.clientY - b.y };
            lastP = { x: e.clientX, y: e.clientY, t: performance.now() };
            b.el.style.cursor = 'grabbing';
            b.el.style.zIndex = '400';
        };
        const move = e => {
            if (!drag) return;
            const now = performance.now(), dtm = Math.max(1, now - lastP.t) / 1000;
            drag.vx = (e.clientX - lastP.x) / dtm * 0.6 + drag.vx * 0.4;
            drag.vy = (e.clientY - lastP.y) / dtm * 0.6 + drag.vy * 0.4;
            drag.x = e.clientX - dragOff.x;
            drag.y = e.clientY - dragOff.y;
            lastP = { x: e.clientX, y: e.clientY, t: now };
        };
        const up = () => {
            if (!drag) return;
            drag.el.style.cursor = 'grab';
            drag.el.style.zIndex = drag.saved.z;
            drag.vx = Math.max(-2600, Math.min(2600, drag.vx));
            drag.vy = Math.max(-2600, Math.min(2600, drag.vy));
            drag = null;
        };
        const blockClick = e => { if (findBody(e.target)) { e.preventDefault(); e.stopPropagation(); } };
        document.addEventListener('pointerdown', down, true);
        window.addEventListener('pointermove', move, { passive: true });
        window.addEventListener('pointerup', up);
        document.addEventListener('click', blockClick, true);

        function physics(dt) {
            const W = innerWidth, H = innerHeight;
            for (const b of bodies) {
                if (b === drag) continue;
                b.vy += G * dt;
                b.x += b.vx * dt; b.y += b.vy * dt;
                if (b.y + b.h > H) { b.y = H - b.h; b.vy = Math.abs(b.vy) > 120 ? -b.vy * 0.28 : 0; b.vx *= 0.9; }
                if (b.x < 0) { b.x = 0; b.vx = -b.vx * 0.45; }
                if (b.x + b.w > W) { b.x = W - b.w; b.vx = -b.vx * 0.45; }
                if (b.y < -H) { b.y = -H; b.vy = 0; }
            }
            for (let it = 0; it < 4; it++) {
                for (let i = 0; i < bodies.length; i++) {
                    for (let j = i + 1; j < bodies.length; j++) {
                        const a = bodies[i], c = bodies[j];
                        const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
                        const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
                        if (ox <= 0 || oy <= 0) continue;
                        const ia = a === drag ? 0 : 1 / a.m, ic = c === drag ? 0 : 1 / c.m, sum = ia + ic;
                        if (!sum) continue;
                        if (ox < oy) {
                            const dir = a.x + a.w / 2 < c.x + c.w / 2 ? -1 : 1;
                            a.x += dir * ox * (ia / sum); c.x -= dir * ox * (ic / sum);
                            const rv = a.vx - c.vx;
                            if (rv * dir < 0) { const imp = -(1.2) * rv / sum; a.vx += imp * ia; c.vx -= imp * ic; }
                        } else {
                            const dir = a.y + a.h / 2 < c.y + c.h / 2 ? -1 : 1;
                            a.y += dir * oy * (ia / sum); c.y -= dir * oy * (ic / sum);
                            const rv = a.vy - c.vy;
                            if (rv * dir < 0) { const imp = -(1.2) * rv / sum; a.vy += imp * ia; c.vy -= imp * ic; }
                            a.vx *= 0.96; c.vx *= 0.96;
                        }
                    }
                }
            }
        }

        function frame(now) {
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;
            for (let s = 0; s < 3; s++) physics(dt / 3);
            for (const b of bodies) {
                const target = Math.max(-14, Math.min(14, b.vx * 0.025));
                b.rot += (target - b.rot) * 0.15;
                b.el.style.transform = `translate(${(b.x - b.x0).toFixed(1)}px, ${(b.y - b.y0).toFixed(1)}px) rotate(${b.rot.toFixed(2)}deg)`;
            }
            if (!stopped) raf = requestAnimationFrame(frame);
        }

        const cleanup = animate => {
            stopped = true;
            cancelAnimationFrame(raf);
            unEsc();
            document.removeEventListener('pointerdown', down, true);
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            document.removeEventListener('click', blockClick, true);
            bar.remove();
            bodies.forEach((b, i) => {
                b.el.style.transition = animate ? `transform .8s cubic-bezier(.2,1.2,.35,1) ${i * 25}ms` : 'none';
                b.el.style.transform = b.saved.tf;
            });
            setTimeout(() => {
                bodies.forEach(b => {
                    const s = b.saved, st = b.el.style;
                    st.transition = s.tr; st.cursor = s.cur; st.touchAction = s.ta; st.willChange = s.wc; st.zIndex = s.z; st.position = s.pos;
                });
                lock(false);
                root.classList.remove('egg-gravity');
                if (animate && done) done();
            }, animate ? 850 + bodies.length * 25 : 0);
            release('gravity');
        };
        const stop = () => { if (!stopped) cleanup(false); };
        claim('gravity', stop);
        const unEsc = onEsc(() => { if (!stopped) cleanup(true); });
        const bar = banner(t('🍎 gravity on · drag & throw things', '🍎 gravité activée · attrape et lance les éléments'),
            t('↺ tidy up', '↺ tout remettre en ordre'), () => { if (!stopped) cleanup(true); });
        raf = requestAnimationFrame(frame);
    }

    /* =====================================================================
       4. Run — tiny runner game, aim for 42.195 km
       ===================================================================== */
    function run(onClose) {
        if (current && current.name === 'run') return;
        const ov = document.createElement('div');
        ov.className = 'egg-game';
        ov.innerHTML = '<div class="egg-game-panel" role="dialog" aria-modal="true" tabindex="-1">' +
            '<div class="egg-game-head"><span>🏃 Run · ' + t('goal', 'objectif') + ' 42,195 km</span>' +
            '<button type="button" class="egg-game-x" aria-label="' + t('Close', 'Fermer') + '">✕</button></div>' +
            '<canvas></canvas>' +
            '<p class="egg-game-hint">' + t('Space, ↑ or tap to jump · Esc to quit', 'Espace, ↑ ou tap pour sauter · Échap pour quitter') + '</p></div>';
        document.body.appendChild(ov);
        lock(true);
        const panel = ov.querySelector('.egg-game-panel');
        const cv = ov.querySelector('canvas');
        const g = cv.getContext('2d');
        const C = { text: css('--text') || '#ededea', dim: css('--text-3') || '#6f6f69', line: css('--line-2') || '#3a3a36', accent: css('--accent') || '#ff7a3d', ok: css('--ok') || '#6fcf8f', bg: css('--bg-2') || '#141413' };
        let W = 0, H = 0;
        const size = () => {
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            W = Math.min(920, innerWidth - 40); H = Math.round(Math.max(220, Math.min(300, W * 0.32)));
            cv.style.width = W + 'px'; cv.style.height = H + 'px';
            cv.width = W * dpr; cv.height = H * dpr;
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        size();
        window.addEventListener('resize', size);

        let best = 0;
        try { best = parseFloat(localStorage.getItem('portfolio-run-best')) || 0; } catch (e) { /* storage unavailable */ }
        const km = m => (m / 1000).toFixed(1).replace('.', isFr() ? ',' : '.');
        const GOAL = 42195;
        const S = { state: 'ready', dist: 0, speed: 380, time: 0, y: 0, vy: 0, obs: [], nextObs: 1.2, phase: 0, halfShown: false, toast: '', toastT: 0, sky: [] };
        for (let i = 0; i < 26; i++) S.sky.push({ x: rand(0, 2000), w: rand(26, 70), h: rand(20, 90) });

        const reset = () => {
            Object.assign(S, { state: 'run', dist: 0, speed: 380, time: 0, y: 0, vy: 0, obs: [], nextObs: 1.1, halfShown: false, toast: '', toastT: 0 });
        };
        const jump = () => {
            if (S.state === 'ready' || S.state === 'dead' || S.state === 'won') { reset(); return; }
            if (S.y === 0) S.vy = 760;
        };
        const onKey = e => {
            if (e.key === 'Escape') { close(); return; }
            if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'Enter') { e.preventDefault(); jump(); }
        };
        document.addEventListener('keydown', onKey);
        cv.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
        ov.querySelector('.egg-game-x').addEventListener('click', () => close());
        ov.addEventListener('pointerdown', e => { if (e.target === ov) close(); });
        panel.focus({ preventScroll: true });

        const groundY = () => H - 42;
        const fmtTime = s => { const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + String(r).padStart(2, '0'); };

        function drawRunner(x, baseY, air) {
            const s = H / 260;
            const hip = { x, y: baseY - 38 * s };
            const ph = S.phase;
            g.strokeStyle = C.text; g.lineWidth = 3.2 * s; g.lineCap = 'round'; g.lineJoin = 'round';
            const leg = (a) => {
                const knee = { x: hip.x + Math.sin(a) * 12 * s, y: hip.y + 17 * s };
                const foot = { x: knee.x + Math.sin(a - 0.9) * 12 * s, y: knee.y + 18 * s - Math.max(0, Math.sin(a)) * 6 * s };
                g.beginPath(); g.moveTo(hip.x, hip.y); g.lineTo(knee.x, knee.y); g.lineTo(foot.x, foot.y); g.stroke();
            };
            if (air) { leg(0.9); leg(-0.3); } else { leg(Math.sin(ph) * 1.1); leg(Math.sin(ph + Math.PI) * 1.1); }
            const neck = { x: hip.x + 5 * s, y: hip.y - 26 * s };
            g.beginPath(); g.moveTo(hip.x, hip.y); g.lineTo(neck.x, neck.y); g.stroke();
            const arm = (a) => {
                const el = { x: neck.x + Math.sin(a) * 10 * s, y: neck.y + 12 * s };
                g.beginPath(); g.moveTo(neck.x, neck.y + 3 * s); g.lineTo(el.x, el.y); g.lineTo(el.x + 8 * s, el.y - 4 * s); g.stroke();
            };
            const sw = air ? 0.8 : Math.sin(ph) * 1.1;
            arm(-sw); arm(sw);
            g.fillStyle = C.text;
            g.beginPath(); g.arc(neck.x + 3 * s, neck.y - 9 * s, 7 * s, 0, 6.283); g.fill();
            g.strokeStyle = C.accent; g.lineWidth = 2.6 * s;
            g.beginPath(); g.moveTo(neck.x - 4 * s, neck.y - 12 * s); g.lineTo(neck.x + 10 * s, neck.y - 12 * s); g.stroke();
            g.beginPath(); g.moveTo(neck.x - 4 * s, neck.y - 12 * s); g.lineTo(neck.x - 12 * s, neck.y - 8 * s); g.stroke();
        }

        function drawObstacle(o, gy) {
            if (o.kind === 'bug') {
                g.font = `${o.h}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
                g.textBaseline = 'bottom'; g.textAlign = 'left';
                g.fillText('🐛', o.x - 2, gy + 4);
            } else {
                g.fillStyle = C.accent;
                g.beginPath(); g.moveTo(o.x, gy); g.lineTo(o.x + o.w / 2, gy - o.h); g.lineTo(o.x + o.w, gy); g.closePath(); g.fill();
                g.fillStyle = '#fff';
                g.fillRect(o.x + o.w * 0.28, gy - o.h * 0.55, o.w * 0.44, o.h * 0.12);
                g.fillStyle = C.accent;
                g.fillRect(o.x - 3, gy - 4, o.w + 6, 4);
            }
        }

        let raf = 0, last = performance.now(), closed = false;
        function frame(now) {
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;
            const gy = groundY(), s = H / 260;

            if (S.state === 'run') {
                S.time += dt;
                S.speed = Math.min(900, 380 + S.time * 9);
                S.dist += S.speed * dt * 0.62;          // ~70 s of play for a full marathon
                S.phase += S.speed * dt * 0.035;
                S.vy -= 2300 * dt; S.y = Math.max(0, S.y + S.vy * dt); if (S.y === 0) S.vy = 0;
                S.nextObs -= dt;
                if (S.nextObs <= 0) {
                    const kind = Math.random() < 0.5 ? 'bug' : 'cone';
                    const h = (kind === 'bug' ? 30 : rand(30, 42)) * s, w = (kind === 'bug' ? 32 : 24) * s;
                    S.obs.push({ kind, x: W + 20, w, h });
                    if (kind === 'cone' && Math.random() < 0.25) S.obs.push({ kind, x: W + 20 + w + 4, w, h });
                    S.nextObs = rand(0.85, 1.7) * (520 / S.speed) + 0.35;
                }
                for (const o of S.obs) o.x -= S.speed * dt;
                S.obs = S.obs.filter(o => o.x > -80);
                const rx = 70 * s, ry = gy - S.y;
                for (const o of S.obs) {
                    if (rx + 9 * s > o.x + 5 * s && rx - 9 * s < o.x + o.w - 5 * s && ry > gy - o.h + 6 * s) {
                        S.state = 'dead';
                        if (S.dist > best) { best = S.dist; try { localStorage.setItem('portfolio-run-best', String(best)); } catch (e) { /* ignore */ } }
                    }
                }
                if (!S.halfShown && S.dist >= 21097) { S.halfShown = true; S.toast = t('🎉 half marathon!', '🎉 semi-marathon !'); S.toastT = 2; }
                if (S.dist >= GOAL) {
                    S.dist = GOAL; S.state = 'won';
                    best = GOAL; try { localStorage.setItem('portfolio-run-best', String(best)); } catch (e) { /* ignore */ }
                }
            }
            if (S.toastT > 0) S.toastT -= dt;

            // ---- draw ----
            g.clearRect(0, 0, W, H);
            g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
            const scroll = S.dist / 0.62;
            g.fillStyle = C.line;
            for (const b of S.sky) {
                const x = ((b.x - scroll * 0.15) % 2000 + 2000) % 2000 - 100;
                if (x < -100 || x > W + 100) continue;
                g.globalAlpha = 0.45;
                g.fillRect(x, gy - b.h * s, b.w * s, b.h * s);
            }
            g.globalAlpha = 1;
            g.strokeStyle = C.dim; g.lineWidth = 1.5;
            g.beginPath(); g.moveTo(0, gy + 0.5); g.lineTo(W, gy + 0.5); g.stroke();
            g.fillStyle = C.dim;
            for (let x = -((scroll * 1) % 40); x < W; x += 40) g.fillRect(x, gy + 10, 14, 2);
            // kilometre signs every 5 km
            const nextSign = Math.ceil((S.dist + 1) / 5000) * 5000;
            for (const m of [nextSign - 5000, nextSign]) {
                if (m <= 0 || m > GOAL) continue;
                const sx = 70 * s + (m - S.dist) / 0.62;
                if (sx < -40 || sx > W + 40) continue;
                g.fillStyle = C.dim; g.fillRect(sx, gy - 46 * s, 2, 46 * s);
                g.fillStyle = C.accent; g.fillRect(sx + 2, gy - 46 * s, 34 * s, 16 * s);
                g.fillStyle = '#000'; g.font = `600 ${10 * s}px ui-monospace, monospace`; g.textBaseline = 'middle'; g.textAlign = 'center';
                g.fillText((m / 1000) + ' km', sx + 2 + 17 * s, gy - 38 * s);
            }
            for (const o of S.obs) drawObstacle(o, gy);
            drawRunner(70 * s, gy - S.y, S.y > 0);

            g.textBaseline = 'top'; g.textAlign = 'left';
            g.fillStyle = C.text; g.font = `600 ${18 * s}px ui-monospace, monospace`;
            g.fillText(km(S.dist) + ' km', 16, 14);
            g.fillStyle = C.dim; g.font = `${12 * s}px ui-monospace, monospace`;
            g.textAlign = 'right';
            g.fillText(t('best ', 'record ') + km(best) + ' km', W - 16, 16);
            const pw = W - 32, pct = S.dist / GOAL;
            g.fillStyle = C.line; g.fillRect(16, 42 * s, pw, 3);
            g.fillStyle = C.accent; g.fillRect(16, 42 * s, pw * pct, 3);

            g.textAlign = 'center'; g.textBaseline = 'middle';
            if (S.toastT > 0) { g.fillStyle = C.ok; g.font = `600 ${16 * s}px ui-monospace, monospace`; g.fillText(S.toast, W / 2, H * 0.32); }
            const center = (title, sub, col) => {
                g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H);
                g.fillStyle = col; g.font = `600 ${26 * s}px ui-sans-serif, system-ui, sans-serif`; g.fillText(title, W / 2, H * 0.4);
                g.fillStyle = '#eee'; g.font = `${13 * s}px ui-monospace, monospace`; g.fillText(sub, W / 2, H * 0.58);
            };
            if (S.state === 'ready') center(t('Ready? 42.195 km to go', 'Prêt ? 42,195 km à courir'), t('press Space or tap to start', 'Espace ou tap pour partir'), C.text);
            if (S.state === 'dead') center('DNF · ' + km(S.dist) + ' km', t('tripped on a bug 🐛 · Space to retry', 'trébuché sur un bug 🐛 · Espace pour réessayer'), C.accent);
            if (S.state === 'won') center('🏅 FINISHER · 42,195 km', t('in ', 'en ') + fmtTime(S.time) + t(' — Kipchoge needs 2:01:09 😉', ' — Kipchoge met 2:01:09 😉'), C.ok);

            if (!closed) raf = requestAnimationFrame(frame);
        }

        const close = () => {
            if (closed) return;
            closed = true;
            cancelAnimationFrame(raf);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', size);
            ov.classList.add('out');
            setTimeout(() => ov.remove(), 250);
            lock(false);
            release('run');
            if (onClose) onClose(S.state === 'won' ? GOAL : S.dist);
        };
        claim('run', close);
        raf = requestAnimationFrame(frame);
    }

    window.siteEggs = {
        dropTable, winter, gravity, run,
        get active() { return current ? current.name : null; },
        stopAll() { if (current) current.stop(); },
        reduce,
    };
})();
