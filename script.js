/* Mathis Pernias — portfolio */
(function () {
    'use strict';

    /* ---------- Top bar: border on scroll, active link, mobile menu ---------- */
    const topbar = document.querySelector('.topbar');
    const nav = document.getElementById('nav');
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = [...nav.querySelectorAll('a')];
    const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    function onScroll() {
        topbar.classList.toggle('scrolled', window.scrollY > 8);
        let current = null;
        sections.forEach(s => { if (s.getBoundingClientRect().top < 120) current = s; });
        navLinks.forEach(a => a.classList.toggle('active', !!current && a.getAttribute('href') === '#' + current.id));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
        nav.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
    }
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));

    /* ---------- Reveal on scroll ---------- */
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    }


    /* ---------- Polish: scroll progress, cursor halo, count-up, data-journey orb ---------- */
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const bar = document.querySelector('.scroll-progress');
    if (bar) {
        let queued = false;
        const paint = () => {
            queued = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
        };
        window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paint); } }, { passive: true });
        window.addEventListener('resize', paint);
        paint();
    }

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('.case, .project, .featured, .eucor, .pr').forEach(el => {
            el.classList.add('halo');
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                el.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    const counters = [...document.querySelectorAll('.metrics dt')].map(el => {
        const m = el.textContent.trim().match(/^([−-]?)(\d+)(.*)$/);
        return m && { el, sign: m[1], to: +m[2], suffix: m[3] };
    }).filter(Boolean);
    if (counters.length && !reduce && 'IntersectionObserver' in window) {
        const ease = x => 1 - Math.pow(1 - x, 3);
        const run = (c, delay) => {
            const from = c.to === 0 ? 9 : 0, dur = 1100;
            c.el.textContent = (from ? '' : c.sign) + from + c.suffix;
            setTimeout(() => {
                const t0 = performance.now();
                const step = now => {
                    const p = Math.min(1, (now - t0) / dur);
                    const v = Math.round(from + (c.to - from) * ease(p));
                    c.el.textContent = (v ? c.sign : '') + v + c.suffix;
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }, delay);
        };
        const cio = new IntersectionObserver(entries => {
            if (entries.some(e => e.isIntersecting)) {
                counters.forEach((c, i) => run(c, i * 130));
                cio.disconnect();
            }
        }, { threshold: 0.4 });
        cio.observe(counters[0].el.closest('.metrics'));
    }

    const journey = document.querySelector('.journey');
    if (journey && !reduce && 'IntersectionObserver' in window) {
        const stages = [...journey.querySelectorAll('.stage')];
        const orb = document.createElement('span');
        const fill = document.createElement('span');
        orb.className = 'journey-orb'; fill.className = 'journey-fill';
        orb.setAttribute('aria-hidden', 'true'); fill.setAttribute('aria-hidden', 'true');
        journey.append(fill, orb);
        let visible = false, running = false;

        const geometry = () => {
            const jr = journey.getBoundingClientRect();
            const pts = stages.map(st => {
                const r = st.querySelector('.stage-dot').getBoundingClientRect();
                return { x: r.left + r.width / 2 - jr.left, y: r.top + r.height / 2 - jr.top };
            });
            const vertical = Math.abs(pts[pts.length - 1].x - pts[0].x) < 4;
            return { pts, vertical };
        };
        const ease = x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

        const cycle = () => {
            if (!visible) { running = false; return; }
            running = true;
            const { pts, vertical } = geometry();
            const a = pts[0], b = pts[pts.length - 1];
            const lit = new Set();
            const dur = 4200, t0 = performance.now();
            orb.classList.add('on');
            const frame = now => {
                const p = Math.min(1, (now - t0) / dur), e = ease(p);
                const x = a.x + (b.x - a.x) * e, y = a.y + (b.y - a.y) * e;
                orb.style.transform = 'translate(' + x + 'px,' + y + 'px)';
                if (vertical) Object.assign(fill.style, { left: (a.x - 1) + 'px', top: a.y + 'px', width: '2px', height: (y - a.y) + 'px' });
                else Object.assign(fill.style, { left: a.x + 'px', top: (a.y - 1) + 'px', width: (x - a.x) + 'px', height: '2px' });
                fill.style.opacity = '1';
                pts.forEach((pt, i) => {
                    const reached = vertical ? y >= pt.y - 2 : x >= pt.x - 2;
                    if (reached && !lit.has(i)) {
                        lit.add(i);
                        stages[i].classList.add('lit');
                        setTimeout(() => stages[i].classList.remove('lit'), i === pts.length - 1 ? 1600 : 1100);
                    }
                });
                if (p < 1) requestAnimationFrame(frame);
                else {
                    orb.classList.remove('on');
                    fill.style.opacity = '0';
                    setTimeout(cycle, 1500);
                }
            };
            requestAnimationFrame(frame);
        };
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (visible && !running) setTimeout(cycle, 400);
        }, { threshold: 0.35 }).observe(journey);
    }

    /* ---------- i18n ----------
       English lives in the HTML. French overrides below, keyed by data-i18n. */
    const fr = {
        navWork: 'Réalisations', navProjects: 'Projets', navStack: 'Stack', navExperience: 'Parcours', navContact: 'Contact', navSport: 'Sport',

        heroStatus: 'Analyste de données chez iA Groupe financier · Montréal, QC',
        heroTitle: 'Des données <span class="nw"><em>fiables</em>,</span> pour décider en&nbsp;confiance.',
        heroLead: 'Je suis Mathis, analyste de données chez iA Groupe financier. Derrière chaque tableau de bord et chaque modèle, il y a un flux de données : je construis ces flux, je protège les informations personnelles qu’ils contiennent et je les teste pour que les chiffres sur lesquels on s’appuie soient justes.',
        termStatus: 'disponible', cmdProjects: 'projets', termInputLabel: 'Tape une commande, par exemple help',
        heroCta: 'Voir les réalisations',

        m1: 'de coût VM sur notre runtime d’intégration auto-hébergé, après une étude de capacité',
        m2: 'identifiant en clair restant dans la configuration des pipelines',
        m3: 'expériences en données entre la France, le Danemark et le Canada',
        m4: 'diplômes : maîtrise Polytechnique Montréal, ingénieur Télécom Physique Strasbourg',

        fKicker: 'Projet vedette · à essayer',
        fTitle: 'Où finiriez-<em>vous</em> au Marathon de Berlin&nbsp;?',
        fHook: 'Entrez votre temps et découvrez votre classement parmi 780 000 coureurs.',
        fText: 'Un dashboard interactif construit sur 25 ans de résultats du Marathon de Berlin : records du monde, chaque édition à la loupe, la météo du jour de course, et qui court en tête.',
        fCta: 'Essayer le dashboard ↗',
        fCode: 'Code source',

        jTitle: 'Le <em>parcours</em> d’une donnée',
        jLead: 'Quatre étapes entre un système source et une décision. Mon rôle : rendre chacune fiable. Chaque étape renvoie à un projet concret plus bas.',
        jCollect: 'Collecter', jCollectText: 'Extraire les données des applications, API et fichiers, selon un calendrier, sans surcharger personne.', jCollectLink: 'cas C : dimensionner l’ingestion →',
        jProtect: 'Protéger', jProtectText: 'Les secrets restent dans un coffre ; les données personnelles sont masquées avant de quitter la production.', jProtectLink: 'cas A et B : secrets, données personnelles →',
        jVerify: 'Vérifier', jVerifyText: 'Tests automatisés et contrats de données détectent les erreurs avant les utilisateurs.', jVerifyLink: 'datacontract-cli →',
        jDeliver: 'Valoriser', jDeliverText: 'Des modèles propres et documentés qui alimentent tableaux de bord, rapports et ML.', jDeliverLink: 'cas D : docs-as-code →',

        workTitle: '<em>Réalisations</em>',
        workLead: 'Quatre projets issus de mon travail chez iA Groupe financier : contexte, approche, résultat.',
        lblProblem: 'Problème', lblApproach: 'Approche', lblOutcome: 'Résultat',
        before: 'avant', after: 'après',

        c1Tag: 'Sécurité · Azure Data Factory',
        c1Plain: 'Plus aucun mot de passe en clair dans nos flux de données',
        c1Title: 'Migrer les identifiants des pipelines vers Azure Key Vault',
        c1P: 'Les pipelines ADF appelaient l’API de la plateforme de centre de contact avec des identifiants OAuth2 stockés directement dans les linked services, lisibles par toute personne ayant accès à la factory.',
        c1A: 'Migration de chaque identifiant vers Azure Key Vault. Les linked services référencent désormais des secrets résolus à l’exécution via l’identité de la factory : plus rien de sensible dans les définitions de pipelines ni dans le dépôt.',
        c1O: 'Aucun secret exposé, aucune interruption pendant la migration, et une configuration conforme aux standards de sécurité de l’entreprise.',
        edgePlain: 'en clair', edgeRuntime: 'secret à l’exécution',

        c2Tag: 'Confidentialité · Snowflake',
        c2Plain: 'Tester sur des données réalistes sans exposer un seul client',
        c2Title: 'Masquage des données personnelles piloté par configuration',
        c2P: 'Les développeurs ont besoin de données proches de la production pour tester, mais les conversations du centre de contact sont du JSON imbriqué rempli de noms, courriels et numéros de téléphone. Les copier en environnement de test exposait des données personnelles.',
        c2A: 'Conception d’un outil d’anonymisation configurable qui parcourt le JSON imbriqué et remplace les champs personnels. Les champs sensibles sont déclarés sous forme de règles, pas codés en dur : une nouvelle source demande de la configuration, pas du nouveau code.',
        c2O: 'Les équipes testent sur des données réalistes tout en protégeant la vie privée des clients.',
        c2Cap: 'Exemple illustratif, données fictives.',

        c3Tag: 'FinOps · Azure',
        c3Plain: 'Même service, 30&nbsp;% moins cher : le serveur n’était pas en cause',
        c3Title: 'Redimensionner la VM du runtime d’intégration : −30 % de coût',
        c3P: 'La VM hébergeant notre runtime d’intégration auto-hébergé (SHIR) avait 4 processeurs et 14 Go de mémoire. Les pipelines subissaient de la latence : fallait-il monter en gamme, ou le goulot d’étranglement était-il ailleurs ?',
        c3A: 'Analyse de la mémoire, du CPU, des files d’attente API, de la concurrence et des réponses HTTP 429. La VM était loin de la saturation ; la latence venait de la concurrence des requêtes et du rate limiting de l’API. Ajustement de la concurrence ADF et validation progressive de DEV à PROD.',
        c3O: 'Passage à une machine deux fois plus petite (4 → 2 processeurs, 14 → 8 Go de mémoire) : environ 30&nbsp;% de coût en moins, pour le même niveau de service.',
        specBefore: 'machine d’origine', specAfter: 'deux fois plus petite',
        obsMem: 'mémoire utilisée', obsCpu: 'CPU, habituel', obsPeak: 'CPU, pic', obsCalls: 'fenêtre critique', obsCallsVal: '~1 600 appels / 5 min',
        obsCause: 'cause', obsCauseVal: 'concurrence + HTTP 429',
        c3Cap: 'Coût VM/SHIR relatif sur le périmètre étudié. Déploiement : DEV → acceptation → PROD.',

        c4Tag: 'DevOps · Docs-as-code',
        c4Plain: 'Une documentation qui se met à jour avec le code',
        c4Title: 'Un pipeline docs-as-code qui publie sur SharePoint',
        c4P: 'La documentation des tables était dispersée, rapidement obsolète, et plus personne ne lui faisait confiance.',
        c4A: 'Documentation déplacée en Markdown à côté des définitions de données, revue en pull request comme tout autre changement. Au merge, un pipeline Azure la publie sur le SharePoint de l’entreprise.',
        c4O: 'Une source de vérité unique, synchronisée avec le code. Preuve de concept aujourd’hui, prête à être étendue à d’autres équipes.',

        projTitle: 'Autres <em>projets</em>',
        projLead: 'Stages, open source et recherche.',
        research: 'Recherche', personal: 'Personnel',
        p1Title: 'Chatbot RAG sur des données de couverture des médicaments',
        p1Text: 'Assistant interne qui répond aux questions sur les données publiques de couverture des médicaments grâce au RAG (retrieval-augmented generation) : des réponses en quelques secondes plutôt qu’en fouillant les tables.',
        p2Text: 'Contribution à <code>datacontract-cli</code>, un CLI open source pour définir, valider et tester les contrats de données entre producteurs et consommateurs.',
        dgQs: 'en mots simples', dgRet: 'Recherche', dgRets: 'passages pertinents',
        dgLLMs: 'avec le contexte', dgAns: 'Réponse', dgAnss: 'avec sources',
        dgDocs: 'données de couverture · Snowflake',
        p3Title: 'Séries temporelles synthétiques avec des GAN',
        p3Text: 'Entraînement d’un réseau antagoniste génératif pour produire des séries temporelles synthétiques réalistes, puis évaluation de la qualité des échantillons et de la stabilité de l’entraînement.',
        p4Note: 'Hébergement gratuit : la première visite peut prendre environ une minute, le temps de réveiller le serveur.',

        gNoise: 'bruit z', gGen: 'Générateur', gFake: 'synthétique', gReal: 'réelle',
        gDisc: 'Discriminateur', gVerdict: 'vrai ou faux ?', gLoop: 'rétroaction · perte adverse',

        stackTitle: '<em>Stack</em>',
        stackLead: 'Ce que j’utilise au quotidien, regroupé par usage.',
        s1: 'Ingestion et orchestration', s2: 'Entrepôt et modélisation', s3: 'Infrastructure et DevOps',
        s4: 'Qualité et gouvernance', s5: 'Sécurité et confidentialité', s6: 'Langages et analytique',

        expTitle: '<em>Parcours</em>',
        d1: 'Août 2026 — auj.', d2: 'Mai — août 2026', d3: 'Mai — août 2025', d4: 'Mai — août 2024', d5: 'Juin 2023',
        r1: 'Analyste de données',
        r1Text: 'Plateformes de données clients et de centre de contact. Pipelines sécurisés et fiables, qualité des données.',
        r1a: 'Migration des identifiants API vers Azure Key Vault.',
        r1b: 'Anonymisation configurable des données sensibles pour les environnements de test.',
        r1c: 'Fiabilisation des pipelines, des correspondances de campagnes marketing et de la gestion des doublons.',
        r1d: 'Analyse de capacité serveur et API à l’origine d’une réduction de 30 % des coûts d’infrastructure.',
        r2: 'Stagiaire analyste de données (fin d’études)',
        r2Text: 'Azure Data Factory, Snowflake et Azure Key Vault. Améliorations de la sécurité, de la conformité des données de test et de la qualité des données.',
        r3: 'Stagiaire ingénierie des données et IA',
        r3a: 'Conception et validation de pipelines pour des usages analytiques et IA.',
        r3b: 'Développement d’un chatbot RAG sur des données pharmaceutiques.',
        r3c: 'Automatisation des tests et intégration dans les workflows Git/CI.',
        r3d: 'Tableaux de bord Power BI pour le suivi des KPI et des taux d’erreur.',
        r4: 'Stagiaire de recherche, science des données',
        r4Text: 'Modèles prédictifs sur des données épidémiques simulées : apprentissage supervisé par arbres de décision en Python et Julia.',
        denmark: 'Danemark',
        r5: 'Stagiaire ingénierie systèmes',
        r5Text: 'Automatisation du calcul de répartition de charge pour des traitements multithreadés ; diagnostic de performance sur architectures multicœurs (C, Bash, Python).',
        eduTitle: 'Formation',
        e1: 'Maîtrise en génie informatique',
        e1Text: 'Maîtrise professionnelle, orientation ingénierie et analytique des données.',
        e2: 'Diplôme d’ingénieur, science des données et IA',

        contactTitle: 'Parlons <span class="nw"><em>données</em>.</span>',
        sportTitle: 'Hors du bureau : l’<em>endurance</em>',
        sportLead: 'La course et le vélo, c’est ma façon de recharger les batteries, et sans doute l’origine de ma manie de tout mesurer.',
        pr10: 'Classique Parc La Fontaine · 14ᵉ',
        prHalf: 'Semi-marathon',
        prHalfRace: 'Semi-marathon de Lachine',
        prTrail: 'Chute du Diable · 1&nbsp;609 m D+ · 14ᵉ au général',
        eucorTag: 'Vélo · Rhin supérieur · 2023',
        eucorTitle: 'Tour EUCOR : cinq jours, cinq universités, à vélo',
        eucorText: 'Un périple reliant les universités du réseau EUCOR entre la France, l’Allemagne et la Suisse : Karlsruhe, Strasbourg, Mulhouse, Bâle et Fribourg, à plus de 100 km par jour.',
        eucorKm: 'parcourus',
        eucorDplus: 'de dénivelé positif',
        eucorDaysVal: '5 jours',
        eucorDays: '3 pays',
        stravaCta: 'Me suivre sur Strava ↗',
        eucorCap: 'Tracé dessiné à partir de mes traces GPS Strava.',
        trailAlt: 'Lac à Saint-Alexis-des-Monts, au Québec, au départ du trail Chute du Diable 50 km',
        trailCap: 'le lac au départ · 2026',
        eucorAlt: 'Vallée verdoyante du Jura avec un vélo de route dans l’herbe, pendant le Tour EUCOR',
        eucorPhotoCap: 'jour 3, le Jura entre Mulhouse et Bâle · 2023',
        galleryTitle: 'Photos',
        finishAlt: 'Accolade avec un ami sur la ligne d’arrivée du trail Chute du Diable 50 km',
        finishCap: 'sur la ligne d’arrivée · 2026 · photo : La Chute du Diable',
        cityBasel: 'Bâle', cityFreiburg: 'Fribourg',
        contactText: 'Toujours partant pour échanger sur l’ingénierie des données, les plateformes data ou l’IA appliquée. Le courriel est le moyen le plus rapide de me joindre.'
    };

    const meta = {
        en: { title: 'Mathis Pernias — Data Engineering' },
        fr: { title: 'Mathis Pernias — Ingénierie des données' }
    };

    const textNodes = [...document.querySelectorAll('[data-i18n]')];
    const altNodes = [...document.querySelectorAll('[data-i18n-alt]')];
    const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
    const enAria = new Map(ariaNodes.map(el => [el, el.getAttribute('aria-label')]));
    const enText = new Map(textNodes.map(el => [el, el.innerHTML]));
    const enAlt = new Map(altNodes.map(el => [el, el.alt]));
    const langButtons = [...document.querySelectorAll('.lang button')];

    function setLanguage(lang) {
        if (lang !== 'fr') lang = 'en';
        document.documentElement.lang = lang;
        document.title = meta[lang].title;
        textNodes.forEach(el => {
            const key = el.dataset.i18n;
            el.innerHTML = lang === 'fr' && fr[key] !== undefined ? fr[key] : enText.get(el);
        });
        altNodes.forEach(el => {
            const key = el.dataset.i18nAlt;
            el.alt = lang === 'fr' && fr[key] !== undefined ? fr[key] : enAlt.get(el);
        });
        ariaNodes.forEach(el => {
            const key = el.dataset.i18nAria;
            el.setAttribute('aria-label', lang === 'fr' && fr[key] !== undefined ? fr[key] : enAria.get(el));
        });
        langButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
        try { localStorage.setItem('portfolio-language', lang); } catch (e) { /* storage unavailable */ }
    }

    langButtons.forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));

    let saved = null;
    try { saved = localStorage.getItem('portfolio-language'); } catch (e) { /* storage unavailable */ }
    const browserFr = (navigator.language || '').toLowerCase().startsWith('fr');
    setLanguage(saved || (browserFr ? 'fr' : 'en'));
})();
