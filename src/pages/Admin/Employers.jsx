import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination } from '@mui/material';
import { Add } from '@mui/icons-material';
import EmployerCard from '../../components/EmployerCard';
import EmployeeDialog from '../../components/EmployeeDialog';
import axios from 'axios';
import Finder from '../../components/Finder';
import WorkTypeFinder from '../../components/WorkTypeFinder';
import { API_URL } from '../../utils/utils';

export default function Employers() {
  const { handleNotification, currentLocation, mode } = useOutletContext();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const fetchInProgress = useRef(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [sort, setSort] = useState({
    sort_by: 'fio',
    sort_order: 'asc'
  });

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  const fetchEmployees = async (fioFilter = '', workTypeFilter = '') => {
    try {
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      const locationId = locationMapper[currentLocation];
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sort.sort_by,
        sort_order: sort.sort_order
      };

      if (fioFilter && fioFilter.trim() !== '') {
        params.fio = fioFilter.trim();
      }

      if (workTypeFilter && workTypeFilter.trim() !== '') {
        params.work_type = workTypeFilter.trim();
      }

      const response = await axios.get(
        `${API_URL}employers/get_list_employers/${locationId}`,
        { params }
      );
      setEmployees(response.data || []);
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
    fetchEmployees();
  }, [currentLocation, pagination.page, sort]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchEmployees(term, workTypeFilter);
  };

  const handleWorkTypeSearch = (workType) => {
    setWorkTypeFilter(workType);
    fetchEmployees(searchTerm, workType);
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}employers/admin/delete_employer?employer_id=${id}`);
      handleNotification('Успешно!', 'success');
      fetchEmployees(searchTerm, workTypeFilter);
    } catch (err) {
      console.error('Ошибка удаления:', err);
      handleNotification('Ошибка при удалении!', 'error');
    }
  };

  const handleOpenCreateDialog = () => {
    setCurrentEmployee(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (employee) => {
    setCurrentEmployee(employee);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEmployee(null);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Ошибка загрузки: {error}</Typography>
        <Button
          variant="contained"
          onClick={() => fetchEmployees(searchTerm, workTypeFilter)}
          sx={{ mt: 2, width: '200px', maxWidth: '100%' }}
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
        {currentLocation}/Сотрудники
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: '800px', width: '100%' }}>
          <Grid item xs={12} sm={6}>
            <Finder
              findBy={'ФИО'}             
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={handleSearch}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <WorkTypeFinder
              value={workTypeFilter}
              onChange={setWorkTypeFilter}
              onSubmit={handleWorkTypeSearch}
            />
          </Grid>
        </Grid>
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
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {employees.map(employee => (
              <Grid item xs={12} sm={6} md={4} key={employee.id}>
                <EmployerCard
                  employee={employee}
                  onEdit={() => handleOpenEditDialog(employee)}
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

      <EmployeeDialog
        open={openDialog}
        onClose={handleCloseDialog}
        employee={currentEmployee}
        onSave={(result) => {
          fetchEmployees(searchTerm, workTypeFilter);
          handleCloseDialog();
        }}
        locationId={locationMapper[currentLocation]}
      />
    </Box>
  );
}