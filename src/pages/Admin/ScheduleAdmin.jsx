import { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Drawer, List, ListItem, 
  ListItemText, CircularProgress, IconButton, TextField
} from '@mui/material';
import { Close, Delete, Search } from '@mui/icons-material';
import DateFinder from '../../components/DateFinder';
import axios from 'axios';
import { API_URL,capitalize } from '../../utils/utils';
import { useOutletContext } from 'react-router-dom';

const ScheduleAdminPage = () => {
  const { currentLocation } = useOutletContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  // Получаем расписание
  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}workdays/schedule_admin`, {
        params: {
          date_now: selectedDate,
          location_id: locationMapper[currentLocation]
        }
      });
      setScheduleData(response.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке расписания:', error);
    } finally {
      setLoading(false);
    }
  };

  // Получаем сотрудников по типу работы и фио (если есть)
  const fetchEmployeesByWorkType = async (workType, fio = null) => {
    try {
      const response = await axios.get(`${API_URL}employers/get_employer_by_work_type`, {
        params: {
          work_type: workType.toLowerCase(),
          fio: fio || undefined,
          location_id: locationMapper[currentLocation]
        }
      });
      return response.data || [];
    } catch (error) {
      console.error('Ошибка при загрузке сотрудников:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate, currentLocation]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const normalizeWorkType = (type) => {
    const types = {
      'хостес': 'Хостес',
      'менеджер': 'Хостес',
      'бармен': 'Бармен',
      'помощник бармена': 'Бармен',
      'кальянный мастер': 'Кальянный мастер',
      'помощник кальянного мастера': 'Кальянный мастер'
    };
    return types[type.toLowerCase()] || type;
  };

  const groupedByWorkType = useMemo(() => {
    const groups = {
      'Хостес': Array(4).fill(null),
      'Бармен': Array(5).fill(null),
      'Кальянный мастер': Array(6).fill(null)
    };

    scheduleData.forEach(item => {
      const normalizedType = normalizeWorkType(item.employer_work_type);
      if (groups[normalizedType]) {
        const shiftNumber = item.number_work || 1;
        const maxShifts = groups[normalizedType].length;
        const index = Math.min(Math.max(0, shiftNumber - 1), maxShifts - 1);
        
        groups[normalizedType][index] = item;
      }
    });

    return groups;
  }, [scheduleData]);

  const assignedIds = useMemo(() => {
    return new Set(scheduleData.map(shift => shift?.employer_id).filter(Boolean));
  }, [scheduleData]);

  const handleFormClick = async (workType, shiftNumber) => {
    setCurrentForm({ workType, shiftNumber });
    setSearchTerm('');
    setSearchSubmitted(false);
    setDrawerOpen(true);
    
    const employees = await fetchEmployeesByWorkType(workType);
    setFilteredEmployees(employees.filter(emp => !assignedIds.has(emp.id)));
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setSearchSubmitted(true);
    
    if (!currentForm?.workType) return;
    
    const employees = await fetchEmployeesByWorkType(
      currentForm.workType, 
      searchTerm.trim() || undefined
    );
    setFilteredEmployees(employees.filter(emp => !assignedIds.has(emp.id)));
  };

  const handleEmployeeSelect = async (employee) => {
    if (!currentForm) return;
    
    try {
      await axios.post(`${API_URL}workdays/admin/add_workday`, {
        work_date: selectedDate,
        employer_id: employee.id,
        location_id: locationMapper[currentLocation],
        number_work: currentForm.shiftNumber
      });
      
      await fetchScheduleData();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Ошибка при сохранении расписания:', error);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    try {
      await axios.delete(`${API_URL}workdays/admin/delete_workday?id=${shiftId}`);
      await fetchScheduleData();
    } catch (error) {
      console.error('Ошибка при удалении смены:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      backgroundColor: 'transparent',
      minHeight: '100vh',
      color: 'white'
    }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        Администрирование расписания - {currentLocation}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <DateFinder 
          value={selectedDate}
          onChange={handleDateChange}
          onSubmit={handleDateChange}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          gap: 4, 
          mt: 3,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {['Хостес', 'Бармен', 'Кальянный мастер'].map((workType) => {
            const shiftsCount = workType === 'Хостес' ? 4 : workType === 'Бармен' ? 5 : 6;
            
            return (
              <Box key={workType} sx={{ 
                backgroundColor: 'transparent',
                p: 3,
                borderRadius: 2,
                minWidth: 300,
                border: '1px solid white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(200, 58, 10, 0.2)',
                  borderColor: '#c83a0a'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: 'white',
                  textAlign: 'center',
                  borderBottom: '1px solid white',
                  pb: 1
                }}>
                  {workType}
                </Typography>
                
                {Array(shiftsCount).fill(null).map((_, index) => {
                  const shift = groupedByWorkType[workType]?.[index] || null;
                  return (
                    <Box 
                      key={`${workType}-${index}`}
                      onClick={() => handleFormClick(workType, index + 1)}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: '1px solid white',
                        borderRadius: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(200, 58, 10, 0.2)',
                          borderColor: '#c83a0a'
                        }
                      }}
                    >
                      <Box>
                        <Typography>
                          {shift ? capitalize(shift.employer_fio) : 'Пусто'}
                        </Typography>
                        {shift && shift.employer_work_type.toLowerCase().includes('помощник') && (
                          <Typography variant="caption" sx={{ color: '#aaa', display: 'block' }}>
                            (помощник)
                          </Typography>
                        )}
                      </Box>
                      {shift && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteShift(shift.id);
                          }}
                          sx={{ 
                            color: 'white', 
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              color: '#ff4444',
                              transform: 'scale(1.1)'
                            } 
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      )}

      <Drawer 
        anchor="right" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            borderLeft: '1px solid white',
            color: 'white',
            width: 350
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Выберите {currentForm?.workType?.toLowerCase()}</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          <Box component="form" onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск по ФИО (нажмите Enter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                startAdornment: <Search sx={{ color: 'white', mr: 1 }} />,
                sx: { 
                  color: 'white', 
                  border: '1px solid white', 
                  borderRadius: 1,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
              sx={{ mb: 2 }}
            />
          </Box>

          <List sx={{ 
            maxHeight: '70vh', 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c83a0a',
              borderRadius: '3px',
            }
          }}>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <ListItem 
                  key={employee.id}
                  onClick={() => handleEmployeeSelect(employee)}
                  sx={{
                    border: '1px solid white',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    '&:hover': { 
                      borderColor: '#c83a0a',
                      backgroundColor: 'rgba(200, 58, 10, 0.2)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={capitalize(employee.fio)} 
                    primaryTypographyProps={{ color: 'white' }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ 
                textAlign: 'center', 
                mt: 2,
                color: 'white'
              }}>
                {searchSubmitted ? 'Сотрудники не найдены' : 'Загрузка...'}
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ScheduleAdminPage;