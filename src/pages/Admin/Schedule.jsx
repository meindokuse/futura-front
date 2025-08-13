import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import axios from 'axios';
import { API_URL, capitalize } from '../../utils/utils';
import Finder from '../../components/Finder';
import WorkTypeFinder from '../../components/WorkTypeFinder';

export default function SchedulePage() {
  const { currentLocation } = useOutletContext();
  const [workdays, setWorkdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null); // Состояние для наведенной строки
  const [hoveredColumn, setHoveredColumn] = useState(null); // Состояние для наведенного столбца
  const tableRef = useRef(null); // Ссылка на TableContainer
  const isDragging = useRef(false); // Флаг для отслеживания зажатия
  const startX = useRef(0); // Начальная позиция X
  const scrollLeft = useRef(0); // Начальная позиция скролла

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  // Получаем данные с сервера
  const fetchWorkdays = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}workdays/get_workday_filter`, {
        params: {
          date_now: currentDate.toISOString().split('T')[0],
          location_id: locationMapper[currentLocation],
          employer_fio: searchTerm,
          employer_work_type: workTypeFilter
        }
      });
      setWorkdays(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkdays();
  }, [currentDate, currentLocation, searchTerm, workTypeFilter]);

  // Генерация дней месяца для заголовков таблицы
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysCount }, (_, i) => ({
      day: i + 1,
      date: new Date(year, month, i + 1)
    }));
  }, [currentDate]);

  // Группировка смен по сотрудникам
  const groupedWorkdays = useMemo(() => {
    const groups = {};
    
    workdays.forEach(workday => {
      if (!groups[workday.employer_id]) {
        groups[workday.employer_id] = {
          employer: workday.employer_fio,
          work_type: workday.employer_work_type,
          days: {}
        };
      }
      const day = new Date(workday.work_date).getDate();
      groups[workday.employer_id].days[day] = workday.number_work;
    });
    
    return groups;
  }, [workdays]);

  // Уникальные сотрудники для строк таблицы
  const employees = useMemo(() => 
    Object.values(groupedWorkdays).sort((a, b) => a.employer.localeCompare(b.employer)),
    [groupedWorkdays]
  );

  // Обработчики для скроллинга мышью
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - (tableRef.current?.offsetLeft || 0);
    scrollLeft.current = tableRef.current?.scrollLeft || 0;
    tableRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (tableRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 2; // Ускорение скролла
    tableRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    tableRef.current.style.cursor = 'grab';
  };

  // Обработчики для скроллинга касанием
  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].pageX - (tableRef.current?.offsetLeft || 0);
    scrollLeft.current = tableRef.current?.scrollLeft || 0;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const x = e.touches[0].pageX - (tableRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 2;
    tableRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Обработчики для наведения
  const handleCellMouseEnter = (rowIndex, columnIndex) => {
    setHoveredRow(rowIndex);
    setHoveredColumn(columnIndex);
  };

  const handleCellMouseLeave = () => {
    setHoveredRow(null);
    setHoveredColumn(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleWorkTypeSearch = (workType) => {
    setWorkTypeFilter(workType);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        backgroundColor: 'transparent' 
      }}>
        <Typography color="error">Ошибка загрузки расписания: {error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchWorkdays}
          sx={{ 
            mt: 2, 
            bgcolor: '#c83a0a', 
            '&:hover': { bgcolor: '#e04b1a' } 
          }}
        >
          Повторить попытку
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, md: 3 },
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
        Расписание - {currentLocation}
      </Typography>

      {/* Фильтры и навигация */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <Finder
              findBy="ФИО"
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={handleSearch}
              onClear={handleClearSearch}
              sx={{ flex: 1 }}
            />
            <WorkTypeFinder
              value={workTypeFilter}
              onChange={setWorkTypeFilter}
              onSubmit={handleWorkTypeSearch}
              sx={{ flex: 1, minWidth: '200px' }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-end' },
            gap: 1
          }}>
            <Button
              variant="outlined"
              onClick={handlePrevMonth}
              startIcon={<ChevronLeft />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: '#c83a0a',
                  color: '#c83a0a'
                }
              }}
            >
              Пред.
            </Button>
            
            <Button
              variant="contained"
              onClick={handleCurrentMonth}
              sx={{
                mx: 1,
                bgcolor: '#c83a0a',
                '&:hover': { bgcolor: '#e04b1a' }
              }}
            >
              Текущий
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleNextMonth}
              endIcon={<ChevronRight />}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: '#c83a0a',
                  color: '#c83a0a'
                }
              }}
            >
              След.
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ 
        mb: 2, 
        textAlign: 'center',
        color: 'white'
      }}>
        {monthName}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <TableContainer 
          ref={tableRef}
          sx={{ 
            maxHeight: 'calc(100vh - 300px)', 
            overflow: 'auto',
            border: '1px solid white',
            borderRadius: 2,
            backgroundColor: 'transparent',
            cursor: 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  width: 200, 
                  minWidth: 200,
                  backgroundColor: '#1e1e1e', 
                  color: 'white',
                  border: '1px solid white',
                  position: 'sticky',
                  left: 0,
                  zIndex: 15
                }}>
                  Сотрудник
                </TableCell>
                <TableCell sx={{ 
                  width: 150,
                  minWidth: 150, 
                  backgroundColor: '#1e1e1e', 
                  color: 'white',
                  border: '1px solid white',
                  borderRight: '3px solid white', // Разделяющая полоса
                  position: 'sticky',
                  left: 200,
                  zIndex: 15
                }}>
                  Должность
                </TableCell>
                {daysInMonth.map(({ day, date }, index) => (
                  <TableCell 
                    key={day} 
                    align="center"
                    onMouseEnter={() => handleCellMouseEnter(null, index)}
                    onMouseLeave={handleCellMouseLeave}
                    sx={{ 
                      minWidth: 50,
                      fontWeight: date.getDay() === 0 || date.getDay() === 6 ? 'bold' : 'normal',
                      color: date.getDay() === 0 ? '#ff4444' : 
                            date.getDay() === 6 ? '#c83a0a' : 'white',
                      backgroundColor: hoveredColumn === index ? 'rgba(200, 58, 10, 0.3)' : '#1e1e1e',
                      border: '1px solid white',
                      borderLeft: 'none', // Убираем левую границу для всех дней
                      zIndex: 2
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee, rowIndex) => (
                <TableRow 
                  key={`${employee.employer}-${rowIndex}`}
                  sx={{
                    backgroundColor: 'transparent', // Прозрачный фон строки
                  }}
                >
                  <TableCell sx={{ 
                    color: 'white', 
                    border: '1px solid white',
                    position: 'sticky',
                    left: 0,
                    zIndex: 12,
                    backgroundColor: rowIndex % 2 === 0 ? '#212121' : '#2a2a2a', // Непрозрачный базовый фон
                    ...(hoveredRow === rowIndex && { backgroundColor: '#c8643c' }) // Непрозрачная подсветка
                  }}>
                    {capitalize(employee.employer)}
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'white', 
                    border: '1px solid white',
                    borderRight: '3px solid white', // Разделяющая полоса
                    position: 'sticky',
                    left: 200,
                    zIndex: 12,
                    backgroundColor: rowIndex % 2 === 0 ? '#212121' : '#2a2a2a', // Непрозрачный базовый фон
                    ...(hoveredRow === rowIndex && { backgroundColor: '#c8643c' }) // Непрозрачная подсветка
                  }}>
                    {capitalize(employee.work_type)}
                  </TableCell>
                  {daysInMonth.map(({ day }, colIndex) => (
                    <TableCell 
                      key={day} 
                      align="center"
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                      onMouseLeave={handleCellMouseLeave}
                      sx={{ 
                        color: 'white',
                        border: '1px solid white',
                        borderLeft: 'none', // Убираем левую границу для всех дней
                        bgcolor: employee.days[day] ? 'rgba(200, 58, 10, 0.3)' : 
                          (hoveredRow === rowIndex || hoveredColumn === colIndex) ? 'rgba(200, 58, 10, 0.3)' : 
                          rowIndex % 2 === 0 ? '#212121' : '#2a2a2a'
                      }}
                    >
                      {employee.days[day] || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}