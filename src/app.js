import { jobs, candidates, plans, defaultState } from './data.js'
import {
  currentPath,
  escapeHTML,
  formatCurrency,
  initials,
  normalizeCardNumber,
  normalizeExpiry,
  queryParams,
  splitLines
} from './utils.js'

const STORAGE_KEY = 'boraestagio-mvp-state-v1'
const app = document.querySelector('#app')
const toastRegion = document.querySelector('#toast-region')
let lastDialogTrigger = null
let firstRender = true

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function displayJobTitle(value) {
  return escapeHTML(value).replace(/front-end/gi, (term) => term.replace('-', '&#8209;'))
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved) return clone(defaultState)
    return {
      ...clone(defaultState),
      ...saved,
      company: { ...defaultState.company, ...(saved.company || {}) },
      student: { ...defaultState.student, ...(saved.student || {}) },
      jobDraft: { ...defaultState.jobDraft, ...(saved.jobDraft || {}) }
    }
  } catch {
    return clone(defaultState)
  }
}

let state = loadState()

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function updateState(patch) {
  state = { ...state, ...patch }
  persist()
}

function resetState() {
  state = clone(defaultState)
  persist()
}

function navigate(path) {
  if (window.location.hash === `#${path}`) {
    render()
    return
  }
  window.location.hash = path
}

function icon(name, size = 20, className = '') {
  const paths = {
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="m19 12-14 0M11 18l-6-6 6-6"/>',
    graduation: '<path d="m2 10 10-5 10 5-10 5L2 10Z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
    building: '<path d="M3 21h18M6 21V5l6-3 6 3v16M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    map: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    chevronDown: '<path d="m7 9 5 5 5-5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
    filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    file: '<path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
    chart: '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    wallet: '<path d="M3 6h15a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6Z"/><path d="M3 6V5a2 2 0 0 1 2-2h12v3M15 12h7v4h-7a2 2 0 1 1 0-4Z"/>',
    creditCard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M10.3 3.8 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    star: '<path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17.3l-6.3 3.2L7 13.7 2 8.9 9 8l3-6Z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    route: '<circle cx="5" cy="18" r="2.2"/><path d="M7.2 18h3.3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3H21"/><path d="m18 3 3 3-3 3"/>',
    sliders: '<path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h9M17 18h3"/><circle cx="13" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="18" r="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M10 17l5-5-5-5M15 12H3M15 4h5v16h-5"/>',
    external: '<path d="M14 3h7v7M10 14 21 3M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.8 2.8 0 1 1 4 2.5c-1 .5-1.5 1.2-1.5 2.5M12 17h.01"/>'
  }
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`
}

function logo() {
  return `<span class="brand" aria-label="BoraEstágio">
    <svg class="brand-symbol" width="42" height="42" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path class="brand-route" d="M9 35h10c4.4 0 8-3.6 8-8v-7c0-4.4 3.6-8 8-8h6" />
      <path class="brand-arrow" d="m36 6 6 6-6 6" />
      <circle class="brand-start" cx="9" cy="35" r="5.5" />
    </svg>
    <span class="brand-name"><b>bora</b><span>estágio</span></span>
  </span>`
}

function header(active = '') {
  return `
    <header class="site-header">
      <div class="header-inner">
        <a href="#/" class="brand-link" aria-label="BoraEstágio — início">${logo()}</a>
        <nav class="desktop-nav" aria-label="Navegação principal">
          <a href="#/vagas" ${active === 'jobs' ? 'aria-current="page"' : ''}>Vagas</a>
          <a href="#/empresa/cadastro" ${active === 'company' ? 'aria-current="page"' : ''}>Para empresas</a>
          <button class="nav-text-button" type="button" data-scroll-target="como-funciona">Como funciona</button>
        </nav>
        <div class="header-actions">
          <a href="#/entrar" class="button button-ghost button-sm">Entrar</a>
          <a href="#/estudante/cadastro" class="button button-primary button-sm desktop-only">Criar perfil</a>
          <button class="menu-button" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menu">${icon('menu')}</button>
        </div>
      </div>
      <div class="mobile-menu" id="mobile-menu" hidden>
        <a href="#/vagas">Explorar vagas</a>
        <a href="#/empresa/cadastro">Publicar uma vaga</a>
        <a href="#/estudante/cadastro">Criar perfil</a>
        <a href="#/entrar">Entrar</a>
      </div>
    </header>`
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          ${logo()}
          <p>Primeiras oportunidades com mais clareza para quem começa e para quem contrata.</p>
        </div>
        <div class="footer-links">
          <div><strong>Produto</strong><a href="#/vagas">Vagas</a><a href="#/empresa/cadastro">Para empresas</a></div>
          <div><strong>Confiança</strong><a href="#/privacidade">Privacidade</a><a href="#/acessibilidade">Acessibilidade</a></div>
          <div><strong>Projeto</strong><button type="button" data-reset-demo>Reiniciar demonstração</button><span>Protótipo navegável</span></div>
        </div>
      </div>
      <div class="footer-bottom"><span>© 2026 BoraEstágio</span><span>Dados e empresas apresentados são fictícios.</span></div>
    </footer>`
}

function shell(content, { active = '', footerVisible = false, bodyClass = '' } = {}) {
  return `${header(active)}<main id="conteudo" tabindex="-1" class="${bodyClass}">${content}</main>${footerVisible ? footer() : ''}`
}

function pageTop(eyebrow, title, description, backRoute = null) {
  return `<div class="page-top container">
    ${backRoute ? `<a class="back-link" href="#${backRoute}">${icon('arrowLeft', 18)} Voltar</a>` : ''}
    <p class="eyebrow">${escapeHTML(eyebrow)}</p>
    <h1>${title}</h1>
    <p class="page-lead">${description}</p>
  </div>`
}

function stepper(current, steps) {
  return `<ol class="stepper" aria-label="Progresso do fluxo">
    ${steps.map((step, index) => {
      const number = index + 1
      const status = number < current ? 'complete' : number === current ? 'current' : ''
      return `<li class="${status}" ${number === current ? 'aria-current="step"' : ''}>
        <span class="step-number">${number < current ? icon('check', 15) : number}</span>
        <span>${escapeHTML(step)}</span>
      </li>`
    }).join('')}
  </ol>`
}

function field({ id, label, value = '', type = 'text', placeholder = '', required = false, hint = '', autocomplete = '', inputmode = '' }) {
  return `<div class="field">
    <label for="${id}">${escapeHTML(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <input id="${id}" name="${id}" type="${type}" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" ${required ? 'required' : ''} ${autocomplete ? `autocomplete="${autocomplete}"` : ''} ${inputmode ? `inputmode="${inputmode}"` : ''} ${hint ? `aria-describedby="${id}-hint"` : ''} />
    ${hint ? `<small id="${id}-hint">${escapeHTML(hint)}</small>` : ''}
  </div>`
}

function selectField({ id, label, value = '', options = [], required = false, hint = '' }) {
  return `<div class="field">
    <label for="${id}">${escapeHTML(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <div class="select-wrap">
      <select id="${id}" name="${id}" ${required ? 'required' : ''} ${hint ? `aria-describedby="${id}-hint"` : ''}>
        ${options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option
          return `<option value="${escapeHTML(item.value)}" ${item.value === value ? 'selected' : ''}>${escapeHTML(item.label)}</option>`
        }).join('')}
      </select>${icon('chevronDown', 18)}
    </div>
    ${hint ? `<small id="${id}-hint">${escapeHTML(hint)}</small>` : ''}
  </div>`
}

function textArea({ id, label, value = '', placeholder = '', required = false, hint = '', rows = 5 }) {
  return `<div class="field">
    <label for="${id}">${escapeHTML(label)}${required ? ' <span aria-hidden="true">*</span>' : ''}</label>
    <textarea id="${id}" name="${id}" rows="${rows}" placeholder="${escapeHTML(placeholder)}" ${required ? 'required' : ''} ${hint ? `aria-describedby="${id}-hint"` : ''}>${escapeHTML(value)}</textarea>
    ${hint ? `<small id="${id}-hint">${escapeHTML(hint)}</small>` : ''}
  </div>`
}

function checkbox({ id, label, checked = false, description = '', required = false }) {
  return `<label class="check-control" for="${id}">
    <input id="${id}" name="${id}" type="checkbox" ${checked ? 'checked' : ''} ${required ? 'required' : ''} />
    <span class="check-box">${icon('check', 14)}</span>
    <span><strong>${label}</strong>${description ? `<small>${description}</small>` : ''}</span>
  </label>`
}

function jobCard(job, featured = false) {
  const saved = state.savedJobs.includes(job.id)
  return `<article class="job-card ${featured ? 'job-card-featured' : ''}" data-job-card data-search="${escapeHTML(`${job.title} ${job.company} ${job.area}`.toLowerCase())}" data-mode="${escapeHTML(job.mode)}" data-area="${escapeHTML(job.area)}">
    <div class="job-card-top">
      <span class="company-avatar">${escapeHTML(job.initials)}</span>
      <button class="icon-button save-button ${saved ? 'is-saved' : ''}" type="button" data-save-job="${job.id}" aria-label="${saved ? 'Remover vaga dos salvos' : 'Salvar vaga'}">${icon('bookmark', 20)}</button>
    </div>
    <div>
      <p class="job-company">${escapeHTML(job.company)}</p>
      <h2><a href="#/vagas/${job.id}" data-select-job="${job.id}">${displayJobTitle(job.title)}</a></h2>
      <p class="job-summary">${escapeHTML(job.summary)}</p>
    </div>
    <div class="job-meta">
      <span>${icon('map', 16)} ${escapeHTML(job.location)}</span>
      <span>${icon('briefcase', 16)} ${escapeHTML(job.mode)}</span>
      <span>${icon('wallet', 16)} ${escapeHTML(job.salary)}</span>
    </div>
    <div class="job-card-footer">
      <div><span class="tag tag-soft">${escapeHTML(job.type)}</span><span class="tag tag-outline">${escapeHTML(job.area)}</span></div>
      <span class="posted">${escapeHTML(job.posted)}</span>
    </div>
  </article>`
}

