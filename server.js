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
  const { text, priority = 'medium', deadline = null } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required and must be a string' });
  }

  // Валидация priority
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'priority must be one of: low, medium, high' });
  }

  // Валидация deadline (опционально — число или null)
  let parsedDeadline = null;
  if (deadline != null) {
    const num = Number(deadline);
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ error: 'deadline must be a valid timestamp or null' });
    }
    parsedDeadline = num;
  }

  const task = {
    id: idCounter++,
    text: text.trim(),
    priority,
    deadline: parsedDeadline,
    completed: false,
    createdAt: Date.now()
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { completed, text, priority, deadline } = req.body;

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    task.completed = completed;
  }

  if (text !== undefined) {
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'text must be a string' });
    }
    task.text = text.trim();
  }

  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'priority must be one of: low, medium, high' });
    }
    task.priority = priority;
  }

  if (deadline !== undefined) {
    if (deadline === null) {
      task.deadline = null;
    } else {
      const num = Number(deadline);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ error: 'deadline must be a valid timestamp or null' });
      }
      task.deadline = num;
    }
  }

  res.json(task);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});