// ==================================================
// 0) LocalStorage‐helpers
// ==================================================
const CHOICES_KEY = 'userChoices';

/**
 * Henter alle gemte bruger‐valg fra localStorage.
 * @returns {Object} 
 */
function getUserChoices() {
  const raw = localStorage.getItem(CHOICES_KEY);
  return raw ? JSON.parse(raw) : {};
}

/**
 * Gemmer et valg for et givet scenarie.
 @param {string} slug  
 @param {number} idx    
 @param {number} choice 
 */
function saveUserChoice(slug, idx, choice) {
  const all = getUserChoices();
  if (!all[slug]) all[slug] = {};
  all[slug][idx] = choice;
  localStorage.setItem(CHOICES_KEY, JSON.stringify(all));
}

// ==================================================
// 1) Container & hash‐helper
// ==================================================
const contentContainer = document.getElementById('content');
function getHash() {
  return window.location.hash.slice(1) || 'home';
}

// ==================================================
// 2) Håndtering af bruger‐valg
// ==================================================
function handleChoice(slug, idx, choice) {
  saveUserChoice(slug, idx, choice);
  const nr = idx + 1;
  switch (choice) {
    case 1:
      window.location.hash = `#${slug}-${nr}-quiz-1`;
      break;
    case 2:
      window.location.hash = `#${slug}-${nr}-quiz-ignore`;
      break;
    case 3:
      window.location.hash = `#${slug}-${nr}-advice`;
      break;
  }
}
function handleScenarioChoice(slug, idx, choice) {
  saveUserChoice(slug, idx, choice);
  const nr = idx + 1;
  window.location.hash = `#${slug}-${nr}-choice-${choice}`;
}

// ==================================================
// 3) Router
// ==================================================
function router() {
  const hash = getHash();

  // 1) Faste sider
  if (hash === 'home')    return loadHome();
  if (hash === 'emner')   return loadEmner();
  if (hash === 'profile') return loadProfile();

  // 2) Quiz-2 (Undersøger det først) → outcome2
  {
    const m = hash.match(/^(.+)-(\d+)-quiz-2$/);
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) return loadScenarioOutcomePage2(page, idx);
    }
  }

  // 3) Quiz‐valg 1 → scenario‐choice
  {
    const m = hash.match(/^(.+)-(\d+)-quiz-1$/);
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) return loadScenarioChoicePage(page, idx);
    }
  }

  // 4) Ignorer‐opfølgning
  {
    const m = hash.match(/^(.+)-(\d+)-quiz-ignore$/);
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) return loadScenarioIgnorePage(page, idx);
    }
  }

  // 5) Rådfør‐med‐ven
  {
    const m = hash.match(/^(.+)-(\d+)-advice$/);
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) return loadScenarioAdvicePage(page, idx);
    }
  }

  // 6–9) Outcome‐views for choice 1..4
  for (let c = 1; c <= 4; c++) {
    const m = hash.match(new RegExp(`^(.+)-(\\d+)-choice-${c}$`));
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) {
        return ({
          1: loadScenarioOutcomePage,
          2: loadScenarioOutcomePage2,
          3: loadScenarioOutcomePage3,
          4: loadScenarioOutcomePage4
        })[c](page, idx);
      }
    }
  }

  // 10–13) Ending‐views for ending-1..4
  for (let e = 1; e <= 4; e++) {
    const m = hash.match(new RegExp(`^(.+)-(\\d+)-ending-${e}$`));
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e2 => e2.slug === slug);
      if (page) {
        return ({
          1: loadScenarioEndPage,
          2: loadScenarioEndPage2,
          3: loadScenarioEndPage3,
          4: loadScenarioEndPage4
        })[e](page, idx);
      }
    }
  }

  // 14) Første quiz‐skærm
  {
    const m = hash.match(/^(.+)-(\d+)-quiz$/);
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) return loadScenarioQuizPage(page, idx);
    }
  }

  // 15) Intro‐view (første scenarie)
  {
    const m = hash.match(/^(.+)-(\d+)$/);
    if (m) {
      const [, slug, num] = m;
      const idx = +num - 1;
      const page = emnePages.find(e => e.slug === slug);
      if (page) return loadScenarioPage(page, idx);
    }
  }

  // 16) Ren emne‐side
  {
    const page = emnePages.find(e => e.slug === hash);
    if (page) return loadEmnePage(page);
  }

  // 17) Fallback: 404
  loadNotFound();
}

