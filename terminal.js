/* Mathis Pernias — interactive hero terminal (typing intro, commands, techno easter egg) */
(function () {
    'use strict';

    const term = document.querySelector('.term');
    if (!term) return;
    const out = term.querySelector('.term-out');
    const form = term.querySelector('.term-input');
    const input = form.querySelector('input');
    const clock = term.querySelector('.term-clock');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const isFr = () => document.documentElement.lang === 'fr';
    const t = (en, fr) => (isFr() ? fr : en);
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const PROMPT = '<span class="t-prompt">$</span> ';

    /* ---------- Clock: Montréal local time ---------- */
    const fmt = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => { clock.textContent = fmt.format(new Date()).replace(' h ', ':'); };
    tick();
    setInterval(tick, 15000);

    /* ---------- Output helpers ---------- */
    function line(html, cls) {
        const div = document.createElement('div');
        div.className = 'term-line' + (cls ? ' ' + cls : '');
        div.innerHTML = html || '&nbsp;';
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
        return div;
    }

    async function typeInto(el, text, speed) {
        const cursor = document.createElement('span');
        cursor.className = 'term-cursor';
        el.appendChild(cursor);
        for (const ch of text) {
            cursor.insertAdjacentText('beforebegin', ch);
            out.scrollTop = out.scrollHeight;
            await wait(speed + Math.random() * speed * 0.8);
        }
        await wait(120);
        cursor.remove();
    }

    /* ---------- Intro: replay the static profile as if typed ---------- */
    const staticLines = out.innerHTML.trim().split('\n');
    let busy = true;

    async function intro() {
        out.innerHTML = '';
        for (const raw of staticLines) {
            if (raw.startsWith(PROMPT)) {
                const cmd = raw.slice(PROMPT.length);
                const el = line(PROMPT);
                await wait(260);
                await typeInto(el, cmd, 42);
                await wait(180);
            } else {
                line(raw);
                await wait(raw.trim() ? 55 : 30);
            }
        }
        hint();
        ready();
    }

    function hint() {
        line('<span class="t-cm">' + t('# type help, or click a command below', '# tape help, ou clique une commande ci-dessous') + '</span>');
    }

    function ready() {
        busy = false;
        form.hidden = false;
        out.setAttribute('aria-live', 'polite');
        out.scrollTop = out.scrollHeight;
    }

    if (reduceMotion) {
        out.innerHTML = staticLines.map(l => '<div class="term-line">' + (l || '&nbsp;') + '</div>').join('');
        hint();
        ready();
    } else {
        form.hidden = true;
        setTimeout(intro, 450);
    }

    /* ---------- Commands ---------- */
    function goTo(id, delay) {
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }, delay || 650);
    }

    const commands = {
        help() {
            line(t('available commands:', 'commandes disponibles :'), 't-key');
            [
                ['projects', t('featured & other projects', 'projets vedette et autres')],
                ['berlin', t('try the marathon dashboard', 'essayer le dashboard du marathon')],
                ['sport', t('race times, trail, bike tour', 'temps de course, trail, vélo')],
                ['contact', t('get in touch', 'me contacter')],
                ['whoami', t('who is this?', 'qui est-ce ?')],
                ['clear', t('clear the screen', 'effacer l’écran')],
            ].forEach(([c, d]) => line('  <span class="t-list">' + c.padEnd(9) + '</span><span class="t-key">' + d + '</span>'));
            line('<span class="t-cm">' + t('# psst… a few are hidden', '# psst… il y en a des cachées') + '</span>');
        },
        projects() {
            line(t('→ opening projects…', '→ ouverture des projets…'), 't-str');
            goTo('featured');
        },
        berlin() {
            line(t('→ 780,000 runners: where would you finish?', '→ 780 000 coureurs : où finiriez-vous ?'), 't-str');
            line('  <a class="t-link" href="https://berlinmarathondashboard.onrender.com/" target="_blank" rel="noopener noreferrer">berlinmarathondashboard.onrender.com ↗</a>');
            goTo('featured');
        },
        sport() {
            line(t('→ half marathon 1:24:19 · trail 50 km · 655 km by bike', '→ semi 1:24:19 · trail 50 km · 655 km à vélo'), 't-str');
            goTo('sport');
        },
        contact() {
            line('→ <a class="t-link" href="mailto:mathis.pernias@gmail.com">mathis.pernias@gmail.com</a>', 't-str');
            goTo('contact');
        },
        whoami() { line('mathis-pernias'); },
        clear() { out.innerHTML = ''; },
        techno() { startTechno(); },
        burn() {
            if (!window.siteBurn) return;
            if (window.siteBurn.active) { line(t('already on fire 🔥', 'ça brûle déjà 🔥'), 't-key'); return; }
            if (reduceMotion) { line(t('🔥 (animation off: reduced motion is on)', '🔥 (animation désactivée : mouvement réduit activé)'), 't-key'); return; }
            if (techno) stopTechno();
            line(t('🔥 igniting… press Esc to put it out', '🔥 mise à feu… Échap pour éteindre'), 't-err');
            const r = term.getBoundingClientRect();
            setTimeout(() => {
                window.siteBurn.start({ x: r.left + r.width / 2, y: r.top + r.height * 0.6 }, () => {
                    line(t('↻ site rebuilt. nothing was harmed, promise.', '↻ site reconstruit. rien n’a vraiment brûlé, promis.'), 't-cm');
                });
            }, 350);
        },
        stop() {
            if (techno) { stopTechno(); line(t('■ party over. back to work.', '■ fin de la fête. retour au boulot.'), 't-key'); }
            else line(t('nothing to stop.', 'rien à arrêter.'), 't-key');
        },
        ls() { line('<span class="t-list">projects/  berlin/  sport/  contact.txt  profile.yml</span>'); },
        sudo() { line(t('nice try 😏', 'bien essayé 😏'), 't-key'); },
    };
    const aliases = {
        aide: 'help', '?': 'help', projets: 'projects', projet: 'projects', project: 'projects',
        dashboard: 'berlin', marathon: 'berlin', email: 'contact', mail: 'contact',
        exit: 'stop', quit: 'stop', cls: 'clear', party: 'techno', rave: 'techno',
        fire: 'burn', feu: 'burn', brule: 'burn', 'brûle': 'burn', incendie: 'burn',
    };

    function run(raw) {
        const value = raw.trim();
        line(PROMPT + esc(value));
        if (!value) return;
        const word = value.toLowerCase().split(/\s+/)[0];
        const name = commands[word] ? word : aliases[word];
        if (name) commands[name]();
        else line('zsh: ' + t('command not found', 'commande introuvable') + ': ' + esc(word) +
                  ' <span class="t-cm">— ' + t('try help', 'essaie help') + '</span>', 't-err');
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (busy) return;
        const v = input.value;
        input.value = '';
        run(v);
    });

    term.querySelectorAll('[data-cmd]').forEach(btn => btn.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        const cmd = btn.textContent.trim();
        input.value = '';
        if (!reduceMotion) {
            for (const ch of cmd) { input.value += ch; await wait(45); }
            await wait(150);
        }
        input.value = '';
        busy = false;
        run(cmd);
    }));

    /* ---------- Techno easter egg: generated hardtek (Web Audio, no samples) ---------- */
    let techno = null;

    function startTechno() {
        if (techno) { line(t('already partying 😎', 'déjà en mode techno 😎'), 't-key'); return; }
        const AC = window.AudioContext || window.webkitAudioContext;
        line(t('🔊 TECHNO MODE: ON', '🔊 MODE TECHNO : ACTIVÉ'), 't-list');
        line('<span class="t-cm">' + t('# sound + lights · type stop or press Esc to end', '# son + lumières · tape stop ou Échap pour arrêter') + '</span>');

        const root = document.documentElement;
        root.classList.add('techno');
        const lights = document.createElement('div');
        lights.className = 'rave-lights';
        lights.setAttribute('aria-hidden', 'true');
        const banner = document.createElement('div');
        banner.className = 'rave-banner';
        banner.innerHTML = '<span>🔊 TECHNOOOO PARTYYY · 178 BPM</span><button type="button">■ stop</button>';
        banner.querySelector('button').addEventListener('click', () => commands.stop());
        document.body.append(lights, banner);

        const state = { lights, banner, ctx: null, timer: null };
        techno = state;
        if (!AC) return;

        const ctx = new AC();
        state.ctx = ctx;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, now);
        master.gain.linearRampToValueAtTime(0.62, now + 1.5);
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -20; comp.knee.value = 6; comp.ratio.value = 8;
        comp.attack.value = 0.003; comp.release.value = 0.12;
        master.connect(comp).connect(ctx.destination);

        function drive(amount) {
            const ws = ctx.createWaveShaper(), c = new Float32Array(2048);
            for (let i = 0; i < 2048; i++) { const x = i / 1024 - 1; c[i] = Math.tanh(x * amount); }
            ws.curve = c; ws.oversample = '2x';
            return ws;
        }

        // Kick: long distorted body + clean sub layer
        const kickDrive = drive(11);
        const kickTone = ctx.createBiquadFilter(); kickTone.type = 'lowpass'; kickTone.frequency.value = 2600;
        const kickBus = ctx.createGain(); kickBus.gain.value = 0.85;
        kickDrive.connect(kickTone).connect(kickBus).connect(master);

        // Rolling bass: detuned square + saw, overdriven, dark low-pass
        const bassDrive = drive(5);
        const bassLP = ctx.createBiquadFilter(); bassLP.type = 'lowpass'; bassLP.Q.value = 5;
        bassLP.frequency.value = 420;
        const bassBus = ctx.createGain(); bassBus.gain.value = 0.5;
        bassDrive.connect(bassLP).connect(bassBus).connect(master);

        const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const nd = noise.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

        // Dark drone pad: E1 + B1 + low G, slow filter sweep
        const padLP = ctx.createBiquadFilter(); padLP.type = 'lowpass'; padLP.frequency.value = 260; padLP.Q.value = 3;
        const padGain = ctx.createGain(); padGain.gain.value = 0.055;
        padLP.connect(padGain).connect(master);
        const lfo = ctx.createOscillator(), lfoAmt = ctx.createGain();
        lfo.frequency.value = 0.05; lfoAmt.gain.value = 170;
        lfo.connect(lfoAmt).connect(padLP.frequency); lfo.start();
        [[41.2, -7], [41.2, 6], [61.74, 0], [98.0, 4]].forEach(([f, cents]) => {
            const o = ctx.createOscillator(); o.type = 'sawtooth';
            o.frequency.value = f; o.detune.value = cents;
            o.connect(padLP); o.start();
        });

        const E1 = 41.2;
        const hz = semi => E1 * Math.pow(2, semi / 12);

        function kick(time) {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.frequency.setValueAtTime(230, time);
            o.frequency.exponentialRampToValueAtTime(50, time + 0.07);
            o.frequency.exponentialRampToValueAtTime(38, time + 0.4);
            g.gain.setValueAtTime(1.15, time);
            g.gain.setValueAtTime(1.15, time + 0.04);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.48);
            o.connect(g).connect(kickDrive);
            o.start(time); o.stop(time + 0.5);
            const sub = ctx.createOscillator(), sg = ctx.createGain();
            sub.frequency.setValueAtTime(55, time);
            sub.frequency.exponentialRampToValueAtTime(40, time + 0.3);
            sg.gain.setValueAtTime(0.75, time);
            sg.gain.exponentialRampToValueAtTime(0.001, time + 0.34);
            sub.connect(sg).connect(master);
            sub.start(time); sub.stop(time + 0.36);
        }
        function rollingBass(time, semi, open) {
            const f = hz(semi);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, time);
            g.gain.exponentialRampToValueAtTime(0.9, time + 0.008);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.075);
            g.connect(bassDrive);
            [['square', 0], ['sawtooth', 9], ['sawtooth', -9]].forEach(([type, det]) => {
                const o = ctx.createOscillator(); o.type = type;
                o.frequency.setValueAtTime(f * 2, time); o.detune.value = det;
                o.connect(g); o.start(time); o.stop(time + 0.08);
            });
            bassLP.frequency.cancelScheduledValues(time);
            bassLP.frequency.setValueAtTime(open, time);
            bassLP.frequency.exponentialRampToValueAtTime(180, time + 0.07);
            const sub = ctx.createOscillator(), sg = ctx.createGain();
            sub.frequency.setValueAtTime(f, time);
            sg.gain.setValueAtTime(0.32, time);
            sg.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
            sub.connect(sg).connect(master);
            sub.start(time); sub.stop(time + 0.08);
        }
        function hat(time, open) {
            const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
            s.buffer = noise; f.type = 'highpass'; f.frequency.value = 9000;
            g.gain.setValueAtTime(open ? 0.07 : 0.03, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.09 : 0.025));
            s.connect(f).connect(g).connect(master);
            s.start(time, Math.random() * 0.5); s.stop(time + 0.1);
        }
        function snare(time) {
            const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
            s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 0.7;
            g.gain.setValueAtTime(0.26, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
            s.connect(f).connect(g).connect(master);
            s.start(time, Math.random() * 0.5); s.stop(time + 0.24);
        }
        function acid(time, semi, cutoff) {
            const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(hz(semi + 24), time);
            f.type = 'lowpass'; f.Q.value = 18;
            f.frequency.setValueAtTime(cutoff * 3, time);
            f.frequency.exponentialRampToValueAtTime(cutoff, time + 0.09);
            g.gain.setValueAtTime(0.09, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
            o.connect(f).connect(g).connect(master);
            o.start(time); o.stop(time + 0.13);
        }

        const BPM = 178, step16 = 60 / BPM / 4;
        // E phrygian, rolling bass on the three 16ths between kicks (semitones from E1)
        const roll = [
            [0, 0, 0], [0, 0, 1], [0, 0, 0], [0, 3, 1],
            [0, 0, 0], [0, 0, 1], [0, 0, 0], [7, 6, 1],
        ];
        const acidLine = [null, 12, null, 13, 12, null, 15, null, 12, null, 13, null, 10, 12, null, 13];
        const palette = ['#14001f', '#00121f', '#1f0010', '#001a10', '#160b00', '#0b0019'];
        let step = 0, next = ctx.currentTime + 0.2;

        function visualBeat(n) {
            if (reduceMotion) return;  // music only, no pulsing colours
            root.classList.remove('kick');
            void root.offsetWidth;
            root.classList.add('kick');
            if (n % 2 === 0) root.style.setProperty('--rave-bg', palette[(n / 2) % palette.length]);
        }

        function schedule() {
            while (next < ctx.currentTime + 0.12) {
                const s = step % 16, bar = Math.floor(step / 16), phrase = bar % 16;
                const beat = Math.floor(s / 4);
                if (s % 4 === 0) {
                    kick(next);
                    const beatNo = step / 4;
                    setTimeout(() => techno && visualBeat(beatNo), Math.max(0, (next - ctx.currentTime) * 1000));
                } else {
                    const pattern = roll[(bar % 2) * 4 + beat];
                    const open = 380 + 520 * (0.5 + 0.5 * Math.sin(step / 64));
                    rollingBass(next, pattern[(s % 4) - 1], open);
                }
                if (s % 4 === 2) hat(next, true); else if (s % 2 === 1 && bar % 2 === 1) hat(next, false);
                if (s === 12 && bar % 4 === 3) snare(next);
                if (phrase >= 8 && acidLine[s] !== null) acid(next, acidLine[s], 220 + 380 * (0.5 + 0.5 * Math.sin(step / 24)));
                next += step16;
                step++;
            }
        }
        schedule();
        state.timer = setInterval(schedule, 25);
    }

    function stopTechno() {
        const s = techno;
        if (!s) return;
        techno = null;
        clearInterval(s.timer);
        if (s.ctx) s.ctx.close();
        s.lights.remove();
        s.banner.remove();
        const root = document.documentElement;
        root.classList.remove('techno', 'kick');
        root.style.removeProperty('--rave-bg');
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && techno) {
            stopTechno();
            line(t('■ party over. back to work.', '■ fin de la fête. retour au boulot.'), 't-key');
        }
    });
})();
