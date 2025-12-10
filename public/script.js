let tasks = [];

async function fetchTasks() {
  const res = await fetch('/api/tasks');
  tasks = await res.json();
  renderTasks();
}

async function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) return;

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  input.value = '';
  fetchTasks();
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: !task.completed })
  });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, {
    method: 'DELETE'
  });
  fetchTasks();
}

function renderTasks() {
  const container = document.getElementById('tasks');
  container.innerHTML = tasks.length ? '' : '<p class="empty">Нет задач</p>';

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `task ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})"></div>
      <span class="task-text">${task.text}</span>
      <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
    `;
    container.appendChild(div);
  });
}

// Инициализация
if (window.Telegram?.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}

fetchTasks();