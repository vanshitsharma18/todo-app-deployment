// API Configuration
const API_BASE = '/api';

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalTodos = document.getElementById('totalTodos');
const completedTodos = document.getElementById('completedTodos');

// State
let todos = [];

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
});

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showError('Something went wrong. Please try again.');
        throw error;
    }
}

// Load todos from server
async function loadTodos() {
    try {
        setLoading(true);
        todos = await apiCall('/todos');
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Failed to load todos:', error);
    } finally {
        setLoading(false);
    }
}

// Add new todo
async function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        showError('Please enter a todo item');
        return;
    }

    try {
        setLoading(true);
        const newTodo = await apiCall('/todos', {
            method: 'POST',
            body: JSON.stringify({ text })
        });

        todos.push(newTodo);
        todoInput.value = '';
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Failed to add todo:', error);
    } finally {
        setLoading(false);
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
        setLoading(true);
        const updatedTodo = await apiCall(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: !todo.completed })
        });

        const index = todos.findIndex(t => t.id === id);
        todos[index] = updatedTodo;
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Failed to toggle todo:', error);
    } finally {
        setLoading(false);
    }
}

// Edit todo
async function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('Edit todo:', todo.text);
    if (!newText || newText.trim() === '' || newText.trim() === todo.text) {
        return;
    }

    try {
        setLoading(true);
        const updatedTodo = await apiCall(`/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ text: newText.trim() })
        });

        const index = todos.findIndex(t => t.id === id);
        todos[index] = updatedTodo;
        renderTodos();
    } catch (error) {
        console.error('Failed to edit todo:', error);
    } finally {
        setLoading(false);
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) {
        return;
    }

    try {
        setLoading(true);
        await apiCall(`/todos/${id}`, {
            method: 'DELETE'
        });

        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateStats();
    } catch (error) {
        console.error('Failed to delete todo:', error);
    } finally {
        setLoading(false);
    }
}

// Render todos to DOM
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        emptyState.style.display = 'block';
        todoList.classList.remove('has-todos');
        return;
    }

    emptyState.style.display = 'none';
    todoList.classList.add('has-todos');

    todos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

// Create todo element
function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
               onchange="toggleTodo(${todo.id})">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <div class="todo-actions">
            <button class="edit-btn" onclick="editTodo(${todo.id})">Edit</button>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
        </div>
    `;
    return div;
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    
    totalTodos.textContent = `Total: ${total}`;
    completedTodos.textContent = `Completed: ${completed}`;
}

// Utility functions
function setLoading(loading) {
    document.body.classList.toggle('loading', loading);
    addBtn.disabled = loading;
    todoInput.disabled = loading;
}

function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create and show new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const main = document.querySelector('main');
    main.insertBefore(errorDiv, main.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
