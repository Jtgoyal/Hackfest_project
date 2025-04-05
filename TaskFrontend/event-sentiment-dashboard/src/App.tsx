import React from 'react';
import { Box, Container, Grid, Paper, Typography, useMediaQuery, useTheme, Tab, Tabs } from '@mui/material';
import SentimentGauge from './components/SentimentGauge';
import TrendingIssues from './components/TrendingIssues';
import FeedbackStream from './components/FeedbackStream';
import PriorityAlert from './components/PriorityAlert';
import MetricsOverview from './components/MetricsOverview';
import SentimentAnalytics from './components/SentimentAnalytics';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        <Paper 
          elevation={0} 
          sx={{ p: 2, mb: 3, bgcolor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Event Sentiment Dashboard
          </Typography>
          <Typography variant="body2">
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
        </Paper>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Dashboard" />
          <Tab label="Analytics" />
        </Tabs>

        {activeTab === 0 ? (
          <Grid container spacing={3}>
            {/* Metrics overview cards */}
            <Grid item xs={12}>
              <MetricsOverview />
            </Grid>

            {/* Sentiment gauge */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <SentimentGauge />
              </Paper>
            </Grid>

            {/* Trending issues */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                <TrendingIssues />
              </Paper>
            </Grid>

            {/* Live feedback stream */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 2, height: isMobile ? 'auto' : 400, overflow: 'auto' }}>
                <FeedbackStream />
              </Paper>
            </Grid>

            {/* Priority Alerts (replacing Alert history) */}
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, height: isMobile ? 'auto' : 400, overflow: 'auto' }}>
                <PriorityAlert />
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <SentimentAnalytics />
        )}
      </Container>
    </Box>
  );
}

export default App; 