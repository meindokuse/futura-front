import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminLayout from '../src/components/layouts/AdminLayout';
import MainLayout from '../src/components/layouts/MainLayout';
import HomePage from '../src/pages/Home';
import Employers from './pages/admin/Employers';
import Schedule from './pages/admin/Schedule';
import Events from './pages/admin/Events';
import Residents from './pages/admin/Residents';
import Manuals from './pages/admin/Manuals';
import LoginPage from './pages/login/LoginPage';
import { initInterceptor } from './interceptors';
import axios from 'axios';
import { API_URL } from './utils/utils';
import AccessDeniedPage from './pages/AccessDeniedPage';
import ProfilePage from './pages/profile/Profile';
import ScheduleAdminPage from './pages/admin/ScheduleAdmin';


function AppRouter() {


  return (
    <BrowserRouter>
      <Routes>
        {/* Основной сайт (basic mode) */}
        <Route path="/" element={<MainLayout mode="basic" />}>
          <Route index element={<HomePage />} />
          <Route path='home' element={<HomePage />} />
          <Route path="employers" element={<Employers />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="events" element={<Events />} />
          <Route path="residents" element={<Residents />} />
          <Route path="manuals" element={<Manuals />} />
          <Route path="profile" element={<ProfilePage  />} />
          <Route path="profile/:id" element={<ProfilePage mode="other" />} />

        </Route>
        
        {/* Админ-панель (admin mode) */}
        <Route 
          path="/admin" 
          element={
              <AdminLayout mode="admin" /> 
          }
        >
          <Route path="employers" element={<Employers />} />
          <Route path="schedule" element={<ScheduleAdminPage />} />
          <Route path="events" element={<Events />} />
          <Route path="residents" element={<Residents />} />
          <Route path="manuals" element={<Manuals />} />
          <Route index element={<Navigate to="employers" />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  useEffect(() => {
    initInterceptor();
  }, []);

  return <AppRouter />;
}