window.addEventListener('load',  router);
window.addEventListener('hashchange', router);

// ==================================================
// 4) Datastruktur for ALLE emne‐sider
// ==================================================
const emnePages = [
  {
    slug: 'digital-tryghed',
    title: 'Digital Tryghed',
    hero: 'img/hjerneklog.png',
    scenarios: [
      { name: 'For godt til at være sandt?',       icon: 'img/shopping-bag 1.png',      status: 'not-done' },
      { name: 'Hej, det er din bank :)',            icon: 'img/bank 1.png',              status: 'done'     },
      { name: 'Svært kodeord eller nemt liv?',      icon: 'img/password 1.png',          status: 'done'     },
      { name: 'Hvor mange oplysninger smed du lige væk?', icon: 'img/preview 1.png',     status: 'done'     }
    ]
  },
  {
    slug: 'budget-oekonomi',
    title: 'Budget & Økonomi',
    hero: 'img/hjerneide - Copy.png',
    scenarios: [
      { name: 'Flad på dag 5',                      icon: 'img/broke 1.png',             status: 'done'     },
      { name: 'Impulskøbs - legenden',                icon: 'img/shopping-bag 1.png',      status: 'done'     },
      { name: 'Budget = frihed',                    icon: 'img/budget 1.png',            status: 'not-done' },
      { name: 'Abonnementer – den usynlige dræber', icon: 'img/subscribe 1.png',         status: 'not-done' },
      { name: 'PBS – den voksne autopilot',         icon: 'img/bill 1.png',              status: 'done'     },
      { name: '“Det koster vel ikke så meget…”',    icon: 'img/expensive 1.png',         status: 'not-done' }
    ]
  },
  {
    slug: 'skat',
    title: 'SKAT',
    hero: 'img/hjerneforvirret.png',
    scenarios: [
      { name: 'Frikort eller fupkort?',             icon: 'img/money 1.png',             status: 'done'     },
      { name: 'Årsopgørelsen – fjende eller ven?',  icon: 'img/dont-know 1.png',         status: 'not-done' },
      { name: 'Forskuds-hva’ for noget?',           icon: 'img/shrug 1.png',             status: 'done'     },
      { name: 'Træk fra – men hvad egentlig?',      icon: 'img/briefcase 1.png',         status: 'done'     },
      { name: 'Når du får en regning fra SKAT',     icon: 'img/invoice 1.png',           status: 'done'     }
    ]
  },
  {
    slug: 'voksenliv-basics',
    title: 'Voksenliv Basics',
    hero: 'img/hjernestærk.png',
    scenarios: [
      { name: 'Kontrakter for begyndere',           icon: 'img/home 1.png',              status: 'not-done' },
      { name: 'Hvad dækker din forsikring egentlig?', icon: 'img/insurance 1.png',       status: 'not-done' },
      { name: 'Når du skal tale med det offentlige', icon: 'img/capitol 1.png',           status: 'done'     },
      { name: 'Post, papirer og panik',             icon: 'img/email-marketing 1.png',    status: 'done'     }
    ]
  },
  {
    slug: 'mental-sundhed',
    title: 'Mental Sundhed',
    hero: 'img/hjernezen.png',
    scenarios: [
      { name: 'Alt for meget på én gang',           icon: 'img/performance (2) 1.png',   status: 'done'     },
      { name: 'Når økonomi fylder i hovedet',        icon: 'img/money 2.png',             status: 'done'     },
      { name: 'At sige nej uden skyld',             icon: 'img/say-no 1.png',            status: 'not-done' },
      { name: 'Digital detox – eller bare pause',    icon: 'img/digital-detox 1.png',     status: 'done'     },
      { name: 'Hvordan har du det egentlig?',       icon: 'img/self-love 1.png',         status: 'done'     },
      { name: 'Sammenlignings-fælden',              icon: 'img/justice-scale 1.png',     status: 'done'     },
      { name: "Fake it 'til you crash it",          icon: 'img/mask 1.png',              status: 'not-done' }
    ]
  }
];

