class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.todoInput = document.getElementById('todoInput');
    this.addBtn = document.getElementById('addBtn');
    this.todoList = document.getElementById('todoList');
    this.taskCount = document.getElementById('taskCount');
    this.clearCompletedBtn = document.getElementById('clearCompleted');
    this.filterBtns = document.querySelectorAll('.filter-btn');

    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });

    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
    });

    this.render();
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (text === '') {
      this.showMessage('Please enter a task!');
      return;
    }

    const todo = {
      id: Date.now(),
      text: text,
      completed: false
    };

    this.todos.push(todo);
    this.todoInput.value = '';
    this.save();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
      this.render();
    }
  }

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      const todoElement = document.querySelector(`[data-id="${id}"]`);
      const textElement = todoElement.querySelector('.todo-text');
      
      // Create input element
      const input = document.createElement('input');
      input.type = 'text';
      input.value = todo.text;
      input.className = 'edit-input';
      
      // Replace text with input
      textElement.replaceWith(input);
      input.focus();
      input.select();
      
      // Save on Enter or blur
      const saveEdit = () => {
        const newText = input.value.trim();
        if (newText !== '' && newText !== todo.text) {
          todo.text = newText;
          this.save();
        }
        this.render();
      };
      
      input.addEventListener('blur', saveEdit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.render();
      });
      
      // Hide edit button while editing
      todoElement.querySelector('.edit-btn').style.display = 'none';
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
    this.render();
  }

  clearCompleted() {
    const completedCount = this.todos.filter(t => t.completed).length;
    if (completedCount === 0) {
      this.showMessage('No completed tasks to clear!');
      return;
    }
    this.todos = this.todos.filter(t => !t.completed);
    this.save();
    this.render();
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  getFilteredTodos() {
    if (this.currentFilter === 'active') {
      return this.todos.filter(t => !t.completed);
    } else if (this.currentFilter === 'completed') {
      return this.todos.filter(t => t.completed);
    }
    return this.todos;
  }

  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #fc8181;
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 2000);
  }

  render() {
    const filteredTodos = this.getFilteredTodos();
    this.todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
      this.todoList.innerHTML = '<div class="empty-state">No tasks yet. Add one above! 👆</div>';
    } else {
      filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        li.innerHTML = `
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
          <span class="todo-text">${todo.text}</span>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => this.toggleTodo(todo.id));
        li.querySelector('.edit-btn').addEventListener('click', () => this.editTodo(todo.id));
        li.querySelector('.delete-btn').addEventListener('click', () => this.deleteTodo(todo.id));

        this.todoList.appendChild(li);
      });
    }

    const activeCount = this.todos.filter(t => !t.completed).length;
    this.taskCount.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
  }
}

// Initialize app
new TodoApp();