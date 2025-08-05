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

// CSS 애니메이션을 위한 스타일 추가
const addGlobalStyles = () => {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    /* 개별 할일 아이템은 스크롤 방지 */
    .todo-item {
      overflow: hidden;
    }
    
    /* 할일 목록 컨테이너는 스크롤바 스타일링 */
    .todo-list-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .todo-list-container::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .todo-list-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    
    .todo-list-container::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    @keyframes slideInFromRight {
      0% {
        transform: translateY(10px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeInUp {
      0% {
        transform: translateY(10px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes gradientShift {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }
  `;
  document.head.appendChild(styleSheet);
};

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dynamicWidth, setDynamicWidth] = useState(200);
  const [expandedDynamicWidth, setExpandedDynamicWidth] = useState(280);
  const containerRef = useRef(null);

  // 글로벌 스타일 추가
  useEffect(() => {
    addGlobalStyles();
  }, []);

  // 로컬 스토리지에서 To-Do 불러오기
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // To-Do가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // ElectronAPI 로드 확인 및 크기 동기화
  useEffect(() => {
    const checkAPI = () => {
      if (window.electronAPI && containerRef.current) {
        const containerHeight = containerRef.current.scrollHeight;
        const totalHeight = containerHeight + 40;
        const minHeight = isMinimized ? 160 : 250;
        const maxHeight = 800;
        const finalHeight = Math.max(minHeight, Math.min(totalHeight, maxHeight));
        
        const currentWidth = isMinimized ? dynamicWidth : expandedDynamicWidth;
        
        window.electronAPI.updateWindowHeight(Math.round(finalHeight));
        window.electronAPI.updateWindowWidth(Math.round(currentWidth));
      }
    };
    
    const timeoutId = setTimeout(checkAPI, 200);
    return () => clearTimeout(timeoutId);
  }, [isMinimized, todos, filter, dynamicWidth, expandedDynamicWidth]);

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

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleDoubleClick = () => {
    toggleMinimize();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div 
      ref={containerRef}
      id="todo-app-root"
      onDoubleClick={handleDoubleClick}
      style={{ 
        width: isMinimized ? `${dynamicWidth}px` : `${expandedDynamicWidth}px`,
        minHeight: isMinimized ? '120px' : '200px',
        maxHeight: '800px',
        padding: '16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.5',
        color: 'rgba(255, 255, 255, 0.85)',
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: [
          '0 8px 32px rgba(0, 0, 0, 0.37)',
          '0 4px 16px rgba(0, 0, 0, 0.25)',
          'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        ].join(', '),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        cursor: isHovered ? 'pointer' : 'default',
        userSelect: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isMinimized ? '8px' : '20px',
        paddingBottom: isMinimized ? '0' : '16px',
        borderBottom: isMinimized ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: isMinimized ? '16px' : '20px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          background: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          transition: 'all 0.3s ease'
        }}>
          {isMinimized ? 'Todo' : 'Simple Todo'}
        </h1>
        
        <button
          className="minimize-toggle"
          onClick={toggleMinimize}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 8px',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.color = 'rgba(255, 255, 255, 0.9)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = 'rgba(255, 255, 255, 0.7)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {/* Input Section - Hidden when minimized */}
      {!isMinimized && (
        <div style={{
          marginBottom: '20px',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="할 일을 입력하세요..."
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                e.target.style.borderColor = 'rgba(253, 121, 168, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(253, 121, 168, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={addTodo}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(253, 121, 168, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(253, 121, 168, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(253, 121, 168, 0.3)';
              }}
            >
              추가
            </button>
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '8px'
          }}>
            {['all', 'active', 'completed'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                style={{
                  padding: '6px 12px',
                  background: filter === filterType 
                    ? 'rgba(253, 121, 168, 0.2)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: filter === filterType 
                    ? '1px solid rgba(253, 121, 168, 0.3)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: filter === filterType 
                    ? 'rgba(253, 121, 168, 1)' 
                    : 'rgba(255, 255, 255, 0.6)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: filter === filterType ? '600' : '400'
                }}
                onMouseOver={(e) => {
                  if (filter !== filterType) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  }
                }}
                onMouseOut={(e) => {
                  if (filter !== filterType) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
              >
                {filterType === 'all' ? '전체' : filterType === 'active' ? '미완료' : '완료'}
              </button>
            ))}
            
            {todos.some(todo => todo.completed) && (
              <button
                onClick={clearCompleted}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  borderRadius: '8px',
                  color: 'rgba(255, 107, 107, 0.8)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginLeft: 'auto'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 107, 107, 0.2)';
                  e.target.style.color = 'rgba(255, 107, 107, 1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 107, 107, 0.1)';
                  e.target.style.color = 'rgba(255, 107, 107, 0.8)';
                }}
              >
                완료된 할일 삭제
              </button>
            )}
          </div>
        </div>
      )}

      {/* Todo List */}
      <TodoList 
        todos={filteredTodos} 
        toggleTodo={toggleTodo} 
        deleteTodo={deleteTodo} 
        isMinimized={isMinimized} 
      />
    </div>
  );
}

export default TodoApp;