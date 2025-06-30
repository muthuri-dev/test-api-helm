const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for tasks
let tasks = [
  { id: 1, text: 'Learn Express.js', completed: false },
  { id: 2, text: 'Build a SPA', completed: false }
];
let nextId = 3;

// Serve the HTML page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager SPA</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .task-form {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }

        .input-group {
            display: flex;
            gap: 10px;
        }

        #taskInput {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }

        #taskInput:focus {
            border-color: #667eea;
        }

        #addBtn {
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s;
        }

        #addBtn:hover {
            transform: translateY(-2px);
        }

        .tasks-container {
            padding: 30px;
        }

        .task-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            transition: all 0.3s;
        }

        .task-item:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .task-item.completed {
            opacity: 0.7;
            border-left-color: #28a745;
        }

        .task-item.completed .task-text {
            text-decoration: line-through;
            color: #6c757d;
        }

        .task-checkbox {
            margin-right: 15px;
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        .task-text {
            flex: 1;
            font-size: 16px;
            color: #333;
        }

        .delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }

        .delete-btn:hover {
            background: #c82333;
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: #6c757d;
        }

        .empty-state i {
            font-size: 3em;
            margin-bottom: 20px;
            display: block;
        }

        .stats {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8f9fa;
            border-top: 1px solid #eee;
        }

        .stat {
            text-align: center;
        }

        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }

        .stat-label {
            font-size: 0.9em;
            color: #6c757d;
            margin-top: 5px;
        }

        @media (max-width: 480px) {
            .input-group {
                flex-direction: column;
            }
            
            #addBtn {
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Task Manager</h1>
            <p>Stay organized and productive</p>
        </div>

        <div class="task-form">
            <div class="input-group">
                <input type="text" id="taskInput" placeholder="What needs to be done?" />
                <button id="addBtn">Add Task</button>
            </div>
        </div>

        <div class="tasks-container">
            <div id="tasksList"></div>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-number" id="totalTasks">0</div>
                <div class="stat-label">Total Tasks</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="completedTasks">0</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="pendingTasks">0</div>
                <div class="stat-label">Pending</div>
            </div>
        </div>
    </div>

    <script>
        class TaskManager {
            constructor() {
                this.tasks = [];
                this.init();
            }

            async init() {
                await this.loadTasks();
                this.bindEvents();
                this.render();
            }

            bindEvents() {
                document.getElementById('addBtn').addEventListener('click', () => this.addTask());
                document.getElementById('taskInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });
            }

            async loadTasks() {
                try {
                    const response = await fetch('/api/tasks');
                    this.tasks = await response.json();
                } catch (error) {
                    console.error('Error loading tasks:', error);
                }
            }

            async addTask() {
                const input = document.getElementById('taskInput');
                const text = input.value.trim();
                
                if (!text) return;

                try {
                    const response = await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text })
                    });
                    
                    const newTask = await response.json();
                    this.tasks.push(newTask);
                    input.value = '';
                    this.render();
                } catch (error) {
                    console.error('Error adding task:', error);
                }
            }

            async toggleTask(id) {
                try {
                    const response = await fetch(\`/api/tasks/\${id}/toggle\`, {
                        method: 'PUT'
                    });
                    
                    const updatedTask = await response.json();
                    const index = this.tasks.findIndex(t => t.id === id);
                    if (index !== -1) {
                        this.tasks[index] = updatedTask;
                        this.render();
                    }
                } catch (error) {
                    console.error('Error toggling task:', error);
                }
            }

            async deleteTask(id) {
                try {
                    await fetch(\`/api/tasks/\${id}\`, {
                        method: 'DELETE'
                    });
                    
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.render();
                } catch (error) {
                    console.error('Error deleting task:', error);
                }
            }

            render() {
                const tasksList = document.getElementById('tasksList');
                
                if (this.tasks.length === 0) {
                    tasksList.innerHTML = \`
                        <div class="empty-state">
                            <i>📝</i>
                            <h3>No tasks yet</h3>
                            <p>Add your first task above to get started!</p>
                        </div>
                    \`;
                } else {
                    tasksList.innerHTML = this.tasks.map(task => \`
                        <div class="task-item \${task.completed ? 'completed' : ''}">
                            <input type="checkbox" class="task-checkbox" 
                                   \${task.completed ? 'checked' : ''} 
                                   onchange="taskManager.toggleTask(\${task.id})">
                            <span class="task-text">\${task.text}</span>
                            <button class="delete-btn" onclick="taskManager.deleteTask(\${task.id})">
                                Delete
                            </button>
                        </div>
                    \`).join('');
                }
                
                this.updateStats();
            }

            updateStats() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.completed).length;
                const pending = total - completed;

                document.getElementById('totalTasks').textContent = total;
                document.getElementById('completedTasks').textContent = completed;
                document.getElementById('pendingTasks').textContent = pending;
            }
        }

        // Initialize the app
        const taskManager = new TaskManager();
    </script>
</body>
</html>
  `);
});

// API Routes
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Task text is required' });
  }

  const newTask = {
    id: nextId++,
    text,
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = !task.completed;
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;