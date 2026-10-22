/* Mathis Pernias - Portfolio interactions */
(function () {
    'use strict';

    /* ---------- Scroll progress + nav ---------- */
    const progress = document.getElementById('progress');
    const links = document.querySelectorAll('.nav-menu a');
    const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    function onScroll() {
        const h = document.documentElement;
        progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
        let current = sections[0];
        sections.forEach(s => { if (s.getBoundingClientRect().top < 140) current = s; });
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    links.forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

    /* ---------- Reveal on scroll ---------- */
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            e.target.querySelectorAll('.bar').forEach(b => { b.style.height = b.dataset.h; });
            e.target.querySelectorAll('[data-count]').forEach(countUp);
            io.unobserve(e.target);
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* ---------- Counters ---------- */
    function countUp(el) {
        if (el.dataset.done) return;
        el.dataset.done = '1';
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const t0 = performance.now();
        const dur = 1600;
        (function tick(t) {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        })(t0);
    }

    /* ---------- Typing effect ---------- */
    const phrases = [
        'reliable data pipelines',
        'cloud security',
        'data quality and testing',
        'privacy and compliance',
        'applied AI'
    ];
    const typed = document.getElementById('typed');
    let pi = 0, ci = 0, del = false;
    (function type() {
        const word = phrases[pi];
        typed.textContent = word.slice(0, ci);
        if (!del && ci === word.length) { del = true; return setTimeout(type, 1500); }
        if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
        ci += del ? -1 : 1;
        setTimeout(type, del ? 35 : 70);
    })();

    /* ---------- Hero network canvas ---------- */
    const canvas = document.getElementById('network');
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [];
    const mouse = { x: -999, y: -999 };

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
        const n = Math.min(90, Math.floor((W * H) / 14000));
        nodes = Array.from({ length: n }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.8 + 0.8
        }));
    }
    window.addEventListener('resize', resize);
    canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    resize();

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            a.x += a.vx; a.y += a.vy;
            if (a.x < 0 || a.x > W) a.vx *= -1;
            if (a.y < 0 || a.y > H) a.vy *= -1;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(165, 180, 252, 0.9)';
            ctx.fill();
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 130) {
                    ctx.strokeStyle = 'rgba(99, 102, 241,' + (0.35 * (1 - d / 130)) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
            const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            if (dm < 170) {
                ctx.strokeStyle = 'rgba(34, 211, 238,' + (0.7 * (1 - dm / 170)) + ')';
                ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
            }
        }
        requestAnimationFrame(draw);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) draw();
})();
