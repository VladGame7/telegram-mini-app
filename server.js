const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
let tasks = [];
let idCounter = 1;

// Получить задачи
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Добавить задачу
app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  const task = {
    id: idCounter++,
    text,
    completed: false,
    createdAt: Date.now()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// Обновить задачу
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { completed } = req.body;
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.completed = completed;
  res.json(task);
});

// Удалить задачу
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});