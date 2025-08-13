import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import axios from 'axios';
import BackgroundCarousel from './BackgroundCarousel';
import LoginForm from './LoginForm';
import './Login.css';
import { API_URL } from '../../utils/utils';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const navigate = useNavigate(); // Хук для редиректа

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setNotification({ type: '', message: '' });

  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(
      `${API_URL}auth/token`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );

    // Проверяем статус ответа
    if (response.data.status === true) {
      // Успешная аутентификация
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      setNotification({ type: 'success', message: 'Успешный вход!' });
      console.log('Успешный вход:', response.data);
      
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } else {
      // Неверные учетные данные
      setNotification({ type: 'error', message: 'Неверное имя пользователя или пароль' });
    }

  } catch (error) {
    console.error('Ошибка входа:', error);
    let message = 'Ошибка входа. Проверьте данные.';
    
    if (error.response) {
      const { status, data } = error.response;
      if (status === 422) {
        message = 'Некорректный формат данных. Проверьте введённые данные.';
        if (data.detail) {
          message = data.detail.map((err) => err.msg).join(' ') || message;
        }
      } else if (status === 500) {
        message = 'Ошибка сервера. Попробуйте позже.';
      }
    } else if (error.request) {
      message = 'Сервер не отвечает. Проверьте подключение к интернету.';
    }

    setNotification({ type: 'error', message });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => setNotification({ type: '', message: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  return (
    <div className="login-page">
      <BackgroundCarousel />
      <div className="login-container">
        <LoginForm
          onSubmit={handleSubmit}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          loading={loading}
          notification={notification}
        />
      </div>
    </div>
  );
};

export default LoginPage;