// ==================================================
// 5) Init cirkler
// ==================================================
function initProgressCircles() {
  document.querySelectorAll('[data-progress]').forEach(c => {
    const pct    = +c.dataset.progress;
    const circle = c.querySelector('circle');
    const r      = circle.r.baseVal.value;
    const len    = 2 * Math.PI * r;
    circle.style.strokeDasharray  = len;
    circle.style.strokeDashoffset = len - (pct / 100) * len;
  });
}

// ==================================================
// 6) global .profile-btn handler
// ==================================================
document.addEventListener('click', e => {
  if (e.target.closest('.profile-btn')) {
    window.location.hash = '#profile';
  }
});


// ==================================================
// 7) View-funktioner
// ==================================================

// 7) 404
function loadNotFound() {
  contentContainer.innerHTML = `
    <section class="not-found">
      <h1>404</h1>
      <p>Side ikke fundet.</p>
      <a href="#home" class="btn">Tilbage til forsiden</a>
    </section>`;
}


// 7) Home
function loadHome() {
  contentContainer.innerHTML = `
    <section class="home-view">
      <img src="img/hjerneide.png" alt="Hjerne illustration" class="hero-image"/>
      <h1>Virkeligheden 101</h1>
      <div class="intro-text">
        <p>Interaktive scenarier om virkeligheden.</p>
        <p>Alt det shit du ikke lærer i skolen.</p>
      </div>
      <a href="#emner" class="btn">Kom i gang</a>
      <a href="#profile" class="btn">Min Profil</a>
    </section>`;
}

// 7.1) Se alle emner
function loadEmner() {
  const emnerData = emnePages.map(p => ({
    name: p.title,
    progress: Math.round(p.scenarios.filter(s => s.status === 'done').length / p.scenarios.length * 100),
    slug: p.slug
  }));

  let html = `
    <section class="emne-view">
      <header class="emne-header">
        <div class="back-btn" onclick="window.location.hash='#home'">
          <i class="fa-solid fa-arrow-left"></i>
        </div>
        <h2>Alt det, du aldrig lærte i skolen</h2>
        <p class="subtitle">
          Vælg et emne og lær om virkeligheden – ét klik ad gangen.
        </p>
        <div class="profile-btn">
          <i class="fa-solid fa-user"></i>
        </div>
      </header>
      <div class="emne-list">
  `;

  emnerData.forEach(emne => {
    html += `
      <a href="#${emne.slug}" class="emne-item">
        <div class="progress-container" data-progress="${emne.progress}">
          <svg class="progress-circle" width="60" height="60">
            <circle class="progress-ring__circle"
                    stroke="#541BBE" stroke-width="6"
                    fill="transparent" r="25" cx="30" cy="30"/>
          </svg>
          <span class="progress-text">${emne.progress}%</span>
        </div>
        <p>${emne.name}</p>
      </a>`;
  });

  html += `</div></section>`;
  contentContainer.innerHTML = html;
  initProgressCircles();
}

