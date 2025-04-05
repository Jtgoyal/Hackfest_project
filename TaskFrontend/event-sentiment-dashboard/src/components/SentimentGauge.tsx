import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentGauge: React.FC = () => {
  // Mock sentiment data (would be fetched from an API in a real app)
  const [sentiment, setSentiment] = useState<{ positive: number; neutral: number; negative: number }>({
    positive: 65,
    neutral: 25,
    negative: 10,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Periodically update sentiment data for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate sentiment changes
      const randomShift = Math.floor(Math.random() * 5);
      const randomSentiment = Math.floor(Math.random() * 3);
      
      setSentiment(prev => {
        // Create a copy of the previous state
        const newSentiment = { ...prev };
        
        // Update the random sentiment type
        if (randomSentiment === 0 && prev.positive >= 5) {
          newSentiment.positive = Math.max(prev.positive - randomShift, 0);
          newSentiment.neutral = Math.min(prev.neutral + randomShift, 100);
        } else if (randomSentiment === 1 && prev.neutral >= 5) {
          newSentiment.neutral = Math.max(prev.neutral - randomShift, 0);
          newSentiment.negative = Math.min(prev.negative + randomShift, 100);
        } else if (randomSentiment === 2 && prev.negative >= 5) {
          newSentiment.negative = Math.max(prev.negative - randomShift, 0);
          newSentiment.positive = Math.min(prev.positive + randomShift, 100);
        }
        
        // Ensure total is 100%
        const total = newSentiment.positive + newSentiment.neutral + newSentiment.negative;
        const adjustment = 100 / total;
        
        return {
          positive: Math.round(newSentiment.positive * adjustment),
          neutral: Math.round(newSentiment.neutral * adjustment),
          negative: Math.round(newSentiment.negative * adjustment),
        };
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [sentiment.positive, sentiment.neutral, sentiment.negative],
        backgroundColor: ['#4caf50', '#ffeb3b', '#f44336'],
        borderColor: ['#43a047', '#fdd835', '#e53935'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
  };

  // Get overall sentiment label
  const getOverallSentiment = () => {
    if (sentiment.positive > sentiment.neutral && sentiment.positive > sentiment.negative) {
      return 'Positive';
    } else if (sentiment.negative > sentiment.neutral && sentiment.negative > sentiment.positive) {
      return 'Negative';
    } else {
      return 'Neutral';
    }
  };

  // Get color for overall sentiment
  const getSentimentColor = () => {
    const sentimentType = getOverallSentiment();
    if (sentimentType === 'Positive') return '#4caf50';
    if (sentimentType === 'Negative') return '#f44336';
    return '#ffeb3b';
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading sentiment data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Real-Time Sentiment Gauge
      </Typography>
      <Box height={300} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box position="relative" width="100%" height="100%">
          <Doughnut data={chartData} options={options} />
          <Box
            position="absolute"
            top="50%"
            left="50%"
            sx={{
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color={getSentimentColor()} sx={{ fontWeight: 'bold' }}>
              {getOverallSentiment()}
            </Typography>
            <Typography variant="body2">Overall Sentiment</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SentimentGauge; 