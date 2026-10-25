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

    /* ---------- Language switcher ---------- */
    const languageToggle = document.getElementById('language-toggle');
    const translations = {
        en: {
            navHome: 'Home', navAbout: 'About', navToolbox: 'Toolbox', navStories: 'Featured Work', navProjects: 'Projects', navExperience: 'Experience', navContact: 'Contact',
            heroEyebrow: 'Data Analyst @ iA Groupe financier - Montréal', heroGreeting: "Hi, I'm", chipCloud: 'Cloud', chipSecurity: 'Security', chipAi: 'AI', journeyTitle: 'The journey of a piece of data', journeyCollect: 'Collect', journeyCollectText: 'from apps, APIs and files', journeyProtect: 'Protect', journeyProtectText: 'secrets locked, personal data hidden', journeyVerify: 'Verify', journeyVerifyText: 'automated tests catch errors early', journeyDeliver: 'Deliver', journeyDeliverText: 'dashboards, reports and ML models', journeyFoot: 'My job: make every step reliable.',
            heroSubtitle: 'I turn raw data into <strong>trusted, secure and useful</strong> information that teams can act on. Right now I focus on <span class="typing" id="typed"></span><span class="caret"></span>',
            heroCta: "See what I've built &rarr;", contactCta: 'Get in touch',
            statCost: 'infrastructure cost reduction', statRoles: 'internships &amp; roles in data', statCountries: 'countries: France, Denmark, Canada', statDegrees: "engineering &amp; master's degrees",
            aboutKicker: 'about', aboutTitleBefore: 'Building the', aboutTitleAccent: 'pipes', aboutTitleAfter: 'that make data useful',
            aboutTextOne: "Companies produce huge amounts of data, but it is only valuable if it is <strong>correct, protected and easy to use</strong>. That is what I work on every day as a data analyst at <strong>iA Groupe financier</strong>, one of Canada's major insurance and wealth management companies.",
            aboutTextTwo: 'I graduated in August 2026 with a professional Master\'s in Computer Engineering from <strong>Polytechnique Montréal</strong> and an engineering degree in Data Science &amp; AI from <strong>Télécom Physique Strasbourg</strong>. I work comfortably in French and English.',
            skillBuild: 'Build', skillBuildText: 'Automated data pipelines on Azure and Snowflake, written in SQL and Python', skillProtect: 'Protect', skillProtectText: 'Secrets management, access control, anonymisation of personal data', skillVerify: 'Verify', skillVerifyText: 'Automated tests and CI so errors are found before users see them', skillUnderstand: 'Understand', skillUnderstandText: 'Dashboards, analytics, and machine learning including RAG chatbots',
            toolboxKicker: 'toolbox', toolboxTitleBefore: 'The tools I use', daily: 'daily', toolboxLead: 'Each family in one sentence, so you know what it is for.',
            toolIngestion: 'Ingestion &amp; orchestration', toolIngestionText: 'Moving data from where it is created to where it is analysed, on a schedule.', toolWarehouse: 'Warehouse &amp; modelling', toolWarehouseText: 'Storing data in a clean, structured way so anyone can query it.', toolInfrastructure: 'Infrastructure &amp; DevOps', toolInfrastructureText: 'Describing infrastructure as code and shipping changes safely and repeatably.', toolQuality: 'Quality &amp; governance', toolQualityText: 'Making sure data is correct, traceable and used under clear rules.', toolSecurity: 'Security &amp; privacy', toolSecurityText: 'Protecting credentials and personal information end to end.', toolAnalytics: 'Languages &amp; analytics', toolAnalyticsText: 'Scripting, analysis, dashboards and machine learning, served from Snowflake or Databricks.',
            storiesKicker: 'featured work', storiesTitleBefore: "Four things I'm", storiesTitleAccent: 'proud of', storiesLead: 'Real work done at iA: what the problem was, what I did, and what changed.',
            problemLabel: 'The problem', actionLabel: 'What I did', resultLabel: 'The result', storySecurityBadge: 'Security', storySecurityTitle: 'Locking passwords in a digital safe', storySecurityProblem: "The login credentials our pipelines use to talk to the call-center platform were stored in plain sight in the tool's settings. Anyone with access could read them.", storySecurityAction: 'Moved every credential into a secure vault. Pipelines now ask the vault for access only at the moment they need it, and nothing sensitive is left in the code.', storySecurityResult: "No secret exposed anymore, no downtime, and a setup that meets the company's security standards.", storyPrivacyBadge: 'Privacy', storyPrivacyTitle: 'Realistic test data, with no real people in it', storyPrivacyProblem: 'To test properly, developers need data that looks real. But copying real customer conversations into test environments puts personal information at risk.', storyPrivacyAction: 'Built a configurable tool that automatically finds and replaces personal details in complex, nested data, driven by simple rules instead of custom code.', storyPrivacyResult: 'Teams test on realistic data while customer privacy stays protected.', storyCostBadge: 'Cost optimisation', storyCostTitle: 'Cutting CCC VM costs by 30%', storyCostProblem: 'The CCC VM was sized at Standard DS3_v2 (4 vCPU, 14 GiB RAM). The study checked whether latency came from resource saturation or from SHIR/API concurrency, queues and HTTP 429 rate limiting.', storyCostAction: 'Analysed memory, CPU, API queues, concurrency and 429 errors. Memory stayed around 5–6.5 GiB, CPU was usually 0–20% with peaks near 74%, while one critical window reached about 1,600 calls in five minutes.', storyCostResult: 'Recommended D2ads_v5 (2 vCPU, 8 GiB), with D4ads_v5 as a conservative option. A progressive DEV → ACCP → PROD validation and ADF concurrency controls supported a 30% VM/SHIR cost reduction without degrading expected service.', storyDocsBadge: 'Automation', storyDocsTitle: 'Documentation that publishes itself', storyDocsProblem: 'Documentation about data tables lived in scattered files and quickly went out of date, so people stopped trusting it.', storyDocsAction: 'Treated docs like code: written in Markdown next to the data definitions, reviewed in pull requests, and published automatically to the company SharePoint after each merge.', storyDocsResult: 'One source of truth that updates itself. It is a proof of concept today, ready to roll out to more teams.',
            projectsKicker: 'more projects', projectsTitleBefore: 'Side quests &amp;', projectsTitleAccent: 'research', marathonTitle: 'Berlin Marathon dashboard', marathonText: 'An interactive web app to explore how weather, age and nationality affect marathon results across the years.', marathonImageAlt: 'Berlin Marathon Dashboard preview', githubButton: 'View on GitHub', costSavingBadge: '-30%', capacityMeasureTitle: 'Measure', capacityMeasureText: 'SHIR memory stayed at 5–6.5 GiB; CPU was usually 0–20%, with peaks near 74%.', capacityDiagnoseTitle: 'Diagnose', capacityDiagnoseText: 'Queues and HTTP 429 errors came from request concurrency, not constant VM saturation.', capacityChooseTitle: 'Right-size', capacityChooseText: 'Target: D2ads_v5, 2 vCPU and 8 GiB, with D4ads_v5 as the conservative option.', capacityValidateTitle: 'Validate', capacityValidateText: 'Tune ADF concurrency, then validate progressively in DEV, ACCP and PROD.', costBeforeLabel: 'Before analysis', costAfterLabel: 'After right-sizing', costFootnote: 'Same expected service, 30% lower VM/SHIR cost on the studied scope.',
            projectChatbotTitle: 'AI chatbot for drug data', projectChatbotText: 'At McKesson, I built an internal chatbot that answers questions about public drug-coverage data, so teams get answers in seconds instead of digging through tables.', projectOpenSourceTitle: 'Open source contribution', projectOpenSourceText: 'Contributed to <code>datacontract-cli</code>, a public tool that helps teams agree on and check the quality of the data they share.', projectGanTitle: 'AI that invents realistic data', projectGanText: 'Trained a neural network (a GAN) to generate artificial time series that look real, and studied how good and how stable the results are.', diagramBeforeAfter: 'before / after', diagramHowItWorks: 'how it works', diagramInfrastructure: 'infrastructure cost', diagramDocs: 'documentation pipeline', barBefore: 'Before analysis', barAfter: 'After right-sizing',
            experienceKicker: 'journey', experienceTitleBefore: 'Experience &amp;', experienceTitleAccent: 'education', contactKicker: 'contact', contactTitleBefore: "Let's build something", contactTitleAccent: 'great', contactText: "I'm always interested in new projects and opportunities in Data Engineering and AI.", emailButton: 'Email me'
            ,timelineCurrentTitle: 'Data Analyst', timelineCurrentText: 'Full time on the customer data and contact-center platforms, focusing on secure, reliable pipelines and data quality.', timelineCurrentOne: 'Moved API credentials into Azure Key Vault.', timelineCurrentTwo: 'Built configurable anonymisation of sensitive data for test environments.', timelineCurrentThree: 'Improved pipeline reliability, marketing campaign mappings and duplicate handling.', timelineCurrentFour: 'Analysed server and API capacity, contributing to a 30% infrastructure cost reduction.', timelineInternTitle: 'Final-Year Data Analyst Intern', timelineInternText: 'Final-year internship with the data team.', timelineInternOne: 'Worked with Azure Data Factory, Snowflake and Azure Key Vault.', timelineInternTwo: 'Delivered improvements to security, test-data compliance and data quality.', timelineMckessonTitle: 'Data Engineering &amp; AI Intern', timelineMckessonText: 'Built and validated data pipelines supporting analytics and AI use cases.', timelineMckessonOne: 'Developed a RAG-based chatbot using drug data.', timelineMckessonTwo: 'Automated tests and integrated them into Git/CI workflows.', timelineMckessonThree: 'Built Power BI dashboards for KPI tracking and monitored error rates.', timelineMaerskTitle: 'Research Intern (Data Science)', timelineMaerskText: 'Analytical studies and predictive models on simulated epidemic data.', timelineMaerskOne: 'Developed supervised models using Decision Trees (Python, Julia).', timelineMaerskTwo: 'Communicated findings through structured summaries and project reviews.', timelineInriaTitle: 'Systems Engineering Intern', timelineInriaText: 'Automated load-balancing computation for multi-threaded workloads.', timelineInriaOne: 'Performance diagnostics on multi-core architectures.', timelineInriaTwo: 'Technologies: C, Bash, Python.', timelineMasterTitle: "Master's in Computer Engineering", timelineMasterText: "Professional Master's degree specialising in Data Engineering and Analytics. Graduated.", timelineTelecomTitle: 'Engineering Degree in Data Science &amp; AI', timelineTelecomText: 'Engineering degree specialising in Data Science and Artificial Intelligence. Graduated.', footerText: '&copy; 2026 Mathis Pernias. Built with care in Montréal.'
        },
        fr: {
            navHome: 'Accueil', navAbout: 'À propos', navToolbox: 'Outils', navStories: 'Réalisations', navProjects: 'Projets', navExperience: 'Parcours', navContact: 'Contact',
            heroEyebrow: 'Analyste de données @ iA Groupe financier - Montréal', heroGreeting: 'Bonjour, je suis', chipCloud: 'Cloud', chipSecurity: 'Sécurité', chipAi: 'IA', journeyTitle: 'Le parcours d’une donnée', journeyCollect: 'Collecter', journeyCollectText: 'depuis des applications, API et fichiers', journeyProtect: 'Protéger', journeyProtectText: 'secrets verrouillés, données personnelles masquées', journeyVerify: 'Vérifier', journeyVerifyText: 'des tests automatisés détectent les erreurs tôt', journeyDeliver: 'Valoriser', journeyDeliverText: 'tableaux de bord, rapports et modèles ML', journeyFoot: 'Mon rôle : rendre chaque étape fiable.',
            heroSubtitle: 'Je transforme les données brutes en informations <strong>fiables, sécurisées et utiles</strong> pour aider les équipes à décider. Je travaille actuellement sur <span class="typing" id="typed"></span><span class="caret"></span>',
            heroCta: 'Voir mes réalisations &rarr;', contactCta: 'Me contacter',
            statCost: "de réduction des coûts d'infrastructure", statRoles: 'stages et expériences en données', statCountries: 'pays : France, Danemark, Canada', statDegrees: 'diplômes en ingénierie et données',
            aboutKicker: 'à propos', aboutTitleBefore: 'Construire les', aboutTitleAccent: 'pipelines', aboutTitleAfter: 'qui rendent les données utiles',
            aboutTextOne: "Les entreprises produisent énormément de données, mais elles n’ont de valeur que si elles sont <strong>correctes, protégées et faciles à utiliser</strong>. C’est ce sur quoi je travaille chaque jour comme analyste de données chez <strong>iA Groupe financier</strong>, l’un des principaux groupes canadiens d’assurance et de gestion de patrimoine.",
            aboutTextTwo: 'J’ai obtenu en août 2026 une maîtrise professionnelle en génie informatique de <strong>Polytechnique Montréal</strong> ainsi qu’un diplôme d’ingénieur en Sciences des Données et Intelligence Artificielle de <strong>Télécom Physique Strasbourg</strong>. Je travaille aisément en français et en anglais.',
            skillBuild: 'Construire', skillBuildText: 'Pipelines de données automatisés sur Azure et Snowflake, en SQL et Python', skillProtect: 'Protéger', skillProtectText: 'Gestion des secrets, contrôle des accès et anonymisation des données personnelles', skillVerify: 'Vérifier', skillVerifyText: 'Tests automatisés et CI pour détecter les erreurs avant les utilisateurs', skillUnderstand: 'Comprendre', skillUnderstandText: 'Tableaux de bord, analytique et apprentissage automatique, dont les chatbots RAG',
            toolboxKicker: 'outils', toolboxTitleBefore: 'Les outils que j’utilise', daily: 'au quotidien', toolboxLead: 'Chaque famille résumée en une phrase pour comprendre son utilité.',
            toolIngestion: 'Ingestion et orchestration', toolIngestionText: 'Déplacer les données de leur source vers leur destination selon un calendrier.', toolWarehouse: 'Entrepôt et modélisation', toolWarehouseText: 'Stocker les données de manière structurée pour les rendre faciles à interroger.', toolInfrastructure: 'Infrastructure et DevOps', toolInfrastructureText: 'Décrire l’infrastructure comme du code et livrer les changements de façon fiable.', toolQuality: 'Qualité et gouvernance', toolQualityText: 'Garantir que les données sont correctes, traçables et utilisées selon des règles claires.', toolSecurity: 'Sécurité et confidentialité', toolSecurityText: 'Protéger les identifiants et les informations personnelles de bout en bout.', toolAnalytics: 'Langages et analytique', toolAnalyticsText: 'Développer des scripts, analyses, tableaux de bord et modèles ML avec Snowflake ou Databricks.',
            storiesKicker: 'réalisations', storiesTitleBefore: 'Quatre projets dont je suis', storiesTitleAccent: 'fier', storiesLead: 'Des réalisations concrètes chez iA : le problème, la solution et le résultat.',
            problemLabel: 'Le problème', actionLabel: 'Mon intervention', resultLabel: 'Le résultat', storySecurityBadge: 'Sécurité', storySecurityTitle: 'Ranger les mots de passe dans un coffre numérique', storySecurityProblem: 'Les identifiants utilisés par nos pipelines pour accéder à la plateforme de centre de contact étaient visibles dans les paramètres. Toute personne ayant accès pouvait les lire.', storySecurityAction: 'J’ai déplacé chaque identifiant dans un coffre sécurisé. Les pipelines demandent désormais l’accès uniquement au moment nécessaire, sans secret dans le code.', storySecurityResult: 'Plus aucun secret exposé, aucune interruption et une solution conforme aux standards de sécurité de l’entreprise.', storyPrivacyBadge: 'Confidentialité', storyPrivacyTitle: 'Des données de test réalistes, sans données personnelles réelles', storyPrivacyProblem: 'Pour tester correctement, les développeurs ont besoin de données réalistes. Mais copier des conversations clients dans les environnements de test expose des informations personnelles.', storyPrivacyAction: 'J’ai construit un outil configurable qui détecte et remplace automatiquement les informations personnelles dans des données imbriquées.', storyPrivacyResult: 'Les équipes testent sur des données réalistes tout en protégeant la vie privée des clients.', storyCostBadge: 'Optimisation des coûts', storyCostTitle: 'Réduire de 30 % le coût de la VM CCC', storyCostProblem: 'La VM CCC était dimensionnée en Standard DS3_v2 (4 vCPU, 14 Gio de RAM). L’étude a vérifié si la latence venait d’une saturation des ressources ou de la concurrence SHIR/API, des files d’attente et des erreurs HTTP 429.', storyCostAction: 'J’ai analysé la mémoire, le CPU, les files d’attente API, la concurrence et les erreurs 429. La mémoire est restée autour de 5–6,5 Gio, le CPU entre 0 et 20 % la plupart du temps avec des pics proches de 74 %, tandis qu’une fenêtre critique a atteint environ 1 600 appels en cinq minutes.', storyCostResult: 'La cible recommandée était D2ads_v5 (2 vCPU, 8 Gio), avec D4ads_v5 comme option conservatrice. La validation progressive DEV → ACCP → PROD et le pilotage de la concurrence ADF ont permis une réduction de 30 % du coût VM/SHIR sans dégrader le service attendu.', storyDocsBadge: 'Automatisation', storyDocsTitle: 'Une documentation qui se publie automatiquement', storyDocsProblem: 'La documentation des tables était dispersée et rapidement obsolète, ce qui réduisait la confiance des utilisateurs.', storyDocsAction: 'J’ai traité la documentation comme du code : écrite en Markdown, revue dans les pull requests et publiée automatiquement après chaque merge.', storyDocsResult: 'Une source de vérité unique qui se met à jour automatiquement.',
            projectsKicker: 'autres projets', projectsTitleBefore: 'Projets personnels et', projectsTitleAccent: 'recherche', marathonTitle: 'Dashboard du Marathon de Berlin', marathonText: 'Une application web interactive pour explorer l’influence de la météo, de l’âge et de la nationalité sur les résultats du marathon.', marathonImageAlt: 'Aperçu du Dashboard du Marathon de Berlin', githubButton: 'Voir sur GitHub', costSavingBadge: '-30 %', capacityMeasureTitle: 'Mesurer', capacityMeasureText: 'La mémoire disponible du SHIR est restée entre 5 et 6,5 Gio ; le CPU était généralement entre 0 et 20 %, avec des pics proches de 74 %.', capacityDiagnoseTitle: 'Diagnostiquer', capacityDiagnoseText: 'Les files d’attente et les erreurs HTTP 429 provenaient de la concurrence des requêtes, et non d’une saturation permanente de la VM.', capacityChooseTitle: 'Redimensionner', capacityChooseText: 'Cible : D2ads_v5, 2 vCPU et 8 Gio, avec D4ads_v5 comme option conservatrice.', capacityValidateTitle: 'Valider', capacityValidateText: 'Ajuster la concurrence ADF, puis valider progressivement en DEV, ACCP et PROD.', costBeforeLabel: 'Avant analyse', costAfterLabel: 'Après dimensionnement', costFootnote: 'Même service attendu, avec 30 % de coût VM/SHIR en moins sur le périmètre étudié.',
            projectChatbotTitle: 'Chatbot IA pour les données pharmaceutiques', projectChatbotText: 'Chez McKesson, j’ai développé un chatbot interne qui répond aux questions sur les données publiques de couverture des médicaments.', projectOpenSourceTitle: 'Contribution open source', projectOpenSourceText: 'Contribution à <code>datacontract-cli</code>, un outil public qui aide les équipes à définir et vérifier la qualité des données partagées.', projectGanTitle: 'Une IA qui génère des données réalistes', projectGanText: 'Entraînement d’un réseau neuronal GAN pour générer des séries temporelles artificielles, puis analyse de leur qualité et de leur stabilité.', diagramBeforeAfter: 'avant / après', diagramHowItWorks: 'fonctionnement', diagramInfrastructure: 'coût d’infrastructure', diagramDocs: 'pipeline documentaire', barBefore: 'Avant analyse', barAfter: 'Après dimensionnement',
            experienceKicker: 'parcours', experienceTitleBefore: 'Expérience et', experienceTitleAccent: 'formation', contactKicker: 'contact', contactTitleBefore: 'Construisons quelque chose de', contactTitleAccent: 'grand', contactText: "Je suis toujours intéressé par de nouveaux projets et opportunités en ingénierie des données et IA.", emailButton: 'M’écrire'
            ,timelineCurrentTitle: 'Analyste de données', timelineCurrentText: 'Travail à temps plein sur les plateformes de données clients et de centre de contact, avec un focus sur la sécurité, la fiabilité et la qualité.', timelineCurrentOne: 'Migration des identifiants API vers Azure Key Vault.', timelineCurrentTwo: 'Mise en place d’une anonymisation configurable des données sensibles en environnement de test.', timelineCurrentThree: 'Amélioration de la fiabilité des pipelines, des campagnes marketing et de la gestion des doublons.', timelineCurrentFour: 'Analyse de la capacité serveur et API ayant contribué à une réduction des coûts de 30 %.', timelineInternTitle: 'Stagiaire analyste de données - fin d’études', timelineInternText: 'Stage de fin d’études au sein de l’équipe data.', timelineInternOne: 'Utilisation d’Azure Data Factory, Snowflake et Azure Key Vault.', timelineInternTwo: 'Amélioration de la sécurité, de la conformité des données de test et de la qualité.', timelineMckessonTitle: 'Stagiaire ingénierie des données et IA', timelineMckessonText: 'Conception et validation de pipelines de données pour des usages analytiques et IA.', timelineMckessonOne: 'Développement d’un chatbot RAG à partir de données pharmaceutiques.', timelineMckessonTwo: 'Automatisation de tests et intégration dans les workflows Git/CI.', timelineMckessonThree: 'Création de tableaux de bord Power BI pour le suivi des indicateurs.', timelineMaerskTitle: 'Stagiaire recherche en science des données', timelineMaerskText: 'Études analytiques et modèles prédictifs sur des données épidémiques simulées.', timelineMaerskOne: 'Développement de modèles supervisés avec des arbres de décision en Python et Julia.', timelineMaerskTwo: 'Présentation des résultats dans des synthèses structurées et revues de projet.', timelineInriaTitle: 'Stagiaire ingénierie systèmes', timelineInriaText: 'Automatisation du calcul de répartition de charge pour des traitements multithreadés.', timelineInriaOne: 'Diagnostic des performances sur des architectures multicœurs.', timelineInriaTwo: 'Technologies : C, Bash, Python.', timelineMasterTitle: 'Maîtrise en génie informatique', timelineMasterText: 'Maîtrise professionnelle spécialisée en ingénierie et analytique des données. Diplôme obtenu.', timelineTelecomTitle: 'Diplôme d’ingénieur en Sciences des Données et IA', timelineTelecomText: 'Diplôme d’ingénieur spécialisé en Sciences des Données et Intelligence Artificielle. Diplôme obtenu.', footerText: '&copy; 2026 Mathis Pernias. Réalisé avec soin à Montréal.'
        }
    };
    const phraseSets = {
        en: ['reliable data pipelines', 'cloud security', 'data quality and testing', 'privacy and compliance', 'applied AI'],
        fr: ['des pipelines fiables', 'la sécurité cloud', 'la qualité et les tests de données', 'la confidentialité et la conformité', 'l’IA appliquée']
    };

    function startTyping(language) {
        const target = document.getElementById('typed');
        if (!target) return;
        let index = 0, character = 0, deleting = false;
        function type() {
            if (!document.documentElement.lang || document.documentElement.lang === language) {
                const phrase = phraseSets[language][index];
                target.textContent = phrase.slice(0, character);
                if (!deleting && character === phrase.length) deleting = true;
                else if (deleting && character === 0) { deleting = false; index = (index + 1) % phraseSets[language].length; }
                character += deleting ? -1 : 1;
                setTimeout(type, deleting ? 35 : 70);
            }
        }
        type();
    }

    function setLanguage(language) {
        const dictionary = translations[language];
        document.documentElement.lang = language;
        document.title = language === 'fr' ? 'Mathis Pernias | Analyste de données' : 'Mathis Pernias | Data Analyst & Data Engineer';
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const value = dictionary[element.dataset.i18n];
            if (value !== undefined) element.innerHTML = value;
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(element => {
            const value = dictionary[element.dataset.i18nAlt];
            if (value !== undefined) element.alt = value;
        });
        languageToggle.textContent = language === 'en' ? 'FR' : 'EN';
        languageToggle.setAttribute('aria-label', language === 'en' ? 'Passer au français' : 'Switch to English');
        localStorage.setItem('portfolio-language', language);
        startTyping(language);
    }

    if (languageToggle) {
        languageToggle.addEventListener('click', () => {
            setLanguage(document.documentElement.lang === 'fr' ? 'en' : 'fr');
        });
        setLanguage(localStorage.getItem('portfolio-language') || 'en');
    }
})();
