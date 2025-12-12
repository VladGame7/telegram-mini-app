let tasks = [];

// Инициализация Telegram WebApp
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  Telegram.WebApp.setHeaderColor('#ffffff');
  Telegram.WebApp.setBackgroundColor('#f5f5f7');
}

// Загрузка задач
async function fetchTasks() {
  try {
    const res = await fetch('/api/tasks');
    tasks = await res.json();
    renderTasks();
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

// Добавление задачи
async function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  const priority = document.getElementById('priority').value;
  const deadlineRaw = document.getElementById('deadline').value;

  if (!text) return;

  const deadline = deadlineRaw ? new Date(deadlineRaw).getTime() : null;

  const task = {
    text,
    priority,
    deadline,
    completed: false,
    createdAt: Date.now()
  };

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    await res.json();
    hideAddForm();
    document.getElementById('taskInput').value = '';
    document.getElementById('deadline').value = '';
    fetchTasks();
  } catch (e) {
    alert('Ошибка при сохранении');
  }
}

// Переключение статуса
async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    fetchTasks();
  } catch (e) {
    alert('Ошибка при обновлении');
  }
}

// Удаление задачи
async function deleteTask(id) {
  if (!confirm('Удалить задачу?')) return;
  try {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  } catch (e) {
    alert('Ошибка при удалении');
  }
}

// Форматирование даты (iOS-style)
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

// Группировка задач
function groupTasks() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    today: tasks.filter(t => 
      !t.completed && 
      t.deadline && 
      new Date(t.deadline).toDateString() === today.toDateString()
    ),
    scheduled: tasks.filter(t => 
      !t.completed && 
      t.deadline && 
      new Date(t.deadline) >= tomorrow
    ),
    completed: tasks.filter(t => t.completed)
  };
}

// Отрисовка
function renderTasks() {
  const { today, scheduled, completed } = groupTasks();
  
  // Today
  renderTaskList('todayTasks', today);
  // Scheduled
  renderTaskList('scheduledTasks', scheduled);
  // Completed
  renderTaskList('completedTasks', completed);
  document.getElementById('completedCount').textContent = completed.length;
}

function renderTaskList(containerId, tasksList) {
  const container = document.getElementById(containerId);
  container.innerHTML = tasksList.length ? '' : `<div class="empty">Нет задач</div>`;

  tasksList.forEach(task => {
    const deadlineStr = task.deadline ? formatDate(task.deadline) : '';
    const priorityClass = `priority-${task.priority}`;
    
    const div = document.createElement('div');
    div.className = `task ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="task-main" onclick="toggleTask(${task.id})">
        <div class="checkbox ${task.completed ? 'checked' : ''}">
          ${task.completed ? '✓' : ''}
        </div>
        <div class="task-content">
          <div class="task-text ${task.completed ? 'completed-text' : ''}">${task.text}</div>
          ${deadlineStr ? `<div class="task-meta"><span class="${priorityClass}">●</span> ${deadlineStr}</div>` : ''}
        </div>
      </div>
      <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})">✕</button>
    `;
    container.appendChild(div);
  });

  // Показываем/скрываем секции
  document.querySelector('#todayTasks').closest('.section').style.display = 
    today.length ? 'block' : 'none';
  document.querySelector('#scheduledTasks').closest('.section').style.display = 
    scheduled.length ? 'block' : 'none';
}

// Управление формой
function showAddForm() {
  document.getElementById('addForm').classList.remove('hidden');
  document.getElementById('taskInput').focus();
}
function hideAddForm() {
  document.getElementById('addForm').classList.add('hidden');
}

// Свайп-удаление (простой вариант)
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
}

function handleTouchMove(evt) {
  if (!xDown) return;
  const xUp = evt.touches[0].clientX;
  const xDiff = xDown - xUp;
  if (Math.abs(xDiff) > 30) {
    // Свайп влево → показать delete-btn
    const task = evt.target.closest('.task');
    if (task) {
      const deleteBtn = task.querySelector('.delete-btn');
      if (deleteBtn) deleteBtn.style.opacity = '1';
    }
  }
  xDown = null;
}

// Сворачивание завершённых
function toggleCompleted() {
  const list = document.getElementById('completedTasks');
  const chevron = document.querySelector('.chevron');
  list.classList.toggle('hidden');
  chevron.textContent = list.classList.contains('hidden') ? '▼' : '▲';
}

// Инициализация
fetchTasks();