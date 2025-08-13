import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LockKeyhole, Check } from 'lucide-react';
import axios from 'axios';
import './Login.css';
import { API_URL } from '../../utils/utils';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isTokenValid, setIsTokenValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      navigate('/forgot-password');
    }
  }, [searchParams, navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(
        `${API_URL}auth/verify-reset-token?token=${token}`
      );
      setEmail(response.data);
      setIsTokenValid(true);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Ссылка недействительна или устарела'
      });
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Пароли не совпадают'
      });
      return;
    }

    setLoading(true);
    setNotification({ type: '', message: '' });

    try {
      await axios.post(
        `${API_URL}auth/reset-password`,
        { token, new_password: newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setNotification({
        type: 'success',
        message: 'Пароль успешно изменён!'
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Ошибка при смене пароля'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="form-container">
            <div className="form-content">
              {notification.message && (
                <div className={`notification notification-${notification.type}`}>
                  {notification.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="form-container">
          <div className="form-content">
            <h2 className="form-title">Новый пароль для {email}</h2>
            
            {notification.message && (
              <div className={`notification notification-${notification.type}`}>
                {notification.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-icon">
                  <LockKeyhole size={20} />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Новый пароль"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <div className="input-icon">
                  <LockKeyhole size={20} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Повторите пароль"
                  disabled={loading}
                />
              </div>
              
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Сохранение...' : <><span>Сохранить</span><Check size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;