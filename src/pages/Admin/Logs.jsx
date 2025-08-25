import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Typography, Grid, CircularProgress, Pagination,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Button, FormControlLabel, Switch
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import axios from 'axios';
import LogCard from '../../components/LogCard';
import { API_URL, locationMapper } from '../../utils/utils';

// Enum для типов и действий (соответствуют бэкенду)
const LOG_TYPES = [
  { value: 'EMPLOYEE', label: 'Персонал' },
  { value: 'CARD', label: 'Методички' },
  { value: 'SCHEDULE', label: 'Расписание' },
  { value: 'RESIDENTS', label: 'Постоянные гости' },
  { value: 'EVENTS', label: 'События' }
];

const LOG_ACTIONS = [
  { value: 'CREATED', label: 'добавил(а)' },
  { value: 'UPDATED', label: 'редактировал(а)' },
  { value: 'DELETED', label: 'удалил(а)' }
];

export default function LogsPage() {
  const { handleNotification, currentLocation } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noLocationFilter, setNoLocationFilter] = useState(false);
  const abortControllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    type: null,
    action: null,
    date_created: null,
    location_id: locationMapper[currentLocation]
  });
  
  // Пагинация
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });

  // Эффект для обновления фильтра локации при смене currentLocation
  useEffect(() => {
    if (!noLocationFilter) {
      setFilters(prev => ({
        ...prev,
        location_id: locationMapper[currentLocation]
      }));
    }
  }, [currentLocation, noLocationFilter]);

  const fetchLogs = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      
      const requestBody = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      if (noLocationFilter) {
        requestBody.location_id = null;
      }

      Object.keys(requestBody).forEach(key => {
        if (requestBody[key] === null || requestBody[key] === undefined || requestBody[key] === '') {
          delete requestBody[key];
        }
      });

      const response = await axios.post(
        `${API_URL}logs/admin/get_list`,
        requestBody,
        { 
          signal: abortControllerRef.current.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setLogs(response.data || []);
      setError(null);
      
      const isLastPage = response.data.length < pagination.limit;
      setPagination(prev => ({
        ...prev,
        total: isLastPage && pagination.page === 1 
          ? response.data.length 
          : (pagination.page) * pagination.limit + 1
      }));
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
        console.error('Ошибка загрузки логов:', err);
        handleNotification('Ошибка загрузки логов', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pagination.page, filters, noLocationFilter]);

  const handleFilterChange = (filterName, value) => {
    const filterValue = value === '' ? null : value;
    setFilters(prev => ({ ...prev, [filterName]: filterValue }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleNoLocationToggle = (event) => {
    const isChecked = event.target.checked;
    setNoLocationFilter(isChecked);
    
    // Если включаем "Без локации", устанавливаем location_id в null
    // Если выключаем - возвращаем текущую локацию
    setFilters(prev => ({
      ...prev,
      location_id: isChecked ? null : locationMapper[currentLocation]
    }));
    
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      type: null,
      action: null,
      date_created: null,
      location_id: locationMapper[currentLocation]
    });
    setNoLocationFilter(false);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: '#ffffff' }}>
        <Typography color="error">Ошибка загрузки логов: {error}</Typography>
        <Button
          variant="contained"
          onClick={fetchLogs}
          sx={{ 
            mt: 2, 
            width: '200px', 
            bgcolor: '#c83a0a',
            '&:hover': { bgcolor: '#e04b1a' },
            color: '#ffffff'
          }}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#ffffff' }}>
        Журнал событий - {currentLocation}
      </Typography>
      
      {/* Фильтры */}
      <Box sx={{ 
        mb: 4, 
        p: 2,
        backgroundColor: 'rgba(30, 30, 30, 0.5)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1, color: '#c83a0a' }} />
          <Typography variant="h6" sx={{ color: '#ffffff' }}>
            Фильтры
          </Typography>
        </Box>
        
        <Grid container spacing={1}>
          {/* Свитчер "Без локации" */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={noLocationFilter}
                  onChange={handleNoLocationToggle}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#c83a0a',
                      '&:hover': {
                        backgroundColor: 'rgba(200, 58, 10, 0.1)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#c83a0a',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#666',
                    },
                    '& .MuiSwitch-thumb': {
                      backgroundColor: noLocationFilter ? '#c83a0a' : '#fff',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                  Без локации (общие логи)
                </Typography>
              }
              sx={{ mb: 1 }}
            />
          </Grid>

          {/* Фильтр по типу объекта */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
              <InputLabel 
                sx={{ 
                  color: '#ccc',
                  fontSize: '0.8rem',
                  '&.Mui-focused': {
                    color: '#c83a0a',
                  }
                }}
              >
                Тип объекта
              </InputLabel>
              <Select
                value={filters.type || ''}
                label="Тип объекта"
                onChange={(e) => handleFilterChange('type', e.target.value)}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.8rem',
                  height: '40px',
                  '& .MuiSelect-icon': { color: '#ccc' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c83a0a',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c83a0a',
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#2a2a2a',
                      color: 'white',
                      '& .MuiMenuItem-root': {
                        fontSize: '0.8rem',
                        '&:hover': {
                          backgroundColor: 'rgba(200, 58, 10, 0.2)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#c83a0a',
                          '&:hover': {
                            backgroundColor: '#e04b1a',
                          }
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem' }}>Все типы</MenuItem>
                {LOG_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.8rem' }}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Фильтр по действию */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
              <InputLabel 
                sx={{ 
                  color: '#ccc',
                  fontSize: '0.8rem',
                  '&.Mui-focused': {
                    color: '#c83a0a',
                  }
                }}
              >
                Действие
              </InputLabel>
              <Select
                value={filters.action || ''}
                label="Действие"
                onChange={(e) => handleFilterChange('action', e.target.value)}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '0.8rem',
                  height: '40px',
                  '& .MuiSelect-icon': { color: '#ccc' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c83a0a',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c83a0a',
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#2a2a2a',
                      color: 'white',
                      '& .MuiMenuItem-root': {
                        fontSize: '0.8rem',
                        '&:hover': {
                          backgroundColor: 'rgba(200, 58, 10, 0.2)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#c83a0a',
                          '&:hover': {
                            backgroundColor: '#e04b1a',
                          }
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8rem' }}>Все действия</MenuItem>
                {LOG_ACTIONS.map(action => (
                  <MenuItem key={action.value} value={action.value} sx={{ fontSize: '0.8rem' }}>
                    {action.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Фильтр по дате */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Дата события"
              value={filters.date_created || ''}
              onChange={(e) => handleFilterChange('date_created', e.target.value)}
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  color: '#ccc',
                  fontSize: '0.8rem',
                  '&.Mui-focused': {
                    color: '#c83a0a',
                  }
                }
              }}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiInputBase-input': { 
                  color: 'white',
                  fontSize: '0.8rem',
                  height: '40px',
                  py: '8px'
                },
                '& .MuiInputLabel-root': { color: '#ccc' },
                '& .MuiOutlinedInput-root': {
                  height: '40px',
                  '&.Mui-focused fieldset': {
                    borderColor: '#c83a0a',
                  },
                  '&:hover fieldset': {
                    borderColor: '#c83a0a',
                  },
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                  }
                }
              }}
            />
          </Grid>

          {/* Кнопка очистки */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              fullWidth
              sx={{
                height: '40px',
                color: '#c83a0a',
                borderColor: '#c83a0a',
                fontSize: '0.8rem',
                '&:hover': { 
                  borderColor: '#e04b1a',
                  backgroundColor: 'rgba(200, 58, 10, 0.1)'
                }
              }}
            >
              Очистить
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Список логов */}
      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} sx={{ color: '#c83a0a' }} />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4, color: '#ccc' }}>
            <Typography variant="h6">Логи не найдены</Typography>
            <Typography variant="body2">Попробуйте изменить параметры фильтрации</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {logs.map(log => (
              <Grid item key={log.id}>
                <LogCard
                  log={log}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Пагинация */}
      {!loading && pagination.total > pagination.limit && (
        <Box sx={{ 
          py: 2,
          display: 'flex',
          justifyContent: 'center',
          mt: 2
        }}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
              },
              '& .MuiPaginationItem-page': {
                '&:hover': {
                  backgroundColor: 'rgba(200, 58, 10, 0.4)',
                },
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#c83a0a',
                '&:hover': {
                  backgroundColor: '#e04b1a',
                },
              },
              '& .MuiPaginationItem-ellipsis': {
                color: 'white !important',
              },
              '& .MuiSvgIcon-root': {
                color: 'white !important',
                fontSize: '1.5rem',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}