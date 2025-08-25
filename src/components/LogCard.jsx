import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { AccessTime, CalendarToday, LocationOn } from '@mui/icons-material';
import { capitalize } from '../utils/utils'; 

const LogCard = ({ log }) => {
  const getTypeColor = (type) => {
    const colors = {
      EMPLOYEE: '#4caf50',
      CARD: '#2196f3', 
      SCHEDULE: '#ff9800',
      RESIDENTS: '#9c27b0',
      EVENTS: '#f44336'
    };
    return colors[type] || '#757575';
  };

  const getActionColor = (action) => {
    const colors = {
      'добавил(а)': '#4caf50',
      'редактировал(а)': '#ff9800',
      'удалил(а)': '#f44336'
    };
    return colors[action] || '#757575';
  };

  const getActionText = (action) => {
    const actionMap = {
      CREATED: "добавил(а)",
      UPDATED: "редактировал(а)", 
      DELETED: "удалил(а)"
    };
    return actionMap[action] || action;
  };

  const getTypeText = (type) => {
    const typeMap = {
      EMPLOYEE: 'Персонал',
      CARD: 'Методички',
      SCHEDULE: 'Расписание',
      RESIDENTS: 'Постоянные гости',
      EVENTS: 'События'
    };
    return typeMap[type] || type;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.split('.')[0];
  };

  // Разделяем object_action на отдельные строки
  const getActionLines = () => {
    return log.object_action.split('\n').filter(item => item.trim() !== '');
  };

  return (
    <Card 
      sx={{ 
        width: 350,
        minHeight: 200,
        backgroundColor: 'rgba(30, 30, 30, 0.8)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        cursor: 'default',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Заголовок и тип */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1 }}>
            {capitalize(log.admin_name)}
          </Typography>
          <Chip 
            label={getTypeText(log.type)}
            size="small"
            sx={{ 
              backgroundColor: getTypeColor(log.type),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          />
        </Box>

        {/* Действие и локация в одной строке */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Chip 
            label={getActionText(log.action)}
            size="small"
            sx={{ 
              backgroundColor: getActionColor(log.action),
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: '#c83a0a' }} />
            <Typography variant="caption" sx={{ color: '#999' }}>
              {log.location_name || 'Общий'}
            </Typography>
          </Box>
        </Box>

        {/* Объект действия */}
        <Box sx={{ mb: 2 }}>
          {getActionLines().map((line, index) => (
            <Box
              key={index}
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: log.action === 'UPDATED' && index > 0 
                  ? 'rgba(255, 152, 0, 0.2)' // Оранжевый для дополнительных строк UPDATE
                  : 'rgba(255, 255, 255, 0.05)', // Серый для первой строки и всех строк других действий
                borderRadius: 1,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: log.action === 'UPDATED' && index > 0 ? '#ffcc80' : '#ccc',
                  fontSize: '0.8rem',
                  lineHeight: 1.3
                }}
              >
                {line.trim()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Дата и время */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ fontSize: 16, color: '#c83a0a' }} />
            <Typography variant="caption" sx={{ color: '#999' }}>
              {new Date(log.date_created).toLocaleDateString('ru-RU')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime sx={{ fontSize: 16, color: '#c83a0a' }} />
            <Typography variant="caption" sx={{ color: '#999' }}>
              {formatTime(log.time_created)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LogCard;