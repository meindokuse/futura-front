import { useState, useEffect,useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination } from '@mui/material';
import { Add } from '@mui/icons-material';
import ResidentCard from '../../components/ResidentCard';
import axios from 'axios';
import Finder from '../../components/Finder';
import ResidentDialog from '../../components/ResidentDialog';
import {API_URL } from '../../utils/utils';


export default function Residents() {
    const { handleNotification, mode  } = useOutletContext();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fetchInProgress = useRef(false);
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 10,
      total: 0
    });
    const fetchClients = async (fioFilter = '') => {
      try {
        if (fetchInProgress.current) return;
       fetchInProgress.current = true;
        setLoading(true);
  
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };
  
        if (fioFilter && fioFilter.trim() !== '') {
          params.fio = fioFilter.trim();
        }
        console.log(params)
  
        const response = await axios.get(
          `${API_URL}residents/get_residents_by_filters`,
          { params }
        );
        setClients(response.data || []);
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
      } finally {
        fetchInProgress.current = false;
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchClients();
    }, [pagination.page]);
  
    const handleSearch = (term) => {
      setSearchTerm(term);
      fetchClients(term);
    };
  
    const handlePageChange = (event, newPage) => {
      setPagination(prev => ({ ...prev, page: newPage }));
    };
  
    const handleDelete = async (id) => {
      try {
        await axios.delete(`${API_URL}residents/admin/delete_resident?id=${id}`);
        handleNotification('Клиент удален!', 'success');
        fetchClients(searchTerm);
      } catch (err) {
        console.error('Ошибка удаления:', err);
        handleNotification('Ошибка при удалении!', 'error');
      }
    };
  
    const handleOpenCreateDialog = () => {
      setCurrentClient(null);
      setOpenDialog(true);
    };
  
    const handleOpenEditDialog = (client) => {
      setCurrentClient(client);
      setOpenDialog(true);
    };
  
    const handleCloseDialog = () => {
      setOpenDialog(false);
      setCurrentClient(null);
    };
  
    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Ошибка загрузки: {error}</Typography>
          <Button
            variant="contained"
            onClick={() => fetchClients(searchTerm)}
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
          Постоянные клиенты
        </Typography>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box sx={{ maxWidth: '500px', width: '100%' }}>
            <Finder
              findBy={'ФИО'}
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={handleSearch}
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
              {clients.map(client => (
                <Grid item key={client.id}>
                  <ResidentCard
                    client={client}
                    onEdit={() => handleOpenEditDialog(client)}
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
        {/* Здесь должен быть ваш RegularClientDialog */}
        <ResidentDialog
          open={openDialog}
          onClose={handleCloseDialog}
          resident={currentClient}
          onSave={() => {
            fetchClients(searchTerm);
            handleCloseDialog();
          }}
        />
      </Box>
    );
  }