// 7.2) Profil
function loadProfile() {
  const categories = [
    { name: 'Digital Tryghed', done: 3, total: 4, slug: 'digital-tryghed' },
    { name: 'Budget & Økonomi', done: 3, total: 6, slug: 'budget-oekonomi' },
    { name: 'SKAT', done: 4, total: 5, slug: 'skat' },
    { name: 'Voksenliv Basics', done: 2, total: 4, slug: 'voksenliv-basics' },
    { name: 'Mental sundhed', done: 5, total: 7, slug: 'mental-sundhed' }
  ];

  let html = `
    <section class="profile-view">
      <header class="profil-header">
        <div class="top-bar">
          <div class="back-btn" onclick="window.location.hash='#emner'">
            <i class="fa-solid fa-arrow-left"></i>
          </div>
          <h2>Brugernavn</h2>
          <div class="coins-container">
            <p class="coins">645</p>
            <img class="coin" src="img/star 1.png" alt="Mønt-icon">
          </div>
        </div>
        <img class="profile-pic" src="img/Group 42.png" alt="Profilbillede">
      </header>

      <div class="progress-card">
        <h3>Din fremgang</h3>
        <div class="progress-details">
          <p class="level-text">IRL-Lærling <br>(Level 1)</p>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: 40%;"></div>
          </div>
        </div>
        <div class="reward-row">
          <p class="reward-label">Næste reward:</p>
          <p class="reward-amount">
            1000 <img class="reward-coin" src="img/star 1.png">
          </p>
          <p class="reward-desc">Rabatkode til Rema 1000</p>
        </div>
      </div>

      <section class="badge-collection">
        <h2>Badge kollektion</h2>
        <div class="badge-grid">
          <div class="badge-item"><img src="img/Group 35.png"><p>Skatteekspert</p></div>
          <div class="badge-item"><img src="img/Group 36.png"><p>Flad på Dag 5</p></div>
          <div class="badge-item"><img src="img/Group 38.png"><p>Digital Back-Up</p></div>
          <div class="badge-item"><img src="img/Group 40.png"><p>URL-Sheriff</p></div>
          <div class="badge-item"><img src="img/Group 43.png"><p>Tryghedssnegl</p></div>
          <div class="badge-item locked"><img src="img/Group 41.png"><p>Datavogter</p></div>
        </div>
      </section>

      <section class="profile-emnekategori">
        <h2>Alle emner</h2>
        <div class="profile-emne-list">
          ${categories.map(cat => {
            const pct = Math.round(cat.done / cat.total * 100);
            return `
              <a href="#${cat.slug}" class="profile-emne-item">
                <div class="profile-emne-circle" data-progress="${pct}">
                  <svg width="60" height="60">
                    <circle class="profile-circle-ring"
                            stroke="#541BBE" stroke-width="6"
                            fill="transparent" r="25" cx="30" cy="30"/>
                  </svg>
                  <span class="profile-emne-percent">${pct}%</span>
                </div>
                <div class="profile-emne-texts">
                  <p class="profile-emne-title">${cat.name}</p>
                  <p class="profile-emne-sub">${cat.done}/${cat.total} Scenarier</p>
                </div>
              </a>`;
          }).join('')}
        </div>
      </section>
    </section>`;

  contentContainer.innerHTML = html;
  initProgressCircles();
}

// 7.3) Individuel emne-side
function loadEmnePage(page) {
  let html = `
    <section class="emne-detail">
      <header class="emne-header">
        <div class="back-btn" onclick="window.location.hash='#emner'">
          <i class="fa-solid fa-arrow-left"></i><span>Alle emner</span>
        </div>
        <div class="profile-btn"><i class="fa-solid fa-user"></i></div>
        <h2>${page.title}</h2>
      </header>
      <div class="emne-hero">
        <img src="${page.hero}" alt="${page.title}"/>
      </div>
      <div class="scenario-list">`;

  page.scenarios.forEach((s, i) => {
    const doneClass = s.status === 'done' ? 'completed' : '';
    const checkIcon = s.status === 'done'
      ? 'img/grøn checkmark.png'
      : 'img/grå checkmark.png';
    html += `
      <a href="#${page.slug}-${i+1}" class="scenario-item ${doneClass}">
        <img class="scenario-icon" src="${s.icon}"/><p>${s.name}</p>
        <img class="check" src="${checkIcon}"/>
      </a>`;
  });

  html += `</div></section>`;
  contentContainer.innerHTML = html;
}

