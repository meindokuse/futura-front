import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Card,
  Grid,
  CardContent,
  Pagination,
  CircularProgress
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Основной импорт русской локали
import updateLocale from 'dayjs/plugin/updateLocale';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { API_URL, locationMapper } from '../utils/utils';
import { useOutletContext } from 'react-router-dom';


// Настройка dayjs с русской локалью
dayjs.extend(updateLocale);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('ru');

// Кастомизация русской локали
dayjs.updateLocale('ru', {
  months: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ],
  monthsShort: [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ],
  weekdays: [
    'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
    'Четверг', 'Пятница', 'Суббота'
  ],
  weekdaysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  weekdaysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
});

// Компонент карточки сотрудника
const EmployeeCardMini = ({ employee, onRemove }) => (
  <Card sx={{ 
    bgcolor: '#424242', 
    color: '#ffffff', 
    mb: 1, 
    borderRadius: '6px',
    '&:hover': { bgcolor: '#555555' }
  }}>
    <CardContent sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      p: 1 
    }}>
      <Typography variant="body2">{employee.fio} ({employee.work_type})</Typography>
      <Button
        size="small"
        sx={{ 
          color: '#c83a0a', 
          '&:hover': { 
            color: '#e04b1a',
            backgroundColor: 'rgba(200, 58, 10, 0.1)' 
          } 
        }}
        onClick={() => onRemove(employee.id)}
      >
        Удалить
      </Button>
    </CardContent>
  </Card>
);