function landingPage() {
  return shell(`
    <section class="hero">
      <div class="hero-margin" aria-hidden="true"><b>01</b><i></i><span>primeiro movimento</span></div>
      <div class="container hero-grid">
        <div class="hero-copy" data-reveal>
          <span class="hero-kicker"><span>Começo de carreira</span> estágio + júnior</span>
          <h1>Seu começo já é <em>movimento.</em></h1>
          <p>Transforme curso, projetos e vontade de aprender em uma rota possível. Encontre oportunidades claras — ou abra a porta para quem está chegando.</p>
          <div class="role-actions" aria-label="Escolha seu objetivo">
            <a href="#/estudante/cadastro" class="role-card role-student" data-role="student">
              <span class="role-index">01</span>
              <span class="role-icon">${icon('graduation', 27)}</span>
              <span><strong>Quero dar meu próximo passo</strong><small>Crie seu perfil e candidate-se gratuitamente</small></span>
              ${icon('arrowRight', 21)}
            </a>
            <a href="#/empresa/cadastro" class="role-card role-company" data-role="company">
              <span class="role-index">02</span>
              <span class="role-icon">${icon('building', 27)}</span>
              <span><strong>Quero abrir uma oportunidade</strong><small>Publique sua primeira vaga sem custo</small></span>
              ${icon('arrowRight', 21)}
            </a>
          </div>
          <p class="hero-note">${icon('shield', 18)} Candidaturas são sempre gratuitas. Nenhuma compra aumenta a chance de aprovação.</p>
        </div>
        <figure class="hero-story" data-reveal data-reveal-delay="1">
          <div class="start-map" aria-hidden="true">
            <span class="vector-tab">mapa do começo</span>
            <span class="map-coordinate">rota 01 · em construção</span>
            <svg class="start-map-route" viewBox="0 0 520 350" preserveAspectRatio="none" focusable="false">
              <path class="map-route-guide" d="M64 276C146 276 132 112 248 112s96 128 208 128" />
              <path class="map-route-progress" pathLength="1" d="M64 276C146 276 132 112 248 112s96 128 208 128" />
              <circle class="map-route-origin" cx="64" cy="276" r="8" />
              <path class="map-route-arrow" d="m442 228 14 12-14 12" />
            </svg>
            <div class="map-stop map-stop-course">
              <span class="map-stop-index">01</span><span class="map-stop-icon">${icon('graduation', 22)}</span>
              <strong>Curso</strong><small>repertório em construção</small>
            </div>
            <div class="map-stop map-stop-project">
              <span class="map-stop-index">02</span><span class="map-stop-icon project">${icon('file', 22)}</span>
              <strong>Projetos</strong><small>evidência do que você já faz</small>
            </div>
            <div class="map-stop map-stop-role">
              <span class="map-stop-index">03</span><span class="map-stop-icon role">${icon('briefcase', 22)}</span>
              <strong>Primeira oportunidade</strong><small>um próximo passo possível</small>
            </div>
            <span class="map-live"><i></i> percurso em movimento</span>
          </div>
          <figcaption>
            <span>O ponto de partida</span>
            <strong>Curso, projetos e repertório já formam uma rota possível.</strong>
          </figcaption>
          <div class="hero-dossier" aria-label="Exemplos do que forma um perfil">
            <span>perfil em construção</span>
            <p><b>curso</b><i></i><b>projetos</b><i></i><b>repertório</b></p>
          </div>
          <p class="vector-credit">Ilustração vetorial própria · sem imagem de banco</p>
        </figure>
      </div>
    </section>

    <section class="trust-strip" aria-label="Compromissos da plataforma">
      <div class="container trust-grid">
        <div><b>01</b>${icon('checkCircle', 20)} <span><strong>Gratuito para estudantes</strong><small>Do perfil à candidatura</small></span></div>
        <div><b>02</b>${icon('eye', 20)} <span><strong>Aderência com explicação</strong><small>Orientação, não sentença</small></span></div>
        <div><b>03</b>${icon('building', 20)} <span><strong>Primeira vaga sem custo</strong><small>A empresa evolui se precisar</small></span></div>
      </div>
    </section>

    <section class="how-section" id="como-funciona">
      <div class="container">
        <div class="section-heading" data-reveal><div><p class="eyebrow">O caminho, sem mistério</p><h2>Três passos. Cada um mostra o que vem depois.</h2></div><p>A plataforma reduz o atrito sem esconder critérios, condições ou escolhas comerciais.</p></div>
        <div class="journey-tabs" role="tablist" aria-label="Fluxos da plataforma">
          <button type="button" class="journey-tab is-active" role="tab" aria-selected="true" data-journey="student">Para estudantes</button>
          <button type="button" class="journey-tab" role="tab" aria-selected="false" data-journey="company">Para empresas</button>
        </div>
        <div class="journey-panel" data-journey-panel="student">
          <article data-reveal><span>01</span>${icon('file', 24)}<h3>Organize o que já existe</h3><p>Curso, projetos e habilidades formam um perfil que continua em construção.</p></article>
          <article data-reveal data-reveal-delay="1"><span>02</span>${icon('search', 24)}<h3>Leia antes de escolher</h3><p>Bolsa, formato e requisitos aparecem antes de qualquer candidatura.</p></article>
          <article data-reveal data-reveal-delay="2"><span>03</span>${icon('checkCircle', 24)}<h3>Envie sem pagar</h3><p>Revise o envio, receba confirmação e acompanhe cada processo.</p></article>
        </div>
        <div class="journey-panel" data-journey-panel="company" hidden>
          <article><span>01</span>${icon('plus', 24)}<h3>Descreva a oportunidade</h3><p>Separe o essencial do desejável e publique a primeira vaga sem custo.</p></article>
          <article><span>02</span>${icon('users', 24)}<h3>Receba pessoas, não pilhas</h3><p>Visualize perfis e acompanhe novas candidaturas com contexto.</p></article>
          <article><span>03</span>${icon('sliders', 24)}<h3>Evolua quando fizer sentido</h3><p>Compare planos somente ao precisar de filtros e funil avançado.</p></article>
        </div>
      </div>
    </section>

    <section class="career-bridge">
      <div class="container career-grid">
        <figure class="career-route-figure" data-reveal>
          <div class="career-route-board" aria-hidden="true">
            <header>
              <span>rota 02</span>
              <div><small>travessia profissional</small><strong>campus → primeiro time</strong></div>
              <span class="route-status"><i></i> em movimento</span>
            </header>
            <div class="career-route-body">
              <span class="career-route-marker"></span>
              <ol class="career-route-list">
                <li><span class="career-route-icon">${icon('graduation', 23)}</span><div><small>01 · campus</small><strong>Organize o repertório</strong><p>Curso, projetos e habilidades ganham forma.</p></div></li>
                <li><span class="career-route-icon opportunity">${icon('file', 23)}</span><div><small>02 · oportunidade</small><strong>Leia uma vaga clara</strong><p>Bolsa, rotina e requisitos aparecem antes da escolha.</p></div></li>
                <li><span class="career-route-icon team">${icon('users', 23)}</span><div><small>03 · primeiro time</small><strong>Chegue sabendo o próximo passo</strong><p>Processo, retorno e expectativas ficam visíveis.</p></div></li>
              </ol>
            </div>
            <div class="career-ticket"><span>próximo embarque</span><strong>Uma vaga com critérios honestos</strong>${icon('arrowRight', 20)}</div>
          </div>
          <figcaption>Ilustração de percurso: formação, oportunidade e primeiro time.</figcaption>
        </figure>
        <div class="career-copy" data-reveal data-reveal-delay="1">
          <p class="eyebrow">Do campus ao primeiro time</p>
          <h2>Uma boa oportunidade explica a travessia.</h2>
          <p>Para quem começa, clareza reduz ansiedade. Para quem contrata, requisitos honestos aproximam pessoas com potencial real.</p>
          <div class="notebook-list">
            <div><span>anotar</span><strong>O que a pessoa vai aprender?</strong></div>
            <div><span>confirmar</span><strong>O que é realmente obrigatório?</strong></div>
            <div><span>mostrar</span><strong>Qual é a próxima etapa?</strong></div>
          </div>
        </div>
      </div>
    </section>

    <section class="principle-section">
      <div class="container principle-grid">
        <div class="compat-board" data-reveal aria-label="Exemplo de aderência explicada de setenta por cento">
          <header><div><span>leitura de exemplo</span><small>perfil × vaga</small></div><strong>70<sup>%</sup></strong></header>
          <div class="compat-meter" aria-hidden="true"><i></i><span></span></div>
          <div class="compat-columns">
            <section><span class="compat-count found">04 encontrados</span><h3>Já aparece no perfil</h3><ul><li>HTML semântico</li><li>CSS responsivo</li><li>JavaScript básico</li><li>Git</li></ul></section>
            <section><span class="compat-count growth">02 para desenvolver</span><h3>Ainda não apareceu</h3><ul><li>Testes de interface</li><li>Design systems</li></ul></section>
          </div>
          <footer>${icon('info', 17)} <span>É uma orientação explicável — nunca uma decisão de aprovação ou reprovação.</span></footer>
        </div>
        <div data-reveal data-reveal-delay="1"><p class="eyebrow">Uma porcentagem não decide por você</p><h2>Compatibilidade com contexto.</h2><p>A BoraEstágio mostra o que foi identificado no perfil e o que ainda não apareceu. Assim, a pessoa sabe onde investir energia sem receber um rótulo definitivo.</p><ul class="check-list"><li>${icon('check', 17)} Critérios profissionais declarados</li><li>${icon('check', 17)} Sem características pessoais protegidas</li><li>${icon('check', 17)} Explicação acessível para cada resultado</li></ul></div>
      </div>
    </section>

    <section class="closing-cta"><div class="container closing-inner"><div><p class="eyebrow">Qual é o seu ponto de partida?</p><h2>Escolha o próximo movimento.</h2></div><div><a class="button button-light" href="#/estudante/cadastro">Criar perfil gratuito</a><a class="button button-outline-light" href="#/empresa/cadastro">Publicar uma vaga</a></div></div></section>
  `, { footerVisible: true })
}

