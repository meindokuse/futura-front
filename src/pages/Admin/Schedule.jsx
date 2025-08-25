import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Grid, Card, CardContent, useMediaQuery, Pagination
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import axios from 'axios';
import { API_URL, capitalize } from '../../utils/utils';
import Finder from '../../components/Finder';
import WorkTypeFinder from '../../components/WorkTypeFinder';

export default function SchedulePage() {
  const { currentLocation } = useOutletContext();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [workdays, setWorkdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const tableRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const abortControllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Пагинация для мобильной версии
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0
  });

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  const fetchWorkdays = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const params = {
        date_now: currentDate.toISOString().split('T')[0],
        location_id: locationMapper[currentLocation],
        employer_fio: searchTerm,
        employer_work_type: workTypeFilter
      };

      // Добавляем параметры пагинации только для мобильной версии
      if (isMobile) {
        params.page = pagination.page;
        params.limit = pagination.limit;
      }

      const response = await axios.get(`${API_URL}workdays/get_workday_filter`, {
        params,
        signal: abortControllerRef.current.signal
      });
      
      setWorkdays(response.data);
      setError(null);

      // Обновляем общее количество только для мобильной версии
      if (isMobile) {
        const isLastPage = response.data.length < pagination.limit;
        setPagination(prev => ({
          ...prev,
          total: isLastPage && pagination.page === 1 
            ? response.data.length 
            : (pagination.page) * pagination.limit + 1
        }));
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
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
      fetchWorkdays();
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentDate, currentLocation, workTypeFilter, searchTerm, pagination.page]);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysCount }, (_, i) => ({
      day: i + 1,
      date: new Date(year, month, i + 1)
    }));
  }, [currentDate]);

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

  const employees = useMemo(() => 
    Object.values(groupedWorkdays).sort((a, b) => a.employer.localeCompare(b.employer)),
    [groupedWorkdays]
  );

  const handleMouseDown = (e) => {
    if (!isMobile) {
      isDragging.current = true;
      startX.current = e.pageX - (tableRef.current?.offsetLeft || 0);
      scrollLeft.current = tableRef.current?.scrollLeft || 0;
      if (tableRef.current) tableRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!isMobile && isDragging.current && tableRef.current) {
      e.preventDefault();
      const x = e.pageX - (tableRef.current.offsetLeft || 0);
      const walk = (x - startX.current) * 2;
      tableRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const handleMouseUp = () => {
    if (!isMobile && tableRef.current) {
      isDragging.current = false;
      tableRef.current.style.cursor = 'grab';
    }
  };

  const handleCellMouseEnter = (rowIndex, columnIndex) => {
    if (!isMobile) {
      setHoveredRow(rowIndex);
      setHoveredColumn(columnIndex);
    }
  };

  const handleCellMouseLeave = () => {
    if (!isMobile) {
      setHoveredRow(null);
      setHoveredColumn(null);
    }
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

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h4" sx={{ 
        mb: 3, 
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        Расписание - {currentLocation}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4, width: '100%', maxWidth: '1200px' }}>
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
              onSubmit={setSearchTerm}
              sx={{ flex: 1 }}
            />
            <WorkTypeFinder
              value={workTypeFilter}
              onChange={setWorkTypeFilter}
              sx={{ flex: 1 }}
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
        color: 'white',
        width: '100%',
        maxWidth: '1200px'
      }}>
        {monthName}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : isMobile ? (
        <>
          <Box sx={{
            width: '100%',
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            px: 2
          }}>
            {employees.map((employee) => (
              <Card key={employee.employer} sx={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: 'rgba(30, 30, 30, 0.8)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 2
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {capitalize(employee.employer)}
                  </Typography>
                  <Typography color="#c83a0a" sx={{ mb: 2 }}>
                    {capitalize(employee.work_type)}
                  </Typography>
                  
                  <Grid container spacing={1}>
                    {daysInMonth.map(({ day, date }) => (
                      employee.days[day] && (
                        <Grid item xs={4} sm={3} key={day}>
                          <Box sx={{ 
                            p: 1,
                            border: '1px solid rgba(200, 58, 10, 0.3)',
                            borderRadius: 1,
                            textAlign: 'center',
                            bgcolor: 'rgba(30, 30, 30, 0.5)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="body2" sx={{ 
                              color: date.getDay() === 0 ? '#ff4444' : 
                                    date.getDay() === 6 ? '#c83a0a' : 'white'
                            }}>
                              {day} {date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '')}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: 'white' }}>
                              {employee.days[day]}
                            </Typography>
                          </Box>
                        </Grid>
                      )
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>

          {pagination.total > pagination.limit && (
            <Box sx={{ 
              py: 2,
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
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
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                }}
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ 
          width: '100%',
          maxWidth: '1200px',
          overflow: 'hidden'
        }}>
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
                    borderRight: '3px solid white',
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
                        borderLeft: 'none',
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
                      backgroundColor: 'transparent',
                    }}
                  >
                    <TableCell sx={{ 
                      color: 'white', 
                      border: '1px solid white',
                      position: 'sticky',
                      left: 0,
                      zIndex: 12,
                      backgroundColor: rowIndex % 2 === 0 ? '#212121' : '#2a2a2a',
                      ...(hoveredRow === rowIndex && { backgroundColor: '#c8643c' })
                    }}>
                      {capitalize(employee.employer)}
                    </TableCell>
                    <TableCell sx={{ 
                      color: 'white', 
                      border: '1px solid white',
                      borderRight: '3px solid white',
                      position: 'sticky',
                      left: 200,
                      zIndex: 12,
                      backgroundColor: rowIndex % 2 === 0 ? '#212121' : '#2a2a2a',
                      ...(hoveredRow === rowIndex && { backgroundColor: '#c8643c' })
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
                          borderLeft: 'none',
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
        </Box>
      )}
    </Box>
  );
}