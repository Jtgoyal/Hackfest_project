import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CircularProgress, 
  Divider, 
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';

// Define alert type
interface Alert {
  id: number;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: string;
  isResolved: boolean;
}

const AlertHistory: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate resolving alerts
  const resolveAlert = (id: number) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, isResolved: true } : alert
      )
    );
  };

  // Initial data loading
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
      setAlerts([
        {
          id: 1,
          message: "Critical alert: Audio system failure in Hall B",
          type: "error",
          timestamp: "10:22 AM",
          isResolved: true
        },
        {
          id: 2,
          message: "High volume of complaints about main entrance queue",
          type: "error",
          timestamp: "10:15 AM",
          isResolved: false
        },
        {
          id: 3,
          message: "Warning: Food service delays reported",
          type: "warning",
          timestamp: "10:45 AM",
          isResolved: false
        },
        {
          id: 4,
          message: "Info: Workshop C speaker running 15 mins late",
          type: "info",
          timestamp: "11:05 AM",
          isResolved: false
        },
        {
          id: 5,
          message: "Registration system back online after brief outage",
          type: "success",
          timestamp: "09:48 AM",
          isResolved: true
        },
        {
          id: 6,
          message: "Warning: Capacity limits approaching in Exhibition Hall",
          type: "warning",
          timestamp: "09:30 AM",
          isResolved: true
        }
      ]);
    }, 1800);
    
    return () => clearTimeout(timer);
  }, []);

  // Automatically resolve the first unresolved alert after 15 seconds for demo purposes
  useEffect(() => {
    if (loading) return;
    
    const firstUnresolvedAlert = alerts.find(alert => !alert.isResolved);
    
    if (firstUnresolvedAlert) {
      const timer = setTimeout(() => {
        resolveAlert(firstUnresolvedAlert.id);
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [alerts, loading]);

  // Add occasional new alerts for demo purposes
  useEffect(() => {
    if (loading) return;
    
    const possibleAlerts = [
      {
        message: "New issue: WiFi connectivity problems in east wing",
        type: "warning" as const
      },
      {
        message: "VIP guest arrival at backstage entrance",
        type: "info" as const
      },
      {
        message: "Critical: Power fluctuation in AV control room",
        type: "error" as const
      },
      {
        message: "Parking lot A reaching capacity",
        type: "warning" as const
      }
    ];
    
    const interval = setInterval(() => {
      // 30% chance of adding a new alert
      if (Math.random() < 0.3) {
        const randomIndex = Math.floor(Math.random() * possibleAlerts.length);
        const newAlert = possibleAlerts[randomIndex];
        
        const newAlertItem: Alert = {
          id: Date.now(),
          message: newAlert.message,
          type: newAlert.type,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          isResolved: false
        };
        
        setAlerts(prevAlerts => [newAlertItem, ...prevAlerts.slice(0, 9)]); // Keep max 10 alerts
      }
    }, 20000); // Check every 20 seconds
    
    return () => clearInterval(interval);
  }, [loading]);

  // Get alert icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get status chip
  const getStatusChip = (isResolved: boolean) => {
    return isResolved ? 
      <Chip label="Resolved" size="small" color="success" variant="outlined" /> : 
      <Chip label="Active" size="small" color="error" variant="outlined" />;
  };

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading alert history...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">Alert History</Typography>
          <Chip 
            label={`${alerts.filter(a => !a.isResolved).length} active`} 
            size="small" 
            color="error" 
            sx={{ ml: 2 }} 
          />
        </Box>
        <Tooltip title="Refresh alerts">
          <IconButton size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <List sx={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
        {alerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            <ListItem 
              alignItems="flex-start"
              sx={{
                bgcolor: !alert.isResolved ? 
                  (alert.type === 'error' ? 'rgba(244, 67, 54, 0.08)' : 
                   alert.type === 'warning' ? 'rgba(255, 152, 0, 0.08)' : 
                   'transparent') : 
                  'transparent'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getAlertIcon(alert.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" component="span" sx={{ fontWeight: !alert.isResolved ? 'bold' : 'regular' }}>
                      {alert.timestamp}
                    </Typography>
                    {getStatusChip(alert.isResolved)}
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    color="text.primary" 
                    sx={{ mt: 1, fontWeight: !alert.isResolved ? 'medium' : 'regular' }}
                  >
                    {alert.message}
                  </Typography>
                }
              />
            </ListItem>
            {index < alerts.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default AlertHistory; 