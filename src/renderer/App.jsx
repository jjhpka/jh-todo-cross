import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

const TodoList = ({ todos, toggleTodo, deleteTodo, isMinimized }) => {

  return (
    <div style={{ 
      width: '100%',
      maxHeight: isMinimized ? '300px' : '400px',
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
    }}>
      <div style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0
      }}>
        {todos.map((todo, index) => (
          <div key={todo.id} style={{ 
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
            e.currentTarget.style.transform = 'translateX(5px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
            e.currentTarget.style.transform = 'translateX(0)';
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
    @keyframes slideInFromRight {
      0% {
        transform: translateX(30px);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      0% {
        transform: translateX(0);
        opacity: 1;
        max-height: 100px;
      }
      100% {
        transform: translateX(-100px);
        opacity: 0;
        max-height: 0;
      }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
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
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(253, 121, 168, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(253, 121, 168, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(253, 121, 168, 0);
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
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dynamicWidth, setDynamicWidth] = useState(200);
  const [expandedDynamicWidth, setExpandedDynamicWidth] = useState(280);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Electron 창 드래그 기능
  const handleMouseDown = useCallback((e) => {
    // 입력 필드와 버튼에서는 드래그 비활성화
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    
    // 토글 버튼에서는 드래그 비활성화
    if (e.target.classList.contains('minimize-toggle')) {
      return;
    }
    
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    // 마우스 커서 변경
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    // 120fps를 위한 requestAnimationFrame 사용
    requestAnimationFrame(() => {
      if (window.electronAPI) {
        window.electronAPI.moveWindow(deltaX, deltaY);
      } else {
        console.log('Move window:', deltaX, deltaY);
      }
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // 글로벌 스타일 추가
  useEffect(() => {
    addGlobalStyles();
  }, []);

  // ElectronAPI 로드 확인 및 초기 너비 설정
  useEffect(() => {
    const checkAPI = () => {
      if (window.electronAPI) {
        console.log('ElectronAPI is available');
        // 초기 너비 설정
        const initialWidth = isMinimized ? dynamicWidth : expandedDynamicWidth;
        if (initialWidth && initialWidth > 0) {
          console.log('Setting initial width:', initialWidth);
          window.electronAPI.updateWindowWidth(Math.round(initialWidth));
        }
      } else {
        console.log('ElectronAPI not yet available, retrying...');
        setTimeout(checkAPI, 100);
      }
    };
    checkAPI();
  }, [dynamicWidth, expandedDynamicWidth, isMinimized]);

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

  // 창 높이 자동 조절 - 디바운싱으로 무한 루프 방지
  useEffect(() => {
    const updateWindowHeight = () => {
      const appElement = document.getElementById('todo-app-root') || document.querySelector('[data-app-container="true"]');
      if (appElement && window.electronAPI) {
        const rect = appElement.getBoundingClientRect();
        const contentHeight = rect.height;
        
        let newHeight;
        if (isMinimized) {
          // 축소 상태: 컨텐츠 높이에 최소 여백만 추가, 최대 200px
          newHeight = Math.min(contentHeight + 10, 200);
        } else {
          // 확장 상태: 더 작은 기본 높이
          const baseHeight = 180;
          const maxHeight = 500;
          newHeight = Math.min(Math.max(contentHeight + 15, baseHeight), maxHeight);
        }
        
        console.log('Updating window height:', { isMinimized, contentHeight, newHeight });
        window.electronAPI.updateWindowHeight(newHeight);
      }
    };

    const timeoutId = setTimeout(updateWindowHeight, 100); // 디바운싱
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [todos.length, filter, isMinimized]); // 더 구체적인 의존성

  // 드래그 이벤트 리스너 설정
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

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

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const remainingCount = todos.filter(todo => !todo.completed).length;

  // 동적 너비 계산 (축소/확장 상태별로 다르게) - 120fps 최적화
  useEffect(() => {
    requestAnimationFrame(() => {
      if (filteredTodos.length > 0) {
        // 각 todo 텍스트의 길이를 기준으로 최적 너비 계산
        const maxTextLength = Math.max(...filteredTodos.map(todo => todo.text.length));
        console.log('Max text length:', maxTextLength);
        
        // 축소 상태: 최소 200px, 최대 400px (텍스트만)
        const minimizedWidth = Math.min(Math.max(maxTextLength * 7 + 50, 200), 400);
        
        // 확장 상태: 체크박스(18px) + 간격(12px) + 삭제버튼(20px) + 간격들 고려하여 +70px
        const expandedWidth = Math.min(Math.max(maxTextLength * 7 + 120, 280), 480);
        
        console.log('Calculated widths:', { minimizedWidth, expandedWidth });
        
        setDynamicWidth(Math.round(minimizedWidth));
        setExpandedDynamicWidth(Math.round(expandedWidth));
      } else {
        setDynamicWidth(200); // 축소 상태: 200px
        setExpandedDynamicWidth(280); // 확장 상태: 280px
        console.log('No todos, using default widths:', { minimized: 200, expanded: 280 });
      }
    });
  }, [filteredTodos]);

  // 너비 변화에 따른 창 크기 업데이트 (smooth transition)
  useEffect(() => {
    const updateWidth = () => {
      if (window.electronAPI) {
        const currentWidth = isMinimized ? dynamicWidth : expandedDynamicWidth;
        const numericWidth = Math.round(Number(currentWidth));
        
        if (numericWidth && numericWidth > 0) {
          console.log('Width update:', { isMinimized, numericWidth });
          window.electronAPI.updateWindowWidth(numericWidth);
        }
      }
    };

    const timeoutId = setTimeout(updateWidth, 200); // 디바운싱

    return () => clearTimeout(timeoutId);
  }, [dynamicWidth, expandedDynamicWidth, isMinimized]);

  const toggleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    
    // IPC를 통해 창 너비 조절 (상태별 다른 너비 사용)
    setTimeout(() => {
      if (window.electronAPI) {
        const targetWidth = newMinimizedState ? dynamicWidth : expandedDynamicWidth;
        const numericWidth = Math.round(Number(targetWidth));
        
        if (numericWidth && numericWidth > 0) {
          console.log('Toggle minimize width update:', { newMinimizedState, numericWidth });
          window.electronAPI.updateWindowWidth(numericWidth);
        } else {
          console.log('Invalid toggle width:', { targetWidth, numericWidth });
        }
      } else {
        console.log('Toggle minimize - API not available:', { 
          electronAPI: !!window.electronAPI, 
          dynamicWidth,
          expandedDynamicWidth 
        });
      }
    }, 8); // 20ms에서 8ms로 단축
  };

  // 더블클릭으로 축소/확장 토글
  const handleDoubleClick = useCallback((e) => {
    // 버튼, 입력 필드, 체크박스가 아닌 빈 영역에서만 동작
    const isInteractiveElement = e.target.tagName === 'BUTTON' || 
                                e.target.tagName === 'INPUT' || 
                                e.target.type === 'checkbox' ||
                                e.target.closest('button') ||
                                e.target.closest('input');
    
    if (!isInteractiveElement) {
      toggleMinimize();
    }
  }, []);

  return (
    <div 
      id="todo-app-root"
      data-app-container="true"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{ 
        padding: isMinimized ? '10px' : '20px 15px', 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        maxWidth: isMinimized ? `${dynamicWidth}px` : `${expandedDynamicWidth}px`,
        margin: '0 auto',
        backgroundColor: 'rgba(10, 10, 10, 0.95)', // 더 다크한 배경, 불투명도 0.95
        backdropFilter: 'blur(10px)', // 흐림 효과
        borderRadius: '16px', // 둥근 모서리
        border: '1px solid rgba(255, 255, 255, 0.1)', // 더 어두운 테두리
        height: 'auto',
        cursor: isDragging ? 'move' : 'default',
        userSelect: isDragging ? 'none' : 'auto',
        transition: 'max-width 0.2s ease-out, padding 0.2s ease-out'
      }}>
      {/* 축소/확장 토글 버튼 */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '32px',
          height: '20px',
          zIndex: 1000
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={toggleMinimize}
          className="minimize-toggle"
          style={{
            width: '32px',
            height: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.6)',
            transition: 'all 0.2s',
            opacity: isHovered ? 1 : 0
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.target.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          {isMinimized ? '＋' : '－'}
        </button>
      </div>
      
      {isMinimized ? (
        <>
          {/* 축소 상태: 진행중인 To-Do만 표시 */}
          <TodoList todos={todos.filter(todo => !todo.completed)} toggleTodo={toggleTodo} deleteTodo={deleteTodo} isMinimized={isMinimized} />
        </>
      ) : (
        <>
          <h1 style={{ 
            marginTop: 0, 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '24px',
            fontWeight: '600',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.8s ease-out',
            background: 'linear-gradient(135deg, #fd79a8, #fdcb6e, #a29bfe)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'fadeInUp 0.4s ease-out, gradientShift 3s ease-in-out infinite'
          }}>
            To-Do List
          </h1>
      
      {!isMinimized && (
        <div style={{ 
          display: 'flex', 
          marginBottom: '20px',
          gap: '10px',
          alignItems: 'stretch'
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              outline: 'none',
              transition: 'all 0.2s ease-out',
              fontWeight: '400',
              letterSpacing: '0.01em'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              e.target.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button 
            onClick={addTodo}
            style={{ 
              padding: '2px 8px',
              background: 'linear-gradient(135deg, #a29bfe, #fd79a8)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.15s ease-out',
              boxShadow: '0 2px 4px rgba(162, 155, 254, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fd79a8, #a29bfe)';
              e.target.style.transform = 'translateY(-1px) scale(1.05)';
              e.target.style.boxShadow = '0 4px 8px rgba(162, 155, 254, 0.4), 0 0 0 4px rgba(253, 121, 168, 0.3)';
              e.target.style.animation = 'pulse 1.5s infinite';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #a29bfe, #fd79a8)';
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(162, 155, 254, 0.3)';
              e.target.style.animation = 'none';
            }}
            onMouseDown={(e) => {
              e.target.style.animation = 'bounce 0.6s ease-out';
              setTimeout(() => {
                e.target.style.animation = 'none';
              }, 600);
            }}
          >
            추가
          </button>
        </div>
      )}

      {!isMinimized && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '16px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <span>{remainingCount}개 남음</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{ 
                background: filter === 'all' ? 'linear-gradient(135deg, #a29bfe, #fd79a8)' : 'rgba(255, 255, 255, 0.05)', 
                border: 'none', 
                cursor: 'pointer',
                color: filter === 'all' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: filter === 'all' ? '500' : '400',
                padding: '2px 8px',
                borderRadius: '6px',
                transition: 'all 0.15s ease-out',
                fontSize: '12px',
                boxShadow: filter === 'all' ? '0 2px 4px rgba(162, 155, 254, 0.3)' : 'none',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                if (filter === 'all') {
                  e.target.style.background = 'linear-gradient(135deg, #fd79a8, #a29bfe)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(162, 155, 254, 0.4)';
                } else {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                }
              }}
              onMouseOut={(e) => {
                if (filter === 'all') {
                  e.target.style.background = 'linear-gradient(135deg, #a29bfe, #fd79a8)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(162, 155, 254, 0.3)';
                } else {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              전체
            </button>
            <button 
              onClick={() => setFilter('active')}
              style={{ 
                background: filter === 'active' ? 'linear-gradient(135deg, #fd79a8, #e84393)' : 'rgba(255, 255, 255, 0.05)', 
                border: 'none', 
                cursor: 'pointer',
                color: filter === 'active' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: filter === 'active' ? '500' : '400',
                padding: '2px 8px',
                borderRadius: '6px',
                transition: 'all 0.15s ease-out',
                fontSize: '12px',
                boxShadow: filter === 'active' ? '0 2px 4px rgba(253, 121, 168, 0.3)' : 'none',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                if (filter === 'active') {
                  e.target.style.background = 'linear-gradient(135deg, #e84393, #fd79a8)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(253, 121, 168, 0.4)';
                } else {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                }
              }}
              onMouseOut={(e) => {
                if (filter === 'active') {
                  e.target.style.background = 'linear-gradient(135deg, #fd79a8, #e84393)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(253, 121, 168, 0.3)';
                } else {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              진행중
            </button>
            <button 
              onClick={() => setFilter('completed')}
              style={{ 
                background: filter === 'completed' ? 'linear-gradient(135deg, #e84393, #a29bfe)' : 'rgba(255, 255, 255, 0.05)', 
                border: 'none', 
                cursor: 'pointer',
                color: filter === 'completed' ? 'white' : 'rgba(255, 255, 255, 0.6)',
                fontWeight: filter === 'completed' ? '500' : '400',
                padding: '2px 8px',
                borderRadius: '6px',
                transition: 'all 0.15s ease-out',
                fontSize: '12px',
                boxShadow: filter === 'completed' ? '0 2px 4px rgba(232, 67, 147, 0.3)' : 'none',
                backdropFilter: 'blur(10px)'
              }}
              onMouseOver={(e) => {
                if (filter === 'completed') {
                  e.target.style.background = 'linear-gradient(135deg, #a29bfe, #e84393)';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(232, 67, 147, 0.4)';
                } else {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                }
              }}
              onMouseOut={(e) => {
                if (filter === 'completed') {
                  e.target.style.background = 'linear-gradient(135deg, #e84393, #a29bfe)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(232, 67, 147, 0.3)';
                } else {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              완료
            </button>
          </div>
        </div>
      )}

      {!isMinimized && (
        <TodoList todos={filteredTodos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} isMinimized={isMinimized} />
      )}

      {!isMinimized && todos.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          paddingTop: '16px'
        }}>
          <button
            onClick={clearCompleted}
            style={{ 
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #e84393, #a29bfe)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.15s ease-out',
              boxShadow: '0 2px 4px rgba(232, 67, 147, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #a29bfe, #e84393)';
              e.target.style.boxShadow = '0 4px 8px rgba(232, 67, 147, 0.4)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #e84393, #a29bfe)';
              e.target.style.boxShadow = '0 2px 4px rgba(232, 67, 147, 0.3)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            완료된 항목 삭제
          </button>
        </div>
      )}
          </>
        )}
    </div>
  );
}

export default TodoApp;