import React from 'react';
import { UserRound, LockKeyhole, LogIn } from 'lucide-react';
import './Login.css';

const LoginForm = ({
  onSubmit,
  username,
  setUsername,
  password,
  setPassword,
  loading,
  notification,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <h2 className="form-title">Войти в аккаунт</h2>
        
        {notification.message && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-icon">
              <UserRound size={20} />
            </div>
            <input
              type="text" // Используем type="text", так как username может быть не email
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Имя пользователя"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <div className="input-icon">
              <LockKeyhole size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Пароль"
              disabled={loading}
            />
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" disabled={loading} />
              <span>Запомнить меня</span>
            </label>
            <a href="#" className="forgot-password">Забыли пароль?</a>
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Загрузка...' : <><span>Войти</span><LogIn size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;