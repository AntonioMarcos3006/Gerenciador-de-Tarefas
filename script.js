(() => {
  'use strict';
  
  const STORAGE_KEY = 'nimbus_state_v1';
  const PRIORITIES = {
    urgente: { label: 'Urgente', color: '#ff4d6d', icon: '🔴' },
    alta:    { label: 'Alta',    color: '#ff9f43', icon: '🟠' },
    media:   { label: 'Média',   color: '#ffd23f', icon: '🟡' },
    baixa:   { label: 'Baixa',   color: '#2ee6a6', icon: '🟢' },
  };
  const STATUS_LABELS = {
    pendente: 'Pendente', andamento: 'Em andamento', revisao: 'Em revisão', concluido: 'Concluído'
  };
  const BOARD_ICONS = ['fa-rocket','fa-briefcase','fa-palette','fa-code','fa-bullhorn','fa-chart-line','fa-graduation-cap','fa-heart','fa-house','fa-leaf','fa-gamepad','fa-camera'];
  const BOARD_COLORS = ['#5b8cff','#9b6bff','#ff6b9d','#ff9f43','#2ee6a6','#34d399','#fbbf24','#fb5b6f','#38bdf8','#a78bfa'];
  const DEFAULT_LABELS = [
    { id: 'l1', name: 'Frontend', color: '#5b8cff' },
    { id: 'l2', name: 'Backend',  color: '#9b6bff' },
    { id: 'l3', name: 'Design',   color: '#ff6b9d' },
    { id: 'l4', name: 'Bug',      color: '#fb5b6f' },
    { id: 'l5', name: 'Urgente',  color: '#ff9f43' },
    { id: 'l6', name: 'Melhoria', color: '#2ee6a6' },
  ];
  const ASSIGNEES = [
    { id: 'u1', name: 'Camila Moraes', initials: 'CM' },
    { id: 'u2', name: 'Bruno Alves',   initials: 'BA' },
    { id: 'u3', name: 'Júlia Santos',  initials: 'JS' },
    { id: 'u4', name: 'Pedro Lima',    initials: 'PL' },
    { id: 'u5', name: 'Ana Castro',    initials: 'AC' },
  ];
  const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };
  const fmtDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };
  const fmtDateTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };
  const escapeHtml = (str = '') =>
    str.replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  
  function seedData() {
    const boardId = uid('board');
    const cols = ['Backlog', 'A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'].map((name, i) => ({
      id: uid('col'), name, color: BOARD_COLORS[i % BOARD_COLORS.length], order: i,
    }));
    const sample = [
      { title: 'Definir identidade visual do produto', col: 0, p: 'media', labels: ['l3'], status: 'pendente' },
      { title: 'Modelar banco de dados', col: 0, p: 'alta', labels: ['l2'], status: 'pendente' },
      { title: 'Criar wireframes do dashboard', col: 1, p: 'media', labels: ['l3','l1'], status: 'pendente' },
      { title: 'Configurar autenticação JWT', col: 1, p: 'urgente', labels: ['l2','l5'], status: 'pendente' },
      { title: 'Implementar drag and drop dos cartões', col: 2, p: 'alta', labels: ['l1'], status: 'andamento' },
      { title: 'Ajustar responsividade do menu lateral', col: 2, p: 'baixa', labels: ['l1','l4'], status: 'andamento' },
      { title: 'Revisar copy das telas de erro', col: 3, p: 'baixa', labels: ['l3'], status: 'revisao' },
      { title: 'Testes de carga na API', col: 3, p: 'media', labels: ['l2'], status: 'revisao' },
      { title: 'Publicar landing page', col: 4, p: 'media', labels: ['l6'], status: 'concluido' },
      { title: 'Configurar pipeline de deploy', col: 4, p: 'alta', labels: ['l2'], status: 'concluido' },
    ];
    const cards = sample.map((s, i) => ({
      id: uid('card'),
      boardId,
      columnId: cols[s.col].id,
      title: s.title,
      desc: '',
      priority: s.p,
      category: '',
      createdAt: new Date(Date.now() - (sample.length - i) * 86400000).toISOString(),
      dueDate: s.status === 'concluido' ? addDays(-2) : addDays(Math.floor(Math.random() * 12) - 3),
      labels: s.labels,
      checklist: [],
      assignee: ASSIGNEES[i % ASSIGNEES.length].id,
      comments: [],
      attachments: [],
      status: s.status,
      favorite: i === 1 || i === 4,
      order: i,
    }));
    return {
      theme: 'dark',
      boards: [{
        id: boardId, name: 'Lançamento App Mobile', desc: 'Planejamento e execução do MVP do aplicativo.',
        icon: 'fa-rocket', color: '#5b8cff', createdAt: new Date().toISOString(), favorite: true, columns: cols,
      }],
      cards,
      labels: DEFAULT_LABELS,
      history: [
        { id: uid('h'), type: 'create', text: 'Quadro "Lançamento App Mobile" foi criado.', createdAt: new Date().toISOString() },
      ],
      settings: { notifications: true },
    };
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('Falha ao carregar estado salvo, recriando.', e); }
    const fresh = seedData();
    saveState(fresh);
    return fresh;
  }
  function saveState(s = state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
  let state = loadState();
  
  const ui = {
    view: 'boards',
    currentBoardId: null,
    search: '',
    filters: { priority: new Set(), label: new Set(), assignee: new Set(), status: new Set() },
    favOnly: false,
    calMonth: new Date(),
    editingChecklist: [],
    editingComments: [],
    editingAttachments: [],
    editingLabels: new Set(),
    confirmCallback: null,
  };
  
  const getBoard = (id) => state.boards.find(b => b.id === id);
  const getBoardCards = (boardId) => state.cards.filter(c => c.boardId === boardId);
  const getAssignee = (id) => ASSIGNEES.find(a => a.id === id);
  const getLabel = (id) => state.labels.find(l => l.id === id);
  function addHistory(text, type = 'info') {
    state.history.unshift({ id: uid('h'), text, type, createdAt: new Date().toISOString() });
    state.history = state.history.slice(0, 100);
  }
  function isOverdue(card) {
    return card.dueDate && card.dueDate < todayISO() && card.status !== 'concluido';
  }
  
  const toastIcons = {
    success: 'fa-circle-check', info: 'fa-circle-info', warning: 'fa-triangle-exclamation', danger: 'fa-circle-xmark',
  };
  function toast(title, msg = '', kind = 'info') {
    if (!state.settings.notifications) return;
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `
      <div class="toast-icon ${kind}"><i class="fa-solid ${toastIcons[kind] || toastIcons.info}"></i></div>
      <div class="toast-text"><strong>${escapeHtml(title)}</strong>${msg ? `<span>${escapeHtml(msg)}</span>` : ''}</div>
      <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>`;
    container.appendChild(el);
    const remove = () => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); };
    el.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, 4200);
  }
  function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
  function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) closeModal(closeBtn.dataset.close);
    if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }
  });
  function confirmAction(title, text, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    ui.confirmCallback = onConfirm;
    openModal('modalConfirm');
  }
  document.getElementById('btnConfirmAction').addEventListener('click', () => {
    if (ui.confirmCallback) ui.confirmCallback();
    closeModal('modalConfirm');
  });
  const views = ['boards-list', 'board', 'dashboard', 'calendar', 'favorites', 'history'];
  function switchView(view, boardId = null) {
    ui.view = view;
    if (boardId) ui.currentBoardId = boardId;
    views.forEach(v => {
      document.getElementById(`view-${v}`).classList.toggle('hidden', v !== (view === 'boards' ? 'boards-list' : view));
    });
    document.querySelectorAll('.nav-item[data-view]').forEach(n => {
      n.classList.toggle('active', n.dataset.view === (view === 'board' ? 'boards' : view));
    });
    closeMobileSidebar();
    if (view === 'board') renderBoard();
    if (view === 'boards') renderBoardsGrid();
    if (view === 'dashboard') renderDashboard();
    if (view === 'calendar') renderCalendar();
    if (view === 'favorites') renderFavorites();
    if (view === 'history') renderHistory();
    renderSidebarBoards();
  }
  document.querySelectorAll('.nav-item[data-view]').forEach(n => {
    n.addEventListener('click', (e) => { e.preventDefault(); switchView(n.dataset.view); });
  });
  function renderSidebarBoards() {
    const list = document.getElementById('sidebarBoardList');
    list.innerHTML = state.boards.map(b => `
      <div class="sidebar-board-item ${ui.currentBoardId === b.id && ui.view === 'board' ? 'active' : ''}" data-board="${b.id}">
        <span class="sidebar-board-dot" style="background:${b.color}"></span>
        <span>${escapeHtml(b.name)}</span>
      </div>`).join('') || `<p class="muted" style="font-size:12px;padding:8px 12px;">Nenhum quadro ainda.</p>`;
    list.querySelectorAll('.sidebar-board-item').forEach(item => {
      item.addEventListener('click', () => switchView('board', item.dataset.board));
    });
  }
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });
  function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('mobile-open');
    document.getElementById('sidebarOverlay').classList.add('show');
  });
  document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);
  function boardProgress(board) {
    const cards = getBoardCards(board.id);
    if (!cards.length) return 0;
    const done = cards.filter(c => c.status === 'concluido').length;
    return Math.round((done / cards.length) * 100);
  }
  function renderBoardsGrid() {
    const grid = document.getElementById('boardsGrid');
    if (!state.boards.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <i class="fa-regular fa-folder-open"></i><h3>Nenhum quadro criado</h3>
        <p>Clique em "Novo quadro" para começar a organizar suas tarefas.</p></div>`;
      return;
    }
    grid.innerHTML = state.boards.map(boardTileHTML).join('');
    attachBoardTileEvents(grid);
  }
  function boardTileHTML(b) {
    const progress = boardProgress(b);
    const cardCount = getBoardCards(b.id).length;
    return `
    <div class="board-tile" style="--tile-color:${b.color}" data-board="${b.id}">
      <div class="board-tile-top">
        <div class="board-tile-icon"><i class="fa-solid ${b.icon}"></i></div>
        <div style="display:flex;align-items:center;gap:4px;">
          <button class="board-tile-fav ${b.favorite ? 'is-fav' : ''}" data-action="fav" data-board="${b.id}">
            <i class="fa-${b.favorite ? 'solid' : 'regular'} fa-star"></i>
          </button>
          <button class="icon-btn" data-action="menu" data-board="${b.id}"><i class="fa-solid fa-ellipsis-vertical"></i></button>
        </div>
      </div>
      <h3>${escapeHtml(b.name)}</h3>
      <p>${escapeHtml(b.desc || 'Sem descrição.')}</p>
      <div class="board-tile-progress"><span style="width:${progress}%"></span></div>
      <div class="board-tile-foot">
        <span class="board-tile-date"><i class="fa-regular fa-calendar"></i> ${fmtDate(b.createdAt.slice(0,10))} · ${cardCount} tarefas</span>
        <span class="board-tile-date">${progress}%</span>
      </div>
    </div>`;
  }
  function attachBoardTileEvents(scope) {
    scope.querySelectorAll('.board-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) return;
        switchView('board', tile.dataset.board);
      });
    });
    scope.querySelectorAll('[data-action="fav"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const b = getBoard(btn.dataset.board);
        b.favorite = !b.favorite;
        saveState(); renderBoardsGrid(); renderFavorites();
        toast(b.favorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos', b.name, 'success');
      });
    });
    scope.querySelectorAll('[data-action="menu"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown').forEach(d => d.remove());
        const b = getBoard(btn.dataset.board);
        const dd = document.createElement('div');
        dd.className = 'dropdown';
        dd.innerHTML = `
          <button data-act="edit"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
          <button data-act="dup"><i class="fa-regular fa-copy"></i> Duplicar</button>
          <button data-act="del" class="danger"><i class="fa-regular fa-trash-can"></i> Excluir</button>`;
        btn.parentElement.style.position = 'relative';
        btn.parentElement.appendChild(dd);
        const closeDD = (ev) => { if (!dd.contains(ev.target)) { dd.remove(); document.removeEventListener('click', closeDD); } };
        setTimeout(() => document.addEventListener('click', closeDD), 0);
        dd.querySelector('[data-act="edit"]').addEventListener('click', () => { dd.remove(); openBoardModal(b); });
        dd.querySelector('[data-act="dup"]').addEventListener('click', () => { dd.remove(); duplicateBoard(b); });
        dd.querySelector('[data-act="del"]').addEventListener('click', () => {
          dd.remove();
          confirmAction('Excluir quadro?', `O quadro "${b.name}" e todas as suas tarefas serão excluídos permanentemente.`, () => deleteBoard(b.id));
        });
      });
    });
  }
  function duplicateBoard(b) {
    const newId = uid('board');
    const colMap = {};
    const newCols = b.columns.map(c => {
      const nc = { ...c, id: uid('col') };
      colMap[c.id] = nc.id;
      return nc;
    });
    state.boards.push({ ...b, id: newId, name: b.name + ' (cópia)', createdAt: new Date().toISOString(), favorite: false, columns: newCols });
    getBoardCards(b.id).forEach(c => {
      state.cards.push({ ...c, id: uid('card'), boardId: newId, columnId: colMap[c.columnId], comments: [], favorite: false });
    });
    addHistory(`Quadro "${b.name}" foi duplicado.`, 'create');
    saveState(); renderBoardsGrid(); renderSidebarBoards();
    toast('Quadro duplicado', b.name, 'success');
  }
  function deleteBoard(id) {
    const b = getBoard(id);
    state.boards = state.boards.filter(x => x.id !== id);
    state.cards = state.cards.filter(c => c.boardId !== id);
    addHistory(`Quadro "${b.name}" foi excluído.`, 'delete');
    saveState();
    if (ui.currentBoardId === id) ui.currentBoardId = null;
    renderBoardsGrid(); renderSidebarBoards(); renderFavorites();
    toast('Quadro excluído', b.name, 'danger');
    if (ui.view === 'board') switchView('boards');
  }
  
  let editingBoardIcon = BOARD_ICONS[0];
  let editingBoardColor = BOARD_COLORS[0];
  function buildPickers() {
    const iconPicker = document.getElementById('boardIconPicker');
    iconPicker.innerHTML = BOARD_ICONS.map(ic => `<button type="button" class="icon-opt" data-icon="${ic}"><i class="fa-solid ${ic}"></i></button>`).join('');
    const colorPicker = document.getElementById('boardColorPicker');
    colorPicker.innerHTML = BOARD_COLORS.map(c => `<button type="button" class="color-opt" data-color="${c}" style="background:${c}"></button>`).join('');
    const colPicker = document.getElementById('columnColorPicker');
    colPicker.innerHTML = BOARD_COLORS.map(c => `<button type="button" class="color-opt" data-color="${c}" style="background:${c}"></button>`).join('');
    iconPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.icon-opt'); if (!btn) return;
      editingBoardIcon = btn.dataset.icon;
      iconPicker.querySelectorAll('.icon-opt').forEach(b => b.classList.toggle('selected', b === btn));
    });
    colorPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-opt'); if (!btn) return;
      editingBoardColor = btn.dataset.color;
      colorPicker.querySelectorAll('.color-opt').forEach(b => b.classList.toggle('selected', b === btn));
    });
    colPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-opt'); if (!btn) return;
      editingColumnColor = btn.dataset.color;
      colPicker.querySelectorAll('.color-opt').forEach(b => b.classList.toggle('selected', b === btn));
    });
  }
  function openBoardModal(board = null) {
    document.getElementById('boardModalTitle').textContent = board ? 'Editar quadro' : 'Novo quadro';
    document.getElementById('boardId').value = board ? board.id : '';
    document.getElementById('boardName').value = board ? board.name : '';
    document.getElementById('boardDesc').value = board ? board.desc : '';
    editingBoardIcon = board ? board.icon : BOARD_ICONS[0];
    editingBoardColor = board ? board.color : BOARD_COLORS[0];
    document.querySelectorAll('#boardIconPicker .icon-opt').forEach(b => b.classList.toggle('selected', b.dataset.icon === editingBoardIcon));
    document.querySelectorAll('#boardColorPicker .color-opt').forEach(b => b.classList.toggle('selected', b.dataset.color === editingBoardColor));
    openModal('modalBoard');
    document.getElementById('boardName').focus();
  }
  [document.getElementById('btnNewBoard'), document.getElementById('btnNewBoard2')].forEach(btn => {
    btn.addEventListener('click', () => openBoardModal());
  });
  document.getElementById('btnSaveBoard').addEventListener('click', () => {
    const name = document.getElementById('boardName').value.trim();
    if (!name) { toast('Nome obrigatório', 'Dê um nome ao seu quadro.', 'warning'); return; }
    const id = document.getElementById('boardId').value;
    const desc = document.getElementById('boardDesc').value.trim();
    if (id) {
      const b = getBoard(id);
      Object.assign(b, { name, desc, icon: editingBoardIcon, color: editingBoardColor });
      addHistory(`Quadro "${name}" foi atualizado.`, 'edit');
      toast('Quadro atualizado', name, 'success');
    } else {
      const cols = ['Backlog', 'A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'].map((n, i) => ({
        id: uid('col'), name: n, color: BOARD_COLORS[i % BOARD_COLORS.length], order: i,
      }));
      const nb = { id: uid('board'), name, desc, icon: editingBoardIcon, color: editingBoardColor, createdAt: new Date().toISOString(), favorite: false, columns: cols };
      state.boards.push(nb);
      addHistory(`Quadro "${name}" foi criado.`, 'create');
      toast('Quadro criado', name, 'success');
    }
    saveState();
    closeModal('modalBoard');
    renderBoardsGrid(); renderSidebarBoards();
  });
  
  let editingColumnColor = BOARD_COLORS[0];
  function currentFilteredCards(boardId) {
    let cards = getBoardCards(boardId);
    const q = ui.search.trim().toLowerCase();
    if (q) {
      cards = cards.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        c.labels.map(getLabel).some(l => l && l.name.toLowerCase().includes(q)) ||
        (getAssignee(c.assignee)?.name || '').toLowerCase().includes(q)
      );
    }
    if (ui.filters.priority.size) cards = cards.filter(c => ui.filters.priority.has(c.priority));
    if (ui.filters.status.size) cards = cards.filter(c => ui.filters.status.has(c.status));
    if (ui.filters.assignee.size) cards = cards.filter(c => ui.filters.assignee.has(c.assignee));
    if (ui.filters.label.size) cards = cards.filter(c => c.labels.some(l => ui.filters.label.has(l)));
    if (ui.favOnly) cards = cards.filter(c => c.favorite);
    return cards;
  }
  function renderBoard() {
    const board = getBoard(ui.currentBoardId);
    if (!board) { switchView('boards'); return; }
    document.getElementById('boardHeader').innerHTML = `
      <div style="width:100%;">
        <button class="board-back" id="boardBackBtn"><i class="fa-solid fa-arrow-left"></i> Todos os quadros</button>
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="board-header-icon" style="--bh-color:${board.color}"><i class="fa-solid ${board.icon}"></i></div>
          <div class="board-header-text">
            <h2>${escapeHtml(board.name)}</h2>
            <p>${escapeHtml(board.desc || 'Sem descrição.')} · Criado em ${fmtDate(board.createdAt.slice(0,10))}</p>
          </div>
          <div class="board-header-actions">
            <button class="icon-btn" id="boardFavBtn" title="Favoritar"><i class="fa-${board.favorite ? 'solid' : 'regular'} fa-star" style="${board.favorite ? 'color:var(--warning)' : ''}"></i></button>
            <button class="icon-btn" id="boardEditBtn" title="Editar quadro"><i class="fa-regular fa-pen-to-square"></i></button>
          </div>
        </div>
      </div>`;
    document.getElementById('boardBackBtn').addEventListener('click', () => switchView('boards'));
    document.getElementById('boardFavBtn').addEventListener('click', () => {
      board.favorite = !board.favorite; saveState(); renderBoard(); renderFavorites();
    });
    document.getElementById('boardEditBtn').addEventListener('click', () => openBoardModal(board));
    renderColumns(board);
    renderFilterChips();
  }
  function renderColumns(board) {
    const container = document.getElementById('boardColumns');
    const cols = [...board.columns].sort((a, b) => a.order - b.order);
    const filtered = currentFilteredCards(board.id);
    container.innerHTML = cols.map(col => {
      const cards = filtered.filter(c => c.columnId === col.id).sort((a, b) => a.order - b.order);
      const allInCol = getBoardCards(board.id).filter(c => c.columnId === col.id);
      const doneCount = allInCol.filter(c => c.status === 'concluido').length;
      const pct = allInCol.length ? Math.round((doneCount / allInCol.length) * 100) : 0;
      return `
      <div class="column" data-column="${col.id}">
        <div class="column-head" draggable="true" data-drag-column="${col.id}">
          <span class="column-color-dot" style="background:${col.color}"></span>
          <span class="column-title">${escapeHtml(col.name)}</span>
          <span class="column-count">${cards.length}</span>
          <div class="column-menu-btn">
            <button class="icon-btn" data-col-menu="${col.id}"><i class="fa-solid fa-ellipsis-vertical"></i></button>
          </div>
        </div>
        <div class="column-progress"><span style="width:${pct}%;background:${col.color}"></span></div>
        <div class="column-cards" data-drop-column="${col.id}">
          ${cards.map(cardHTML).join('')}
        </div>
        <button class="column-add" data-add-card="${col.id}"><i class="fa-solid fa-plus"></i> Adicionar tarefa</button>
      </div>`;
    }).join('') + `<button class="add-column-btn" id="addColumnBtn"><i class="fa-solid fa-plus"></i> Adicionar coluna</button>`;
    document.getElementById('addColumnBtn').addEventListener('click', () => openColumnModal());
    container.querySelectorAll('[data-add-card]').forEach(btn => {
      btn.addEventListener('click', () => openCardModal(null, btn.dataset.addCard));
    });
    container.querySelectorAll('.task-card').forEach(el => {
      el.addEventListener('click', () => openCardModal(el.dataset.card));
    });
    container.querySelectorAll('[data-col-menu]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown').forEach(d => d.remove());
        const col = board.columns.find(c => c.id === btn.dataset.colMenu);
        const dd = document.createElement('div');
        dd.className = 'dropdown';
        dd.innerHTML = `
          <button data-act="rename"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
          <button data-act="left"><i class="fa-solid fa-arrow-left"></i> Mover p/ esquerda</button>
          <button data-act="right"><i class="fa-solid fa-arrow-right"></i> Mover p/ direita</button>
          <button data-act="del" class="danger"><i class="fa-regular fa-trash-can"></i> Excluir coluna</button>`;
        btn.parentElement.style.position = 'relative';
        btn.parentElement.appendChild(dd);
        const closeDD = (ev) => { if (!dd.contains(ev.target)) { dd.remove(); document.removeEventListener('click', closeDD); } };
        setTimeout(() => document.addEventListener('click', closeDD), 0);
        dd.querySelector('[data-act="rename"]').addEventListener('click', () => { dd.remove(); openColumnModal(col); });
        dd.querySelector('[data-act="left"]').addEventListener('click', () => { dd.remove(); moveColumn(board, col.id, -1); });
        dd.querySelector('[data-act="right"]').addEventListener('click', () => { dd.remove(); moveColumn(board, col.id, 1); });
        dd.querySelector('[data-act="del"]').addEventListener('click', () => {
          dd.remove();
          const count = getBoardCards(board.id).filter(c => c.columnId === col.id).length;
          confirmAction('Excluir coluna?', `A coluna "${col.name}" ${count ? `e suas ${count} tarefa(s)` : ''} serão excluídas.`, () => deleteColumn(board, col.id));
        });
      });
    });
    setupCardDragDrop();
    setupColumnDragDrop();
  }
  function priorityClass(p) { return `priority-${p}`; }
  function cardHTML(c) {
    const board = getBoard(c.boardId);
    const checklistDone = c.checklist.filter(i => i.done).length;
    const overdue = isOverdue(c);
    return `
    <div class="task-card" draggable="true" data-card="${c.id}">
      <div class="task-card-status-bar" style="background:${PRIORITIES[c.priority].color}"></div>
      <div class="task-card-top">
        <span class="priority-dot ${priorityClass(c.priority)}" title="Prioridade: ${PRIORITIES[c.priority].label}"></span>
        <span class="task-card-title">${escapeHtml(c.title)}</span>
        <button class="task-card-fav ${c.favorite ? 'is-fav' : ''}" data-fav-card="${c.id}">
          <i class="fa-${c.favorite ? 'solid' : 'regular'} fa-star"></i>
        </button>
      </div>
      ${c.labels.length ? `<div class="task-card-labels">${c.labels.map(lid => {
        const l = getLabel(lid); return l ? `<span class="label-pill" style="background:${l.color}">${escapeHtml(l.name)}</span>` : '';
      }).join('')}</div>` : ''}
      <div class="task-card-meta">
        ${c.dueDate ? `<span class="meta-pill ${overdue ? 'overdue' : ''}"><i class="fa-regular fa-calendar"></i> ${fmtDate(c.dueDate)}</span>` : ''}
        ${c.checklist.length ? `<span class="meta-pill task-card-checklist-pill"><i class="fa-regular fa-square-check"></i> ${checklistDone}/${c.checklist.length}</span>` : ''}
        ${c.comments.length ? `<span class="meta-pill"><i class="fa-regular fa-comment"></i> ${c.comments.length}</span>` : ''}
        ${c.attachments.length ? `<span class="meta-pill"><i class="fa-solid fa-paperclip"></i> ${c.attachments.length}</span>` : ''}
      </div>
      <div class="task-card-foot">
        <span class="meta-pill" style="font-size:10.5px;">${escapeHtml(c.category || STATUS_LABELS[c.status])}</span>
        ${c.assignee ? `<div class="avatar task-card-assignee avatar-grad" title="${escapeHtml(getAssignee(c.assignee)?.name || '')}">${getAssignee(c.assignee)?.initials || ''}</div>` : ''}
      </div>
    </div>`;
  }
  
  document.getElementById('boardColumns').addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-fav-card]');
    if (favBtn) {
      e.stopPropagation();
      const c = state.cards.find(x => x.id === favBtn.dataset.favCard);
      c.favorite = !c.favorite;
      saveState(); renderBoard(); renderFavorites();
    }
  });
  
  let draggedCardId = null;
  function setupCardDragDrop() {
    document.querySelectorAll('.task-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedCardId = card.dataset.card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.column-cards').forEach(z => z.classList.remove('drag-over-zone'));
        document.querySelectorAll('.column').forEach(z => z.classList.remove('drag-over'));
      });
    });
    document.querySelectorAll('.column-cards').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedCardId) return;
        zone.classList.add('drag-over-zone');
        zone.closest('.column').classList.add('drag-over');
        const afterEl = getDragAfterElement(zone, e.clientY);
        const dragEl = document.querySelector(`.task-card[data-card="${draggedCardId}"]`);
        if (!dragEl) return;
        if (afterEl == null) zone.appendChild(dragEl);
        else zone.insertBefore(dragEl, afterEl);
      });
      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over-zone');
          zone.closest('.column').classList.remove('drag-over');
        }
      });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over-zone');
        zone.closest('.column').classList.remove('drag-over');
        if (!draggedCardId) return;
        const newColumnId = zone.dataset.dropColumn;
        const card = state.cards.find(c => c.id === draggedCardId);
        const oldColumnId = card.columnId;
        card.columnId = newColumnId;
        
        [...zone.querySelectorAll('.task-card')].forEach((el, idx) => {
          const cc = state.cards.find(x => x.id === el.dataset.card);
          if (cc) cc.order = idx;
        });
        if (oldColumnId !== newColumnId) {
          const board = getBoard(card.boardId);
          const oldCol = board.columns.find(c => c.id === oldColumnId);
          const newCol = board.columns.find(c => c.id === newColumnId);
          addHistory(`Tarefa "${card.title}" movida de "${oldCol?.name}" para "${newCol?.name}".`, 'move');
          toast('Tarefa movida', `${card.title} → ${newCol?.name}`, 'info');
        }
        saveState();
        draggedCardId = null;
        renderBoard();
      });
    });
  }
  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.task-card:not(.dragging)')];
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: -Infinity }).element;
  }
  
  let draggedColumnId = null;
  function setupColumnDragDrop() {
    document.querySelectorAll('[data-drag-column]').forEach(head => {
      head.addEventListener('dragstart', (e) => {
        draggedColumnId = head.dataset.dragColumn;
        e.stopPropagation();
      });
    });
    document.querySelectorAll('.column').forEach(col => {
      col.addEventListener('dragover', (e) => {
        if (draggedColumnId) e.preventDefault();
      });
      col.addEventListener('drop', (e) => {
        if (!draggedColumnId) return;
        e.preventDefault();
        e.stopPropagation();
        const board = getBoard(ui.currentBoardId);
        const targetId = col.dataset.column;
        if (targetId === draggedColumnId) return;
        const cols = [...board.columns].sort((a, b) => a.order - b.order);
        const fromIdx = cols.findIndex(c => c.id === draggedColumnId);
        const toIdx = cols.findIndex(c => c.id === targetId);
        const [moved] = cols.splice(fromIdx, 1);
        cols.splice(toIdx, 0, moved);
        cols.forEach((c, i) => c.order = i);
        draggedColumnId = null;
        saveState();
        renderBoard();
      });
    });
  }
  function moveColumn(board, colId, dir) {
    const cols = [...board.columns].sort((a, b) => a.order - b.order);
    const idx = cols.findIndex(c => c.id === colId);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cols.length) return;
    [cols[idx], cols[newIdx]] = [cols[newIdx], cols[idx]];
    cols.forEach((c, i) => c.order = i);
    saveState(); renderBoard();
  }
  function deleteColumn(board, colId) {
    const col = board.columns.find(c => c.id === colId);
    board.columns = board.columns.filter(c => c.id !== colId);
    state.cards = state.cards.filter(c => c.columnId !== colId);
    addHistory(`Coluna "${col.name}" foi excluída.`, 'delete');
    saveState(); renderBoard();
    toast('Coluna excluída', col.name, 'danger');
  }
  
  function openColumnModal(col = null) {
    document.getElementById('columnModalTitle').textContent = col ? 'Editar coluna' : 'Nova coluna';
    document.getElementById('columnId').value = col ? col.id : '';
    document.getElementById('columnName').value = col ? col.name : '';
    editingColumnColor = col ? col.color : BOARD_COLORS[0];
    document.querySelectorAll('#columnColorPicker .color-opt').forEach(b => b.classList.toggle('selected', b.dataset.color === editingColumnColor));
    openModal('modalColumn');
    document.getElementById('columnName').focus();
  }
  document.getElementById('btnSaveColumn').addEventListener('click', () => {
    const name = document.getElementById('columnName').value.trim();
    if (!name) { toast('Nome obrigatório', 'Dê um nome à coluna.', 'warning'); return; }
    const id = document.getElementById('columnId').value;
    const board = getBoard(ui.currentBoardId);
    if (id) {
      const col = board.columns.find(c => c.id === id);
      Object.assign(col, { name, color: editingColumnColor });
      toast('Coluna atualizada', name, 'success');
    } else {
      board.columns.push({ id: uid('col'), name, color: editingColumnColor, order: board.columns.length });
      addHistory(`Coluna "${name}" foi criada em "${board.name}".`, 'create');
      toast('Coluna criada', name, 'success');
    }
    saveState(); closeModal('modalColumn'); renderBoard();
  });
  
  function renderFilterChips() {
    document.querySelectorAll('.chip[data-filter]').forEach(chip => {
      const type = chip.dataset.filter;
      chip.classList.toggle('active', ui.filters[type].size > 0);
    });
    document.getElementById('chipFavOnly').classList.toggle('active', ui.favOnly);
  }
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = chip.dataset.filter;
      const pop = document.getElementById('filterPopover');
      let options = [];
      if (type === 'priority') options = Object.entries(PRIORITIES).map(([k, v]) => ({ id: k, label: `${v.icon} ${v.label}` }));
      if (type === 'label') options = state.labels.map(l => ({ id: l.id, label: l.name, color: l.color }));
      if (type === 'assignee') options = ASSIGNEES.map(a => ({ id: a.id, label: a.name }));
      if (type === 'status') options = Object.entries(STATUS_LABELS).map(([k, v]) => ({ id: k, label: v }));
      pop.innerHTML = options.map(o => `
        <label>
          <input type="checkbox" data-val="${o.id}" ${ui.filters[type].has(o.id) ? 'checked' : ''}>
          ${o.color ? `<span style="width:8px;height:8px;border-radius:3px;background:${o.color};display:inline-block;"></span>` : ''}
          ${escapeHtml(o.label)}
        </label>`).join('');
      const rect = chip.getBoundingClientRect();
      pop.style.left = rect.left + 'px';
      pop.classList.remove('hidden');
      pop.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('change', () => {
          if (inp.checked) ui.filters[type].add(inp.dataset.val);
          else ui.filters[type].delete(inp.dataset.val);
          renderColumns(getBoard(ui.currentBoardId));
          renderFilterChips();
        });
      });
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-popover') && !e.target.closest('.chip[data-filter]')) {
      document.getElementById('filterPopover').classList.add('hidden');
    }
  });
  document.getElementById('chipFavOnly').addEventListener('click', () => {
    ui.favOnly = !ui.favOnly;
    renderColumns(getBoard(ui.currentBoardId));
    renderFilterChips();
  });
  document.getElementById('chipClear').addEventListener('click', () => {
    Object.values(ui.filters).forEach(s => s.clear());
    ui.favOnly = false;
    renderColumns(getBoard(ui.currentBoardId));
    renderFilterChips();
  });
  document.getElementById('searchInput').addEventListener('input', (e) => {
    ui.search = e.target.value;
    if (ui.view === 'board' && ui.currentBoardId) renderColumns(getBoard(ui.currentBoardId));
  });
  
  function openCardModal(cardId, columnId) {
    const isNew = !cardId;
    const card = isNew
      ? {
          id: null, boardId: ui.currentBoardId, columnId, title: '', desc: '', priority: 'media', category: '',
          createdAt: new Date().toISOString(), dueDate: '', labels: [], checklist: [], assignee: '', comments: [],
          attachments: [], status: 'pendente', favorite: false, order: 0,
        }
      : state.cards.find(c => c.id === cardId);
    document.getElementById('cardId').value = card.id || '';
    document.getElementById('cardColumnId').value = card.columnId;
    document.getElementById('cardTitle').value = card.title;
    document.getElementById('cardDesc').value = card.desc;
    document.getElementById('cardStatus').value = card.status;
    document.getElementById('cardPriority').value = card.priority;
    document.getElementById('cardCategory').value = card.category;
    document.getElementById('cardDueDate').value = card.dueDate || '';
    const assigneeSel = document.getElementById('cardAssignee');
    assigneeSel.innerHTML = `<option value="">Sem responsável</option>` + ASSIGNEES.map(a => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('');
    assigneeSel.value = card.assignee || '';
    ui.editingChecklist = JSON.parse(JSON.stringify(card.checklist || []));
    ui.editingComments = JSON.parse(JSON.stringify(card.comments || []));
    ui.editingAttachments = JSON.parse(JSON.stringify(card.attachments || []));
    ui.editingLabels = new Set(card.labels || []);
    renderChecklist(); renderComments(); renderAttachments(); renderLabelPicker();
    document.getElementById('cardMetaInfo').innerHTML = isNew ? '' : `
      <span><i class="fa-regular fa-calendar-plus"></i> Criada em ${fmtDateTime(card.createdAt)}</span>`;
    document.getElementById('btnDeleteCard').classList.toggle('hidden', isNew);
    document.getElementById('btnDuplicateCard').classList.toggle('hidden', isNew);
    openModal('modalCard');
    document.getElementById('cardTitle').focus();
  }
  function renderChecklist() {
    const el = document.getElementById('cardChecklist');
    const done = ui.editingChecklist.filter(i => i.done).length;
    el.innerHTML = (ui.editingChecklist.length ? `<div class="checklist-progress">${done}/${ui.editingChecklist.length} concluídos</div>` : '') +
      ui.editingChecklist.map(item => `
      <div class="checklist-item ${item.done ? 'done' : ''}" data-id="${item.id}">
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span>${escapeHtml(item.text)}</span>
        <button data-del><i class="fa-solid fa-xmark"></i></button>
      </div>`).join('');
    el.querySelectorAll('.checklist-item').forEach(row => {
      row.querySelector('input').addEventListener('change', (e) => {
        const item = ui.editingChecklist.find(i => i.id === row.dataset.id);
        item.done = e.target.checked; renderChecklist();
      });
      row.querySelector('[data-del]').addEventListener('click', () => {
        ui.editingChecklist = ui.editingChecklist.filter(i => i.id !== row.dataset.id); renderChecklist();
      });
    });
  }
  document.getElementById('btnAddChecklistItem').addEventListener('click', () => {
    const text = prompt('Novo item do checklist:');
    if (text && text.trim()) { ui.editingChecklist.push({ id: uid('chk'), text: text.trim(), done: false }); renderChecklist(); }
  });
  function renderComments() {
    const el = document.getElementById('cardComments');
    el.innerHTML = ui.editingComments.map(cm => `
      <div class="comment">
        <div class="avatar avatar-sm avatar-grad">${cm.author.slice(0,2).toUpperCase()}</div>
        <div class="comment-body">
          <strong>${escapeHtml(cm.author)}</strong>
          <p>${escapeHtml(cm.text)}</p>
          <time>${fmtDateTime(cm.createdAt)}</time>
        </div>
      </div>`).join('') || `<p class="muted" style="font-size:12px;">Nenhum comentário ainda.</p>`;
  }
  document.getElementById('btnAddComment').addEventListener('click', () => {
    const input = document.getElementById('newCommentInput');
    if (!input.value.trim()) return;
    ui.editingComments.push({ id: uid('cm'), author: 'Camila Moraes', text: input.value.trim(), createdAt: new Date().toISOString() });
    input.value = ''; renderComments();
  });
  document.getElementById('newCommentInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btnAddComment').click();
  });
  function renderAttachments() {
    const el = document.getElementById('cardAttachments');
    el.innerHTML = ui.editingAttachments.map(a => `
      <div class="attachment-item" data-id="${a.id}">
        <i class="fa-regular fa-file"></i><span>${escapeHtml(a.name)}</span>
        <button data-del><i class="fa-solid fa-xmark"></i></button>
      </div>`).join('') || `<p class="muted" style="font-size:12px;">Nenhum anexo.</p>`;
    el.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.attachment-item').dataset.id;
        ui.editingAttachments = ui.editingAttachments.filter(a => a.id !== id);
        renderAttachments();
      });
    });
  }
  document.getElementById('btnAddAttachment').addEventListener('click', () => {
    const fakeFiles = ['especificacao.pdf', 'mockup-final.png', 'planilha-dados.xlsx', 'print-bug.png', 'briefing.docx'];
    const name = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
    ui.editingAttachments.push({ id: uid('att'), name });
    renderAttachments();
  });
  function renderLabelPicker() {
    const el = document.getElementById('cardLabelPicker');
    el.innerHTML = state.labels.map(l => `
      <button type="button" class="label-opt ${ui.editingLabels.has(l.id) ? 'selected' : ''}" data-id="${l.id}" style="background:${l.color}">${escapeHtml(l.name)}</button>`).join('');
    el.querySelectorAll('.label-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (ui.editingLabels.has(btn.dataset.id)) ui.editingLabels.delete(btn.dataset.id);
        else ui.editingLabels.add(btn.dataset.id);
        renderLabelPicker();
      });
    });
  }
  document.getElementById('btnSaveCard').addEventListener('click', () => {
    const title = document.getElementById('cardTitle').value.trim();
    if (!title) { toast('Título obrigatório', 'Dê um título para a tarefa.', 'warning'); return; }
    const id = document.getElementById('cardId').value;
    const payload = {
      title,
      desc: document.getElementById('cardDesc').value.trim(),
      status: document.getElementById('cardStatus').value,
      priority: document.getElementById('cardPriority').value,
      category: document.getElementById('cardCategory').value.trim(),
      dueDate: document.getElementById('cardDueDate').value,
      assignee: document.getElementById('cardAssignee').value,
      labels: [...ui.editingLabels],
      checklist: ui.editingChecklist,
      comments: ui.editingComments,
      attachments: ui.editingAttachments,
    };
    if (id) {
      const card = state.cards.find(c => c.id === id);
      const priorityChanged = card.priority !== payload.priority;
      Object.assign(card, payload);
      addHistory(`Tarefa "${title}" foi atualizada.`, 'edit');
      if (priorityChanged) addHistory(`Prioridade de "${title}" alterada para ${PRIORITIES[payload.priority].label}.`, 'priority');
      toast('Tarefa atualizada', title, 'success');
    } else {
      const columnId = document.getElementById('cardColumnId').value;
      const board = getBoard(ui.currentBoardId);
      const order = getBoardCards(board.id).filter(c => c.columnId === columnId).length;
      state.cards.push({ id: uid('card'), boardId: board.id, columnId, createdAt: new Date().toISOString(), favorite: false, order, ...payload });
      addHistory(`Tarefa "${title}" foi criada.`, 'create');
      toast('Tarefa criada', title, 'success');
    }
    saveState();
    closeModal('modalCard');
    renderBoard();
  });
  document.getElementById('btnDeleteCard').addEventListener('click', () => {
    const id = document.getElementById('cardId').value;
    const card = state.cards.find(c => c.id === id);
    confirmAction('Excluir tarefa?', `A tarefa "${card.title}" será excluída permanentemente.`, () => {
      state.cards = state.cards.filter(c => c.id !== id);
      addHistory(`Tarefa "${card.title}" foi excluída.`, 'delete');
      saveState();
      closeModal('modalCard');
      renderBoard();
      toast('Tarefa excluída', card.title, 'danger');
    });
  });
  document.getElementById('btnDuplicateCard').addEventListener('click', () => {
    const id = document.getElementById('cardId').value;
    const card = state.cards.find(c => c.id === id);
    const copy = { ...card, id: uid('card'), title: card.title + ' (cópia)', favorite: false, comments: [] };
    state.cards.push(copy);
    addHistory(`Tarefa "${card.title}" foi duplicada.`, 'create');
    saveState();
    closeModal('modalCard');
    renderBoard();
    toast('Tarefa duplicada', card.title, 'success');
  });
  
  function renderDashboard() {
    const cards = state.cards;
    const total = cards.length;
    const done = cards.filter(c => c.status === 'concluido').length;
    const andamento = cards.filter(c => c.status === 'andamento').length;
    const pendente = cards.filter(c => c.status === 'pendente' || c.status === 'revisao').length;
    const atrasadas = cards.filter(isOverdue).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const stats = [
      { label: 'Total de tarefas', value: total, icon: 'fa-list-check', color: '#5b8cff' },
      { label: 'Concluídas', value: done, icon: 'fa-circle-check', color: '#34d399' },
      { label: 'Em andamento', value: andamento, icon: 'fa-spinner', color: '#9b6bff' },
      { label: 'Pendentes', value: pendente, icon: 'fa-hourglass-half', color: '#fbbf24' },
      { label: 'Atrasadas', value: atrasadas, icon: 'fa-triangle-exclamation', color: '#fb5b6f' },
      { label: 'Percentual concluído', value: pct + '%', icon: 'fa-chart-pie', color: '#38bdf8' },
    ];
    document.getElementById('statsGrid').innerHTML = stats.map(s => `
      <div class="stat-card">
        <div class="stat-icon" style="background:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('');
    
    const ring = document.getElementById('ringWrap');
    ring.innerHTML = `
      <div class="progress-ring" style="background:conic-gradient(#5b8cff ${pct * 3.6}deg, var(--surface-2) 0deg)">
        <div class="progress-ring" style="width:128px;height:128px;background:var(--surface);">
          <div class="progress-ring-label"><span class="big">${pct}%</span><span class="small">concluído</span></div>
        </div>
      </div>`;
    
    const byPriority = Object.keys(PRIORITIES).map(k => ({ k, n: cards.filter(c => c.priority === k).length }));
    const maxP = Math.max(1, ...byPriority.map(x => x.n));
    document.getElementById('barChartPriority').innerHTML = byPriority.map(x => `
      <div class="bar-row">
        <span class="bar-label">${PRIORITIES[x.k].icon} ${PRIORITIES[x.k].label}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(x.n/maxP)*100}%;background:${PRIORITIES[x.k].color}"></div></div>
        <span class="bar-value">${x.n}</span>
      </div>`).join('');
    
    const colMap = {};
    state.boards.forEach(b => b.columns.forEach(c => { colMap[c.name] = colMap[c.name] || { n: 0, color: c.color }; }));
    cards.forEach(c => {
      const board = getBoard(c.boardId); if (!board) return;
      const col = board.columns.find(cc => cc.id === c.columnId); if (!col) return;
      colMap[col.name] = colMap[col.name] || { n: 0, color: col.color };
      colMap[col.name].n++;
    });
    const maxC = Math.max(1, ...Object.values(colMap).map(x => x.n));
    document.getElementById('barChartColumn').innerHTML = Object.entries(colMap).map(([name, x]) => `
      <div class="bar-row">
        <span class="bar-label">${escapeHtml(name)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(x.n/maxC)*100}%;background:${x.color}"></div></div>
        <span class="bar-value">${x.n}</span>
      </div>`).join('') || `<p class="muted" style="font-size:12px;">Sem dados ainda.</p>`;
  }
  
  function renderCalendar() {
    const monthDate = ui.calMonth;
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    document.getElementById('calLabel').textContent = monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, other: true, month: month - 1 });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false, month });
    while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ day: cells.length - (startOffset + daysInMonth) + 1, other: true, month: month + 1 });
    const grid = document.getElementById('calendarGrid');
    const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const todayStr = todayISO();
    grid.innerHTML = `<div class="calendar-weekdays">${weekdays.map(w => `<span>${w}</span>`).join('')}</div>
      <div class="calendar-days">${cells.map(cell => {
        const cellDate = new Date(year, cell.month, cell.day);
        const iso = cellDate.toISOString().slice(0, 10);
        const dayCards = state.cards.filter(c => c.dueDate === iso);
        return `<div class="cal-day ${cell.other ? 'other-month' : ''} ${iso === todayStr ? 'today' : ''}">
          <span class="day-num">${cell.day}</span>
          <div class="cal-day-tasks">
            ${dayCards.slice(0, 3).map(c => `<span class="cal-task-pill ${isOverdue(c) ? 'overdue' : ''}" style="background:${PRIORITIES[c.priority].color}" data-card="${c.id}" title="${escapeHtml(c.title)}">${escapeHtml(c.title)}</span>`).join('')}
            ${dayCards.length > 3 ? `<span class="muted" style="font-size:10px;">+${dayCards.length - 3} mais</span>` : ''}
          </div>
        </div>`;
      }).join('')}</div>`;
    grid.querySelectorAll('[data-card]').forEach(pill => {
      pill.addEventListener('click', () => {
        const c = state.cards.find(x => x.id === pill.dataset.card);
        ui.currentBoardId = c.boardId;
        switchView('board');
        setTimeout(() => openCardModal(c.id), 80);
      });
    });
  }
  document.getElementById('calPrev').addEventListener('click', () => { ui.calMonth.setMonth(ui.calMonth.getMonth() - 1); renderCalendar(); });
  document.getElementById('calNext').addEventListener('click', () => { ui.calMonth.setMonth(ui.calMonth.getMonth() + 1); renderCalendar(); });
  
  function renderFavorites() {
    const favBoards = state.boards.filter(b => b.favorite);
    const favBoardsGrid = document.getElementById('favBoardsGrid');
    favBoardsGrid.innerHTML = favBoards.map(boardTileHTML).join('') || `<p class="muted" style="font-size:13px;">Nenhum quadro favoritado.</p>`;
    attachBoardTileEvents(favBoardsGrid);
    const favCards = state.cards.filter(c => c.favorite);
    document.getElementById('favCardsList').innerHTML = favCards.map(c => `
      <div class="task-card" data-card="${c.id}" style="cursor:pointer;">
        <div class="task-card-status-bar" style="background:${PRIORITIES[c.priority].color}"></div>
        <div class="task-card-top">
          <span class="priority-dot ${priorityClass(c.priority)}"></span>
          <span class="task-card-title">${escapeHtml(c.title)}</span>
          <span class="meta-pill" style="font-size:10.5px;">${escapeHtml(getBoard(c.boardId)?.name || '')}</span>
        </div>
      </div>`).join('') || `<p class="muted" style="font-size:13px;">Nenhuma tarefa favoritada.</p>`;
    document.getElementById('favCardsList').querySelectorAll('[data-card]').forEach(el => {
      el.addEventListener('click', () => {
        const c = state.cards.find(x => x.id === el.dataset.card);
        ui.currentBoardId = c.boardId;
        switchView('board');
        setTimeout(() => openCardModal(c.id), 80);
      });
    });
  }
  
  const HISTORY_ICONS = {
    create: { icon: 'fa-plus', color: '#34d399' },
    edit: { icon: 'fa-pen', color: '#5b8cff' },
    delete: { icon: 'fa-trash', color: '#fb5b6f' },
    move: { icon: 'fa-arrows-up-down-left-right', color: '#9b6bff' },
    priority: { icon: 'fa-bolt', color: '#fbbf24' },
    info: { icon: 'fa-circle-info', color: '#5b8cff' },
  };
  function renderHistory() {
    const el = document.getElementById('historyTimeline');
    el.innerHTML = state.history.map(h => {
      const meta = HISTORY_ICONS[h.type] || HISTORY_ICONS.info;
      return `<div class="timeline-item">
        <div class="timeline-dot" style="background:${meta.color}"><i class="fa-solid ${meta.icon}"></i></div>
        <div class="timeline-content"><p>${escapeHtml(h.text)}</p><time>${fmtDateTime(h.createdAt)}</time></div>
      </div>`;
    }).join('') || `<div class="empty-state"><i class="fa-regular fa-clock"></i><h3>Sem atividades</h3><p>O histórico de alterações aparecerá aqui.</p></div>`;
  }
  document.getElementById('btnClearHistory').addEventListener('click', () => {
    confirmAction('Limpar histórico?', 'Todo o histórico de alterações será removido.', () => {
      state.history = []; saveState(); renderHistory();
      toast('Histórico limpo', '', 'success');
    });
  });
  
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    document.getElementById('themeToggle').innerHTML = `<i class="fa-solid ${state.theme === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>`;
    document.getElementById('settingsThemeSwitch').checked = state.theme === 'dark';
  }
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    saveState(); applyTheme();
  }
  document.getElementById('settingsThemeSwitch').addEventListener('change', toggleTheme);
  
  document.getElementById('btnSettings').addEventListener('click', () => openModal('modalSettings'));
  document.getElementById('settingsNotifSwitch').addEventListener('change', (e) => {
    state.settings.notifications = e.target.checked; saveState();
  });
  document.getElementById('btnResetData').addEventListener('click', () => {
    confirmAction('Limpar todos os dados?', 'Todos os quadros, tarefas e histórico serão apagados permanentemente.', () => {
      localStorage.removeItem(STORAGE_KEY);
      state = seedData();
      saveState();
      closeModal('modalSettings');
      closeModal('modalConfirm');
      ui.currentBoardId = null;
      switchView('boards');
      toast('Dados limpos', 'O espaço de trabalho foi reiniciado.', 'success');
    });
  });
  
  document.getElementById('shortcutsBtn').addEventListener('click', () => openModal('modalShortcuts'));
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === '/' && !typing) { e.preventDefault(); document.getElementById('searchInput').focus(); }
    if ((e.key === 'n' || e.key === 'N') && !typing) { openBoardModal(); }
    if ((e.key === 't' || e.key === 'T') && !typing) { toggleTheme(); }
  });
  
  const backToTop = document.getElementById('backToTop');
  document.addEventListener('scroll', () => {
    backToTop.classList.toggle('hidden', window.scrollY < 300);
  }, true);
  document.querySelector('.main').addEventListener?.('scroll', () => {});
  backToTop.addEventListener('click', () => {
    document.querySelector('.main').scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.addEventListener('DOMContentLoaded', () => {
    const main = document.querySelector('.main');
    if (main) main.addEventListener('scroll', () => backToTop.classList.toggle('hidden', main.scrollTop < 300));
  });
  
  document.getElementById('notifBtn').addEventListener('click', () => switchView('history'));
  
  function init() {
    buildPickers();
    applyTheme();
    renderSidebarBoards();
    switchView('boards');
    
    setTimeout(() => {
      document.getElementById('loader').classList.add('fade-out');
      document.getElementById('app').classList.remove('hidden');
      setTimeout(() => document.getElementById('loader').remove(), 600);
    }, 700);
  }
  init();
})();
