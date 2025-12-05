'use client';

import { useState, useEffect } from 'react';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export default function Reminders() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  // Загружаем из localStorage при старте
  useEffect(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Сохраняем при изменении
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">✅</span>
          </div>
          <h1 className="text-2xl font-semibold">Напоминания</h1>
        </div>

        {/* Input */}
        <div className="mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Новая задача"
            className="w-full p-4 pr-12 text-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTask}
            className="absolute right-6 top-[112px] text-blue-500 font-medium"
          >
            Добавить
          </button>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-12">
              Нет задач. Начните с добавления первой!
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center p-4 rounded-xl ${
                  task.completed
                    ? 'bg-gray-100 dark:bg-zinc-800 line-through text-gray-500 dark:text-gray-500'
                    : 'bg-white dark:bg-zinc-900'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    task.completed
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-400 dark:border-zinc-600'
                  }`}
                >
                  {task.completed && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </button>
                <span className="flex-1 text-lg">{task.text}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}