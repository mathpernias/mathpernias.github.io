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

    /* ---------- i18n ----------
       English lives in the HTML. French overrides below, keyed by data-i18n. */
    const fr = {
        navWork: 'Réalisations', navProjects: 'Projets', navStack: 'Stack', navExperience: 'Parcours', navContact: 'Contact',

        heroStatus: 'Analyste de données chez iA Groupe financier · Montréal, QC',
        heroTitle: 'Des pipelines de données sécurisés et testés, sur Azure&nbsp;et&nbsp;Snowflake.',
        heroLead: 'Je suis Mathis, analyste de données à profil ingénierie, sur les plateformes de données clients et de centre de contact. Je m’occupe de ce qui rend la donnée fiable : gestion des secrets, masquage des données personnelles, tests automatisés et infrastructure bien dimensionnée.',
        heroCta: 'Voir les réalisations',

        m1: 'de coût VM sur notre runtime d’intégration auto-hébergé, après une étude de capacité',
        m2: 'identifiant en clair restant dans la configuration des pipelines',
        m3: 'expériences en données entre la France, le Danemark et le Canada',
        m4: 'diplômes : maîtrise Polytechnique Montréal, ingénieur Télécom Physique Strasbourg',

        jTitle: 'Le parcours d’une donnée',
        jLead: 'Quatre étapes entre un système source et une décision. Mon rôle : rendre chacune fiable. Chaque étape renvoie à un projet concret plus bas.',
        jCollect: 'Collecter', jCollectText: 'Extraire les données des applications, API et fichiers, selon un calendrier, sans surcharger personne.', jCollectLink: 'cas C : dimensionner l’ingestion →',
        jProtect: 'Protéger', jProtectText: 'Les secrets restent dans un coffre ; les données personnelles sont masquées avant de quitter la production.', jProtectLink: 'cas A et B : secrets, données personnelles →',
        jVerify: 'Vérifier', jVerifyText: 'Tests automatisés et contrats de données détectent les erreurs avant les utilisateurs.', jVerifyLink: 'datacontract-cli →',
        jDeliver: 'Valoriser', jDeliverText: 'Des modèles propres et documentés qui alimentent tableaux de bord, rapports et ML.', jDeliverLink: 'cas D : docs-as-code →',

        workTitle: 'Réalisations',
        workLead: 'Quatre projets issus de mon travail chez iA Groupe financier : contexte, approche, résultat.',
        lblProblem: 'Problème', lblApproach: 'Approche', lblOutcome: 'Résultat',
        before: 'avant', after: 'après',

        c1Tag: 'Sécurité · Azure Data Factory',
        c1Title: 'Migrer les identifiants des pipelines vers Azure Key Vault',
        c1P: 'Les pipelines ADF appelaient l’API de la plateforme de centre de contact avec des identifiants OAuth2 stockés directement dans les linked services, lisibles par toute personne ayant accès à la factory.',
        c1A: 'Migration de chaque identifiant vers Azure Key Vault. Les linked services référencent désormais des secrets résolus à l’exécution via l’identité de la factory : plus rien de sensible dans les définitions de pipelines ni dans le dépôt.',
        c1O: 'Aucun secret exposé, aucune interruption pendant la migration, et une configuration conforme aux standards de sécurité de l’entreprise.',
        edgePlain: 'en clair', edgeRuntime: 'secret à l’exécution',

        c2Tag: 'Confidentialité · Snowflake',
        c2Title: 'Masquage des données personnelles piloté par configuration',
        c2P: 'Les développeurs ont besoin de données proches de la production pour tester, mais les conversations du centre de contact sont du JSON imbriqué rempli de noms, courriels et numéros de téléphone. Les copier en environnement de test exposait des données personnelles.',
        c2A: 'Conception d’un outil d’anonymisation configurable qui parcourt le JSON imbriqué et remplace les champs personnels. Les champs sensibles sont déclarés sous forme de règles, pas codés en dur : une nouvelle source demande de la configuration, pas du nouveau code.',
        c2O: 'Les équipes testent sur des données réalistes tout en protégeant la vie privée des clients.',
        c2Cap: 'Exemple illustratif, données fictives.',

        c3Tag: 'FinOps · Azure',
        c3Title: 'Redimensionner la VM du runtime d’intégration : −30 % de coût',
        c3P: 'La VM hébergeant notre runtime d’intégration auto-hébergé (SHIR) tournait sur une Standard_DS3_v2. Les pipelines subissaient de la latence : fallait-il monter en gamme, ou le goulot d’étranglement était-il ailleurs ?',
        c3A: 'Analyse de la mémoire, du CPU, des files d’attente API, de la concurrence et des réponses HTTP 429. La VM était loin de la saturation ; la latence venait de la concurrence des requêtes et du rate limiting de l’API. Ajustement de la concurrence ADF et validation progressive de DEV à PROD.',
        c3O: 'Passage en D2ads_v5 (D4ads_v5 gardée comme option conservatrice) : environ 30 % de coût VM/SHIR en moins, pour le même niveau de service attendu.',
        obsMem: 'mémoire utilisée', obsCpu: 'CPU, habituel', obsPeak: 'CPU, pic', obsCalls: 'fenêtre critique', obsCallsVal: '~1 600 appels / 5 min',
        obsCause: 'cause', obsCauseVal: 'concurrence + HTTP 429',
        c3Cap: 'Coût VM/SHIR relatif sur le périmètre étudié. Déploiement : DEV → acceptation → PROD.',

        c4Tag: 'DevOps · Docs-as-code',
        c4Title: 'Un pipeline docs-as-code qui publie sur SharePoint',
        c4P: 'La documentation des tables était dispersée, rapidement obsolète, et plus personne ne lui faisait confiance.',
        c4A: 'Documentation déplacée en Markdown à côté des définitions de données, revue en pull request comme tout autre changement. Au merge, un pipeline Azure la publie sur le SharePoint de l’entreprise.',
        c4O: 'Une source de vérité unique, synchronisée avec le code. Preuve de concept aujourd’hui, prête à être étendue à d’autres équipes.',

        projTitle: 'Autres projets',
        projLead: 'Stages, open source et recherche.',
        research: 'Recherche', personal: 'Personnel',
        p1Title: 'Chatbot RAG sur des données de couverture des médicaments',
        p1Text: 'Assistant interne qui répond aux questions sur les données publiques de couverture des médicaments grâce au RAG (retrieval-augmented generation) : des réponses en quelques secondes plutôt qu’en fouillant les tables.',
        p2Text: 'Contribution à <code>datacontract-cli</code>, un CLI open source pour définir, valider et tester les contrats de données entre producteurs et consommateurs.',
        p3Title: 'Séries temporelles synthétiques avec des GAN',
        p3Text: 'Entraînement d’un réseau antagoniste génératif pour produire des séries temporelles synthétiques réalistes, puis évaluation de la qualité des échantillons et de la stabilité de l’entraînement.',
        p4Title: 'Dashboard du Marathon de Berlin',
        p4Text: 'Application web interactive sur 780 000 arrivées du Marathon de Berlin (1999–2023) : records du monde, simulateur qui classe votre propre temps, zoom sur chaque édition, météo et nationalités.',
        p4Live: 'Démo en ligne',
        p4Note: 'Hébergement gratuit : la première visite peut prendre environ une minute, le temps de réveiller le serveur.',

        stackTitle: 'Stack',
        stackLead: 'Ce que j’utilise au quotidien, regroupé par usage.',
        s1: 'Ingestion et orchestration', s2: 'Entrepôt et modélisation', s3: 'Infrastructure et DevOps',
        s4: 'Qualité et gouvernance', s5: 'Sécurité et confidentialité', s6: 'Langages et analytique',

        expTitle: 'Parcours',
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

        contactTitle: 'Parlons données.',
        contactText: 'Toujours partant pour échanger sur l’ingénierie des données, les plateformes data ou l’IA appliquée. Le courriel est le moyen le plus rapide de me joindre.'
    };

    const meta = {
        en: { title: 'Mathis Pernias — Data Engineering' },
        fr: { title: 'Mathis Pernias — Ingénierie des données' }
    };

    const textNodes = [...document.querySelectorAll('[data-i18n]')];
    const altNodes = [...document.querySelectorAll('[data-i18n-alt]')];
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
        langButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
        try { localStorage.setItem('portfolio-language', lang); } catch (e) { /* storage unavailable */ }
    }

    langButtons.forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));

    let saved = null;
    try { saved = localStorage.getItem('portfolio-language'); } catch (e) { /* storage unavailable */ }
    const browserFr = (navigator.language || '').toLowerCase().startsWith('fr');
    setLanguage(saved || (browserFr ? 'fr' : 'en'));
})();
