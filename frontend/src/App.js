import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to fetch todos');
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/todos`, { title: newTodo });
      setTodos([response.data, ...todos]);
      setNewTodo('');
      setError(null);
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${id}`, { completed: !completed });
      setTodos(todos.map(todo => todo.id === id ? response.data : todo));
      setError(null);
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="App">
      <div className="container">
        <h1>📝 Todo App</h1>
        <p className="subtitle">Deployed on AWS EC2 with K3s + ArgoCD</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={addTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button type="submit" className="add-button">Add</button>
        </form>

        <div className="todo-list">
          {todos.length === 0 ? (
            <p className="empty-state">No todos yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="todo-checkbox"
                />
                <span className={todo.completed ? 'completed' : ''}>
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