function loginPage() {
  return shell(`
    <section class="auth-page">
      <div class="auth-panel auth-brand-panel">
        <a href="#/" class="auth-back">${icon('arrowLeft', 18)} Voltar ao início</a>
        <div><p class="eyebrow light">Bem-vindo de volta</p><h1>Continue de onde parou.</h1><p>Acesse candidaturas ou acompanhe seus processos de seleção.</p></div>
        <div class="auth-quote">${icon('shield', 24)}<p>Seus dados de demonstração ficam apenas neste navegador.</p></div>
      </div>
      <div class="auth-panel auth-form-panel">
        <form class="form-card compact-form" data-form="login">
          <div><p class="eyebrow">Acessar conta</p><h2>Entre na BoraEstágio</h2><p class="muted">Escolha qual área deseja acessar.</p></div>
          <fieldset class="segmented-field"><legend>Tipo de conta</legend><label><input type="radio" name="loginRole" value="student" checked><span>${icon('graduation', 18)} Estudante</span></label><label><input type="radio" name="loginRole" value="company"><span>${icon('building', 18)} Empresa</span></label></fieldset>
          ${field({ id: 'loginEmail', label: 'E-mail', type: 'email', placeholder: 'voce@email.com', required: true, autocomplete: 'email' })}
          ${field({ id: 'loginPassword', label: 'Senha', type: 'password', placeholder: 'Digite sua senha', required: true, autocomplete: 'current-password' })}
          <div class="form-inline"><label class="simple-check"><input type="checkbox" name="remember"> Lembrar de mim</label><button type="button" class="text-button" data-toast="Recuperação de senha simulada neste MVP.">Esqueci minha senha</button></div>
          <button class="button button-primary button-block" type="submit">Entrar ${icon('arrowRight', 18)}</button>
          <p class="center muted small">Ainda não tem conta? <a href="#/estudante/cadastro">Crie seu perfil</a></p>
        </form>
      </div>
    </section>
  `)
}

function companySignupPage() {
  return shell(`
    <section class="flow-page">
      <div class="container narrow-flow">
        ${stepper(1, ['Conta', 'Vaga', 'Publicação'])}
        <div class="flow-layout">
          <div>
            ${pageTop('Para empresas', 'Comece com as informações essenciais.', 'Você poderá publicar uma vaga antes de decidir se precisa de recursos pagos.', '/')}
            <form class="form-card" data-form="company-signup">
              <div class="form-section-heading"><span>01</span><div><h2>Dados da empresa</h2><p>Informações visíveis no perfil da organização.</p></div></div>
              <div class="form-grid two-columns">
                ${field({ id: 'companyName', label: 'Nome da empresa', value: state.company.name, required: true, autocomplete: 'organization' })}
                ${field({ id: 'responsible', label: 'Pessoa responsável', value: state.company.responsible, required: true, autocomplete: 'name' })}
                ${field({ id: 'companyEmail', label: 'E-mail profissional', value: state.company.email, type: 'email', required: true, autocomplete: 'email' })}
                ${field({ id: 'companyPassword', label: 'Crie uma senha', type: 'password', placeholder: 'Mínimo de 8 caracteres', required: true, autocomplete: 'new-password', hint: 'Use uma senha fictícia neste protótipo.' })}
                ${selectField({ id: 'segment', label: 'Segmento', value: state.company.segment, required: true, options: ['Tecnologia e serviços digitais', 'Educação', 'Varejo', 'Serviços profissionais', 'Outro'] })}
                ${selectField({ id: 'companySize', label: 'Tamanho da empresa', value: state.company.size, required: true, options: ['Até 10 pessoas', '11 a 50 pessoas', '51 a 200 pessoas', '201 a 500 pessoas', 'Mais de 500 pessoas'] })}
              </div>
              ${checkbox({ id: 'companyTerms', label: 'Li e aceito os Termos de Uso e a Política de Privacidade.', required: true })}
              <div class="form-actions"><a href="#/" class="button button-ghost">Cancelar</a><button class="button button-primary" type="submit">Criar conta empresarial ${icon('arrowRight', 18)}</button></div>
            </form>
          </div>
          <aside class="flow-aside">
            <div class="aside-sticky">
              <span class="aside-icon">${icon('building', 25)}</span>
              <h2>Seu primeiro passo é gratuito.</h2>
              <p>O plano inicial permite publicar uma vaga ativa e visualizar candidaturas básicas.</p>
              <ul class="check-list"><li>${icon('check', 16)} Sem cartão agora</li><li>${icon('check', 16)} Uma vaga ativa</li><li>${icon('check', 16)} Upgrade somente se precisar</li></ul>
              <div class="privacy-note">${icon('shield', 18)} <span>Dados fiscais serão solicitados apenas em uma compra.</span></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `, { active: 'company' })
}

function newJobPage() {
  const job = state.jobDraft
  return shell(`
    <section class="flow-page">
      <div class="container wide-flow">
        ${stepper(2, ['Conta', 'Vaga', 'Publicação'])}
        <div class="flow-layout form-with-summary">
          <div>
            ${pageTop('Nova oportunidade', 'Conte o necessário para uma decisão consciente.', 'Separe requisitos obrigatórios dos desejáveis e informe as condições da vaga.', '/empresa/cadastro')}
            <form class="form-card" data-form="job-create">
              <div class="form-section-heading"><span>01</span><div><h2>Sobre a oportunidade</h2><p>Como a vaga aparecerá na busca.</p></div></div>
              <div class="form-grid two-columns">
                ${field({ id: 'jobTitle', label: 'Título da vaga', value: job.title, required: true })}
                ${selectField({ id: 'jobArea', label: 'Área', value: job.area, required: true, options: ['Tecnologia', 'Dados', 'Design', 'Marketing', 'Recursos Humanos', 'Administrativo'] })}
                ${field({ id: 'jobLocation', label: 'Cidade ou região', value: job.location, required: true })}
                ${selectField({ id: 'jobMode', label: 'Modelo de trabalho', value: job.mode, required: true, options: ['Presencial', 'Híbrido', 'Remoto'] })}
                ${selectField({ id: 'jobType', label: 'Tipo da oportunidade', value: job.type, required: true, options: ['Estágio', 'Júnior'] })}
                ${field({ id: 'jobSalary', label: 'Bolsa ou faixa salarial', value: job.salary, required: true, hint: 'Transparência aumenta a qualidade da decisão.' })}
                ${field({ id: 'jobBenefits', label: 'Benefícios', value: job.benefits })}
                ${field({ id: 'jobDeadline', label: 'Prazo para candidatura', value: job.deadline, type: 'date', required: true })}
              </div>
              <div class="form-section-heading divided"><span>02</span><div><h2>Atividades e requisitos</h2><p>Use frases concretas e evite exigências que não serão usadas.</p></div></div>
              ${textArea({ id: 'jobDescription', label: 'Descrição da oportunidade', value: job.description, required: true, rows: 4 })}
              <div class="form-grid two-columns textareas">
                ${textArea({ id: 'jobRequired', label: 'Requisitos obrigatórios', value: job.required, required: true, rows: 7, hint: 'Insira um item por linha.' })}
                ${textArea({ id: 'jobDesired', label: 'Requisitos desejáveis', value: job.desired, rows: 7, hint: 'Insira um item por linha.' })}
              </div>
              <div class="form-actions"><button type="button" class="button button-ghost" data-toast="Rascunho salvo neste navegador.">Salvar rascunho</button><button class="button button-primary" type="submit">Revisar vaga ${icon('arrowRight', 18)}</button></div>
            </form>
          </div>
          <aside class="flow-aside">
            <div class="aside-sticky preview-side">
              <p class="eyebrow">Prévia rápida</p><span class="company-avatar large">${escapeHTML(initials(state.company.name))}</span>
              <p class="job-company">${escapeHTML(state.company.name)}</p><h2>${displayJobTitle(job.title)}</h2>
              <div class="job-meta vertical"><span>${icon('map', 16)} ${escapeHTML(job.location)}</span><span>${icon('briefcase', 16)} ${escapeHTML(job.mode)}</span><span>${icon('wallet', 16)} ${escapeHTML(job.salary)}</span></div>
              <div class="plan-usage"><span>Uso do plano gratuito</span><strong>0 de 1 vaga ativa</strong><div><i style="width:0%"></i></div></div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `, { active: 'company' })
}

