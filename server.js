const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let tasks = [];
let idCounter = 1;

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const { text, priority = 'medium', deadline = null, completed = false } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  const task = {
    id: idCounter++,
    text,
    priority,
    deadline,
    completed,
    createdAt: Date.now()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { completed, text, priority, deadline } = req.body;
  if (completed !== undefined) task.completed = completed;
  if (text !== undefined) task.text = text;
  if (priority) task.priority = priority;
  if (deadline !== undefined) task.deadline = deadline;

  res.json(task);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});