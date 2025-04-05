import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  CircularProgress,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

// Define the issue type
interface Issue {
  id: number;
  description: string;
  source: string;
  severity: 'high' | 'medium' | 'low';
  count: number;
  timestamp: string;
}

const TrendingIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
      setIssues([
        {
          id: 1,
          description: 'Long queue at main entrance',
          source: 'Twitter, Instagram',
          severity: 'high',
          count: 42,
          timestamp: '10:15 AM'
        },
        {
          id: 2,
          description: 'Audio issues in Hall B',
          source: 'In-app chat',
          severity: 'high',
          count: 38,
          timestamp: '10:22 AM'
        },
        {
          id: 3,
          description: 'Food stand delays',
          source: 'Twitter',
          severity: 'medium',
          count: 24,
          timestamp: '10:45 AM'
        },
        {
          id: 4,
          description: 'Speaker running late in Workshop C',
          source: 'Live Q&A',
          severity: 'medium',
          count: 19,
          timestamp: '11:05 AM'
        },
        {
          id: 5,
          description: 'Confusion about schedule changes',
          source: 'In-app chat, Twitter',
          severity: 'low',
          count: 12,
          timestamp: '11:30 AM'
        }
      ]);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ErrorOutlineIcon color="error" />;
      case 'medium':
        return <WarningAmberIcon color="warning" />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return null;
    }
  };

  // Function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Calculate percentage for progress bar (out of theoretical max of 50)
  const getCountPercentage = (count: number) => {
    return (count / 50) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading trending issues...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom display="flex" alignItems="center">
        Trending Issues
        <Chip 
          label={`${issues.length} active`} 
          size="small" 
          color="primary" 
          sx={{ ml: 2 }} 
        />
      </Typography>
      
      <TableContainer sx={{ maxHeight: 350 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Issue</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="center">Severity</TableCell>
              <TableCell align="right">Mentions</TableCell>
              <TableCell align="right">Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id} hover>
                <TableCell>{issue.description}</TableCell>
                <TableCell>{issue.source}</TableCell>
                <TableCell align="center">
                  <Tooltip title={`${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} severity`}>
                    <Box display="flex" justifyContent="center">
                      {getSeverityIcon(issue.severity)}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getCountPercentage(issue.count)} 
                        color={getSeverityColor(issue.severity) as 'error' | 'warning' | 'info'} 
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">{issue.count}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">{issue.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TrendingIssues; 