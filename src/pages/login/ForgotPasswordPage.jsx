import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './Login.css'; // Используем ваши существующие стили
import { API_URL } from '../../utils/utils';


const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ type: '', message: '' });

    try {
      const response = await axios.post(
        `${API_URL}auth/request-password-reset`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setNotification({
        type: 'success',
        message: 'Ссылка для сброса пароля отправлена на ваш email'
      });
    } catch (error) {
        console.log(error)
      setNotification({
        type: 'error',
        message: error.response?.data?.detail || 'Ошибка при отправке ссылки'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="form-container">
          <div className="form-content">
            <h2 className="form-title">Восстановление пароля</h2>
            
            {notification.message && (
              <div className={`notification notification-${notification.type}`}>
                {notification.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className="input-icon">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Ваш email"
                  disabled={loading}
                />
              </div>
              
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Отправка...' : <><span>Отправить ссылку</span><ArrowRight size={18} /></>}
              </button>
            </form>
            
            <div className="form-footer">
              <button 
                className="text-link" 
                onClick={() => navigate('/login')}
              >
                Вернуться к входу
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;