import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  FormControl, 
  Select, 
  MenuItem,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// Define chart animation settings
const chartAnimationOptions = {
  animation: {
    duration: 1000,
    easing: 'easeInOutQuad' as const
  },
  transitions: {
    active: {
      animation: {
        duration: 400
      }
    }
  }
};

// Generate hours for x-axis
const generateHourLabels = () => {
  const now = new Date();
  const hours = [];
  
  for (let i = 7; i >= 0; i--) {
    const hourAgo = new Date(now);
    hourAgo.setHours(now.getHours() - i);
    hours.push(hourAgo.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }
  
  return hours;
};

// Generate mock sentiment data for hourly distribution
const generateHourlySentimentData = () => {
  const hours = generateHourLabels();
  
  return {
    labels: hours,
    datasets: [
      {
        label: 'Positive',
        data: hours.map(() => Math.floor(Math.random() * 40) + 30), // 30-70
        backgroundColor: 'rgba(76, 175, 80, 0.5)',
        borderColor: 'rgb(76, 175, 80)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Neutral',
        data: hours.map(() => Math.floor(Math.random() * 30) + 15), // 15-45
        backgroundColor: 'rgba(255, 235, 59, 0.5)',
        borderColor: 'rgb(255, 235, 59)',
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Negative',
        data: hours.map(() => Math.floor(Math.random() * 25) + 5), // 5-30
        backgroundColor: 'rgba(244, 67, 54, 0.5)',
        borderColor: 'rgb(244, 67, 54)',
        borderWidth: 2,
        tension: 0.4,
      }
    ]
  };
};

// Generate mock data for channel comparison
const generateChannelComparisonData = () => {
  return {
    labels: ['Twitter', 'Instagram', 'In-app Chat', 'Q&A', 'Reviews'],
    datasets: [
      {
        label: 'Positive',
        data: [65, 80, 55, 40, 60],
        backgroundColor: 'rgba(76, 175, 80, 0.7)'
      },
      {
        label: 'Neutral',
        data: [25, 15, 30, 45, 30],
        backgroundColor: 'rgba(255, 235, 59, 0.7)'
      },
      {
        label: 'Negative',
        data: [10, 5, 15, 15, 10],
        backgroundColor: 'rgba(244, 67, 54, 0.7)'
      }
    ]
  };
};

// Generate mock data for resolution time trend
const generateResolutionTimeTrend = () => {
  const days = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const dayAgo = new Date(now);
    dayAgo.setDate(now.getDate() - i);
    days.push(dayAgo.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
  }
  
  // Generate resolution times with a slightly downward trend (improving over time)
  // with some random fluctuation
  let baseValue = Math.floor(Math.random() * 10) + 30; // Starting point between 30-40 minutes
  const resolutionData = days.map(() => {
    baseValue = Math.max(10, baseValue + (Math.random() > 0.7 ? 5 : -5)); // Trend downward with occasional spikes
    return baseValue;
  });
  
  return {
    labels: days,
    datasets: [
      {
        label: 'Resolution Time (minutes)',
        data: resolutionData,
        borderColor: 'rgb(63, 81, 181)',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(63, 81, 181)',
        pointRadius: 4
      }
    ]
  };
};

const SentimentAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hourlySentimentData, setHourlySentimentData] = useState(generateHourlySentimentData());
  const [channelComparisonData, setChannelComparisonData] = useState(generateChannelComparisonData());
  const [resolutionTimeData, setResolutionTimeData] = useState(generateResolutionTimeTrend());
  const [timeRange, setTimeRange] = useState('today');
  const [chartView, setChartView] = useState('line');
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedRef = useRef<Date>(new Date());
  
  // Options for hourly sentiment chart
  const hourlySentimentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...chartAnimationOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          display: false
        }
      },
      y: {
        stacked: chartView === 'stacked',
        title: {
          display: true,
          text: 'Number of Feedback Items'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Hourly Sentiment Distribution',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' items';
            }
            return label;
          }
        }
      }
    }
  };
  
  // Options for channel comparison chart
  const channelComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...chartAnimationOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Feedback Channels'
        },
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Percentage of Feedback'
        },
        min: 0,
        max: 100
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sentiment Comparison Across Channels',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    }
  };
  
  // Options for resolution time trend chart
  const resolutionTimeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    ...chartAnimationOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Average Resolution Time (minutes)'
        },
        min: 0,
        suggestedMax: 60
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Complaint Resolution Time Trend',
        font: {
          size: 16
        }
      }
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setTimeRange(event.target.value);
    refreshChartData(true);
  };
  
  // Handle chart view type change
  const handleChartViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: string,
  ) => {
    if (newView !== null) {
      setChartView(newView);
    }
  };
  
  // Refresh chart data
  const refreshChartData = (forceRefresh = false) => {
    // Only refresh if forced or if 30 seconds have passed
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdatedRef.current.getTime();
    
    if (forceRefresh || timeDiff >= 30000) {
      setLoading(true);
      
      setTimeout(() => {
        setHourlySentimentData(generateHourlySentimentData());
        setChannelComparisonData(generateChannelComparisonData());
        setResolutionTimeData(generateResolutionTimeTrend());
        setLoading(false);
        lastUpdatedRef.current = new Date();
      }, 500);
    }
  };
  
  // Initialize data and set up auto-refresh
  useEffect(() => {
    // Initial data load
    setLoading(true);
    setTimeout(() => {
      setHourlySentimentData(generateHourlySentimentData());
      setChannelComparisonData(generateChannelComparisonData());
      setResolutionTimeData(generateResolutionTimeTrend());
      setLoading(false);
      lastUpdatedRef.current = new Date();
    }, 1000);
    
    // Set up auto-refresh timer
    refreshTimerRef.current = setInterval(() => {
      refreshChartData();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" gutterBottom>
          Sentiment Analytics
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdatedRef.current.toLocaleTimeString()}
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              displayEmpty
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Hourly Sentiment Chart */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 2, height: 400, position: 'relative' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">Hourly Sentiment Distribution</Typography>
              <ToggleButtonGroup
                size="small"
                value={chartView}
                exclusive
                onChange={handleChartViewChange}
              >
                <ToggleButton value="line">Line</ToggleButton>
                <ToggleButton value="stacked">Stacked</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="85%">
                <CircularProgress />
              </Box>
            ) : (
              <Box height="85%">
                {chartView === 'line' ? (
                  <Line options={hourlySentimentOptions} data={hourlySentimentData} />
                ) : (
                  <Bar options={hourlySentimentOptions} data={hourlySentimentData} />
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Channel Comparison Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper elevation={2} sx={{ p: 2, height: 400, position: 'relative' }}>
            <Typography variant="subtitle1" gutterBottom>
              Sentiment by Channel
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="85%">
                <CircularProgress />
              </Box>
            ) : (
              <Box height="85%">
                <Bar options={channelComparisonOptions} data={channelComparisonData} />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Resolution Time Trend */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, height: 350, position: 'relative' }}>
            <Typography variant="subtitle1" gutterBottom>
              Complaint Resolution Time Trend
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="85%">
                <CircularProgress />
              </Box>
            ) : (
              <Box height="85%">
                <Line options={resolutionTimeOptions} data={resolutionTimeData} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SentimentAnalytics; 