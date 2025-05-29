import { Typography, Box, IconButton, useMediaQuery } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { capitalize } from '../utils/utils';
import { useOutletContext } from 'react-router-dom';

export default function ScheduleCard({ schedule, onEdit, onDelete }) {
  const {mode} = useOutletContext();
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isMediumScreen = useMediaQuery('(max-width:900px)');

  return (
    <Box sx={{
      backgroundColor: 'transparent',
      border: '1px solid white',
      borderRadius: '8px',
      padding: isSmallScreen ? '12px' : '16px',
      color: 'white',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: isSmallScreen ? 'column' : 'row',
      alignItems: isSmallScreen ? 'flex-start' : 'center',
      gap: isSmallScreen ? '12px' : '24px',
      minHeight: '80px',
      width: '100%',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 4px 12px rgba(200, 58, 10, 0.2)',
        border: '1px solid rgb(200, 58, 10)',
      }
    }}>
      {/* ФИО сотрудника */}
      <Box sx={{ 
        minWidth: isSmallScreen ? '100%' : '150px',
        maxWidth: isSmallScreen ? '100%' : '150px',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        <Typography variant={isSmallScreen ? 'body1' : 'h6'} noWrap>
          {capitalize(schedule.employer_fio)}
        </Typography>
      </Box>

      {/* Должность */}
      <Box sx={{ 
        flexGrow: 1,
        minWidth: isMediumScreen ? '100px' : 'auto',
        maxWidth: isSmallScreen ? '100%' : '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        <Typography noWrap>
          {capitalize(schedule.employer_work_type)}
        </Typography>
      </Box>
      
      {/* Дата и время начала */}
      <Box sx={{ 
        minWidth: isSmallScreen ? '100%' : '150px',
        maxWidth: isSmallScreen ? '100%' : '150px'
      }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {dayjs(schedule.work_time).format(isSmallScreen ? 'DD.MM HH:mm' : 'YYYY-MM-DD HH:mm')} 
        </Typography>
      </Box>
      
      {/* Время окончания */}
      <Box sx={{ 
        minWidth: isSmallScreen ? '100%' : '80px',
        maxWidth: isSmallScreen ? '100%' : '80px'
      }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {schedule.time_end.slice(0, 5)}
        </Typography>
      </Box>
      
      {/* Кнопки действий */}
      { mode === 'admin' && (
        <Box sx={{ 
        display: 'flex', 
        gap: '8px',
        marginLeft: isSmallScreen ? 'auto' : '0',
        alignSelf: isSmallScreen ? 'flex-end' : 'center'
      }}>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(schedule);
          }} 
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{ 
            color: '#ffffff',
            '&:hover': {
              color: 'rgb(200, 58, 10)'
            }
          }}
        >
          <Edit fontSize={isSmallScreen ? 'small' : 'medium'} />
        </IconButton>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(schedule.id);
          }} 
          size={isSmallScreen ? 'small' : 'medium'}
          sx={{ 
            color: '#ffffff',
            '&:hover': {
              color: 'rgb(200, 58, 10)'
            }
          }}
        >
          <Delete fontSize={isSmallScreen ? 'small' : 'medium'} />
        </IconButton>
      </Box>
      )}
    </Box>
  );
}