function reviewJobPage() {
  const job = state.jobDraft
  const required = splitLines(job.required)
  const desired = splitLines(job.desired)
  return shell(`
    <section class="flow-page review-page">
      <div class="container wide-flow">
        ${stepper(3, ['Conta', 'Vaga', 'Publicação'])}
        ${pageTop('Revisão', 'Confira a vaga antes de publicar.', 'Nada será cobrado para manter a primeira oportunidade ativa.', '/empresa/vaga/nova')}
        <div class="review-layout">
          <article class="vacancy-preview">
            <div class="vacancy-title-row"><span class="company-avatar xlarge">${escapeHTML(initials(state.company.name))}</span><div><p>${escapeHTML(state.company.name)}</p><h2>${displayJobTitle(job.title)}</h2></div><span class="tag tag-soft">Prévia</span></div>
            <div class="vacancy-meta"><span>${icon('map', 17)} ${escapeHTML(job.location)}</span><span>${icon('briefcase', 17)} ${escapeHTML(job.mode)} · ${escapeHTML(job.type)}</span><span>${icon('wallet', 17)} ${escapeHTML(job.salary)}</span><span>${icon('clock', 17)} Até ${new Date(`${job.deadline}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</span></div>
            <section><h3>Sobre a oportunidade</h3><p>${escapeHTML(job.description)}</p></section>
            <section><h3>Requisitos obrigatórios</h3><ul class="requirement-list">${required.map((item) => `<li>${icon('check', 16)} ${escapeHTML(item)}</li>`).join('')}</ul></section>
            <section><h3>Será um diferencial</h3><div class="skill-row wrap">${desired.map((item) => `<span>${escapeHTML(item)}</span>`).join('')}</div></section>
            <section><h3>Benefícios</h3><p>${escapeHTML(job.benefits)}</p></section>
          </article>
          <aside class="publish-summary">
            <div class="aside-sticky">
              <div class="summary-plan"><span>Seu plano</span><strong>Grátis</strong><small>1 de 1 vaga ficará ativa</small></div>
              <label class="highlight-offer ${state.highlight ? 'is-selected' : ''}" for="highlight">
                <input type="checkbox" id="highlight" data-highlight ${state.highlight ? 'checked' : ''} />
                <span class="highlight-check">${icon('check', 15)}</span>
                <span><span class="offer-label">Opcional</span><strong>Destacar esta vaga</strong><small>Mais visibilidade no feed por 7 dias. Não garante candidaturas.</small></span>
                <b>R$ 9,90</b>
              </label>
              <div class="summary-total"><span>${state.highlight ? 'Total único' : 'Total hoje'}</span><strong>${state.highlight ? 'R$ 9,90' : 'R$ 0,00'}</strong></div>
              <button type="button" class="button button-primary button-block" data-publish-job>${state.highlight ? `Continuar com destaque ${icon('arrowRight', 18)}` : `Publicar gratuitamente ${icon('arrowRight', 18)}`}</button>
              <a class="button button-ghost button-block" href="#/empresa/vaga/nova">Voltar e editar</a>
              <p class="fine-print">O destaque não é pré-selecionado e pode ser ignorado.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `, { active: 'company' })
}

function publishedPage() {
  const job = state.jobDraft
  return shell(`
    <section class="success-page">
      <div class="success-orbit one"></div><div class="success-orbit two"></div>
      <div class="container success-container">
        <div class="success-icon">${icon('check', 34)}</div>
        <p class="eyebrow">Publicação concluída</p>
        <h1>Sua vaga está no ar.</h1>
        <p>A oportunidade já pode ser encontrada por estudantes. Você receberá uma atualização quando houver nova candidatura.</p>
        <article class="published-card">
          <div><span class="status-dot"></span><span class="tag tag-success">Ativa</span></div>
          <h2>${displayJobTitle(job.title)}</h2>
          <p>${escapeHTML(state.company.name)} · ${escapeHTML(job.location)} · ${escapeHTML(job.mode)}</p>
          <dl><div><dt>Publicada</dt><dd>Hoje, 13:52</dd></div><div><dt>Encerramento</dt><dd>${new Date(`${job.deadline}T12:00:00`).toLocaleDateString('pt-BR')}</dd></div><div><dt>Plano</dt><dd>Grátis</dd></div></dl>
        </article>
        <div class="success-actions"><a class="button button-primary" href="#/empresa/candidatos">Acessar painel ${icon('arrowRight', 18)}</a><a class="button button-secondary" href="#/vagas/frontend-horizonte">Ver vaga publicada</a></div>
        <button class="text-button share-button" type="button" data-toast="Link da vaga copiado para a área de transferência.">${icon('external', 16)} Copiar link para compartilhar</button>
      </div>
    </section>
  `, { active: 'company' })
}

function studentSignupPage() {
  const student = state.student
  return shell(`
    <section class="flow-page student-flow">
      <div class="container narrow-flow">
        ${stepper(1, ['Perfil', 'Vagas', 'Candidatura'])}
        <div class="flow-layout">
          <div>
            ${pageTop('Para estudantes', 'Crie um perfil que mostre onde você está agora.', 'Você pode atualizar tudo depois. A candidatura é gratuita do início ao fim.', '/')}
            <form class="form-card" data-form="student-signup">
              <div class="form-section-heading"><span>01</span><div><h2>Seus dados</h2><p>Informações para acesso e comunicação.</p></div></div>
              <div class="form-grid two-columns">
                ${field({ id: 'studentName', label: 'Nome completo', value: student.name, required: true, autocomplete: 'name' })}
                ${field({ id: 'studentEmail', label: 'E-mail', value: student.email, type: 'email', required: true, autocomplete: 'email' })}
                ${field({ id: 'studentPassword', label: 'Crie uma senha', type: 'password', placeholder: 'Mínimo de 8 caracteres', required: true, autocomplete: 'new-password' })}
                ${field({ id: 'studentCity', label: 'Cidade', value: student.city, required: true, autocomplete: 'address-level2' })}
              </div>
              <div class="form-section-heading divided"><span>02</span><div><h2>Formação e preferências</h2><p>Use informações atuais, sem tentar “adivinhar” o que a empresa quer.</p></div></div>
              <div class="form-grid two-columns">
                ${field({ id: 'studentCourse', label: 'Curso', value: student.course, required: true })}
                ${field({ id: 'studentInstitution', label: 'Instituição de ensino', value: student.institution, required: true })}
                ${selectField({ id: 'studentSemester', label: 'Semestre', value: student.semester, required: true, options: ['1º semestre', '2º semestre', '3º semestre', '4º semestre', '5º semestre', '6º semestre', '7º semestre', '8º semestre'] })}
                ${selectField({ id: 'studentWorkMode', label: 'Preferência de trabalho', value: student.workMode, required: true, options: ['Presencial', 'Híbrido', 'Remoto', 'Híbrido ou remoto', 'Sem preferência'] })}
              </div>
              ${textArea({ id: 'studentSkills', label: 'Habilidades', value: student.skills, required: true, rows: 3, hint: 'Separe por vírgulas. Você poderá editar depois.' })}
              <div class="field"><label for="studentCv">Currículo</label><label class="upload-box" for="studentCv">${icon('upload', 23)}<span><strong>${escapeHTML(student.cvName)}</strong><small>PDF de até 5 MB · clique para trocar</small></span></label><input class="visually-hidden" id="studentCv" name="studentCv" type="file" accept="application/pdf" data-file-input /></div>
              ${checkbox({ id: 'studentTerms', label: 'Li e aceito os Termos de Uso e a Política de Privacidade.', required: true })}
              <div class="form-actions"><a href="#/" class="button button-ghost">Cancelar</a><button class="button button-primary" type="submit">Salvar perfil e ver vagas ${icon('arrowRight', 18)}</button></div>
            </form>
          </div>
          <aside class="flow-aside"><div class="aside-sticky student-aside"><span class="aside-icon">${icon('graduation', 25)}</span><h2>Você controla seu perfil.</h2><p>O conteúdo é usado para facilitar candidaturas e explicar aderência às vagas.</p><ul class="check-list"><li>${icon('check', 16)} Candidatura sem cobrança</li><li>${icon('check', 16)} Perfil editável</li><li>${icon('check', 16)} Critérios profissionais</li></ul><div class="privacy-note">${icon('shield', 18)} <span>Serviços pagos não mudam sua posição na seleção.</span></div></div></aside>
        </div>
      </div>
    </section>
  `, { active: 'jobs' })
}

function jobsPage() {
  return shell(`
    <section class="jobs-hero"><div class="container"><p class="eyebrow light">Oportunidades abertas</p><h1>Encontre uma vaga que combine com seu momento.</h1><form class="job-search" role="search" data-job-filter-form>${icon('search', 22)}<label class="visually-hidden" for="jobSearch">Buscar vagas</label><input id="jobSearch" data-job-search type="search" placeholder="Cargo, habilidade ou empresa"><button class="button button-accent" type="submit">Buscar</button></form><p class="search-helper">Experimente: “front-end”, “dados” ou “remoto”</p></div></section>
    <section class="jobs-content"><div class="container jobs-layout">
      <aside class="filter-panel" aria-label="Filtros de vagas"><div class="filter-title"><h2>${icon('filter', 19)} Filtros</h2><button type="button" class="text-button" data-clear-filters>Limpar</button></div>
        ${selectField({ id: 'filterArea', label: 'Área', options: [{ value: '', label: 'Todas as áreas' }, 'Tecnologia', 'Dados', 'Design', 'Marketing', 'Recursos Humanos'], value: '' })}
        ${selectField({ id: 'filterMode', label: 'Modelo de trabalho', options: [{ value: '', label: 'Todos os modelos' }, 'Presencial', 'Híbrido', 'Remoto'], value: '' })}
        <fieldset class="filter-checks"><legend>Tipo de oportunidade</legend><label><input type="checkbox" checked data-type-filter="Estágio"> Estágio</label><label><input type="checkbox" checked data-type-filter="Júnior"> Júnior</label></fieldset>
        <div class="filter-tip">${icon('info', 18)}<p>As condições e os requisitos aparecem antes da candidatura.</p></div>
      </aside>
      <div class="job-results"><div class="results-head"><div><p><strong data-job-count>${jobs.length}</strong> oportunidades encontradas</p><small>Ordenadas por publicação mais recente</small></div><button class="button button-secondary filter-mobile" type="button" data-toast="Os filtros estão disponíveis logo abaixo da busca.">${icon('filter', 18)} Filtrar</button></div>
        <div class="job-grid">${jobs.map((job, index) => jobCard(job, index === 0)).join('')}</div>
        <div class="empty-results" data-empty-results hidden>${icon('search', 30)}<h2>Nenhuma vaga encontrada</h2><p>Remova um filtro ou tente uma busca mais ampla.</p><button type="button" class="button button-secondary" data-clear-filters>Limpar filtros</button></div>
      </div>
    </div></section>
  `, { active: 'jobs', footerVisible: true })
}

function jobDetailPage(id) {
  const job = jobs.find((item) => item.id === id) || jobs[0]
  const saved = state.savedJobs.includes(job.id)
  return shell(`
    <section class="detail-hero"><div class="container"><a class="back-link light-link" href="#/vagas">${icon('arrowLeft', 18)} Voltar para vagas</a><div class="detail-title"><span class="company-avatar xlarge light-avatar">${escapeHTML(job.initials)}</span><div><p>${escapeHTML(job.company)}</p><h1>${displayJobTitle(job.title)}</h1><div class="detail-meta"><span>${icon('map', 17)} ${escapeHTML(job.location)}</span><span>${icon('briefcase', 17)} ${escapeHTML(job.mode)} · ${escapeHTML(job.type)}</span><span>${icon('wallet', 17)} ${escapeHTML(job.salary)}</span></div></div><button class="save-detail ${saved ? 'is-saved' : ''}" type="button" data-save-job="${job.id}">${icon('bookmark', 19)} ${saved ? 'Salva' : 'Salvar'}</button></div></div></section>
    <section class="detail-content"><div class="container detail-layout"><article class="detail-main">
      <section><h2>Sobre a oportunidade</h2><p>${escapeHTML(job.description)}</p></section>
      <section><h2>O que você fará</h2><ul class="bullet-list">${job.activities.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></section>
      <section><h2>Requisitos obrigatórios</h2><p class="section-note">Os itens abaixo são usados na análise inicial da vaga.</p><ul class="requirement-list detailed">${job.required.map((item, index) => `<li class="${index < job.matched.length ? 'matched' : ''}"><span>${index < job.matched.length ? icon('check', 16) : icon('target', 16)}</span><div><strong>${escapeHTML(item)}</strong><small>${index < job.matched.length ? 'Identificado no seu perfil' : 'Ainda não identificado no perfil'}</small></div></li>`).join('')}</ul></section>
      <section><h2>Será um diferencial</h2><div class="skill-row wrap">${job.desired.map((item) => `<span>${escapeHTML(item)}</span>`).join('')}</div></section>
      <section><h2>Benefícios</h2><ul class="inline-benefits">${job.benefits.map((item) => `<li>${icon('checkCircle', 17)} ${escapeHTML(item)}</li>`).join('')}</ul></section>
      <div class="matching-note">${icon('info', 20)}<div><strong>A compatibilidade completa aparece após o envio.</strong><p>Ela serve como orientação e não garante aprovação ou reprovação.</p></div></div>
    </article><aside class="apply-card"><div class="aside-sticky"><p class="eyebrow">Resumo</p><dl><div><dt>Bolsa</dt><dd>${escapeHTML(job.salary)}</dd></div><div><dt>Modelo</dt><dd>${escapeHTML(job.mode)}</dd></div><div><dt>Prazo</dt><dd>${escapeHTML(job.deadline)}</dd></div></dl><a class="button button-primary button-block" href="#/candidatura/revisao" data-select-job="${job.id}">Candidatar-me gratuitamente ${icon('arrowRight', 18)}</a><button class="button button-ghost button-block" type="button" data-save-job="${job.id}">${icon('bookmark', 18)} ${saved ? 'Remover dos salvos' : 'Salvar vaga'}</button><p class="fine-print">Nenhum pagamento será solicitado para concluir a candidatura.</p></div></aside></div></section>
  `, { active: 'jobs', footerVisible: true })
}

function applicationReviewPage() {
  const job = jobs.find((item) => item.id === state.selectedJobId) || jobs[0]
  return shell(`
    <section class="flow-page application-flow"><div class="container narrow-flow">${stepper(3, ['Perfil', 'Vagas', 'Candidatura'])}
      ${pageTop('Revisão final', 'Confira antes de enviar.', 'A empresa receberá este currículo e o resumo do seu perfil.', `/vagas/${job.id}`)}
      <div class="application-layout"><form class="form-card" data-form="application-review">
        <div class="application-job"><span class="company-avatar large">${escapeHTML(job.initials)}</span><div><p>${escapeHTML(job.company)}</p><h2>${displayJobTitle(job.title)}</h2><small>${escapeHTML(job.location)} · ${escapeHTML(job.mode)}</small></div><a href="#/vagas/${job.id}">Ver vaga</a></div>
        <section class="review-section"><div class="section-title-row"><div><span class="number-chip">01</span><h3>Currículo</h3></div><button type="button" class="text-button" data-toast="Use a edição do perfil para trocar o arquivo.">${icon('edit', 16)} Trocar</button></div><div class="file-card">${icon('file', 22)}<span><strong>${escapeHTML(state.student.cvName)}</strong><small>PDF · pronto para envio</small></span><span class="tag tag-success">Selecionado</span></div></section>
        <section class="review-section"><div class="section-title-row"><div><span class="number-chip">02</span><h3>Resumo do perfil</h3></div><a href="#/estudante/cadastro" class="text-button">${icon('edit', 16)} Editar</a></div><dl class="profile-summary"><div><dt>Formação</dt><dd>${escapeHTML(state.student.course)}</dd></div><div><dt>Instituição</dt><dd>${escapeHTML(state.student.institution)}</dd></div><div><dt>Semestre</dt><dd>${escapeHTML(state.student.semester)}</dd></div><div><dt>Preferência</dt><dd>${escapeHTML(state.student.workMode)}</dd></div></dl><div class="skill-row wrap">${state.student.skills.split(',').map((skill) => `<span>${escapeHTML(skill.trim())}</span>`).join('')}</div></section>
        <section class="review-section"><div class="section-title-row"><div><span class="number-chip">03</span><h3>Mensagem opcional</h3></div></div>${textArea({ id: 'applicationMessage', label: 'Mensagem para a empresa', value: state.applicationMessage, rows: 4, hint: 'Evite informações pessoais sensíveis.' })}</section>
        <div class="free-confirmation">${icon('shield', 20)}<div><strong>Nenhum pagamento é necessário.</strong><p>Sua candidatura e o acompanhamento são gratuitos.</p></div></div>
        ${checkbox({ id: 'applicationConsent', label: 'Confirmo que as informações estão corretas e autorizo o envio para esta empresa.', required: true })}
        <div class="form-actions"><a class="button button-ghost" href="#/vagas/${job.id}">Voltar</a><button class="button button-primary" type="submit">Confirmar candidatura ${icon('arrowRight', 18)}</button></div>
      </form><aside class="flow-aside"><div class="aside-sticky"><p class="eyebrow">Antes de enviar</p><h2>Você continua no controle.</h2><ul class="check-list"><li>${icon('check', 16)} Revise o currículo</li><li>${icon('check', 16)} Confira a empresa</li><li>${icon('check', 16)} Acompanhe o status depois</li></ul><p class="fine-print">O envio não garante entrevista ou contratação.</p></div></aside></div>
    </div></section>
  `, { active: 'jobs' })
}

function applicationSuccessPage() {
  const job = jobs.find((item) => item.id === state.selectedJobId) || jobs[0]
  return shell(`
    <section class="application-success"><div class="container success-grid">
      <div class="success-copy"><div class="success-icon">${icon('check', 34)}</div><p class="eyebrow">Candidatura concluída</p><h1>Pronto, ${escapeHTML(state.student.name.split(' ')[0])}. Seu perfil foi enviado.</h1><p>A ${escapeHTML(job.company)} recebeu sua candidatura para <strong>${displayJobTitle(job.title)}</strong>.</p><div class="next-steps"><h2>O que acontece agora</h2><ol><li><span>1</span><div><strong>A empresa analisa o perfil</strong><small>O status inicial já está disponível.</small></div></li><li><span>2</span><div><strong>Você recebe atualizações</strong><small>Alterações serão mostradas no painel e por e-mail.</small></div></li><li><span>3</span><div><strong>Uma entrevista pode ser solicitada</strong><small>A decisão continua sendo da empresa.</small></div></li></ol></div><div class="success-actions left"><a class="button button-primary" href="#/minhas-candidaturas">Acompanhar candidatura ${icon('arrowRight', 18)}</a><a class="button button-secondary" href="#/vagas">Explorar outras vagas</a></div></div>
      <aside class="match-panel"><div class="match-score"><div class="score-ring" style="--score:${job.match}"><span><strong>${job.match}%</strong><small>de aderência</small></span></div><div><p class="eyebrow">Leitura do perfil</p><h2>Você atende a parte dos requisitos informados.</h2></div></div><p class="match-disclaimer">Essa leitura orienta sua preparação. Ela não decide aprovação ou reprovação.</p><div class="match-columns"><div><h3>${icon('checkCircle', 18)} Identificado</h3><ul>${job.matched.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div><div><h3>${icon('target', 18)} Para desenvolver</h3><ul>${job.gaps.map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div></div>
        <div class="optional-services"><div class="optional-heading"><span>Opcional</span><h3>Quer se preparar para os próximos passos?</h3></div><article><span class="service-icon">${icon('route', 20)}</span><div><strong>Bora PRO</strong><p>Simulador de entrevista, revisão de currículo e mapa de gaps.</p><b>R$ 12,90/mês</b></div><button type="button" class="button button-small button-secondary" data-open-dialog="bora-pro-dialog">Conhecer</button></article><article><span class="service-icon partner">${icon('graduation', 20)}</span><div><span class="sponsored">CONTEÚDO DE PARCEIRO</span><strong>Fundamentos de testes de interface</strong><p>Curso recomendado com base no gap identificado.</p></div><button type="button" class="button button-small button-ghost" data-open-dialog="course-dialog">Ver detalhes</button></article><p class="ethical-note">${icon('shield', 16)} Comprar serviços não altera sua posição no processo seletivo.</p></div>
      </aside>
    </div></section>
    ${serviceDialogs()}
  `, { active: 'jobs' })
}

function serviceDialogs() {
  return `<dialog class="dialog" id="bora-pro-dialog" aria-labelledby="bora-pro-title"><div class="dialog-head"><span class="dialog-icon">${icon('route', 24)}</span><button type="button" class="icon-button" data-close-dialog aria-label="Fechar">${icon('x', 20)}</button></div><p class="eyebrow">Serviço opcional</p><h2 id="bora-pro-title">Bora PRO</h2><p>Ferramentas de preparação profissional por R$ 12,90 ao mês. A assinatura não influencia processos seletivos.</p><ul class="check-list"><li>${icon('check', 16)} Simulador de entrevista</li><li>${icon('check', 16)} Revisão guiada de currículo</li><li>${icon('check', 16)} Mapa de habilidades</li></ul><div class="dialog-actions"><button type="button" class="button button-ghost" data-close-dialog>Agora não</button><button type="button" class="button button-primary" data-toast="O checkout do Bora PRO está fora do fluxo principal deste MVP." data-close-dialog>Entendi</button></div></dialog>
  <dialog class="dialog" id="course-dialog" aria-labelledby="course-title"><div class="dialog-head"><span class="dialog-icon partner">${icon('graduation', 24)}</span><button type="button" class="icon-button" data-close-dialog aria-label="Fechar">${icon('x', 20)}</button></div><p class="eyebrow">Recomendação comercial</p><h2 id="course-title">Fundamentos de testes de interface</h2><p>Conteúdo oferecido por um parceiro fictício. A BoraEstágio pode receber comissão se houver compra.</p><div class="disclosure">${icon('info', 18)} Você sairia da BoraEstágio para conhecer o conteúdo. Nenhuma compra é necessária para seguir na seleção.</div><div class="dialog-actions"><button type="button" class="button button-ghost" data-close-dialog>Fechar</button><button type="button" class="button button-secondary" data-toast="Link externo desativado nesta demonstração." data-close-dialog>Conhecer parceiro ${icon('external', 16)}</button></div></dialog>`
}

function applicationsPage() {
  const job = jobs.find((item) => item.id === state.selectedJobId) || jobs[0]
  return shell(`
    <section class="dashboard-page student-dashboard"><div class="container"><div class="dashboard-head"><div><p class="eyebrow">Área do estudante</p><h1>Minhas candidaturas</h1><p>Acompanhe cada atualização sem perder o contexto da vaga.</p></div><a class="button button-primary" href="#/vagas">Encontrar novas vagas</a></div><div class="student-dashboard-grid"><aside class="profile-card"><span class="profile-avatar">${escapeHTML(initials(state.student.name))}</span><h2>${escapeHTML(state.student.name)}</h2><p>${escapeHTML(state.student.course)}</p><div class="profile-progress"><span><b>Perfil</b><b>85%</b></span><div><i style="width:85%"></i></div></div><a href="#/estudante/cadastro">Completar perfil ${icon('arrowRight', 16)}</a></aside><div class="application-list"><div class="list-toolbar"><h2>1 candidatura ativa</h2><button class="button button-secondary button-small" type="button" data-toast="Filtros de status aplicados na demonstração.">${icon('filter', 16)} Filtrar</button></div><article class="application-card"><div class="application-card-main"><span class="company-avatar large">${escapeHTML(job.initials)}</span><div><span class="tag tag-soft">Enviada</span><h3>${displayJobTitle(job.title)}</h3><p>${escapeHTML(job.company)} · ${escapeHTML(job.location)}</p><small>Enviada hoje, 13:58</small></div></div><div class="status-timeline"><div class="done"><span>${icon('check', 14)}</span><small>Candidatura enviada</small></div><i></i><div><span>2</span><small>Análise da empresa</small></div><i></i><div><span>3</span><small>Próxima etapa</small></div></div><div class="application-actions"><a href="#/vagas/${job.id}" class="button button-ghost button-small">Ver vaga</a><button type="button" class="button button-secondary button-small" data-open-dialog="status-dialog">Ver detalhes</button></div></article></div></div></div></section>
    <dialog class="dialog" id="status-dialog" aria-labelledby="status-title"><div class="dialog-head"><span class="dialog-icon">${icon('clock', 24)}</span><button type="button" class="icon-button" data-close-dialog aria-label="Fechar">${icon('x', 20)}</button></div><p class="eyebrow">Status atual</p><h2 id="status-title">Candidatura enviada</h2><p>A empresa ainda não iniciou a análise. Você receberá uma atualização quando o status mudar.</p><div class="dialog-actions"><button type="button" class="button button-primary" data-close-dialog>Entendi</button></div></dialog>
  `, { active: 'jobs' })
}

function companyDashboard(activePlan = state.planActive) {
  return `<main id="conteudo" tabindex="-1" class="company-dashboard-shell"><aside class="dashboard-sidebar"><a href="#/" class="sidebar-brand">${logo()}</a><nav aria-label="Painel da empresa"><a class="is-active" href="#/empresa/candidatos">${icon('users', 19)} Candidatos</a><a href="#/empresa/vaga/nova">${icon('briefcase', 19)} Vagas</a><button type="button" data-toast="Relatórios estarão disponíveis em uma evolução do produto.">${icon('chart', 19)} Relatórios</button><button type="button" data-toast="Configurações simuladas neste MVP.">${icon('sliders', 19)} Configurações</button></nav><div class="sidebar-account"><span class="company-avatar">${escapeHTML(initials(state.company.name))}</span><span><strong>${escapeHTML(state.company.name)}</strong><small>${activePlan ? 'Plano Start' : 'Plano Grátis'}</small></span></div></aside><div class="dashboard-main"><header class="dashboard-topbar"><button class="menu-button dashboard-menu" type="button" data-toast="Menu lateral disponível no desktop." aria-label="Abrir navegação">${icon('menu')}</button><div class="dashboard-title"><p>Estágio em Desenvolvimento Front&#8209;end</p><span class="tag tag-success"><i></i> Vaga ativa</span></div><div class="dashboard-actions"><button class="icon-button" type="button" data-toast="Nenhuma nova notificação." aria-label="Notificações">${icon('mail', 19)}</button><a class="button button-primary button-small" href="#/empresa/vaga/nova">${icon('plus', 17)} Nova vaga</a></div></header><div class="dashboard-content"><div class="dashboard-heading"><div><p class="eyebrow">Candidatos</p><h1>Organize quem chegou até aqui.</h1><p>3 candidaturas para esta vaga.</p></div><div class="plan-badge ${activePlan ? 'active' : ''}">${icon(activePlan ? 'route' : 'lock', 17)} ${activePlan ? 'Plano Start ativo' : 'Plano Grátis'}</div></div><div class="metric-grid"><article><span>${icon('users', 20)}</span><div><small>Total</small><strong>3</strong></div></article><article><span>${icon('clock', 20)}</span><div><small>Novas</small><strong>1</strong></div></article><article><span>${icon('checkCircle', 20)}</span><div><small>Em análise</small><strong>1</strong></div></article><article><span>${icon('target', 20)}</span><div><small>Entrevistas</small><strong>1</strong></div></article></div><div class="candidate-toolbar"><div class="candidate-search">${icon('search', 18)}<label class="visually-hidden" for="candidateSearch">Buscar candidatos</label><input id="candidateSearch" type="search" placeholder="Buscar por nome ou curso" data-candidate-search></div><div class="candidate-filters"><button type="button" class="button button-secondary button-small ${activePlan ? '' : 'locked-button'}" ${activePlan ? 'data-toast="Filtro de compatibilidade aplicado."' : 'data-locked-filter'}>${icon(activePlan ? 'sliders' : 'lock', 16)} Compatibilidade</button><button type="button" class="button button-secondary button-small ${activePlan ? '' : 'locked-button'}" ${activePlan ? 'data-toast="Filtro de habilidades aplicado."' : 'data-locked-filter'}>${icon(activePlan ? 'filter' : 'lock', 16)} Habilidades</button><button type="button" class="button button-secondary button-small">${icon('filter', 16)} Etapa</button></div></div><div class="candidate-table-wrap"><table class="candidate-table"><thead><tr><th scope="col">Candidato</th><th scope="col">Formação</th><th scope="col">Aderência</th><th scope="col">Etapa</th><th scope="col">Recebida</th><th scope="col"><span class="visually-hidden">Ações</span></th></tr></thead><tbody>${candidates.map((candidate, index) => `<tr data-candidate-row data-search="${escapeHTML(`${candidate.name} ${candidate.course}`.toLowerCase())}"><td><div class="candidate-person"><span class="candidate-avatar c${index + 1}">${escapeHTML(initials(candidate.name))}</span><div><strong>${escapeHTML(candidate.name)}</strong><small>${escapeHTML(candidate.location)}</small></div></div></td><td><strong>${escapeHTML(candidate.course)}</strong><small>${escapeHTML(candidate.semester)}</small></td><td><div class="mini-score"><span style="--mini-score:${candidate.match}"></span><b>${candidate.match}%</b></div></td><td><span class="stage-badge stage-${index}">${escapeHTML(candidate.stage)}</span></td><td>${escapeHTML(candidate.appliedAt)}</td><td><button type="button" class="icon-button" data-open-dialog="candidate-dialog" aria-label="Ver perfil de ${escapeHTML(candidate.name)}">${icon('eye', 18)}</button></td></tr>`).join('')}</tbody></table></div>${!activePlan ? `<div class="upgrade-inline"><span>${icon('route', 20)}</span><div><strong>Quer reduzir o trabalho de triagem?</strong><p>Compare perfis com filtros avançados e organize o funil.</p></div><a class="button button-secondary button-small" href="#/empresa/upgrade">Conhecer recursos</a></div>` : `<div class="active-plan-note">${icon('checkCircle', 19)} Filtros avançados disponíveis. Use apenas critérios profissionais relacionados à vaga.</div>`}</div></div></main>`
}

function candidateDialog() {
  const candidate = candidates[0]
  return `<dialog class="dialog candidate-dialog" id="candidate-dialog" aria-labelledby="candidate-title"><div class="dialog-head"><span class="candidate-avatar c1 large-avatar">${escapeHTML(initials(candidate.name))}</span><button type="button" class="icon-button" data-close-dialog aria-label="Fechar">${icon('x', 20)}</button></div><p class="eyebrow">Perfil do candidato</p><h2 id="candidate-title">${escapeHTML(candidate.name)}</h2><p>${escapeHTML(candidate.course)} · ${escapeHTML(candidate.semester)}</p><div class="candidate-dialog-score"><strong>${candidate.match}%</strong><span>Aderência orientativa, baseada nos requisitos declarados.</span></div><h3>Habilidades informadas</h3><div class="skill-row wrap">${candidate.skills.map((skill) => `<span>${escapeHTML(skill)}</span>`).join('')}</div><div class="dialog-actions"><button type="button" class="button button-ghost" data-close-dialog>Fechar</button><button type="button" class="button button-primary" data-toast="Candidata movida para a etapa Em análise." data-close-dialog>Mover para análise</button></div></dialog>`
}

function candidatesPage() {
  return `${companyDashboard(state.planActive)}${candidateDialog()}`
}

function upgradePage() {
  return `<div class="upgrade-page">${companyDashboard(false)}<div class="modal-layer" role="presentation"><section class="upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-title"><a href="#/empresa/candidatos" class="modal-close" aria-label="Fechar">${icon('x', 20)}</a><span class="modal-spark">${icon('route', 25)}</span><p class="eyebrow">Recurso do plano pago</p><h1 id="upgrade-title">Encontre os perfis mais relevantes com menos trabalho.</h1><p>Os filtros avançados ajudam a comparar candidaturas usando apenas critérios profissionais associados à vaga.</p><div class="upgrade-benefits"><div>${icon('sliders', 20)}<span><strong>Filtros avançados</strong><small>Habilidades, aderência e disponibilidade</small></span></div><div>${icon('users', 20)}<span><strong>Funil de candidatos</strong><small>Etapas organizadas em um só lugar</small></span></div><div>${icon('download', 20)}<span><strong>Exportação</strong><small>Dados básicos em CSV</small></span></div></div><div class="upgrade-price"><span>Planos a partir de</span><strong>R$ 29,90<small>/mês</small></strong></div><div class="modal-actions"><a class="button button-ghost" href="#/empresa/candidatos">Continuar no plano gratuito</a><a class="button button-primary" href="#/empresa/planos">Comparar planos ${icon('arrowRight', 18)}</a></div><p class="fine-print">Você pode continuar visualizando os candidatos básicos sem contratar.</p></section></div></div>`
}

function plansPage() {
  return shell(`
    <section class="pricing-page"><div class="container"><div class="pricing-heading"><a class="back-link" href="#/empresa/candidatos">${icon('arrowLeft', 18)} Voltar ao painel</a><p class="eyebrow">Planos para empresas</p><h1>Escolha pelo que você precisa agora.</h1><p>Todos os preços são mensais. Você pode continuar no plano gratuito e cancelar uma assinatura futura sem multa.</p></div><div class="pricing-grid">${plans.map((plan) => `<article class="price-card ${state.selectedPlanId === plan.id ? 'is-selected' : ''} ${plan.id === 'start' ? 'start-card' : ''}"><div class="price-top">${plan.id === 'start' ? '<span class="flow-choice">Escolhido neste fluxo</span>' : ''}<h2>${escapeHTML(plan.name)}</h2><p>${escapeHTML(plan.description)}</p><div class="price"><strong>${formatCurrency(plan.price)}</strong><span>${escapeHTML(plan.suffix)}</span></div></div><ul>${plan.features.map((feature) => `<li>${icon('check', 16)} ${escapeHTML(feature)}</li>`).join('')}${plan.limits.map((limit) => `<li class="limit">${icon('x', 16)} ${escapeHTML(limit)}</li>`).join('')}</ul>${plan.id === 'free' ? `<a class="button button-ghost button-block" href="#/empresa/candidatos">Continuar grátis</a>` : `<button class="button ${state.selectedPlanId === plan.id ? 'button-primary' : 'button-secondary'} button-block" type="button" data-select-plan="${plan.id}">${state.selectedPlanId === plan.id ? 'Plano selecionado' : `Selecionar ${escapeHTML(plan.name)}`}</button>`}</article>`).join('')}</div><div class="pricing-next"><div>${icon('shield', 20)}<span><strong>Cobrança transparente</strong><small>Valor e recorrência aparecem novamente antes da confirmação.</small></span></div><a class="button button-primary" href="#/empresa/checkout">Continuar com ${escapeHTML(plans.find((plan) => plan.id === state.selectedPlanId)?.name || 'Start')} ${icon('arrowRight', 18)}</a></div><div class="pricing-faq"><h2>Dúvidas rápidas</h2><details><summary>Posso continuar no plano gratuito?</summary><p>Sim. Uma vaga ativa e a visualização básica permanecem disponíveis.</p></details><details><summary>O plano melhora a posição de um candidato?</summary><p>Não. Os recursos organizam o trabalho da empresa, mas não alteram dados ou pontuações.</p></details><details><summary>Como funciona o cancelamento?</summary><p>O plano pode ser cancelado antes da próxima cobrança, mantendo o acesso até o fim do período pago.</p></details></div></div></section>
  `, { active: 'company', footerVisible: true })
}

function checkoutPage() {
  const params = queryParams()
  const product = params.get('product')
  const isHighlight = product === 'highlight'
  const plan = plans.find((item) => item.id === state.selectedPlanId) || plans[1]
  const price = isHighlight ? 9.9 : plan.price
  const title = isHighlight ? 'Destaque de Vaga' : `Plano ${plan.name}`
  const suffix = isHighlight ? 'pagamento único' : 'cobrança mensal'
  return shell(`
    <section class="checkout-page"><div class="container"><a class="back-link" href="#${isHighlight ? '/empresa/vaga/revisao' : '/empresa/planos'}">${icon('arrowLeft', 18)} Voltar</a><div class="checkout-heading"><p class="eyebrow">Checkout seguro · demonstração</p><h1>Revise antes de confirmar.</h1><p>Nenhuma cobrança real será realizada neste ambiente de demonstração.</p></div><div class="checkout-layout"><form class="form-card checkout-form" data-form="checkout" data-product="${isHighlight ? 'highlight' : 'plan'}"><div class="form-section-heading"><span>01</span><div><h2>Dados de pagamento</h2><p>Use apenas dados fictícios nesta demonstração.</p></div></div>${field({ id: 'cardName', label: 'Nome impresso no cartão', value: 'Rafael Mendes', required: true, autocomplete: 'cc-name' })}${field({ id: 'cardNumber', label: 'Número do cartão', value: '4242 4242 4242 4242', required: true, inputmode: 'numeric', autocomplete: 'cc-number', hint: 'Número fictício usado somente para validar o formulário.' })}<div class="form-grid two-columns narrow-columns">${field({ id: 'cardExpiry', label: 'Validade', value: '12/30', required: true, inputmode: 'numeric', autocomplete: 'cc-exp' })}${field({ id: 'cardCvc', label: 'Código de segurança', value: '123', required: true, type: 'password', inputmode: 'numeric', autocomplete: 'cc-csc' })}</div><div class="form-section-heading divided"><span>02</span><div><h2>Dados fiscais</h2><p>Usados para o comprovante da contratação.</p></div></div><div class="form-grid two-columns">${field({ id: 'billingCompany', label: 'Razão social', value: state.company.name, required: true, autocomplete: 'organization' })}${field({ id: 'billingDocument', label: 'CNPJ', value: '12.345.678/0001-90', required: true, inputmode: 'numeric' })}${field({ id: 'billingEmail', label: 'E-mail do comprovante', value: state.company.email, type: 'email', required: true, autocomplete: 'email' })}${field({ id: 'billingZip', label: 'CEP', value: '01310-100', required: true, inputmode: 'numeric', autocomplete: 'postal-code' })}</div>${checkbox({ id: 'checkoutTerms', label: isHighlight ? 'Confirmo a compra única de R$ 9,90.' : `Aceito a assinatura recorrente de ${formatCurrency(price)} por mês.`, description: isHighlight ? 'O destaque vale por sete dias e não garante candidaturas.' : 'O cancelamento pode ser feito antes da próxima cobrança.', required: true })}<button class="button button-primary button-block checkout-submit" type="submit">${isHighlight ? `Pagar ${formatCurrency(price)}` : `Assinar por ${formatCurrency(price)}/mês`} ${icon('lock', 17)}</button><p class="secure-line">${icon('shield', 16)} Ambiente demonstrativo. Nenhum dado é enviado a um processador.</p></form><aside class="order-card"><div class="aside-sticky"><p class="eyebrow">Resumo do pedido</p><div class="order-product"><span class="order-icon">${icon(isHighlight ? 'star' : 'route', 22)}</span><div><h2>${escapeHTML(title)}</h2><p>${isHighlight ? 'Mais visibilidade por sete dias' : 'Filtros avançados e funil básico'}</p></div></div><dl><div><dt>Subtotal</dt><dd>${formatCurrency(price)}</dd></div><div><dt>Impostos</dt><dd>Inclusos</dd></div><div class="order-total"><dt>Total</dt><dd>${formatCurrency(price)}</dd></div></dl><p class="billing-cycle">${icon('clock', 16)} ${escapeHTML(suffix)}${!isHighlight ? ' · próxima cobrança em 30 dias' : ''}</p><div class="cancel-note">${icon('info', 17)} ${isHighlight ? 'A compra não se renova automaticamente.' : 'Cancele antes da próxima cobrança para evitar renovação.'}</div></div></aside></div></div></section>
  `, { active: 'company' })
}

function planActivePage() {
  const plan = plans.find((item) => item.id === state.selectedPlanId) || plans[1]
  return shell(`
    <section class="activation-page"><div class="activation-top"><div class="container"><div class="success-icon light-success">${icon('check', 34)}</div><p class="eyebrow light">Assinatura concluída</p><h1>Plano ${escapeHTML(plan.name)} ativado.</h1><p>Os recursos já estão disponíveis no painel. Um comprovante demonstrativo foi associado a ${escapeHTML(state.company.email)}.</p><div class="activation-actions"><a class="button button-light" href="#/empresa/candidatos">Usar filtros avançados ${icon('arrowRight', 18)}</a><button class="button button-outline-light" type="button" data-toast="Gerenciamento de assinatura simulado neste MVP.">Gerenciar assinatura</button></div></div></div><div class="container activation-content"><div class="activation-details"><article><span>${icon('sliders', 22)}</span><div><h2>Filtros avançados</h2><p>Compatibilidade, habilidades e disponibilidade.</p></div><b>Ativo</b></article><article><span>${icon('users', 22)}</span><div><h2>Funil de candidatos</h2><p>Organize as etapas do processo.</p></div><b>Ativo</b></article><article><span>${icon('download', 22)}</span><div><h2>Exportação em CSV</h2><p>Leve os dados básicos quando precisar.</p></div><b>Ativo</b></article></div><div class="billing-card"><p class="eyebrow">Resumo da assinatura</p><dl><div><dt>Plano</dt><dd>${escapeHTML(plan.name)}</dd></div><div><dt>Valor</dt><dd>${formatCurrency(plan.price)}/mês</dd></div><div><dt>Próxima cobrança</dt><dd>23 de outubro de 2026</dd></div><div><dt>Pagamento</dt><dd>•••• 4242</dd></div></dl><p>${icon('info', 16)} Você pode cancelar antes da próxima cobrança.</p></div><div class="unlocked-preview"><div class="preview-head"><div><p class="eyebrow">Comprovação do benefício</p><h2>Os filtros antes bloqueados agora estão disponíveis.</h2></div><span class="plan-badge active">${icon('route', 17)} Plano ${escapeHTML(plan.name)} ativo</span></div><div class="unlocked-filters"><button class="filter-chip active">${icon('sliders', 16)} Aderência: 60% ou mais</button><button class="filter-chip">${icon('filter', 16)} React</button><button class="filter-chip">${icon('filter', 16)} São Paulo</button><button class="filter-chip">${icon('filter', 16)} Disponível</button></div><div class="unlocked-result"><span class="candidate-avatar c1">MC</span><div><strong>Marina Costa</strong><small>Análise e Desenvolvimento de Sistemas</small></div><span class="mini-score"><span style="--mini-score:70"></span><b>70%</b></span><span class="stage-badge stage-0">Nova candidatura</span></div></div></div></section>
  `, { active: 'company', footerVisible: true })
}

function simpleInfoPage(type) {
  const isPrivacy = type === 'privacidade'
  return shell(`<section class="simple-page"><div class="container"><a class="back-link" href="#/">${icon('arrowLeft', 18)} Voltar ao início</a><p class="eyebrow">${isPrivacy ? 'Privacidade' : 'Acessibilidade'}</p><h1>${isPrivacy ? 'Dados sob controle do usuário.' : 'Uma experiência utilizável por mais pessoas.'}</h1><p>${isPrivacy ? 'Este MVP usa apenas dados fictícios e armazena o estado da demonstração no navegador. Em um produto real, finalidade, retenção, exclusão e compartilhamento precisariam ser detalhados antes da coleta.' : 'O protótipo foi construído com estrutura semântica, contraste, foco visível, navegação por teclado e redução de movimento. Isso não substitui uma auditoria completa com tecnologias assistivas.'}</p><div class="simple-card"><h2>Compromissos desta demonstração</h2><ul class="check-list">${(isPrivacy ? ['Não coletar dados reais', 'Não usar características protegidas no matching', 'Identificar ofertas comerciais', 'Permitir reinício e limpeza do estado'] : ['Rótulos persistentes em formulários', 'Foco visível', 'Contraste de texto', 'Layout sem overflow em telas pequenas']).map((item) => `<li>${icon('check', 17)} ${item}</li>`).join('')}</ul></div></div></section>`, { footerVisible: true })
}

function notFoundPage() {
  return shell(`<section class="not-found"><div><span>404</span><h1>Essa página ainda não entrou no fluxo.</h1><p>Volte para o início ou explore as oportunidades disponíveis.</p><div><a class="button button-primary" href="#/">Ir para o início</a><a class="button button-secondary" href="#/vagas">Ver vagas</a></div></div></section>`, { footerVisible: true })
}

function getView(path) {
  if (path === '/') return landingPage()
  if (path === '/entrar') return loginPage()
  if (path === '/empresa/cadastro') return companySignupPage()
  if (path === '/empresa/vaga/nova') return newJobPage()
  if (path === '/empresa/vaga/revisao') return reviewJobPage()
  if (path === '/empresa/vaga/publicada') return publishedPage()
  if (path === '/estudante/cadastro') return studentSignupPage()
  if (path === '/vagas') return jobsPage()
  if (path.startsWith('/vagas/')) return jobDetailPage(path.split('/').pop())
  if (path === '/candidatura/revisao') return applicationReviewPage()
  if (path === '/candidatura/sucesso') return applicationSuccessPage()
  if (path === '/minhas-candidaturas') return applicationsPage()
  if (path === '/empresa/candidatos') return candidatesPage()
  if (path === '/empresa/upgrade') return upgradePage()
  if (path === '/empresa/planos') return plansPage()
  if (path === '/empresa/checkout') return checkoutPage()
  if (path === '/empresa/plano-ativo') return planActivePage()
  if (path === '/privacidade') return simpleInfoPage('privacidade')
  if (path === '/acessibilidade') return simpleInfoPage('acessibilidade')
  return notFoundPage()
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.innerHTML = `${icon('checkCircle', 18)}<span>${escapeHTML(message)}</span>`
  toastRegion.replaceChildren(toast)
  window.setTimeout(() => toast.classList.add('is-visible'), 10)
  window.setTimeout(() => toast.classList.remove('is-visible'), 3000)
}

function updateTitle(path) {
  const titles = {
    '/': 'BoraEstágio — comece por onde você quer chegar',
    '/vagas': 'Vagas abertas — BoraEstágio',
    '/empresa/planos': 'Planos para empresas — BoraEstágio',
    '/empresa/checkout': 'Checkout — BoraEstágio',
    '/candidatura/sucesso': 'Candidatura enviada — BoraEstágio'
  }
  document.title = titles[path] || 'BoraEstágio'
}

function setupReveals() {
  const items = [...document.querySelectorAll('[data-reveal]')]
  if (!items.length) return
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'))
    return
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
  items.forEach((item) => observer.observe(item))
}

function render() {
  const path = currentPath()
  app.innerHTML = getView(path)
  document.body.dataset.route = path
  document.body.dataset.designVersion = '2'
  updateTitle(path)
  if (!firstRender) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const main = document.querySelector('#conteudo')
    main?.focus({ preventScroll: true })
  }
  firstRender = false
  applyJobFilters()
  setupReveals()
}

function setFormState(form, mapping) {
  const formData = new FormData(form)
  return Object.fromEntries(Object.entries(mapping).map(([stateKey, inputName]) => [stateKey, String(formData.get(inputName) || '').trim()]))
}

function applyJobFilters() {
  const cards = [...document.querySelectorAll('[data-job-card]')]
  if (!cards.length) return
  const search = (document.querySelector('[data-job-search]')?.value || '').trim().toLowerCase()
  const area = document.querySelector('#filterArea')?.value || ''
  const mode = document.querySelector('#filterMode')?.value || ''
  const selectedTypes = [...document.querySelectorAll('[data-type-filter]:checked')].map((input) => input.dataset.typeFilter)
  let visible = 0
  cards.forEach((card) => {
    const matchesSearch = !search || card.dataset.search.includes(search)
    const matchesArea = !area || card.dataset.area === area
    const matchesMode = !mode || card.dataset.mode === mode
    const title = card.querySelector('.tag-soft')?.textContent.trim() || ''
    const matchesType = selectedTypes.includes(title)
    const show = matchesSearch && matchesArea && matchesMode && matchesType
    card.hidden = !show
    if (show) visible += 1
  })
  const count = document.querySelector('[data-job-count]')
  if (count) count.textContent = String(visible)
  const empty = document.querySelector('[data-empty-results]')
  if (empty) empty.hidden = visible !== 0
}

function clearJobFilters() {
  const search = document.querySelector('[data-job-search]')
  const area = document.querySelector('#filterArea')
  const mode = document.querySelector('#filterMode')
  if (search) search.value = ''
  if (area) area.value = ''
  if (mode) mode.value = ''
  document.querySelectorAll('[data-type-filter]').forEach((input) => { input.checked = true })
  applyJobFilters()
}

function filterCandidates() {
  const value = (document.querySelector('[data-candidate-search]')?.value || '').toLowerCase().trim()
  document.querySelectorAll('[data-candidate-row]').forEach((row) => {
    row.hidden = Boolean(value) && !row.dataset.search.includes(value)
  })
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button, a, input')
  if (!target) return

  if (target.matches('[data-role]')) {
    updateState({ role: target.dataset.role })
  }

  if (target.matches('[data-menu-toggle]')) {
    const menu = document.querySelector('#mobile-menu')
    if (menu) {
      const open = menu.hidden
      menu.hidden = !open
      target.setAttribute('aria-expanded', String(open))
      target.innerHTML = icon(open ? 'x' : 'menu')
    }
  }

  if (target.matches('[data-scroll-target]')) {
    const section = document.querySelector(`#${target.dataset.scrollTarget}`)
    if (section) section.scrollIntoView({ behavior: 'smooth' })
    else navigate('/')
  }

  if (target.matches('[data-journey]')) {
    const selected = target.dataset.journey
    document.querySelectorAll('[data-journey]').forEach((button) => {
      const active = button.dataset.journey === selected
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-selected', String(active))
    })
    document.querySelectorAll('[data-journey-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.journeyPanel !== selected
    })
  }

  if (target.matches('[data-save-job]')) {
    const id = target.dataset.saveJob
    const saved = state.savedJobs.includes(id)
    updateState({ savedJobs: saved ? state.savedJobs.filter((item) => item !== id) : [...state.savedJobs, id] })
    showToast(saved ? 'Vaga removida dos salvos.' : 'Vaga salva no seu perfil.')
    render()
  }

  if (target.matches('[data-select-job]')) {
    updateState({ selectedJobId: target.dataset.selectJob })
  }

  if (target.matches('[data-publish-job]')) {
    navigate(state.highlight ? '/empresa/checkout?product=highlight' : '/empresa/vaga/publicada')
  }

  if (target.matches('[data-locked-filter]')) {
    navigate('/empresa/upgrade')
  }

  if (target.matches('[data-select-plan]')) {
    updateState({ selectedPlanId: target.dataset.selectPlan })
    render()
  }

  if (target.matches('[data-open-dialog]')) {
    const dialog = document.querySelector(`#${target.dataset.openDialog}`)
    if (dialog) {
      lastDialogTrigger = target
      dialog.showModal()
    }
  }

  if (target.matches('[data-close-dialog]')) {
    const dialog = target.closest('dialog')
    if (dialog) dialog.close()
    lastDialogTrigger?.focus()
  }

  if (target.matches('[data-toast]')) {
    showToast(target.dataset.toast)
  }

  if (target.matches('[data-clear-filters]')) {
    clearJobFilters()
  }

  if (target.matches('[data-reset-demo]')) {
    resetState()
    showToast('Demonstração reiniciada.')
    window.setTimeout(() => navigate('/'), 300)
  }
})

document.addEventListener('change', (event) => {
  const target = event.target
  if (target.matches('[data-highlight]')) {
    updateState({ highlight: target.checked })
    render()
  }
  if (target.matches('[data-file-input]') && target.files?.[0]) {
    state.student.cvName = target.files[0].name
    persist()
    render()
  }
  if (target.matches('#filterArea, #filterMode, [data-type-filter]')) applyJobFilters()
})

document.addEventListener('input', (event) => {
  const target = event.target
  if (target.matches('[data-job-search]')) applyJobFilters()
  if (target.matches('[data-candidate-search]')) filterCandidates()
  if (target.matches('#cardNumber')) target.value = normalizeCardNumber(target.value)
  if (target.matches('#cardExpiry')) target.value = normalizeExpiry(target.value)
})

document.addEventListener('submit', (event) => {
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return
  event.preventDefault()
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }
  const type = form.dataset.form

  if (type === 'login') {
    const role = new FormData(form).get('loginRole')
    updateState({ role })
    navigate(role === 'company' ? '/empresa/candidatos' : '/minhas-candidaturas')
  }

  if (type === 'company-signup') {
    const company = setFormState(form, {
      name: 'companyName', responsible: 'responsible', email: 'companyEmail', segment: 'segment', size: 'companySize'
    })
    updateState({ role: 'company', company })
    navigate('/empresa/vaga/nova')
  }

  if (type === 'job-create') {
    const jobDraft = setFormState(form, {
      title: 'jobTitle', area: 'jobArea', location: 'jobLocation', mode: 'jobMode', type: 'jobType', salary: 'jobSalary', benefits: 'jobBenefits', deadline: 'jobDeadline', description: 'jobDescription', required: 'jobRequired', desired: 'jobDesired'
    })
    updateState({ jobDraft })
    navigate('/empresa/vaga/revisao')
  }

  if (type === 'student-signup') {
    const student = setFormState(form, {
      name: 'studentName', email: 'studentEmail', city: 'studentCity', course: 'studentCourse', institution: 'studentInstitution', semester: 'studentSemester', workMode: 'studentWorkMode', skills: 'studentSkills'
    })
    student.cvName = state.student.cvName
    updateState({ role: 'student', student })
    navigate('/vagas')
  }

  if (type === 'job-filter-form') applyJobFilters()

  if (type === 'application-review') {
    const message = new FormData(form).get('applicationMessage')
    updateState({ applicationSent: true, applicationMessage: String(message || '') })
    navigate('/candidatura/sucesso')
  }

  if (type === 'checkout') {
    if (form.dataset.product === 'highlight') {
      updateState({ highlight: true })
      showToast('Destaque simulado aprovado.')
      navigate('/empresa/vaga/publicada')
    } else {
      updateState({ planActive: true })
      navigate('/empresa/plano-ativo')
    }
  }
})

window.addEventListener('hashchange', render)
window.addEventListener('storage', () => {
  state = loadState()
  render()
})

render()
