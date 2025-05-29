import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { capitalize } from '../../utils/utils';

export default function ScheduleCard({ schedule }) {
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  // Форматирование времени окончания
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    
    // Если время в формате "HH:mm:ss"
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours}:${minutes}`;
    }
    
    // Если время в формате ISO (например "17:00:00Z")
    try {
      return dayjs(`2000-01-01T${timeStr}`).format('HH:mm');
    } catch {
      return timeStr;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }} // Небольшое поднятие вместо масштабирования
      transition={{ duration: 0.2 }}
    >
      <Box sx={{
        backgroundColor: 'rgba(50, 50, 50, 0.5)',
        border: '1px solid #333',
        borderRadius: '12px',
        p: 3,
        color: '#fff',
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        alignItems: isSmallScreen ? 'flex-start' : 'center',
        gap: isSmallScreen ? 2 : 4,
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          borderColor: '#c83a0a',
          boxShadow: '0 6px 12px rgba(200, 58, 10, 0.3)',
          backgroundColor: 'rgba(50, 50, 50, 0.7)'
        }
      }}>
        {/* Дата и время работы */}
        <Box sx={{ minWidth: isSmallScreen ? '100%' : '180px' }}>
          <Typography sx={{ 
            fontWeight: 'bold',
            color: '#c83a0a',
            fontSize: '1.1rem',
            mb: 1
          }}>
            {dayjs(schedule.work_time).format('DD.MM.YYYY')}
          </Typography>
          <Typography sx={{ color: '#aaa' }}>
            {dayjs(schedule.work_time).format('HH:mm')} - {formatTime(schedule.time_end)}
          </Typography>
        </Box>

        {/* Локация */}
        <Box sx={{ 
          flex: 1,
          textAlign: isSmallScreen ? 'left' : 'center'
        }}>
          <Typography sx={{ 
            fontSize: '1rem',
            color: '#ffffff'
          }}>
            {capitalize(schedule.location_name)}
          </Typography>
        </Box>

        {/* День недели */}
        <Box sx={{ 
          minWidth: isSmallScreen ? '100%' : '120px',
          textAlign: isSmallScreen ? 'left' : 'right'
        }}>
          <Typography sx={{ 
            color: '#aaa',
            fontStyle: 'italic'
          }}>
            {dayjs(schedule.work_time).format('dddd')}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}