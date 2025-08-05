import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

const TodoList = ({ todos, toggleTodo, deleteTodo, isMinimized }) => {

  return (
    <div 
      className="todo-list-container"
      style={{ 
        width: '100%',
        maxHeight: isMinimized ? '100px' : '300px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
      <div style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0
      }}>
        {todos.map((todo, index) => (
          <div 
            key={todo.id} 
            className="todo-item"
            style={{ 
              marginBottom: isMinimized ? (index === todos.length - 1 ? '0px' : '4px') : '8px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: `slideInFromRight 0.3s ease-out ${index * 0.05}s both`,
              transition: 'all 0.2s ease-out'
            }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            {!isMinimized && (
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                style={{ 
                  width: '18px', 
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#fd79a8',
                  borderRadius: '6px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
              />
            )}
            <span style={{ 
              flex: 1, 
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.85)',
              fontSize: '14px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.4',
            }}>
              {todo.text}
            </span>
            {!isMinimized && (
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{ 
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
                  border: 'none', 
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease-out',
                  boxShadow: '0 2px 4px rgba(255, 107, 107, 0.3)',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ee5a52, #ff6b6b)';
                  e.target.style.transform = 'scale(1.1) rotate(90deg)';
                  e.target.style.boxShadow = '0 4px 8px rgba(255, 107, 107, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                  e.target.style.boxShadow = '0 2px 4px rgba(255, 107, 107, 0.3)';
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, { 
        id: Date.now(), 
        text: inputValue, 
        completed: false,
        createdAt: new Date().toISOString()
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div 
      id="todo-app-root"
      style={{ 
        padding: '16px', 
        fontFamily: 'Inter, sans-serif',
        width: '300px',
        height: '400px',
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
      <h1 style={{ 
        color: 'white',
        fontSize: '24px',
        textAlign: 'center'
      }}>
        Simple Todo
      </h1>

      <div style={{ 
        display: 'flex', 
        marginBottom: '20px',
        gap: '10px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="할 일 추가..."
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white'
          }}
        />
        <button 
          onClick={addTodo}
          style={{ 
            padding: '8px 16px',
            background: '#fd79a8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          추가
        </button>
      </div>

      <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} isMinimized={isMinimized} />
    </div>
  );
}

export default TodoApp;