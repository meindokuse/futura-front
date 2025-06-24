import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination } from '@mui/material';
import { Add } from '@mui/icons-material';
import axios from 'axios';
import EventCard from '../../components/EventCard';
import EventDialog from '../../components/EventDialog';
import Finder from '../../components/Finder';
import DateFinder from '../../components/DateFinder';
import LocationToggle from '../../components/Switcher';
import { API_URL } from '../../utils/utils';

export default function EventsPage() {
  const { handleNotification, currentLocation, mode } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isGeneralEvent, setIsGeneralEvent] = useState(false);
  const fetchInProgress = useRef(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 2,
    total: 0
  });

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  const fetchEvents = async (titleFilter = '', dateFilter = '') => {
    try {
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      setLoading(true);
      const locationId = isGeneralEvent ? null : locationMapper[currentLocation] || null;

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        location_id: locationId
      };

      if (titleFilter && titleFilter.trim() !== '') {
        params.name = titleFilter.trim();
      }

      if (dateFilter && dateFilter.trim() !== '') {
        params.target_date = dateFilter.trim();
      }

      const response = await axios.get(`${API_URL}events/get_events_with_filters`, {
        params
      });
      setEvents(response.data || []);
      const isLastPage = response.data.length < pagination.limit;
      setPagination(prev => ({
        ...prev,
        total: isLastPage
          ? (pagination.page - 1) * pagination.limit + response.data.length
          : pagination.page * pagination.limit + 1
      }));
    } catch (err) {
      setError(err.message);
      console.error('Ошибка загрузки событий:', err);
    } finally {
      fetchInProgress.current = false;
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsGeneralEvent(prev => !prev);
  };

  useEffect(() => {
    fetchEvents();
  }, [currentLocation, pagination.page, isGeneralEvent]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchEvents(term, dateFilter);
  };

  const handleDateSearch = (date) => {
    setDateFilter(date);
    fetchEvents(searchTerm, date);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}events/admin/delete_event?id=${id}`);
      handleNotification('Успешно удалено!', 'success');
      fetchEvents();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      handleNotification('Ошибка при удалении!', 'error');
    }
  };

  const handleSave = async (data) => {
    try {
      if (currentEvent) {
        await axios.put(`${API_URL}events/admin/update_event?id=${currentEvent.id}`, data);
      } else {
        await axios.post(`${API_URL}events/admin/create_event`, data);
      }
      handleNotification('Успешно сохранено!', 'success');
      fetchEvents();
      setOpenDialog(false);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      handleNotification('Ошибка при сохранении!', 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setCurrentEvent(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (event) => {
    setCurrentEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEvent(null);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: '#ffffff' }}>
        <Typography color="error">Ошибка загрузки: {error}</Typography>
        <Button
          variant="contained"
          onClick={fetchEvents}
          sx={{ mt: 2, width: '200px', bgcolor: '#c83a0a', '&:hover': { bgcolor: '#e04b1a' }, color: '#ffffff' }}
        >
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#ffffff' }}>
        {isGeneralEvent ? 'События' : `${currentLocation}/События`}
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
          <Finder
            findBy={'названию'}
            value={searchTerm}
            onChange={setSearchTerm}
            onSubmit={handleSearch}
          />
          <DateFinder
            value={dateFilter}
            onChange={setDateFilter}
            onSubmit={handleDateSearch}
          />
          <LocationToggle 
            currentLocation={currentLocation}
            onToggle={handleToggle}
            isGeneralEvent={isGeneralEvent}
          />
        </Box>
        {mode === "admin" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
            sx={{
              width: '200px',
              bgcolor: '#c83a0a',
              '&:hover': { bgcolor: '#e04b1a' }
            }}
          >
            Добавить
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={60} sx={{ color: '#c83a0a' }} />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {events.map(event => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard
                  event={event}
                  onEdit={() => handleOpenEditDialog(event)}
                  onDelete={handleDelete}
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
                fontSize: '1rem',
              },
              '& .MuiPaginationItem-page': {
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(200, 58, 10, 0.4)',
                },
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#c83a0a',
                color: 'white',
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

      <EventDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSave={handleSave}
        event={currentEvent}
        locationId={isGeneralEvent ? null : locationMapper[currentLocation]}
        isGeneralEvent={isGeneralEvent}
      />
    </Box>
  );
}