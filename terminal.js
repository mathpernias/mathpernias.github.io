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
            line('<span class="t-cm">' + t('# psst… there is a hidden one', '# psst… il y en a une cachée') + '</span>');
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
        banner.innerHTML = '<span>🔊 TECHNOOOO PARTYYY · 175 BPM</span><button type="button">■ stop</button>';
        banner.querySelector('button').addEventListener('click', () => commands.stop());
        document.body.append(lights, banner);

        const state = { lights, banner, ctx: null, timer: null };
        techno = state;
        if (!AC) return;

        const ctx = new AC();
        state.ctx = ctx;
        if (ctx.state === 'suspended') ctx.resume();
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.2);
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -14; comp.ratio.value = 6;
        master.connect(comp).connect(ctx.destination);

        const shaper = ctx.createWaveShaper();
        const curve = new Float32Array(1024);
        for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 6); }
        shaper.curve = curve;
        const kickBus = ctx.createGain(); kickBus.gain.value = 0.9;
        shaper.connect(kickBus).connect(master);

        const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const nd = noise.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

        function kick(time) {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.frequency.setValueAtTime(190, time);
            o.frequency.exponentialRampToValueAtTime(46, time + 0.11);
            g.gain.setValueAtTime(1, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.32);
            o.connect(g).connect(shaper);
            o.start(time); o.stop(time + 0.34);
        }
        function hat(time, open) {
            const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
            s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7500;
            g.gain.setValueAtTime(open ? 0.16 : 0.07, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.12 : 0.035));
            s.connect(f).connect(g).connect(master);
            s.start(time, Math.random() * 0.5); s.stop(time + 0.14);
        }
        function clap(time) {
            const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
            s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.9;
            g.gain.setValueAtTime(0.35, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
            s.connect(f).connect(g).connect(master);
            s.start(time, Math.random() * 0.5); s.stop(time + 0.18);
        }
        function acid(time, semi, cutoff) {
            const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(55 * Math.pow(2, semi / 12), time);
            f.type = 'lowpass'; f.Q.value = 14;
            f.frequency.setValueAtTime(cutoff * 4, time);
            f.frequency.exponentialRampToValueAtTime(cutoff, time + 0.1);
            g.gain.setValueAtTime(0.22, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
            o.connect(f).connect(g).connect(master);
            o.start(time); o.stop(time + 0.14);
        }

        const BPM = 175, step16 = 60 / BPM / 4;
        const bass = [null, 0, 12, 0, null, 0, 12, 3, null, 0, 12, 0, null, 7, 12, 5];
        const palette = ['#16002b', '#001a33', '#2b0019', '#002417', '#1f1400', '#001f2b'];
        let step = 0, next = ctx.currentTime + 0.15;

        function visualBeat(n) {
            if (reduceMotion) return;  // music only, no pulsing colours
            root.classList.remove('kick');
            void root.offsetWidth;
            root.classList.add('kick');
            if (n % 2 === 0) root.style.setProperty('--rave-bg', palette[(n / 2) % palette.length]);
        }

        function schedule() {
            while (next < ctx.currentTime + 0.12) {
                const s = step % 16, bar = Math.floor(step / 16);
                if (s % 4 === 0) {
                    kick(next);
                    const beatNo = step / 4;
                    setTimeout(() => techno && visualBeat(beatNo), Math.max(0, (next - ctx.currentTime) * 1000));
                }
                if (s % 4 === 2) hat(next, true); else if (s % 2 === 1) hat(next, false);
                if ((s === 4 || s === 12) && bar % 2 === 1) clap(next);
                if (bass[s] !== null) acid(next, bass[s] + (bar % 8 >= 6 ? 3 : 0), 260 + 900 * (0.5 + 0.5 * Math.sin(step / 40)));
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