// 7.4) Scenarie-intro
function loadScenarioPage(page, idx) {
  if (idx !== 0) return;
  const scen = page.scenarios[0];
  contentContainer.innerHTML = `
    <section class="scenario-intro">
      <header class="scenario-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}'">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Tilbage til ${page.title}</span>
        </div>
        <img src="img/hjerneforvirret.png" alt="${scen.name}" class="intro-hero"/>
      </header>
      <div class="intro-body">
        <h2>${scen.name}</h2>
        <p class="scenario-subtitle">Emne: ${page.title}</p>
        <p class="intro-text">Har du det der skal til, for at spotte de rigtige valg?</p>
        <button class="start-btn" onclick="window.location.hash='${page.slug}-1-quiz'">
          Start nu
        </button>
        <p class="note">Alle svar gemmes og kan tilgås efter gennemførelse</p>
      </div>
    </section>`;
}

// 7.5) Quiz-side
function loadScenarioQuizPage(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-quiz">
      <header class="quiz-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}'">
          <i class="fa-solid fa-arrow-left"></i>
        </div>
        <h2>Du ser denne annonce fra JYSK - Hvad gør du?</h2>
      </header>
      <div class="quiz-body">
        <video class="quiz-video" controls>
          <source src="videos/jyskvideo.mp4" type="video/mp4">
          <source src="videos/jyskvideo.mov" type="video/quicktime">
          Din browser understøtter ikke video.
        </video>
        <div class="quiz-choices">
          <button class="quiz-btn" onclick="handleChoice('${page.slug}', ${idx}, 1)">
            Klikker på annoncen
          </button>
          <button class="quiz-btn" onclick="handleChoice('${page.slug}', ${idx}, 2)">
            Ignorer annoncen
          </button>
          <button class="quiz-btn" onclick="handleChoice('${page.slug}', ${idx}, 3)">
            Rådfører mig med en bekendt
          </button>
        </div>
      </div>
    </section>`;
}

// 7.6) Scenarie-choice (valg 1 fra quiz)
function loadScenarioChoicePage(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-choice">
      <header class="scenario-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}-${num}-quiz'">
          <i class="fa-solid fa-arrow-left"></i>
        </div>
        <h2>Du lander på denne hjemmeside</h2>
        <p>- Hvad gør du?</p>
      </header>
      <div class="choice-body">
        <img src="img/jyskshop.png" alt="JYSK shop" class="choice-hero"/>
        <div class="choice-choices">
          <button class="choice-btn"
                  onclick="handleScenarioChoice('${page.slug}', ${idx}, 1)">
            Køber en af de gode tilbud
          </button>
          <button class="choice-btn"
                  onclick="handleScenarioChoice('${page.slug}', ${idx}, 2)">
            Googler “jysk-udsalg.dk”
          </button>
          <button class="choice-btn"
                  onclick="handleScenarioChoice('${page.slug}', ${idx}, 3)">
            Besøger Jysk.dk for at dobbeltchekke
          </button>
        </div>
      </div>
    </section>`;
}

