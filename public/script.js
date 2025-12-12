let tasks = [];

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  Telegram.WebApp.setHeaderColor('#ffffff');
  Telegram.WebApp.setBackgroundColor('#f5f5f7');
  Telegram.WebApp.MainButton.hide();
}

// Инициализация приоритетов
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

// Загрузка задач
async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tasks = await res.json();
    renderTasks();
  } catch (e) {
    console.error('Ошибка загрузки задач:', e);
  }
}

// Добавление задачи
async function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const priorityBtn = document.querySelector('.priority-btn.active');
  const priority = priorityBtn ? priorityBtn.dataset.value : 'medium';
  const deadlineRaw = document.getElementById('deadline').value;

  if (!text) return;

  const deadline = deadlineRaw ? new Date(deadlineRaw).getTime() : null;

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, priority, deadline })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();
    
    // Сброс формы
    hideAddForm();
    document.getElementById('taskInput').value = '';
    document.getElementById('deadline').value = '';
    document.querySelector('.priority-btn.medium').click();
    
    fetchTasks();
  } catch (e) {
    alert('Не удалось добавить задачу. Попробуйте позже.');
    console.error(e);
  }
}

// Переключение статуса
async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();
    fetchTasks();
  } catch (e) {
    alert('Не удалось обновить задачу.');
    console.error(e);
  }
}

// Удаление задачи
async function deleteTask(id) {
  if (!confirm('Удалить задачу?')) return;
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fetchTasks();
  } catch (e) {
    alert('Не удалось удалить задачу.');
    console.error(e);
  }
}

// Обработка дат
function parseDate(ts) {
  if (!ts) return null;
  const num = Number(ts);
  return isNaN(num) ? null : new Date(num);
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = parseDate(timestamp);
  if (!date) return '';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (taskDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function priorityEmoji(priority) {
  switch (priority) {
    case 'high': return '❗';
    case 'medium': return '⚠️';
    case 'low': return '🕗';
    default: return '';
  }
}

// Группировка задач
function groupTasks() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const today = [];
  const scheduled = [];
  const completed = [];

  tasks.forEach(task => {
    const deadline = parseDate(task.deadline);
    if (task.completed) {
      completed.push(task);
    } else if (deadline) {
      if (deadline >= todayStart && deadline < tomorrowStart) {
        today.push(task);
      } else if (deadline >= tomorrowStart) {
        scheduled.push(task);
      } else {
        today.push(task); // дедлайн в прошлом → сегодня
      }
    } else {
      today.push(task); // без дедлайна → сегодня
    }
  });

  return { today, scheduled, completed };
}

// Рендеринг
function renderTasks() {
  const { today, scheduled, completed } = groupTasks();

  renderTaskList('todayTasks', today);
  renderTaskList('scheduledTasks', scheduled);
  renderTaskList('completedTasks', completed);

  document.getElementById('completedCount').textContent = completed.length;

  // Управление видимостью секций
  document.getElementById('todaySection').style.display = today.length ? 'block' : 'none';
  document.getElementById('scheduledSection').style.display = scheduled.length ? 'block' : 'none';
  document.getElementById('completedSection').style.display = 'block'; // всегда показываем, даже если 0
}

function renderTaskList(containerId, tasksList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (tasksList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-title">Нет задач</p>
        <p class="empty-desc">Нажмите «➕» чтобы добавить</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  tasksList.forEach(task => {
    const deadlineStr = task.deadline ? formatDate(task.deadline) : '';
    const emoji = priorityEmoji(task.priority);
    
    const div = document.createElement('div');
    div.className = `task ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="task-main" onclick="toggleTask(${task.id})">
        <div class="checkbox ${task.completed ? 'checked' : ''}">
          ${task.completed ? '✓' : ''}
        </div>
        <div class="task-content">
          <div class="task-text ${task.completed ? 'completed-text' : ''}">${task.text}</div>
          ${(emoji || deadlineStr) ? `<div class="task-meta">${emoji}${deadlineStr ? ' ' + deadlineStr : ''}</div>` : ''}
        </div>
      </div>
      <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})">×</button>
    `;
    container.appendChild(div);
  });
}

// Управление формой
function showAddForm() {
  document.getElementById('addForm').classList.remove('hidden');
  setTimeout(() => document.getElementById('taskInput').focus(), 100);
}

function hideAddForm() {
  document.getElementById('addForm').classList.add('hidden');
}

// Сворачивание завершённых
function toggleCompleted() {
  const list = document.getElementById('completedTasks');
  const chevron = document.querySelector('.chevron');
  if (!list || !chevron) return;
  
  const isHidden = list.classList.contains('hidden');
  list.classList.toggle('hidden', !isHidden);
  chevron.textContent = isHidden ? '▼' : '▲';
}

// Инициализация
fetchTasks();