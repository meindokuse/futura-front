import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination, useMediaQuery } from '@mui/material';
import { Add } from '@mui/icons-material';
import EmployerCard from '../../components/EmployerCard';
import EmployeeDialog from '../../components/EmployeeDialog';
import axios from 'axios';
import Finder from '../../components/Finder';
import WorkTypeFinder from '../../components/WorkTypeFinder';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog'
import { API_URL,capitalize } from '../../utils/utils';


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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const isMobile = useMediaQuery('(max-width:600px)');

  const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };

  const fetchEmployees = async () => {
    try {
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      setLoading(true);
      
      const locationId = locationMapper[currentLocation];
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { fio: searchTerm.trim() }),
        ...(workTypeFilter && { work_type: workTypeFilter.trim() })
      };

      const response = await axios.get(
        `${API_URL}employers/get_list_employers/${locationId}`,
        { params }
      );
      
      setEmployees(response.data || []);
      const isLastPage = response.data.length < pagination.limit;
      setPagination(prev => ({
        ...prev,
        total: isLastPage && pagination.page === 1 
          ? response.data.length 
          : (pagination.page) * pagination.limit + 1
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      fetchInProgress.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentLocation, pagination.page, searchTerm, workTypeFilter]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 3,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Typography variant="h5" sx={{ 
        mb: 3, 
        textAlign: 'center',
        fontSize: isMobile ? '1.5rem' : '2rem'
      }}>
        {currentLocation}/Сотрудники
      </Typography>
      
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2 
      }}>
        <Grid container spacing={2} justifyContent="center" sx={{ 
          maxWidth: '800px', 
          width: '100%',
          px: isMobile ? 1 : 0
        }}>
          <Grid item xs={12} sm={6}>
            <Finder
              findBy={'ФИО'}             
              value={searchTerm}
              onChange={setSearchTerm}
              onSubmit={() => fetchEmployees()}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <WorkTypeFinder
              value={workTypeFilter}
              onChange={setWorkTypeFilter}
              onSubmit={() => fetchEmployees()}
            />
          </Grid>
        </Grid>
        {mode === "admin" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
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
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          Ошибка загрузки
        </Typography>
      ) : (
        <>
          <Grid container spacing={isMobile ? 0 : 2} sx={{
            px: isMobile ? 1 : 0,
            width: '100%'
          }}>
            {employees.map(employee => (
              <Grid item 
                xs={12} 
                sm={6} 
                md={4} 
                key={employee.id}
                sx={{
                  mb: isMobile ? 2 : 0,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <EmployerCard
                  employee={employee}
                  onEdit={() => {
                    setCurrentEmployee(employee);
                    setOpenDialog(true);
                  }}
                  onDelete={(employee) => { 
                    setEmployeeToDelete({
                      id: employee.id,
                      fio: employee.fio
                    });
                    setDeleteDialogOpen(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {!loading && pagination.total > pagination.limit && (
        <Box sx={{ 
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
        </>
      )}

      <EmployeeDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setCurrentEmployee(null);
        }}
        employee={currentEmployee}
        onSave={() => {
          fetchEmployees();
          setOpenDialog(false);
        }}
        locationId={locationMapper[currentLocation]}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            await axios.delete(`${API_URL}employers/admin/delete_employer?employer_id=${employeeToDelete.id}`);
            handleNotification(`Сотрудник ${capitalize(employeeToDelete.fio)} удален`, 'success');
            fetchEmployees();
          } catch (err) {
            handleNotification('Ошибка удаления', 'error');
          } finally {
            setDeleteDialogOpen(false);
          }
        }}
        title="Удаление сотрудника"
        content={`Вы уверены, что хотите удалить сотрудника ${capitalize(employeeToDelete?.fio)}?`}
      />
    </Box>
  );
}