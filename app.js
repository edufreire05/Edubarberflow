/* BarberFlow — aplicativo estático. Os dados ficam no localStorage deste navegador. */
(() => {
  'use strict';
  const KEY = 'barberflow_data_v1';
  const STEP = 30;
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const pageNames = { overview: 'Visão geral', bookings: 'Agendamentos', clients: 'Clientes', settings: 'Configurações' };
  const icons = {
    overview: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
    bookings: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3M14 15h2"/>',
    clients: '<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4.2a4 4 0 0 1 0 7.6M22 20v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1 1.5 1.2-1.8 3.1-1.9-.7a8 8 0 0 1-2.1 1.2l-.4 2h-3.6l-.4-2a8 8 0 0 1-2.1-1.2l-1.9.7L5 16.3l1.5-1.2a8 8 0 0 1 0-2.4L5 11.5l1.8-3.1 1.9.7a8 8 0 0 1 2.1-1.2l.4-2h3.6l.4 2a8 8 0 0 1 2.1 1.2l1.9-.7 1.8 3.1-1.5 1.2a8 8 0 0 1 0 2.3Z" transform="translate(0 -1) scale(.96)"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    wallet: '<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M7 6V3h11"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1 20 20M8.1 15.9 20 4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 5 5"/>',
    sparkle: '<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/>',
    chart: '<path d="M4 20V12M10 20V5M16 20v-9M22 20V8"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.sparkle}</svg>`;
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const slugDigits = value => String(value || '').replace(/\D/g, '');
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const localISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parseDate = iso => new Date(`${iso}T12:00:00`);
  const addDays = (iso, n) => { const d = parseDate(iso); d.setDate(d.getDate() + n); return localISO(d); };
  const today = () => localISO(new Date());
  const mondayOf = iso => addDays(iso, -(parseDate(iso).getDay() + 6) % 7);
  const minutes = hhmm => { const [h, m] = String(hhmm).split(':').map(Number); return h * 60 + m; };
  const hhmm = mins => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  const dateLabel = iso => parseDate(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  const safeName = name => String(name || '').trim();
  const initials = name => safeName(name).split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase() || '?';
  const money = amount => currency.format(Number(amount) || 0);
  const nowIsPast = (iso, time) => (iso < today()) || (iso === today() && minutes(time) <= new Date().getHours() * 60 + new Date().getMinutes());
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const fullDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  function demoData() {
    const base = today();
    const clients = [
      { id: 'demo-client-1', name: 'Gustavo Ferreira', phone: '(00) 90000-0001', email: '', notes: '' },
      { id: 'demo-client-2', name: 'Matheus Ribeiro', phone: '(00) 90000-0002', email: '', notes: '' },
      { id: 'demo-client-3', name: 'Pedro Henrique', phone: '(00) 90000-0003', email: '', notes: '' },
      { id: 'demo-client-4', name: 'João Vitor', phone: '(00) 90000-0004', email: '', notes: '' },
      { id: 'demo-client-5', name: 'Diego Martins', phone: '(00) 90000-0005', email: '', notes: '' },
    ];
    const booking = (id, c, b, s, dayOffset, time, status = 'confirmed') => ({ id: `demo-booking-${id}`, clientId: clients[c].id, barberId: `barber-${b + 1}`, serviceId: ['cut', 'beard', 'combo', 'fade'][s], date: addDays(base, dayOffset), time, status, notes: '' });
    return {
      demo: true,
      business: { name: 'NOVA BARBER STUDIO', opening: '09:00', closing: '19:00', days: [1, 2, 3, 4, 5, 6] },
      barbers: [{ id: 'barber-1', name: 'Rafael Costa' }, { id: 'barber-2', name: 'Lucas Almeida' }, { id: 'barber-3', name: 'André Souza' }],
      services: [{ id: 'cut', name: 'Corte clássico', duration: 30, price: 45 }, { id: 'beard', name: 'Barba premium', duration: 30, price: 35 }, { id: 'combo', name: 'Corte + barba', duration: 60, price: 75 }, { id: 'fade', name: 'Degradê', duration: 45, price: 55 }],
      clients,
      bookings: [booking(1, 0, 0, 0, -2, '10:00', 'completed'), booking(2, 1, 1, 2, -1, '14:00', 'completed'), booking(3, 0, 0, 0, 0, '10:00'), booking(4, 2, 1, 2, 0, '11:30'), booking(5, 3, 0, 1, 0, '14:00'), booking(6, 4, 2, 3, 0, '16:30'), booking(7, 1, 1, 0, 1, '09:30'), booking(8, 2, 0, 2, 1, '15:00')],
    };
  }
  function isValidStore(v) { return !!v && typeof v === 'object' && v.business && typeof v.business.name === 'string' && Array.isArray(v.business.days) && Array.isArray(v.clients) && Array.isArray(v.bookings) && Array.isArray(v.barbers) && Array.isArray(v.services); }
  function loadStore() {
    try { const raw = localStorage.getItem(KEY); if (raw) { const parsed = JSON.parse(raw); if (isValidStore(parsed)) return parsed; } } catch (err) { console.warn('Dados locais indisponíveis:', err); }
    return demoData();
  }
  let db = loadStore();
  let page = 'overview';
  let selectedDate = today();
  let weekStart = mondayOf(selectedDate);
  let selectedBarber = db.barbers[0]?.id || '';
  let selectedService = db.services[0]?.id || '';
  let bookingSearch = '', bookingStatus = 'all', bookingDateFilter = '';
  let clientSearch = '';
  let activeModal = null;

  function save() {
    db.demo = false;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { notify('Não foi possível salvar. Verifique o armazenamento do navegador.', true); console.error(e); }
    render();
  }
  function findService(id) { return db.services.find(s => s.id === id); }
  function findBarber(id) { return db.barbers.find(b => b.id === id); }
  function findClient(id) { return db.clients.find(c => c.id === id); }
  function activeBookings() { return db.bookings.filter(b => b.status !== 'cancelled'); }
  function bookingSort(a, b) { return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`); }
  function allSlots(date, barberId, serviceId, ignoreBookingId = null, allowPast = false) {
    const service = findService(serviceId);
    if (!service || !findBarber(barberId) || !db.business.days.includes(parseDate(date).getDay())) return [];
    const open = minutes(db.business.opening), close = minutes(db.business.closing);
    if (!Number.isFinite(open) || !Number.isFinite(close) || open >= close) return [];
    const out = [];
    for (let start = open; start + Number(service.duration) <= close; start += STEP) {
      const time = hhmm(start);
      const busy = db.bookings.some(b => {
        if (b.id === ignoreBookingId || b.date !== date || b.barberId !== barberId || b.status === 'cancelled') return false;
        const other = findService(b.serviceId); if (!other) return false;
        const from = minutes(b.time), to = from + Number(other.duration);
        return start < to && start + Number(service.duration) > from;
      });
      const past = nowIsPast(date, time);
      out.push({ time, busy, past, available: !busy && (!past || allowPast) });
    }
    return out;
  }
  function countForDay(date) { return activeBookings().filter(b => b.date === date).length; }
  function navHTML() {
    return Object.entries(pageNames).map(([id, name]) => `<button class="nav-btn ${page === id ? 'active' : ''}" data-action="navigate" data-page="${id}" aria-current="${page === id ? 'page' : 'false'}">${icon(id)} <span>${name}</span>${id === 'bookings' ? `<span class="nav-counter">${db.bookings.filter(b => b.status === 'confirmed').length}</span>` : ''}</button>`).join('');
  }
  function statCard(title, value, hint, iconName, tone = '') {
    return `<div class="stat-card glass"><div class="stat-header"><span>${title}</span><span class="stat-icon ${tone}">${icon(iconName)}</span></div><div class="stat-value">${value}</div><div class="stat-hint">${hint}</div></div>`;
  }
  function render() {
    $('#navigation').innerHTML = navHTML();
    $('#breadcrumb-page').textContent = pageNames[page];
    $('#topbar-date').textContent = dateFormatter.format(new Date());
    if (!db.barbers.some(b => b.id === selectedBarber)) selectedBarber = db.barbers[0]?.id || '';
    if (!db.services.some(s => s.id === selectedService)) selectedService = db.services[0]?.id || '';
    const root = $('#app');
    root.innerHTML = page === 'overview' ? renderOverview() : page === 'bookings' ? renderBookingsPage() : page === 'clients' ? renderClientsPage() : renderSettingsPage();
  }
  function renderOverview() {
    const d = today();
    const todayBookings = activeBookings().filter(b => b.date === d);
    const completedToday = todayBookings.filter(b => b.status === 'completed');
    const revenueToday = completedToday.reduce((total, b) => total + (Number(findService(b.serviceId)?.price) || 0), 0);
    const freeSlots = allSlots(d, selectedBarber, selectedService).filter(s => s.available).length;
    const firstName = escapeHTML(db.business.name);
    const day = parseDate(selectedDate);
    const weekLast = addDays(weekStart, 6);
    const range = `${parseDate(weekStart).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${parseDate(weekLast).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
    const selectedBookings = db.bookings.filter(b => b.date === selectedDate).sort(bookingSort);
    const free = allSlots(selectedDate, selectedBarber, selectedService);
    return `
      <div class="heading-row"><div><p class="overline">SEU PAINEL DE CONTROLE</p><h1 class="page-title">Visão geral <span style="color:#a18bfd">✦</span></h1><p class="page-subtitle">Tudo que você precisa para organizar seu dia, em um só lugar.</p></div><span class="status completed">Sistema ativo</span></div>
      <section class="hero"><div class="hero-content"><div class="hero-tag"><span></span> SEU ESTÚDIO EM BOAS MÃOS</div><h2>Seu dia flui melhor<br>com tudo <em>organizado.</em></h2><p>Bem-vindo ao ${firstName}. Acompanhe sua agenda, seus clientes e seus próximos atendimentos.</p></div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="float-card float-card-one"><small>AGENDADOS HOJE</small><b>${todayBookings.length.toString().padStart(2, '0')}</b></div><div class="float-card float-card-two"><small><span class="spark">✦</span> TUDO NO CONTROLE</small><b>100% digital</b></div></div></section>
      <section class="stats-grid" aria-label="Resumo do dia">
        ${statCard('Agendamentos hoje', todayBookings.length.toString().padStart(2, '0'), 'Reservas não canceladas', 'bookings')}
        ${statCard('Atendimentos feitos', completedToday.length.toString().padStart(2, '0'), 'Concluídos hoje', 'check', 'mint')}
        ${statCard('Horários livres', freeSlots.toString().padStart(2, '0'), 'Hoje · profissional selecionado', 'clock', 'orange')}
        ${statCard('Faturamento do dia', money(revenueToday), 'Serviços concluídos hoje', 'wallet', 'mint')}
      </section>
      <section class="layout-grid">
        <div class="panel glass"><div class="panel-head"><div><h2 class="panel-title">Agenda semanal</h2><p class="panel-subtitle">Selecione um dia para visualizar seus agendamentos.</p></div><div class="panel-controls"><button class="tiny-arrow" data-action="prev-week" aria-label="Semana anterior">‹</button><span class="week-label">${range}</span><button class="tiny-arrow" data-action="next-week" aria-label="Próxima semana">›</button></div></div>
          <div class="week-days">${Array.from({length: 7}, (_, i) => { const iso = addDays(weekStart, i), date = parseDate(iso); return `<button data-action="select-day" data-date="${iso}" class="day-item ${iso === selectedDate ? 'active' : ''} ${iso === d ? 'today' : ''} ${countForDay(iso) ? 'has-bookings' : ''}" aria-pressed="${iso === selectedDate}"><span class="day-name">${dayNames[date.getDay()]}</span><span class="day-num">${date.getDate()}</span><span class="day-dot"></span></button>`; }).join('')}</div>
          <div class="section-divider"></div><div class="mini-bar"><span class="small-title">${escapeHTML(fullDays[day.getDay()])}, ${day.getDate()} de ${day.toLocaleDateString('pt-BR', { month: 'long' })}</span><button class="text-link" data-action="navigate" data-page="bookings">Ver todos →</button></div>
          <div class="agenda-list">${selectedBookings.length ? selectedBookings.slice(0, 5).map(b => {
            const client = findClient(b.clientId), barber = findBarber(b.barberId), service = findService(b.serviceId);
            return `<div class="agenda-item"><span class="time-line">${escapeHTML(b.time)}</span><span class="time-marker ${b.status === 'completed' ? 'complete' : b.status === 'cancelled' ? 'cancel' : ''}"></span><div class="agenda-details"><strong>${escapeHTML(client?.name || 'Cliente removido')}</strong><small>${escapeHTML(service?.name || 'Serviço')} · ${escapeHTML(barber?.name || 'Profissional')}</small></div>${statusTag(b.status)}</div>`;
          }).join('') : `<div class="empty-state"><div class="empty-symbol">✧</div><strong>Nenhum agendamento neste dia</strong><p>Aproveite para abrir um novo horário para seus clientes.</p><button class="btn btn-ghost btn-small" data-action="new-booking" data-date="${selectedDate}">+ Novo agendamento</button></div>`}</div>
          ${selectedBookings.length > 5 ? `<button class="text-link mt-18" data-action="navigate" data-page="bookings">Ver mais ${selectedBookings.length - 5} agendamentos →</button>` : ''}
        </div>
        <div class="panel glass"><div class="panel-head"><div><h2 class="panel-title">Horários disponíveis</h2><p class="panel-subtitle">Escolha um horário para agendar rapidamente.</p></div><span class="panel-kicker">${dateLabel(selectedDate)}</span></div>
          <div class="selector-row"><div><label class="control-label" for="home-barber">Profissional</label><select id="home-barber" class="select" data-control="home-barber">${db.barbers.map(b => `<option value="${escapeHTML(b.id)}" ${selectedBarber === b.id ? 'selected' : ''}>${escapeHTML(b.name)}</option>`).join('')}</select></div><div><label class="control-label" for="home-service">Serviço</label><select id="home-service" class="select" data-control="home-service">${db.services.map(s => `<option value="${escapeHTML(s.id)}" ${selectedService === s.id ? 'selected' : ''}>${escapeHTML(s.name)}</option>`).join('')}</select></div></div>
          ${free.length ? `<div class="slot-grid">${free.map(s => `<button class="slot ${s.available ? '' : 'busy'}" data-action="choose-slot" data-time="${s.time}" ${s.available ? '' : 'disabled'} title="${s.available ? 'Reservar horário' : s.busy ? 'Ocupado' : 'Indisponível'}">${s.time}</button>`).join('')}</div><div class="slot-legend"><span><i class="legend-circle"></i> Disponível</span><span><i class="legend-circle unavailable"></i> Ocupado/indisponível</span></div>` : `<div class="empty-state"><div class="empty-symbol">◷</div><strong>Sem horários para este dia</strong><p>Verifique se o estúdio funciona nesta data, ou escolha outro dia.</p></div>`}
          <p class="hint-box">✦ Os horários levam em conta a duração do serviço, a disponibilidade do profissional e o horário de funcionamento.</p>
        </div>
      </section>
      <section class="bottom-grid"><div class="panel glass"><div class="panel-head"><div><h2 class="panel-title">Movimento dos últimos 7 dias</h2><p class="panel-subtitle">Total de agendamentos não cancelados por dia.</p></div><span class="panel-kicker">ÚLTIMA SEMANA</span></div>${chartHTML()}</div><div class="panel glass"><div class="panel-head"><div><h2 class="panel-title">Tudo em sintonia</h2><p class="panel-subtitle">Uma rotina de atendimento mais inteligente.</p></div></div><div class="feature-list"><div class="feature-item"><div class="feature-icon">${icon('bookings')}</div><div><strong>Agenda organizada</strong><small>Todos os horários em um só painel</small></div></div><div class="feature-item"><div class="feature-icon">${icon('clients')}</div><div><strong>Clientes conectados</strong><small>Informações disponíveis em segundos</small></div></div><div class="feature-item"><div class="feature-icon">${icon('clock')}</div><div><strong>Sem horários duplicados</strong><small>Conflitos detectados automaticamente</small></div></div></div></div></section>`;
  }
  function chartHTML() {
    const days = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
    const numbers = days.map(countForDay), max = Math.max(1, ...numbers);
    return `<div class="chart-wrap" role="img" aria-label="Agendamentos nos últimos 7 dias: ${numbers.join(', ')}"><div style="display:contents">${days.map((d, i) => `<div class="chart-col"><div class="chart-track"><span class="chart-bar ${d === today() ? 'current' : ''}" style="height:${Math.max(3, (numbers[i] / max) * 100)}%" data-count="${numbers[i]}"></span></div><small>${dayNames[parseDate(d).getDay()]}</small></div>`).join('')}</div></div>`;
  }
  function statusTag(status) {
    const map = { confirmed: ['confirmed', 'Confirmado'], completed: ['completed', 'Concluído'], cancelled: ['cancelled', 'Cancelado'] };
    const [cls, text] = map[status] || map.confirmed;
    return `<span class="status ${cls}">${text}</span>`;
  }
  function renderBookingsPage() {
    return `<div class="heading-row"><div><p class="overline">CONTROLE DE ATENDIMENTOS</p><h1 class="page-title">Agendamentos</h1><p class="page-subtitle">Consulte, edite, conclua e cancele horários com facilidade.</p></div><button class="btn btn-primary" data-action="new-booking">+ Novo agendamento</button></div>
      <div class="panel glass"><div class="toolbar"><div class="filter-controls"><button class="filter-pill ${bookingStatus === 'all' ? 'active' : ''}" data-action="booking-filter" data-value="all">Todos</button><button class="filter-pill ${bookingStatus === 'confirmed' ? 'active' : ''}" data-action="booking-filter" data-value="confirmed">Confirmados</button><button class="filter-pill ${bookingStatus === 'completed' ? 'active' : ''}" data-action="booking-filter" data-value="completed">Concluídos</button><button class="filter-pill ${bookingStatus === 'cancelled' ? 'active' : ''}" data-action="booking-filter" data-value="cancelled">Cancelados</button></div><div class="filter-controls"><div class="search-wrap">${icon('search')}<input class="input" id="booking-search" type="search" placeholder="Buscar cliente ou profissional" value="${escapeHTML(bookingSearch)}" aria-label="Buscar agendamentos" /></div><input class="input filter-date" type="date" id="booking-date-filter" value="${escapeHTML(bookingDateFilter)}" aria-label="Filtrar por data" title="Filtrar por data" />${bookingDateFilter ? `<button class="btn btn-small btn-secondary" data-action="clear-booking-date">Limpar</button>` : ''}</div></div><div id="bookings-results">${bookingRowsHTML()}</div></div>`;
  }
  function bookingRowsHTML() {
    const filter = bookingSearch.toLocaleLowerCase('pt-BR');
    const list = db.bookings.filter(b => {
      const content = `${findClient(b.clientId)?.name || ''} ${findBarber(b.barberId)?.name || ''} ${findService(b.serviceId)?.name || ''}`.toLocaleLowerCase('pt-BR');
      return (bookingStatus === 'all' || b.status === bookingStatus) && (!bookingDateFilter || b.date === bookingDateFilter) && content.includes(filter);
    }).sort((a, b) => bookingSort(b, a));
    if (!list.length) return emptyHTML('Nenhum agendamento encontrado', 'Tente ajustar os filtros ou crie um novo agendamento.', 'new-booking', 'Criar agendamento');
    return `<div class="table-shell"><table class="data-table"><thead><tr><th>Cliente</th><th>Data / hora</th><th>Serviço</th><th>Profissional</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>${list.map(b => { const c = findClient(b.clientId), s = findService(b.serviceId), barber = findBarber(b.barberId); return `<tr><td><div class="person-cell"><span class="avatar">${escapeHTML(initials(c?.name))}</span><div><span class="table-strong">${escapeHTML(c?.name || 'Cliente removido')}</span><div class="table-muted">${escapeHTML(c?.phone || 'Sem telefone')}</div></div></div></td><td><span class="table-strong">${dateLabel(b.date)}</span><div class="table-muted">${escapeHTML(b.time)}</div></td><td>${escapeHTML(s?.name || 'Serviço removido')}<div class="table-muted">${Number(s?.duration) || 0} min</div></td><td>${escapeHTML(barber?.name || 'Removido')}</td><td>${money(s?.price)}</td><td>${statusTag(b.status)}</td><td><div class="table-actions"><button class="action-icon" data-action="edit-booking" data-id="${escapeHTML(b.id)}" title="Editar agendamento" aria-label="Editar agendamento">✎</button>${b.status === 'confirmed' ? `<button class="action-icon" data-action="complete-booking" data-id="${escapeHTML(b.id)}" title="Marcar como concluído" aria-label="Concluir agendamento">✓</button><button class="action-icon danger" data-action="cancel-booking" data-id="${escapeHTML(b.id)}" title="Cancelar agendamento" aria-label="Cancelar agendamento">×</button>` : b.status === 'cancelled' ? `<button class="action-icon" data-action="reactivate-booking" data-id="${escapeHTML(b.id)}" title="Reativar se o horário estiver livre" aria-label="Reativar agendamento">↺</button>` : ''}<button class="action-icon danger" data-action="delete-booking" data-id="${escapeHTML(b.id)}" title="Excluir agendamento permanentemente" aria-label="Excluir agendamento">⌫</button></div></td></tr>`; }).join('')}</tbody></table></div><div class="summary-row">${list.length} agendamento(s) encontrado(s).</div>`;
  }
  function renderClientsPage() {
    return `<div class="heading-row"><div><p class="overline">SUA COMUNIDADE</p><h1 class="page-title">Clientes</h1><p class="page-subtitle">Mantenha os contatos organizados e acompanhe o histórico de visitas.</p></div><button class="btn btn-primary" data-action="new-client">+ Cadastrar cliente</button></div><div class="toolbar"><div class="search-wrap">${icon('search')}<input type="search" id="client-search" class="input" placeholder="Pesquisar nome, telefone ou e-mail" value="${escapeHTML(clientSearch)}" aria-label="Pesquisar clientes" /></div><span class="mini-label">${db.clients.length} cliente(s) cadastrados</span></div><div id="clients-results">${clientCardsHTML()}</div>`;
  }
  function clientCardsHTML() {
    const list = db.clients.filter(c => `${c.name} ${c.phone} ${c.email || ''}`.toLocaleLowerCase('pt-BR').includes(clientSearch.toLocaleLowerCase('pt-BR'))).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (!list.length) return `<div class="glass">${emptyHTML('Nenhum cliente encontrado', 'Cadastre seu primeiro cliente ou ajuste a pesquisa.', 'new-client', 'Cadastrar cliente')}</div>`;
    return `<div class="client-grid">${list.map(c => { const visits = db.bookings.filter(b => b.clientId === c.id && b.status === 'completed').length; const scheduled = db.bookings.filter(b => b.clientId === c.id && b.status === 'confirmed').length; return `<div class="glass client-card"><div class="client-card-top"><div class="avatar">${escapeHTML(initials(c.name))}</div><div><strong>${escapeHTML(c.name)}</strong><div class="client-contact">${escapeHTML(c.phone)}</div></div></div><div class="client-contact mt-12">${escapeHTML(c.email || 'Sem e-mail informado')}</div><div class="client-card-bottom"><div class="client-visits"><b>${visits}</b> concluído(s) · <b>${scheduled}</b> agendado(s)</div><div class="settings-item-actions"><button class="action-icon" data-action="edit-client" data-id="${escapeHTML(c.id)}" title="Editar cliente" aria-label="Editar cliente">✎</button><button class="action-icon danger" data-action="delete-client" data-id="${escapeHTML(c.id)}" title="Excluir cliente" aria-label="Excluir cliente">⌫</button></div></div></div>`; }).join('')}</div>`;
  }
  function emptyHTML(title, subtitle, action, label) { return `<div class="empty-state"><div class="empty-symbol">✦</div><strong>${title}</strong><p>${subtitle}</p><button class="btn btn-ghost btn-small" data-action="${action}">+ ${label}</button></div>`; }
  function renderSettingsPage() {
    return `<div class="heading-row"><div><p class="overline">PERSONALIZE SEU ESPAÇO</p><h1 class="page-title">Configurações</h1><p class="page-subtitle">Ajuste os horários, serviços e profissionais do estúdio.</p></div></div><div class="settings-grid">
      <div class="settings-card glass"><div class="panel-head"><div><h2 class="panel-title">Dados do estúdio</h2><p class="panel-subtitle">Nome e horários de atendimento.</p></div></div><form id="settings-form"><div class="form-grid"><div class="field field-full"><label for="salon-name">Nome da barbearia</label><input class="input" id="salon-name" name="salonName" required minlength="2" maxlength="80" value="${escapeHTML(db.business.name)}" /></div><div class="field"><label for="opening">Abertura</label><input type="time" class="input" id="opening" name="opening" required value="${escapeHTML(db.business.opening)}" step="1800" /></div><div class="field"><label for="closing">Fechamento</label><input type="time" class="input" id="closing" name="closing" required value="${escapeHTML(db.business.closing)}" step="1800" /></div></div><div class="field-label mt-18">Dias de funcionamento</div><div class="checkbox-days">${[1,2,3,4,5,6,0].map(n => `<label class="checkbox-day"><input type="checkbox" name="days" value="${n}" ${db.business.days.includes(n) ? 'checked' : ''} /><span>${dayNames[n]}</span></label>`).join('')}</div><button class="btn btn-primary" type="submit">Salvar configurações</button></form></div>
      <div class="settings-card glass"><div class="panel-head"><div><h2 class="panel-title">Profissionais</h2><p class="panel-subtitle">Quem atende seus clientes.</p></div><button class="btn btn-small btn-secondary" data-action="new-barber">+ Adicionar</button></div><div class="settings-list">${db.barbers.map(b => `<div class="settings-item"><div><strong>${escapeHTML(b.name)}</strong><small>Profissional</small></div><div class="settings-item-actions"><button class="action-icon" data-action="edit-barber" data-id="${escapeHTML(b.id)}" title="Editar profissional">✎</button><button class="action-icon danger" data-action="delete-barber" data-id="${escapeHTML(b.id)}" title="Excluir profissional">⌫</button></div></div>`).join('')}</div></div>
      <div class="settings-card glass"><div class="panel-head"><div><h2 class="panel-title">Serviços e preços</h2><p class="panel-subtitle">Catálogo disponível no agendamento.</p></div><button class="btn btn-small btn-secondary" data-action="new-service">+ Adicionar</button></div><div class="settings-list">${db.services.map(s => `<div class="settings-item"><div><strong>${escapeHTML(s.name)}</strong><small>${Number(s.duration)} min · ${money(s.price)}</small></div><div class="settings-item-actions"><button class="action-icon" data-action="edit-service" data-id="${escapeHTML(s.id)}" title="Editar serviço">✎</button><button class="action-icon danger" data-action="delete-service" data-id="${escapeHTML(s.id)}" title="Excluir serviço">⌫</button></div></div>`).join('')}</div></div>
      <div class="settings-card glass"><div class="panel-head"><div><h2 class="panel-title">Seus dados</h2><p class="panel-subtitle">Cópia de segurança e transferência manual.</p></div></div><p class="settings-help">Os dados são salvos somente neste navegador. Exporte um arquivo JSON para guardar um backup ou importe um backup previamente exportado. Não há sincronização automática entre dispositivos.</p><div class="filter-controls mt-18"><button class="btn btn-secondary btn-small" data-action="export">↓ Exportar dados</button><button class="btn btn-secondary btn-small" data-action="import">↑ Importar backup</button></div><div class="info-notice">Atenção: este projeto é uma demonstração local. Para agendamentos compartilhados em vários aparelhos, login de usuários ou uso comercial real, será necessário configurar um banco de dados e autenticação no servidor.</div></div>
    </div>`;
  }
  function navigate(next) { if (!pageNames[next]) return; page = next; $('#sidebar').classList.remove('open'); $('#mobile-overlay').classList.remove('open'); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function notify(message, error = false) { const node = document.createElement('div'); node.className = `toast ${error ? 'error' : ''}`; node.textContent = `${error ? '⚠' : '✓'}  ${message}`; $('#toast-root').append(node); setTimeout(() => node.remove(), 4000); }
  function modalWrap(kicker, title, body, footer) {
    $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="dismiss-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="modal-header"><div><p class="overline">${kicker}</p><h3>${title}</h3></div><button class="close-modal" data-action="close-modal" aria-label="Fechar janela">×</button></div>${body}<div class="modal-footer">${footer}</div></div></div>`;
    const focusable = $('#modal-root input:not([type=hidden]), #modal-root select, #modal-root button'); if (focusable) focusable.focus();
  }
  function closeModal() { $('#modal-root').innerHTML = ''; activeModal = null; }
  function openBookingModal(id = null, opts = {}) {
    if (!db.clients.length && opts.forceExisting) return notify('Cadastre um cliente primeiro.', true);
    const b = id ? db.bookings.find(x => x.id === id) : null;
    if (id && !b) return notify('Agendamento não encontrado.', true);
    const bookingDate = b?.date || opts.date || selectedDate;
    const formDate = bookingDate < today() ? today() : bookingDate;
    activeModal = { kind: 'booking', id: b?.id || null, original: b ? { ...b } : null };
    const initialBarber = b?.barberId || opts.barber || selectedBarber;
    const initialService = b?.serviceId || opts.service || selectedService;
    const body = `<form id="booking-form" class="modal-body"><div class="form-grid"><div class="field field-full"><label for="booking-client">Cliente</label><select id="booking-client" name="clientId" class="select" required><option value="">Selecione um cliente</option>${db.clients.map(c => `<option value="${escapeHTML(c.id)}" ${b?.clientId === c.id ? 'selected' : ''}>${escapeHTML(c.name)} · ${escapeHTML(c.phone)}</option>`).join('')}<option value="__new__">+ Cadastrar novo cliente</option></select></div><div class="booking-new-fields field-full hide" id="booking-new-fields"><div class="form-grid"><div class="field"><label for="new-cname">Nome do novo cliente</label><input id="new-cname" class="input" name="newClientName" maxlength="100" placeholder="Nome completo" /></div><div class="field"><label for="new-cphone">Telefone do novo cliente</label><input id="new-cphone" class="input" name="newClientPhone" inputmode="tel" maxlength="25" placeholder="(00) 00000-0000" /></div></div></div><div class="field"><label for="booking-service">Serviço</label><select class="select" name="serviceId" id="booking-service" required>${db.services.map(s => `<option value="${escapeHTML(s.id)}" ${initialService === s.id ? 'selected' : ''}>${escapeHTML(s.name)} · ${money(s.price)}</option>`).join('')}</select></div><div class="field"><label for="booking-barber">Profissional</label><select class="select" name="barberId" id="booking-barber" required>${db.barbers.map(p => `<option value="${escapeHTML(p.id)}" ${initialBarber === p.id ? 'selected' : ''}>${escapeHTML(p.name)}</option>`).join('')}</select></div><div class="field"><label for="booking-date">Data</label><input class="input" type="date" name="date" id="booking-date" required value="${escapeHTML(b?.date || formDate)}" ${b ? '' : `min="${today()}"`} /></div><div class="field"><label for="booking-time">Horário</label><select class="select" id="booking-time" name="time" required></select></div><div class="field field-full"><p class="availability-message" id="modal-availability-message"></p></div><div class="field field-full"><label for="booking-notes">Observações (opcional)</label><textarea id="booking-notes" name="notes" class="textarea" maxlength="500" placeholder="Preferências do cliente, detalhes do atendimento...">${escapeHTML(b?.notes || '')}</textarea></div></div></form>`;
    modalWrap('AGENDA DO ESTÚDIO', b ? 'Editar agendamento' : 'Novo agendamento', body, `<button type="button" class="btn btn-secondary" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit" form="booking-form">${b ? 'Salvar alterações' : 'Confirmar agendamento'}</button>`);
    refreshBookingSlots(b?.time || opts.time || null);
  }
  function refreshBookingSlots(preferred = null) {
    const form = $('#booking-form'); if (!form) return;
    const date = form.elements.date.value, barber = form.elements.barberId.value, service = form.elements.serviceId.value;
    const current = form.elements.time.value;
    const canShowPast = !!activeModal?.id;
    const available = allSlots(date, barber, service, activeModal?.id || null, canShowPast).filter(slot => slot.available);
    const requested = preferred || current;
    const chosen = available.some(s => s.time === requested) ? requested : available[0]?.time || '';
    $('#booking-time').innerHTML = available.length ? available.map(s => `<option value="${s.time}" ${chosen === s.time ? 'selected' : ''}>${s.time}</option>`).join('') : `<option value="">Sem horários disponíveis</option>`;
    $('#booking-time').disabled = !available.length;
    $('#modal-availability-message').textContent = available.length ? `${available.length} horário(s) livre(s). Os horários conflitantes não aparecem.` : 'Sem horários disponíveis. Altere a data, o serviço ou o profissional.';
  }
  function toggleNewClient() {
    const form = $('#booking-form'); if (!form) return;
    const isNew = form.elements.clientId.value === '__new__';
    $('#booking-new-fields').classList.toggle('hide', !isNew);
    form.elements.newClientName.required = isNew;
    form.elements.newClientPhone.required = isNew;
  }
  function openClientModal(id = null) {
    const c = id ? findClient(id) : null;
    if (id && !c) return notify('Cliente não encontrado.', true);
    activeModal = { kind: 'client', id: c?.id || null };
    const body = `<form id="client-form" class="modal-body"><div class="form-grid"><div class="field field-full"><label for="client-name">Nome completo *</label><input class="input" id="client-name" name="name" required maxlength="100" minlength="2" placeholder="Ex.: Ana Silva" value="${escapeHTML(c?.name || '')}" /></div><div class="field"><label for="client-phone">Telefone / WhatsApp *</label><input class="input" id="client-phone" name="phone" inputmode="tel" required maxlength="25" placeholder="(00) 00000-0000" value="${escapeHTML(c?.phone || '')}" /></div><div class="field"><label for="client-email">E-mail (opcional)</label><input class="input" id="client-email" type="email" name="email" maxlength="120" placeholder="email@exemplo.com" value="${escapeHTML(c?.email || '')}" /></div><div class="field field-full"><label for="client-notes">Observações (opcional)</label><textarea class="textarea" id="client-notes" name="notes" maxlength="500" placeholder="Detalhes importantes sobre o cliente...">${escapeHTML(c?.notes || '')}</textarea></div></div></form>`;
    modalWrap('CADASTRO DE CLIENTES', c ? 'Editar cliente' : 'Novo cliente', body, `<button class="btn btn-secondary" data-action="close-modal">Cancelar</button><button class="btn btn-primary" type="submit" form="client-form">${c ? 'Salvar cliente' : 'Cadastrar cliente'}</button>`);
  }
  function openSimpleModal(kind, id = null) {
    const isBarber = kind === 'barber';
    const item = id ? (isBarber ? findBarber(id) : findService(id)) : null;
    if (id && !item) return notify('Registro não encontrado.', true);
    activeModal = { kind, id: item?.id || null };
    const body = `<form id="simple-form" class="modal-body"><div class="form-grid"><div class="field field-full"><label for="simple-name">Nome ${isBarber ? 'do profissional' : 'do serviço'}</label><input id="simple-name" class="input" name="name" required maxlength="80" minlength="2" value="${escapeHTML(item?.name || '')}" placeholder="${isBarber ? 'Ex.: Rafael Costa' : 'Ex.: Corte degradê'}" /></div>${isBarber ? '' : `<div class="field"><label for="service-duration">Duração (minutos)</label><input id="service-duration" class="input" type="number" name="duration" min="15" max="240" step="15" required value="${Number(item?.duration || 30)}" /></div><div class="field"><label for="service-price">Preço (R$)</label><input id="service-price" class="input" type="number" name="price" min="0" max="99999" step="0.01" required value="${Number(item?.price ?? 45)}" /></div>`}</div></form>`;
    modalWrap('PERSONALIZE O ESTÚDIO', `${item ? 'Editar' : 'Adicionar'} ${isBarber ? 'profissional' : 'serviço'}`, body, `<button class="btn btn-secondary" data-action="close-modal">Cancelar</button><button class="btn btn-primary" form="simple-form" type="submit">Salvar</button>`);
  }
  function submitBooking(form) {
    const data = new FormData(form);
    let clientId = String(data.get('clientId') || '');
    const serviceId = String(data.get('serviceId')), barberId = String(data.get('barberId'));
    const date = String(data.get('date')), time = String(data.get('time'));
    const previous = activeModal?.original;
    if (!findService(serviceId) || !findBarber(barberId) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d\d:\d\d$/.test(time)) return notify('Preencha o serviço, a data e o horário.', true);
    if (nowIsPast(date, time) && !(previous && previous.date === date && previous.time === time)) return notify('Não é possível reservar horários que já passaram.', true);
    if (!allSlots(date, barberId, serviceId, activeModal?.id || null, true).some(s => s.time === time && !s.busy)) return notify('Este horário não está disponível para o serviço selecionado.', true);
    let newClient = null;
    if (clientId === '__new__') {
      const name = safeName(data.get('newClientName'));
      const phone = safeName(data.get('newClientPhone'));
      if (name.length < 2 || slugDigits(phone).length < 10 || slugDigits(phone).length > 13) return notify('Informe nome e telefone válidos para o novo cliente.', true);
      if (db.clients.some(c => slugDigits(c.phone) === slugDigits(phone))) return notify('Este telefone já está cadastrado. Selecione o cliente existente.', true);
      newClient = { id: uid(), name, phone, email: '', notes: '' };
      clientId = newClient.id;
    } else if (!findClient(clientId)) return notify('Selecione um cliente existente ou cadastre um novo.', true);
    if (newClient) db.clients.push(newClient);
    const entry = { id: activeModal?.id || uid(), clientId, barberId, serviceId, date, time, notes: safeName(data.get('notes')), status: previous?.status || 'confirmed' };
    if (previous) { const idx = db.bookings.findIndex(b => b.id === previous.id); db.bookings[idx] = entry; }
    else db.bookings.push(entry);
    selectedDate = date; weekStart = mondayOf(date); selectedBarber = barberId; selectedService = serviceId;
    closeModal(); save(); notify(previous ? 'Agendamento atualizado!' : 'Agendamento confirmado!');
  }
  function submitClient(form) {
    const data = new FormData(form), name = safeName(data.get('name')), phone = safeName(data.get('phone'));
    if (name.length < 2 || slugDigits(phone).length < 10 || slugDigits(phone).length > 13) return notify('Informe nome e telefone válidos.', true);
    if (db.clients.some(c => c.id !== activeModal?.id && slugDigits(c.phone) === slugDigits(phone))) return notify('Já existe outro cliente com esse telefone.', true);
    const entry = { id: activeModal?.id || uid(), name, phone, email: safeName(data.get('email')), notes: safeName(data.get('notes')) };
    if (activeModal?.id) db.clients[db.clients.findIndex(c => c.id === activeModal.id)] = entry; else db.clients.push(entry);
    const updated = !!activeModal?.id; closeModal(); save(); notify(updated ? 'Cadastro atualizado!' : 'Cliente cadastrado!');
  }
  function submitSimple(form) {
    const isBarber = activeModal?.kind === 'barber';
    const name = safeName(new FormData(form).get('name'));
    if (name.length < 2) return notify('Informe um nome válido.', true);
    const target = isBarber ? db.barbers : db.services;
    const entry = { id: activeModal?.id || uid(), name };
    if (!isBarber) {
      const duration = Number(form.elements.duration.value), price = Number(form.elements.price.value);
      if (!Number.isInteger(duration) || duration < 15 || duration > 240 || duration % 15 !== 0 || !Number.isFinite(price) || price < 0 || price > 99999) return notify('Confira o tempo e o preço do serviço.', true);
      entry.duration = duration; entry.price = price;
    }
    const existing = target.findIndex(x => x.id === entry.id);
    if (existing >= 0) target[existing] = entry; else target.push(entry);
    closeModal(); save(); notify(isBarber ? 'Profissional salvo!' : 'Serviço salvo!');
  }
  function deleteBooking(id) { const b = db.bookings.find(x => x.id === id); if (!b || !confirm('Excluir este agendamento permanentemente?')) return; db.bookings = db.bookings.filter(x => x.id !== id); save(); notify('Agendamento excluído.'); }
  function changeBookingStatus(id, status) {
    const b = db.bookings.find(x => x.id === id); if (!b) return;
    if (status === 'confirmed') {
      const available = allSlots(b.date, b.barberId, b.serviceId, b.id, true).some(s => s.time === b.time && !s.busy);
      if (!available || nowIsPast(b.date, b.time)) return notify('Não é possível reativar este horário. Edite o agendamento para escolher um horário futuro disponível.', true);
    }
    if (status === 'cancelled' && !confirm('Cancelar este agendamento? O horário ficará disponível novamente.')) return;
    b.status = status; save(); notify(status === 'completed' ? 'Atendimento concluído!' : status === 'cancelled' ? 'Agendamento cancelado.' : 'Agendamento reativado!');
  }
  function deleteClient(id) { const c = findClient(id); if (!c) return; if (db.bookings.some(b => b.clientId === id)) return notify('Cliente possui agendamentos no histórico. Exclua esses agendamentos primeiro.', true); if (!confirm(`Excluir o cliente ${c.name}?`)) return; db.clients = db.clients.filter(x => x.id !== id); save(); notify('Cliente excluído.'); }
  function deleteCatalog(kind, id) {
    const isBarber = kind === 'barber', arr = isBarber ? db.barbers : db.services;
    if (arr.length <= 1) return notify('Mantenha pelo menos um profissional e um serviço cadastrados.', true);
    const item = arr.find(x => x.id === id); if (!item) return;
    if (db.bookings.some(b => isBarber ? b.barberId === id : b.serviceId === id)) return notify('Este item possui agendamentos vinculados e não pode ser excluído.', true);
    if (!confirm(`Excluir ${item.name}?`)) return;
    if (isBarber) db.barbers = arr.filter(x => x.id !== id); else db.services = arr.filter(x => x.id !== id);
    save(); notify('Item excluído.');
  }
  function submitSettings(form) {
    const data = new FormData(form);
    const opening = String(data.get('opening')), closing = String(data.get('closing'));
    const days = data.getAll('days').map(Number);
    if (minutes(opening) >= minutes(closing)) return notify('O fechamento deve ser depois da abertura.', true);
    if (minutes(closing) - minutes(opening) < 30) return notify('O expediente deve ter ao menos 30 minutos.', true);
    if (!days.length) return notify('Selecione pelo menos um dia de atendimento.', true);
    db.business = { name: safeName(data.get('salonName')), opening, closing, days };
    save(); notify('Configurações salvas!');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `barberflow-backup-${today()}.json`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Backup exportado!');
  }
  async function importData(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return notify('Arquivo grande demais (máximo 2 MB).', true);
    try {
      const parsed = JSON.parse(await file.text());
      if (!isValidStore(parsed) || !Array.isArray(parsed.business.days) || typeof parsed.business.opening !== 'string' || typeof parsed.business.closing !== 'string' || !parsed.barbers.length || !parsed.services.length || !parsed.clients.every(c => c && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.phone === 'string') || !parsed.bookings.every(b => b && typeof b.id === 'string' && typeof b.date === 'string' && typeof b.time === 'string')) throw new Error('Formato de backup inválido');
      if (!confirm('Importar este backup? Todos os dados atuais serão substituídos.')) return;
      db = parsed; db.demo = false; selectedDate = today(); weekStart = mondayOf(today()); selectedBarber = db.barbers[0].id; selectedService = db.services[0].id; save(); notify('Backup importado com sucesso!');
    } catch (err) { console.error(err); notify('Não foi possível ler este backup. Verifique o arquivo JSON.', true); }
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]'); if (!el) return;
    const action = el.dataset.action, id = el.dataset.id;
    if (action === 'dismiss-modal') { if (e.target === el) closeModal(); return; }
    if (action === 'close-modal') return closeModal();
    if (action === 'toggle-menu') { $('#sidebar').classList.toggle('open'); $('#mobile-overlay').classList.toggle('open'); return; }
    if (action === 'close-menu') { $('#sidebar').classList.remove('open'); $('#mobile-overlay').classList.remove('open'); return; }
    if (action === 'navigate') return navigate(el.dataset.page);
    if (action === 'new-booking') return openBookingModal(null, { date: el.dataset.date });
    if (action === 'edit-booking') return openBookingModal(id);
    if (action === 'choose-slot') return openBookingModal(null, { date: selectedDate, time: el.dataset.time, barber: selectedBarber, service: selectedService });
    if (action === 'new-client') return openClientModal();
    if (action === 'edit-client') return openClientModal(id);
    if (action === 'prev-week' || action === 'next-week') { weekStart = addDays(weekStart, action === 'prev-week' ? -7 : 7); selectedDate = weekStart; render(); return; }
    if (action === 'select-day') { selectedDate = el.dataset.date; render(); return; }
    if (action === 'booking-filter') { bookingStatus = el.dataset.value; render(); return; }
    if (action === 'clear-booking-date') { bookingDateFilter = ''; render(); return; }
    if (action === 'complete-booking') return changeBookingStatus(id, 'completed');
    if (action === 'cancel-booking') return changeBookingStatus(id, 'cancelled');
    if (action === 'reactivate-booking') return changeBookingStatus(id, 'confirmed');
    if (action === 'delete-booking') return deleteBooking(id);
    if (action === 'delete-client') return deleteClient(id);
    if (action === 'new-barber') return openSimpleModal('barber');
    if (action === 'edit-barber') return openSimpleModal('barber', id);
    if (action === 'delete-barber') return deleteCatalog('barber', id);
    if (action === 'new-service') return openSimpleModal('service');
    if (action === 'edit-service') return openSimpleModal('service', id);
    if (action === 'delete-service') return deleteCatalog('service', id);
    if (action === 'export') return exportData();
    if (action === 'import') return $('#import-file').click();
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.control === 'home-barber') { selectedBarber = el.value; render(); }
    if (el.dataset.control === 'home-service') { selectedService = el.value; render(); }
    if (el.id === 'booking-client') toggleNewClient();
    if (['booking-date', 'booking-barber', 'booking-service'].includes(el.id)) refreshBookingSlots();
    if (el.id === 'booking-date-filter') { bookingDateFilter = el.value; render(); }
    if (el.id === 'import-file') { importData(el.files?.[0]); el.value = ''; }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'booking-search') { bookingSearch = e.target.value; if ($('#bookings-results')) $('#bookings-results').innerHTML = bookingRowsHTML(); }
    if (e.target.id === 'client-search') { clientSearch = e.target.value; if ($('#clients-results')) $('#clients-results').innerHTML = clientCardsHTML(); }
  });
  document.addEventListener('submit', e => {
    const form = e.target;
    if (!['booking-form', 'client-form', 'simple-form', 'settings-form'].includes(form.id)) return;
    e.preventDefault();
    if (form.id === 'booking-form') submitBooking(form);
    if (form.id === 'client-form') submitClient(form);
    if (form.id === 'simple-form') submitSimple(form);
    if (form.id === 'settings-form') submitSettings(form);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && activeModal) closeModal(); });
  render();
})();