// 7.7) Ignorer-opfølgning (gren 2)
function loadScenarioIgnorePage(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-quiz">
      <header class="quiz-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}'">
          <i class="fa-solid fa-arrow-left"></i>
        </div>
        <h2>Et par dage senere ser du en ny annonce - Hvad gør du?</h2>
      </header>
      <div class="quiz-body">
        <video class="quiz-video" controls>
          <source src="videos/jyskvideo.mp4" type="video/mp4">
          Din browser understøtter ikke video.
        </video>
        <div class="quiz-choices">
          <button class="quiz-btn"
                  onclick="handleChoice('${page.slug}', ${idx}, 1)">
            Klikker på annoncen
          </button>
          <button class="quiz-btn"
                  onclick="handleChoice('${page.slug}', ${idx}, 2)">
            Undersøger det først
          </button>
        </div>
      </div>
    </section>`;
}

// 7.8) Rådfør-med-ven (gren 3)
function loadScenarioAdvicePage(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-advice">
      <header class="scenario-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}-${num}-quiz'">
          <i class="fa-solid fa-arrow-left"></i>
        </div>
        <h2>Din ven svarer:</h2>
        <p class="advice-text">
          "Det ser ægte ud, men adressen virker lidt mærkelig"
        </p>
      </header>
      <div class="advice-body">
        <img src="img/hjernefriend.png" alt="Ven og hjerne" class="advice-hero"/>
        <div class="advice-choices">
          <button class="choice-btn"
                  onclick="handleScenarioChoice('${page.slug}', ${idx}, 1)">
            Lader være – men gemmer linket
          </button>
          <button class="choice-btn"
                  onclick="handleScenarioChoice('${page.slug}', ${idx}, 2)">
            Undersøger det selv
          </button>
        </div>
      </div>
    </section>`;
}

// 7.9) Outcome 1 (valg 1)
function loadScenarioOutcomePage(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-outcome">
      <header class="outcome-header">
        <div class="back-btn" onclick="window.history.back()">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img src="img/hjerneked.png" alt="Illustration" class="outcome-hero"/>
      </header>
      <div class="outcome-content">
        <h2>Blåøjet & Snydt</h2>
        <p>Du betaler med kort og får en kvittering.</p>
        <p>Et par dage senere opdager du, at der er hævet penge fra dit kort i udlandet.</p>
        <p>Varen dukker aldrig op, og webshoppen svarer ikke på mails.</p>
        <button class="outcome-btn"
                onclick="window.location.hash='#${page.slug}-${num}-ending-1'">
          Bliv klogere
        </button>
      </div>
    </section>`;
}

// 7.10) Outcome 2 (valg 2)
function loadScenarioOutcomePage2(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-outcome">
      <header class="outcome-header">
        <div class="back-btn" onclick="window.history.back()">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img src="img/hjernestærk.png" alt="Illustration" class="outcome-hero"/>
      </header>
      <div class="outcome-content">
        <h2>Kritisk og Sikret</h2>
        <p>Du finder hurtigt ud af, at siden ikke tilhører JYSK, og flere advarsler dukker op.</p>
        <p>Du handler ikke.</p>
        <p>Du gennemskuede svindlen og undgik at blive snydt.</p>
        <button class="outcome-btn"
                onclick="window.location.hash='#${page.slug}-${num}-ending-2'">
          Bliv klogere
        </button>
      </div>
    </section>`;
}

// 7.11) Outcome 3 (valg 3)
function loadScenarioOutcomePage3(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-outcome">
      <header class="outcome-header">
        <div class="back-btn" onclick="window.history.back()">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img src="img/hjernestærk.png" alt="Illustration" class="outcome-hero"/>
      </header>
      <div class="outcome-content">
        <h2>Forsigtig og Oplyst</h2>
        <p>Du bliver mistænksom og kontakter JYSK’s kundeservice.</p>
        <p>De bekræfter, at det er en falsk side.</p>
        <p>Du tog dig tid til at undersøge tilbuddet og fandt frem til sandheden.</p>
        <button class="outcome-btn"
                onclick="window.location.hash='#${page.slug}-${num}-ending-3'">
          Bliv klogere
        </button>
      </div>
    </section>`;
}

// 7.12) Outcome 4 (valg 4)
function loadScenarioOutcomePage4(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-outcome">
      <header class="outcome-header">
        <div class="back-btn" onclick="window.history.back()">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img src="img/hjerneked.png" alt="Illustration" class="outcome-hero"/>
      </header>
      <div class="outcome-content">
        <h2>Usikker, men heldig</h2>
        <p>Du slap uden skader, men lærte ikke noget nyt om, hvordan man spotter scams.</p>
        <button class="outcome-btn"
                onclick="window.location.hash='#${page.slug}-${num}-ending-4'">
          Bliv klogere
        </button>
      </div>
    </section>`;
}