// Компонент выбора должности
const WorkTypeSelector = ({ onSelect, onBack, onClose }) => {
  const workTypes = ['кальянщик', 'хостес', 'бармен', 'администратор'];

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="xs" 
      fullWidth         
      PaperProps={{ 
        sx: { 
          backgroundColor: '#121212', 
          color: '#ffffff', 
          borderRadius: '8px' 
        } 
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center',  
        color: '#ffffff', 
        py: 2, 
        position: 'relative' 
      }}>
        Выбор должности
        <IconButton
          onClick={onClose}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8, 
            color: '#ffffff', 
            '&:hover': { color: '#c83a0a' } 
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {workTypes.map(type => (
            <Grid item xs={6} key={type}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#c83a0a',
                  '&:hover': { bgcolor: '#e04b1a' },
                  color: '#ffffff',
                  textTransform: 'capitalize',
                  borderRadius: '6px'
                }}
                onClick={() => onSelect(type)}
              >
                {type}
              </Button>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        justifyContent: 'space-between', 
        py: 2, 
        px: 3 
      }}>
        <Button 
          onClick={onBack} 
          sx={{ 
            color: '#ffffff', 
            '&:hover': { color: '#c83a0a' } 
          }}
        >
          Назад
        </Button>
        <Button disabled sx={{ visibility: 'hidden' }}>
          Вперед
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Компонент выбора сотрудников
const EmployeeSelector = ({ 
  workType, 
  onSelectEmployee, 
  onBack, 
  onClose,
  selectedEmployees
}) => {
  const { handleNotification, currentLocation } = useOutletContext();

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0
  });
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, [workType, pagination.page, searchTerm]);

  const fetchEmployees = async () => {
    try {
      const locationId = locationMapper[currentLocation]
      setLoading(true);
      const response = await axios.get(`${API_URL}employers/get_list_employers/${locationId}`, {
        params: {
          work_type: workType,
          fio: searchTerm.trim() || undefined,
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      const filteredData = response.data 
        ? response.data.filter(emp => 
            !selectedEmployees.some(selected => selected.id === emp.id)
          )
        : [];
      
      setEmployees(filteredData);
      const isLastPage = filteredData.length < pagination.limit;
      setPagination(prev => ({
        ...prev,
        total: isLastPage
          ? (pagination.page - 1) * pagination.limit + filteredData.length
          : pagination.page * pagination.limit + 1
      }));
    } catch (err) {
      console.error('Ошибка загрузки сотрудников:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSelect = (employee) => {
    setSelectedIds(prev => 
      prev.includes(employee.id) 
        ? prev.filter(id => id !== employee.id) 
        : [...prev, employee.id]
    );
  };

  const handleConfirmSelection = () => {
    const selected = employees.filter(emp => selectedIds.includes(emp.id));
    onSelectEmployee(selected);
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { 
          backgroundColor: '#121212', 
          color: '#ffffff', 
          borderRadius: '8px' 
        } 
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        color: '#ffffff', 
        py: 2, 
        position: 'relative' 
      }}>
        Выбор сотрудника ({workType})
        <IconButton
          onClick={onClose}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8, 
            color: '#ffffff', 
            '&:hover': { color: '#c83a0a' } 
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ color: '#ffffff', p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Поиск по ФИО"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#424242' },
                '&:hover fieldset': { borderColor: '#c83a0a' },
                '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
              },
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiSvgIcon-root': { color: '#ffffff' }
            }}
          />
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} sx={{ color: '#c83a0a' }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {employees.map(employee => (
                <Grid item xs={12} key={employee.id}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      sx={{
                        bgcolor: selectedIds.includes(employee.id) ? '#c83a0a' : '#424242',
                        color: '#ffffff',
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: selectedIds.includes(employee.id) ? '#e04b1a' : '#555555' 
                        },
                        borderRadius: '6px'
                      }}
                      onClick={() => handleSelect(employee)}
                    >
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="body2">
                          {employee.fio} ({employee.work_type})
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            {pagination.total > pagination.limit && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(pagination.total / pagination.limit)}
                  page={pagination.page}
                  onChange={handlePageChange}
                  sx={{ 
                    '& .MuiPaginationItem-root': { 
                      color: '#ffffff',
                      '&.Mui-selected': {
                        backgroundColor: '#c83a0a',
                        '&:hover': { backgroundColor: '#e04b1a' }
                      }
                    } 
                  }}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        justifyContent: 'space-between', 
        py: 2, 
        px: 3 
      }}>
        <Button 
          onClick={onBack} 
          sx={{ 
            color: '#ffffff', 
            '&:hover': { color: '#c83a0a' } 
          }}
        >
          Назад
        </Button>
        <Button
          onClick={handleConfirmSelection}
          variant="contained"
          disabled={selectedIds.length === 0}
          sx={{
            bgcolor: '#c83a0a',
            '&:hover': { bgcolor: '#e04b1a' },
            color: '#ffffff',
            '&:disabled': { bgcolor: '#555555' }
          }}
        >
          Выбрать ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Основной компонент диалога
const ScheduleDialog = ({ open, onClose,onSave }) => {
  const { handleNotification,currentLocation } = useOutletContext();

  const [formData, setFormData] = useState({
    date: null,
    startTime: null,
    endTime: null,
    employees: []
  });
  const [step, setStep] = useState('main');
  const [selectedWorkType, setSelectedWorkType] = useState('');

  useEffect(() => {
    if (open) {
      setFormData({
        date: null,
        startTime: null,
        endTime: null,
        employees: []
      });
      setStep('main');
      setSelectedWorkType('');
    }
  }, [open]);

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleStartTimeChange = (time) => {
    setFormData(prev => ({ ...prev, startTime: time }));
  };

  const handleEndTimeChange = (time) => {
    setFormData(prev => ({ ...prev, endTime: time }));
  };

  const handleAddEmployee = () => {
    setStep('selectWorkType');
  };

  const handleSelectWorkType = (workType) => {
    setSelectedWorkType(workType);
    setStep('selectEmployee');
  };

  const handleSelectEmployees = (newEmployees) => {
    setFormData(prev => ({
      ...prev,
      employees: [
        ...prev.employees,
        ...newEmployees.filter(newEmp => 
          !prev.employees.some(emp => emp.id === newEmp.id)
        )
      ]
    }));
    setStep('main');
  };

  const handleRemoveEmployee = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.filter(emp => emp.id !== employeeId)
    }));
  };

  const handleBack = () => {
    if (step === 'selectEmployee') {
      setStep('selectWorkType');
    } else if (step === 'selectWorkType') {
      setStep('main');
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('add_list_workdays')
      if (!formData.date || !formData.startTime || !formData.endTime) return;
      
      const formatDate = (date) => {
        return date.format('YYYY-MM-DD');
      };

      const formatTime = (time) => {
        return time.format('HH:mm:ss');
      };

      const formatTimeShort = (time) => {
        return time.format('HH:mm');
      };

      const location_id = locationMapper[currentLocation]

      const workdays = formData.employees.map(employee => ({
        work_time: `${formatDate(formData.date)}T${formatTime(formData.startTime)}Z`,
        employer_id: employee.id,
        location_id: location_id,
        time_end: formatTimeShort(formData.endTime)
      }));

      await axios.post(`${API_URL}workdays/admin/add_list_workdays`, workdays);
      handleNotification('Успешно сохранено!', 'success');
      onSave()
      onClose();
    } catch (err) {
      handleNotification('Ошибка при сохранении!', 'error');
      console.error('Ошибка сохранения:', err);
    }
  };

  if (step === 'selectWorkType') {
    return (
      <WorkTypeSelector 
        onSelect={handleSelectWorkType} 
        onBack={handleBack} 
        onClose={() => setStep('main')} 
      />
    );
  }

  if (step === 'selectEmployee') {
    return (
      <EmployeeSelector
        workType={selectedWorkType}
        onSelectEmployee={handleSelectEmployees}
        onBack={handleBack}
        onClose={() => setStep('main')}
        selectedEmployees={formData.employees}
      />
    );
  }

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDayjs} 
      adapterLocale="ru"
      dateFormats={{
        monthAndYear: 'MMMM YYYY',
        keyboardDate: 'DD.MM.YYYY',
      }}
    >
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ 
          sx: { 
            backgroundColor: '#121212', 
            color: '#ffffff', 
            borderRadius: '8px' 
          } 
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',  
          color: '#ffffff', 
          py: 2, 
          position: 'relative',
          borderBottom: '1px solid #c83a0a'
        }}>
          Добавить смену
          <IconButton
            onClick={onClose}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8, 
              color: '#ffffff', 
              '&:hover': { color: '#c83a0a' } 
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ color: '#ffffff', p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <DatePicker
              label="Дата смены"
              value={formData.date}
              onChange={handleDateChange}
              format="DD.MM.YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#424242' },
                      '&:hover fieldset': { borderColor: '#c83a0a' },
                      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                    },
                    '& .MuiInputLabel-root': { 
                      color: '#ffffff', 
                      '&.Mui-focused': { color: '#c83a0a' } 
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' }
                  }
                },
                openPickerButton: { 
                  sx: { 
                    color: '#ffffff', 
                    '&:hover': { color: '#c83a0a' } 
                  } 
                }
              }}
            />
            
            <TimePicker
              label="Время начала"
              value={formData.startTime}
              onChange={handleStartTimeChange}
              ampm={false}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#424242' },
                      '&:hover fieldset': { borderColor: '#c83a0a' },
                      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                    },
                    '& .MuiInputLabel-root': { 
                      color: '#ffffff', 
                      '&.Mui-focused': { color: '#c83a0a' } 
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' }
                  }
                },
                openPickerButton: { 
                  sx: { 
                    color: '#ffffff', 
                    '&:hover': { color: '#c83a0a' } 
                  } 
                }
              }}
            />
            
            <TimePicker
              label="Время окончания"
              value={formData.endTime}
              onChange={handleEndTimeChange}
              ampm={false}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#424242' },
                      '&:hover fieldset': { borderColor: '#c83a0a' },
                      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                    },
                    '& .MuiInputLabel-root': { 
                      color: '#ffffff', 
                      '&.Mui-focused': { color: '#c83a0a' } 
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' }
                  }
                },
                openPickerButton: { 
                  sx: { 
                    color: '#ffffff', 
                    '&:hover': { color: '#c83a0a' } 
                  } 
                }
              }}
            />

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddEmployee}
              sx={{
                borderColor: '#c83a0a',
                color: '#ffffff',
                '&:hover': { 
                  borderColor: '#e04b1a', 
                  color: '#e04b1a',
                  backgroundColor: 'rgba(200, 58, 10, 0.1)'
                },
                borderRadius: '6px'
              }}
            >
              Добавить сотрудника
            </Button>
            
            <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              {formData.employees.length > 0 ? (
                formData.employees.map(employee => (
                  <motion.div 
                    key={employee.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EmployeeCardMini
                      employee={employee}
                      onRemove={handleRemoveEmployee}
                    />
                  </motion.div>
                ))
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#ffffff', 
                    textAlign: 'center',
                    py: 2
                  }}
                >
                  Сотрудники не добавлены
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'flex-end',  
          py: 2, 
          px: 3,
          borderTop: '1px solid #c83a0a',
          gap: 2
        }}>
          <Button
            onClick={onClose}
            sx={{
              color: '#ffffff',
              '&:hover': { color: '#c83a0a' }
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.date || !formData.startTime || !formData.endTime || formData.employees.length === 0}
            sx={{
              bgcolor: '#c83a0a',
              '&:hover': { bgcolor: '#e04b1a' },
              color: '#ffffff',
              borderRadius: '6px',
              '&:disabled': {
                bgcolor: '#555555',
                color: '#888888'
              }
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleDialog;