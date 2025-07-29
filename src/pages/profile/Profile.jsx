import React, { useState, useEffect, useRef,useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Button,
  Collapse,
  CircularProgress,
  useMediaQuery,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import EmailDialog from './EmailDialog';
import PasswordDialog from './PasswordDialog';
import ProfileDialog from './ProfileDialog';
import PhotoActionDialog from './PhotoActionDialog';
import PhotoUploadDialog from './PhotoChange';
import { API_URL, capitalize } from '../../utils/utils';

axios.defaults.withCredentials = true;

export default function ProfilePage({ mode = 'your' }) {
  const { handleNotification, user } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState('../../../public/default-employer.jpg');
  const [schedules, setSchedules] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
  const [loading, setLoading] = useState({
    profile: true,
    photo: true,
    schedule: true
  });
  const [error, setError] = useState({
    profile: null,
    photo: null,
    schedule: null
  });
  const fetchInProgress = useRef({
    profile: false,
    photo: false,
    schedule: false
  });
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [openPhotoActionDialog, setOpenPhotoActionDialog] = useState(false);
  const [openPhotoUploadDialog, setOpenPhotoUploadDialog] = useState(false);
  const [dialogType, setDialogType] = useState('description');

  // Функция загрузки профиля
  const fetchProfileData = async () => {
    if (fetchInProgress.current.profile) return;
    fetchInProgress.current.profile = true;
    setLoading(prev => ({ ...prev, profile: true }));
    setError(prev => ({ ...prev, profile: null }));

    try {
      const endpoint = mode === 'other' 
        ? `${API_URL}employers/get_employer?id=${id}` 
        : `${API_URL}auth/profile`;
      
      const response = await axios.get(endpoint);
      const profileData = mode === 'other' ? response.data : response.data.user;

      const formattedProfile = {
        ...profileData,
        contacts: Array.isArray(profileData.contacts) ? profileData.contacts.join(', ') : profileData.contacts || ''
      };

      setProfile(formattedProfile);
      return formattedProfile;
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      setError(prev => ({ ...prev, profile: 'Ошибка загрузки профиля' }));
      handleNotification('Ошибка загрузки профиля', 'error');
      return null;
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
      fetchInProgress.current.profile = false;
    }
  };

  // Функция загрузки фото
  const fetchPhoto = async (userId) => {
    if (fetchInProgress.current.photo) return;
    fetchInProgress.current.photo = true;
    setLoading(prev => ({ ...prev, photo: true }));
    setError(prev => ({ ...prev, photo: null }));

    try {
      const response = await axios.get(`${API_URL}files/employer/${userId}/get-photo`, {
        params: { expansion: 'png' },
        withCredentials: true
      });
      const url = response.data.file_url.url;
      setPhoto(url);
      return url;
    } catch (err) {
      console.error('Ошибка загрузки фото:', err);
      setError(prev => ({ ...prev, photo: 'Ошибка загрузки фото' }));
      handleNotification('Ошибка загрузки фото', 'error');
    } finally {
      setLoading(prev => ({ ...prev, photo: false }));
      fetchInProgress.current.photo = false;
    }
  };
  const handleImageError = () => {
    setError(prev => ({ ...prev, photo: 'Ошибка загрузки фото' }));
  };

  // Функция загрузки расписания на неделю
  const fetchWeekSchedule = async () => {
    if (fetchInProgress.current.schedule) return;
    fetchInProgress.current.schedule = true;
    setLoading(prev => ({ ...prev, schedule: true }));
    setError(prev => ({ ...prev, schedule: null }));

    try {
      const params = {
        week: currentWeek.format('YYYY-MM-DD')
      };

      const endpoint = mode === 'other' 
        ? `${API_URL}workdays/get_week_schedule_employer` 
        : `${API_URL}workdays/get_week_schedule`;

      if (mode === 'other') {
        params.id = id;
      }

      const response = await axios.get(endpoint, { params, withCredentials: true });
      setSchedules(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки расписания:', err);
      setError(prev => ({ ...prev, schedule: 'Ошибка загрузки расписания' }));
      handleNotification('Ошибка загрузки расписания', 'error');
      setSchedules([]);
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
      fetchInProgress.current.schedule = false;
    }
  };

  // Группировка расписания по дням недели
  const groupedSchedules = useMemo(() => {
    const groups = {};
    
    schedules.forEach(schedule => {
      const dateStr = dayjs(schedule.work_date).format('YYYY-MM-DD');
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(schedule);
    });

    return groups;
  }, [schedules]);

  // Получаем все дни текущей недели
  const weekDays = useMemo(() => {
    const days = [];
    let currentDay = currentWeek.startOf('week');
    
    for (let i = 0; i < 7; i++) {
      days.push({
        date: currentDay,
        dateStr: currentDay.format('YYYY-MM-DD'),
        dayName: currentDay.format('dddd'),
        isToday: currentDay.isSame(dayjs(), 'day')
      });
      currentDay = currentDay.add(1, 'day');
    }
    
    return days;
  }, [currentWeek]);

  const handleProfileSave = (success, newValue) => {
    setOpenProfileDialog(false);
    
    if (success) {
      setProfile(prev => {
        const updatedValue = dialogType === 'contacts' 
          ? newValue.join(', ')
          : newValue;
        
        return {
          ...prev,
          [dialogType === 'contacts' ? 'contacts' : 'description']: updatedValue
        };
      });
      
      handleNotification(
        dialogType === 'contacts' 
          ? 'Контакты успешно обновлены' 
          : 'Описание успешно обновлено', 
        'success'
      );
    }
  };

  const handleEmailSave = async ({ email }) => {
    try {
      setProfile(prev => ({
        ...prev,
        email: email
      }));
      handleNotification('Email успешно обновлен', 'success');
    } catch (error) {
      console.error('Ошибка при обновлении email:', error);
      handleNotification('Ошибка при обновлении email', 'error');
      throw error;
    }
  };

  const handlePhotoChange = async () => {
    const url = await fetchPhoto(profile.id);
    setPhoto(url);
  };

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      const profileData = await fetchProfileData();
      if (profileData) {
        await fetchPhoto(profileData.id);
      } else {
        setLoading(prev => ({ ...prev, photo: false }));
        setError(prev => ({ ...prev, photo: 'Профиль не загружен' }));
      }
    };

    loadData();
    fetchWeekSchedule();
  }, [id, mode]);

  // Загружаем расписание при изменении недели
  useEffect(() => {
    fetchWeekSchedule();
  }, [currentWeek]);

  useEffect(() => {
    return () => {
      if (photo && photo.startsWith('blob:')) {
        URL.revokeObjectURL(photo);
      }
    };
  }, [photo]);

  const handleWeekChange = (offset) => {
    setCurrentWeek(currentWeek.add(offset, 'week'));
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenProfileDialog(true);
  };

  if (error.profile && error.photo && error.schedule) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: '#ffffff', background: 'transparent' }}>
        <Typography sx={{ color: '#c83a0a' }}>Ошибка загрузки данных</Typography>
        <Button
          variant="contained"
          onClick={() => {
            fetchProfileData().then(profileData => {
              if (profileData) fetchPhoto(profileData.id);
            });
            fetchWeekSchedule();
          }}
          sx={{ mt: 2, backgroundColor: '#c83a0a', color: '#ffffff', '&:hover': { backgroundColor: '#e04b1a' } }}
        >
          Повторить
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: isSmallScreen ? 2 : 4,
      background: 'transparent'
    }}>
      <Box sx={{ 
        maxWidth: '1000px', 
        mx: 'auto',
        background: 'rgba(30, 30, 30, 0.7)',
        borderRadius: '16px',
        p: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Шапка профиля */}
        {loading.profile ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={60} sx={{ color: '#c83a0a' }} />
          </Box>
        ) : error.profile ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography sx={{ color: '#c83a0a' }}>{error.profile}</Typography>
            <Button
              variant="contained"
              onClick={fetchProfileData}
              sx={{ mt: 2, backgroundColor: '#c83a0a', color: '#ffffff', '&:hover': { backgroundColor: '#e04b1a' } }}
            >
              Повторить
            </Button>
          </Box>
        ) : profile && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isSmallScreen ? 'column' : 'row', 
            gap: 3, 
            mb: 4, 
            alignItems: 'center' 
          }}>
            <motion.div 
              whileHover={{ scale: mode === 'your' ? 1.03 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              onClick={() => mode === 'your' && setOpenPhotoActionDialog(true)}
              style={{ cursor: mode === 'your' ? 'pointer' : 'default' }}
            >
              {loading.photo ? (
                <Box sx={{ 
                  width: 200, 
                  height: 200, 
                  borderRadius: '15%', 
                  background: '#333', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <CircularProgress size={40} sx={{ color: '#c83a0a' }} />
                </Box>
              ) : (
                <Box
                  component="img"
                  src={error.photo ? '/default-employer.jpg' : photo}
                  alt="Фото профиля"
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    borderRadius: '15%', 
                    border: '3px solid #c83a0a',
                    objectFit: 'cover',
                    boxShadow: '0 4px 20px rgba(200, 58, 10, 0.3)'
                  }}
                  onError={handleImageError}
                />
              )}
            </motion.div>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                color: '#c83a0a', 
                fontWeight: 'bold',
                mb: 1
              }}>
                {capitalize(profile.fio)}
              </Typography>
              <Typography sx={{ 
                color: '#ffffff',
                fontSize: '1.2rem',
                mb: 1
              }}>
                {capitalize(profile.work_type)}
              </Typography>
              <Typography sx={{ 
                color: '#ffffff',
                fontSize: '0.9rem'
              }}>
                {capitalize(profile.location_name)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Вкладки */}
        <Tabs
          value={tab}
          onChange={(e, newVal) => setTab(newVal)}
          sx={{
            mb: 4,
            '& .MuiTab-root': { 
              color: '#ffffff',
              fontSize: '1rem',
              textTransform: 'none',
              transition: 'all 0.3s ease',
              '&:hover': { 
                color: '#c83a0a',
                transform: 'translateY(-2px)'
              }
            },
            '& .Mui-selected': { 
              color: '#c83a0a !important',
              fontWeight: 'bold' 
            },
            '& .MuiTabs-indicator': { 
              backgroundColor: '#c83a0a',
              height: '3px' 
            }
          }}
        >
          <Tab label="Профиль" />
          <Tab label="Расписание" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Блок контактов */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{
                backgroundColor: 'transparent',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #ffffff'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#c83a0a', 
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  Контакты
                  {mode === 'your' && (
                    <Button
                      onClick={() => handleOpenDialog('contacts')}
                      sx={{ 
                        color: '#ffffff',
                        '&:hover': { 
                          color: '#c83a0a',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Изменить
                    </Button>
                  )}
                </Typography>
                <Typography sx={{ color: '#ffffff', mb: 1 }}>
                  <strong>Телефон:</strong> {profile?.contacts || 'Не указан'}
                </Typography>
                <Typography sx={{ color: '#ffffff' }}>
                  <strong>Email:</strong> {profile?.email || 'Не указан'}
                </Typography>
              </Box>
            </motion.div>

            {/* Блок описания */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Box sx={{
                backgroundColor: 'transparent',
                borderRadius: '12px',
                p: 3,
                border: '1px solid #ffffff'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Typography variant="h6" sx={{ color: '#c83a0a' }}>
                    Описание
                  </Typography>
                  <Box>
                    {profile?.description && profile.description.length > 100 && (
                      <IconButton
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        sx={{ 
                          color: '#ffffff',
                          '&:hover': { 
                            color: '#c83a0a',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isDescriptionExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    )}
                    {mode === 'your' && (
                      <Button
                        onClick={() => handleOpenDialog('description')}
                        sx={{ 
                          color: '#ffffff',
                          '&:hover': { 
                            color: '#c83a0a',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Редактировать
                      </Button>
                    )}
                  </Box>
                </Box>
                
                <Collapse 
                  in={isDescriptionExpanded || !profile?.description || profile.description.length <= 100}
                  timeout="auto" 
                  unmountOnExit
                  sx={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  <Typography sx={{ color: '#ffffff', lineHeight: '1.6' }}>
                    {profile?.description || 'Нет описания'}
                  </Typography>
                </Collapse>
              </Box>
            </motion.div>

            {/* Блок настроек (только для своего профиля) */}
            {mode === 'your' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box sx={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  p: 3,
                  border: '1px solid #ffffff'
                }}>
                  <Typography variant="h6" sx={{ color: '#c83a0a', mb: 2 }}>
                    Настройки аккаунта
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setOpenEmailDialog(true)}
                        sx={{ 
                          backgroundColor: '#c83a0a', 
                          color: '#ffffff',
                          '&:hover': { backgroundColor: '#e04b1a' },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Изменить email
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setOpenPasswordDialog(true)}
                        sx={{ 
                          backgroundColor: '#c83a0a', 
                          color: '#ffffff',
                          '&:hover': { backgroundColor: '#e04b1a' },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Изменить пароль
                      </Button>
                    </motion.div>
                  </Box>
                </Box>
              </motion.div>
            )}
          </Box>
        )}

        {tab === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 3, 
                flexWrap: 'wrap', 
                gap: 2,
                alignItems: 'center'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#c83a0a',
                  fontWeight: 'bold'
                }}>
                  Расписание на неделю {currentWeek.format('DD.MM.YYYY')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleWeekChange(-1)}
                      sx={{ 
                        color: '#ffffff', 
                        border: '1px solid #ffffff',
                        '&:hover': { 
                          borderColor: '#c83a0a',
                          color: '#c83a0a',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Предыдущая
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleWeekChange(1)}
                      sx={{ 
                        color: '#ffffff', 
                        border: '1px solid #ffffff',
                        '&:hover': { 
                          borderColor: '#c83a0a',
                          color: '#c83a0a',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Следующая
                    </Button>
                  </motion.div>
                </Box>
              </Box>

              {loading.schedule ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={60} sx={{ color: '#c83a0a' }} />
                </Box>
              ) : error.schedule ? (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                  <Typography sx={{ color: '#c83a0a' }}>{error.schedule}</Typography>
                  <Button
                    variant="contained"
                    onClick={fetchWeekSchedule}
                    sx={{ mt: 2, backgroundColor: '#c83a0a', color: '#ffffff', '&:hover': { backgroundColor: '#e04b1a' } }}
                  >
                    Повторить
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ 
                  backgroundColor: 'transparent',
                  border: '1px solid #ffffff',
                  borderRadius: '8px'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#1e1e1e' }}>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Дата</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>День недели</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Смена</TableCell>
                        <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Локация</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weekDays.map((day) => {
                        const daySchedules = groupedSchedules[day.dateStr] || [];
                        const isToday = day.date.isSame(dayjs(), 'day');
                        
                        return (
                          <React.Fragment key={day.dateStr}>
                            {daySchedules.length > 0 ? (
                              daySchedules.map((schedule, idx) => (
                                <TableRow 
                                  key={`${day.dateStr}-${idx}`}
                                  sx={{ 
                                    backgroundColor: isToday ? 'rgba(200, 58, 10, 0.2)' : 'transparent',
                                    '&:hover': {
                                      backgroundColor: 'rgba(200, 58, 10, 0.3)'
                                    }
                                  }}
                                >
                                  <TableCell sx={{ color: '#ffffff' }}>
                                    {idx === 0 && day.date.format('DD.MM.YYYY')}
                                  </TableCell>
                                  <TableCell sx={{ color: '#ffffff' }}>
                                    {idx === 0 && capitalize(day.dayName)}
                                  </TableCell>
                                  <TableCell sx={{ color: '#ffffff' }}>
                                    Смена {schedule.number_work}
                                  </TableCell>
                                  <TableCell sx={{ color: '#ffffff' }}>
                                    {schedule.location_name}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow 
                                sx={{ 
                                  backgroundColor: isToday ? 'rgba(200, 58, 10, 0.2)' : 'transparent',
                                  '&:hover': {
                                    backgroundColor: 'rgba(200, 58, 10, 0.1)'
                                  }
                                }}
                              >
                                <TableCell sx={{ color: '#ffffff' }}>
                                  {day.date.format('DD.MM.YYYY')}
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff' }}>
                                  {capitalize(day.dayName)}
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff', fontStyle: 'italic' }}>
                                  Выходной
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff' }}>-</TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </motion.div>
        )}

        {/* Диалоговые окна */}
        {mode === 'your' && (
          <>
            <EmailDialog
              open={openEmailDialog}
              onClose={() => setOpenEmailDialog(false)}
              onSave={handleEmailSave}  
              initialEmail={profile?.email}
              handleNotification={handleNotification}
            />
            <PasswordDialog
              open={openPasswordDialog}
              onClose={() => setOpenPasswordDialog(false)}
              handleNotification={handleNotification}
            />
            <ProfileDialog
              open={openProfileDialog}
              onClose={handleProfileSave}
              initialValue={dialogType === 'contacts' ? profile?.contacts : profile?.description}
              handleNotification={handleNotification}
              type={dialogType}
              userId={profile?.id}
            />
            <PhotoActionDialog
              open={openPhotoActionDialog}
              onClose={() => setOpenPhotoActionDialog(false)}
              userId={profile?.id}
              handleNotification={handleNotification}
              onPhotoChange={() => setPhoto('../../../public/default-employer.jpg')}
              onOpenUploadDialog={() => {
                setOpenPhotoActionDialog(false);
                setOpenPhotoUploadDialog(true);
              }}
            />
            <PhotoUploadDialog
              open={openPhotoUploadDialog}
              onClose={() => setOpenPhotoUploadDialog(false)}
              userId={profile?.id}
              handleNotification={handleNotification}
              onPhotoChange={handlePhotoChange}
            />
          </>
        )}
      </Box>
    </Box>
  );
}