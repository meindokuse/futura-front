import { useState, useEffect,useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination } from '@mui/material';
import { Add } from '@mui/icons-material';
import ManualCard from '../../components/ManualCard';
import axios from 'axios';
import Finder from '../../components/Finder';
import ManualDialog from '../../components/ManualDialog';
import {API_URL } from '../../utils/utils';
import LocationToggle from '../../components/Switcher';


export default function Manuals() {
    const { handleNotification, currentLocation,mode } = useOutletContext();
    const [manuals, setManuals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentManual, setCurrentManual] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGeneralEvent, setIsGeneralEvent] = useState(false);
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

    const fetchManuals = async (titleFilter = '') => {
        try {
          if (fetchInProgress.current) return;
            setLoading(true);
            const locationId = isGeneralEvent ? null : locationMapper[currentLocation] || null;
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                location_id: locationId
            };

            if (titleFilter && titleFilter.trim() !== '') {
                params.title = titleFilter.trim();
            }
            const response = await axios.get(
             `${API_URL}cards/get_list_cards`,
              { params }
            );
            setManuals(response.data || [])
            const isLastPage = response.data.length < pagination.limit;
            setPagination(prev => ({
              ...prev,
              total: isLastPage
                ? (pagination.page - 1) * pagination.limit + response.data.length
                : pagination.page * pagination.limit + 1
            }));

        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки:', err);
        } finally  {
            fetchInProgress.current = false;
            setLoading(false)
        }
    };
    useEffect(() => {
        fetchManuals();
      }, [pagination.page,currentLocation,isGeneralEvent]);
    
      const handleSearch = (term) => {
        setSearchTerm(term);
        fetchManuals(term);
      };
    
      const handlePageChange = (event, newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
      };
    
      const handleDelete = async (id) => {
        try {
          await axios.delete(`${API_URL}cards/admin/delete_card?id=${id}`);
          handleNotification('Клиент удален!', 'success');
          fetchManuals(searchTerm);
        } catch (err) {
          console.error('Ошибка удаления:', err);
          handleNotification('Ошибка при удалении!', 'error');
        }
      };
    
      const handleOpenCreateDialog = () => {
        setCurrentManual(null);
        setOpenDialog(true);
      };
    
      const handleOpenEditDialog = (manual) => {
        setCurrentManual(manual);
        setOpenDialog(true);
      };
    
      const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentManual(null);
      };
      const handleToggle = () => {
        setIsGeneralEvent(prev => !prev);
      };

      if (error) {
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">Ошибка загрузки: {error}</Typography>
            <Button
              variant="contained"
              onClick={() => fetchManuals(searchTerm)}
              sx={{ mt: 2, width: '200px', maxWidth: '100%' }}
            >
              Попробовать снова
            </Button>
          </Box>
        );
      }

      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          {isGeneralEvent ? 'Методички' : `${currentLocation}/Методички`}
          </Typography>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
              <Finder
                findBy={'названию'}
                value={searchTerm}
                onChange={setSearchTerm}
                onSubmit={handleSearch}
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              <Grid container spacing={3} justifyContent="center">
                {manuals.map(manual => (
                  <Grid item key={manual.id}>
                    <ManualCard
                      manual={manual}
                      onEdit={() => handleOpenEditDialog(manual)}
                      onDelete={handleDelete}
                    />
                  </Grid>
                ))}
              </Grid>
              {pagination.total > pagination.limit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={Math.ceil(pagination.total / pagination.limit)}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
          <ManualDialog
            open={openDialog}
            onClose={handleCloseDialog}
            manual={currentManual}
            onSave={() => {
              fetchManuals(searchTerm);
              handleCloseDialog();
            }}
            locationId={isGeneralEvent ? null : locationMapper[currentLocation]}
          />
        </Box>
      );


}