import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination } from '@mui/material';
import { Add } from '@mui/icons-material';
import ScheduleCard from '../../components/ScheduleCard';
import ScheduleDialog from '../../components/ScheduleDialog';
import axios from 'axios';
import Finder from '../../components/Finder';
import DateFinder from '../../components/DateFinder';
import WorkTypeFinder from '../../components/WorkTypeFinder';
import { API_URL } from '../../utils/utils';
import ScheduleEditDialog from '../../components/ScheduleEditDialog';

export default function SchedulePage() {
  const { handleNotification, currentLocation, mode } = useOutletContext();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const fetchInProgress = useRef(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  const fetchSchedules = async (fioFilter = '', dateFilter = '', workTypeFilter = '') => {
    try {
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      setLoading(true);
      const locationId = locationMapper[currentLocation];

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        location_id: locationId
      };

      if (fioFilter.trim()) params.employer_fio = fioFilter.trim();
      if (dateFilter.trim()) params.date = dateFilter.trim();
      if (workTypeFilter.trim()) params.work_type = workTypeFilter.trim();

      const response = await axios.get(`${API_URL}workdays/get_workday_filter`, { params });
      setSchedules(response.data || []);
      
      setPagination(prev => ({
        ...prev,
        total: response.data.length < pagination.limit
          ? (pagination.page - 1) * pagination.limit + response.data.length
          : pagination.page * pagination.limit + 1
      }));
    } catch (err) {
      setError(err.message);
      handleNotification('Ошибка загрузки расписания', 'error');
    } finally {
      fetchInProgress.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentLocation, pagination.page]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSchedules(term, dateFilter, workTypeFilter);
  };

  const handleDateSearch = (date) => {
    setDateFilter(date);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSchedules(searchTerm, date, workTypeFilter);
  };

  const handleWorkTypeSearch = (workType) => {
    setWorkTypeFilter(workType);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSchedules(searchTerm, dateFilter, workType);
  };

  const handlePageChange = (_, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}workdays/admin/delete_workday?id=${id}`);
      handleNotification('Смена успешно удалена', 'success');
      fetchSchedules(searchTerm, dateFilter, workTypeFilter);
    } catch (err) {
      handleNotification('Ошибка при удалении смены', 'error');
    }
  };

  const handleCreate = async (data) => {
    try {
      fetchSchedules(searchTerm, dateFilter, workTypeFilter);
      setOpenCreateDialog(false);
    } catch (err) {
      handleNotification('Ошибка при создании смены', 'error');
    }
  };

  const handleUpdate = async (updatedSchedule) => {
    try {
      await axios.put(`${API_URL}workdays/admin/update_workday`, updatedSchedule);
      handleNotification('Смена успешно обновлена', 'success');
      fetchSchedules(searchTerm, dateFilter, workTypeFilter);
      setOpenEditDialog(false);
    } catch (err) {
      handleNotification('Ошибка при обновлении смены', 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setCurrentSchedule(null);
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (schedule) => {
    setCurrentSchedule(schedule);
    setOpenEditDialog(true);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Ошибка загрузки: {error}</Typography>
        <Button
          variant="contained"
          onClick={() => fetchSchedules(searchTerm, dateFilter, workTypeFilter)}
          sx={{ mt: 2, width: '200px' }}
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
      minHeight: 'calc(100vh - 64px)',
      position: 'relative'
    }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        {currentLocation} - Расписание
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <Finder
            findBy="ФИО"
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearch}
          />
          <DateFinder
            value={dateFilter}
            onChange={setDateFilter}
            onSubmit={handleDateSearch}
          />
          <WorkTypeFinder
            value={workTypeFilter}
            onChange={setWorkTypeFilter}
            onSubmit={handleWorkTypeSearch}
          />
        </Box>
        {mode === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            sx={{ width: '200px', bgcolor: '#c83a0a', '&:hover': { bgcolor: '#e04b1a' } }}
          >
            Добавить смену
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {schedules.map(schedule => (
              <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                <ScheduleCard
                  schedule={schedule}
                  onEdit={() => handleOpenEditDialog(schedule)}
                  onDelete={() => handleDelete(schedule.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {!loading && pagination.total > pagination.limit && (
        <Box sx={{ 
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'white',
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#c83a0a',
                '&:hover': {
                  backgroundColor: '#e04b1a',
                },
              },
              '& .MuiPaginationItem-page': {
                '&:hover': {
                  backgroundColor: 'rgba(200, 58, 10, 0.2)',
                },
              },
              '& .MuiPaginationItem-ellipsis': {
                color: 'white',
              },
              '& .MuiSvgIcon-root': {
                color: 'white',
              },
            }}
          />
        </Box>
      )}

      <ScheduleDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSave={handleCreate}
      />

      <ScheduleEditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        workday={currentSchedule}
        onSave={(updatedSchedule) => handleUpdate(updatedSchedule)}
        currentLocation={locationMapper[currentLocation]}
      />
    </Box>
  );
}