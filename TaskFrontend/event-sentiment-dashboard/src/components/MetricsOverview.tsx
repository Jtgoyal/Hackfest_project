import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';

// Define metric type
interface Metric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const MetricsOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
      setMetrics([
        {
          id: 'attendees',
          title: 'Active Attendees',
          value: '743',
          change: 12,
          icon: <PeopleIcon />,
          description: 'Currently active attendees at the event',
          color: theme.palette.primary.main
        },
        {
          id: 'feedback',
          title: 'Feedback Rate',
          value: '87/hr',
          change: 23,
          icon: <MessageIcon />,
          description: 'Feedback messages per hour',
          color: theme.palette.info.main
        },
        {
          id: 'sentiment',
          title: 'Positive Sentiment',
          value: '68%',
          change: -3,
          icon: <TrendingUpIcon />,
          description: 'Current positive sentiment ratio',
          color: '#4caf50'
        },
        {
          id: 'alerts',
          title: 'Active Alerts',
          value: '4',
          change: 2,
          icon: <NotificationsActiveIcon />,
          description: 'Current unresolved issues',
          color: theme.palette.error.main
        },
        {
          id: 'resolved',
          title: 'Issues Resolved',
          value: '23',
          change: 5,
          icon: <CheckCircleIcon />,
          description: 'Issues resolved today',
          color: theme.palette.success.main
        }
      ]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [theme.palette]);

  // Periodically update metrics for demo purposes
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setMetrics(prevMetrics => 
        prevMetrics.map(metric => {
          // Apply random small fluctuations to metrics
          if (metric.id === 'attendees') {
            const change = Math.floor(Math.random() * 10) - 3; // -3 to +6
            const newValue = Math.max(500, parseInt(metric.value as string) + change);
            return {
              ...metric,
              value: newValue.toString(),
              change: change > 0 ? 1 : change < 0 ? -1 : 0
            };
          } else if (metric.id === 'feedback') {
            const change = Math.floor(Math.random() * 10) - 4; // -4 to +5
            const baseValue = parseInt((metric.value as string).split('/')[0]);
            const newValue = Math.max(40, baseValue + change);
            return {
              ...metric,
              value: `${newValue}/hr`,
              change: change > 0 ? 2 : change < 0 ? -2 : 0
            };
          } else if (metric.id === 'sentiment') {
            const change = Math.floor(Math.random() * 3) - 1; // -1 to +1
            const baseValue = parseInt((metric.value as string).split('%')[0]);
            const newValue = Math.min(100, Math.max(0, baseValue + change));
            return {
              ...metric,
              value: `${newValue}%`,
              change: change
            };
          } else if (metric.id === 'alerts') {
            // 20% chance of adding an alert, 30% chance of resolving one
            const randomNumber = Math.random();
            let change = 0;
            let newValue = parseInt(metric.value as string);
            
            if (randomNumber < 0.2 && newValue < 10) {
              newValue += 1;
              change = 1;
            } else if (randomNumber < 0.5 && newValue > 0) {
              newValue -= 1;
              change = -1;
            }
            
            return {
              ...metric,
              value: newValue.toString(),
              change: change
            };
          } else if (metric.id === 'resolved') {
            // 30% chance of resolving an issue
            const randomNumber = Math.random();
            let change = 0;
            let newValue = parseInt(metric.value as string);
            
            if (randomNumber < 0.3) {
              newValue += 1;
              change = 1;
            }
            
            return {
              ...metric,
              value: newValue.toString(),
              change: change
            };
          }
          
          return metric;
        })
      );
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [loading]);

  // Display loading state
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="120px">
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading metrics...
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={4} lg={2.4} key={metric.id}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              position: 'relative',
              borderLeft: `4px solid ${metric.color}`,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                color: metric.color
              }}
            >
              {metric.icon}
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {metric.title}
              <Tooltip title={metric.description} arrow>
                <HelpIcon sx={{ ml: 0.5, fontSize: 16, color: 'text.disabled', verticalAlign: 'text-bottom' }} />
              </Tooltip>
            </Typography>
            
            <Box display="flex" alignItems="baseline">
              <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
                {metric.value}
              </Typography>
              
              <Box 
                component="span" 
                sx={{ 
                  ml: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: metric.change > 0 ? 'success.main' : metric.change < 0 ? 'error.main' : 'text.secondary',
                  typography: 'body2'
                }}
              >
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricsOverview; 