// 7.13) Slutning 1
function loadScenarioEndPage(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-end">
      <header class="end-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}-${num}-quiz'">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img class="end-hero" src="img/hjerneide - Copy.png" alt="Slutning illustration"/>
        <h2>Selv .dk-domæner kan være scams.</h2>
        <p>Tjek altid, om butikken og tilbuddet er ægte, især hvis det virker for godt til at være sandt.</p>
        <p class="badge-text"><strong>Optjent badge:</strong> Datadumpmap</p>
      </header>
      <div class="end-buttons">
        <button class="end-btn end-btn--scenario" onclick="window.location.hash='#${page.slug}'">
          Prøv et andet scenarie
        </button>
        <button class="end-btn end-btn--profile" onclick="window.location.hash='#profile'">
          Min profil
        </button>
      </div>
    </section>`;
}

// 7.14) Slutning 2
function loadScenarioEndPage2(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-end">
      <header class="end-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}-${num}-quiz'">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img class="end-hero" src="img/hjerneide - Copy.png" alt="Slutning illustration"/>
        <h2>Selv .dk-domæner kan være scams.</h2>
        <p>At undersøge URL’en og google siden er første skridt mod god digital sikkerhed</p>
        <p class="badge-text"><strong>Optjent badge:</strong> URL-Sheriff</p>
      </header>
      <div class="end-buttons">
        <button class="end-btn end-btn--scenario" onclick="window.location.hash='#${page.slug}'">
          Prøv et andet scenarie
        </button>
        <button class="end-btn end-btn--profile" onclick="window.location.hash='#profile'">
          Min profil
        </button>
      </div>
    </section>`;
}

// 7.15) Slutning 3
function loadScenarioEndPage3(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-end">
      <header class="end-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}-${num}-quiz'">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img class="end-hero" src="img/hjerneide - Copy.png" alt="Slutning illustration"/>
        <h2>Selv .dk-domæner kan være scams.</h2>
        <p>At kontakte butikken direkte er en klog måde at tjekke troværdigheden af kampagner på.</p>
      </header>
      <div class="end-buttons">
        <button class="end-btn end-btn--scenario" onclick="window.location.hash='#${page.slug}'">
          Prøv et andet scenarie
        </button>
        <button class="end-btn end-btn--profile" onclick="window.location.hash='#profile'">
          Min profil
        </button>
      </div>
    </section>`;
}

// 7.16) Slutning 4
function loadScenarioEndPage4(page, idx) {
  const num = idx + 1;
  contentContainer.innerHTML = `
    <section class="scenario-end">
      <header class="end-header">
        <div class="back-btn" onclick="window.location.hash='#${page.slug}-${num}-quiz'">
          <i class="fa-solid fa-arrow-left"></i><span>Tilbage</span>
        </div>
        <img class="end-hero" src="img/hjerneforvirret.png" alt="Forvirret hjerne illustration"/>
        <h2>Usikker, men heldig</h2>
        <p>Du slap uden skader, men lærte ikke noget nyt om, hvordan man spotter scams.</p>
      </header>
      <div class="end-buttons">
        <button class="end-btn end-btn--scenario" onclick="window.location.hash='#${page.slug}'">
          Prøv et andet scenarie
        </button>
        <button class="end-btn end-btn--profile" onclick="window.location.hash='#profile'">
          Min profil
        </button>
      </div>
    </section>`;
}