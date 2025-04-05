import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Slide,
  Snackbar,
  Alert,
  Divider,
  Badge,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Tooltip
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  NotificationsActive as NotificationsActiveIcon,
  Close as CloseIcon,
  Block as BlockIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Define severity levels and colors
const SEVERITY = {
  CRITICAL: { level: 'critical', color: '#d32f2f', icon: <ErrorIcon />, badge: '#d32f2f' },
  HIGH: { level: 'high', color: '#f44336', icon: <ErrorIcon />, badge: '#f44336' },
  MEDIUM: { level: 'medium', color: '#ff9800', icon: <WarningIcon />, badge: '#ff9800' },
  LOW: { level: 'low', color: '#2196f3', icon: <InfoIcon />, badge: '#2196f3' }
};

// Define alert interface
interface PriorityAlertItem {
  id: string;
  message: string;
  details: string;
  source: string;
  timestamp: Date | string;
  severity: keyof typeof SEVERITY;
  isResolved: boolean;
  assignedTo?: string;
  actions?: string[];
}

// Define staff member interface
interface StaffMember {
  id: string;
  name: string;
  role: string;
  isAvailable: boolean;
}

// Mock available staff
const AVAILABLE_STAFF: StaffMember[] = [
  { id: 'staff1', name: 'Alex Johnson', role: 'Technical Support', isAvailable: true },
  { id: 'staff2', name: 'Jamie Smith', role: 'Event Coordinator', isAvailable: true },
  { id: 'staff3', name: 'Taylor Wilson', role: 'Customer Service', isAvailable: false },
  { id: 'staff4', name: 'Morgan Lee', role: 'AV Specialist', isAvailable: true }
];

// Sample alert data
const INITIAL_ALERTS: PriorityAlertItem[] = [
  {
    id: 'alert-1',
    message: 'Audio system failure in Hall B',
    details: 'Multiple attendees reporting complete audio loss during keynote presentation',
    source: 'In-app feedback',
    timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
    severity: 'CRITICAL',
    isResolved: false,
    actions: ['Check power supply', 'Test backup microphones', 'Contact AV team']
  },
  {
    id: 'alert-2',
    message: 'WiFi connectivity issues in East Wing',
    details: 'Attendees unable to connect to conference WiFi network in exhibition area',
    source: 'Twitter mentions',
    timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
    severity: 'HIGH',
    isResolved: false,
    actions: ['Reset routers', 'Check bandwidth utilization', 'Deploy mobile hotspots']
  },
  {
    id: 'alert-3',
    message: 'Registration queue exceeding 30 minutes',
    details: 'Entrance queue has grown to over 100 people with long wait times',
    source: 'Staff report',
    timestamp: new Date(Date.now() - 40 * 60000), // 40 minutes ago
    severity: 'MEDIUM',
    isResolved: true,
    assignedTo: 'staff2',
    actions: ['Open additional registration desks', 'Deploy mobile check-in staff']
  }
];

// Mock WebSocket class for simulation purposes
class MockWebSocket {
  private callbacks: { [key: string]: (event: any) => void } = {};
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(url: string) {
    console.log(`WebSocket connected to ${url}`);
    
    // Simulate receiving messages
    this.intervalId = setInterval(() => {
      // 20% chance of sending a new alert
      if (Math.random() < 0.2 && this.callbacks['message']) {
        const newAlert = this.generateRandomAlert();
        this.callbacks['message']({ data: JSON.stringify(newAlert) });
      }
    }, 15000); // Check every 15 seconds
  }
  
  addEventListener(event: string, callback: (event: any) => void) {
    this.callbacks[event] = callback;
  }
  
  removeEventListener(event: string) {
    delete this.callbacks[event];
  }
  
  close() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('WebSocket closed');
  }
  
  private generateRandomAlert(): PriorityAlertItem {
    const severityOptions: Array<keyof typeof SEVERITY> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const randomSeverity = severityOptions[Math.floor(Math.random() * 4)];
    
    const alertMessages = [
      { message: 'Food shortage at main catering station', details: 'Running low on lunch options at Hall A station' },
      { message: 'Overcrowding in Workshop Room 3', details: 'Room capacity exceeded by approximately 20 attendees' },
      { message: 'Parking lot A reaching capacity', details: 'Less than 10% of parking spaces remaining' },
      { message: 'Scheduled speaker delayed in traffic', details: 'Afternoon keynote speaker may be 15-20 minutes late' },
      { message: 'Projector malfunction in Breakout Room B', details: 'Presentation equipment not responding to inputs' }
    ];
    
    const randomMessage = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    const sources = ['Twitter mentions', 'In-app feedback', 'Staff report', 'Email notification', 'SMS alert'];
    
    return {
      id: `alert-${Date.now()}`,
      message: randomMessage.message,
      details: randomMessage.details,
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp: new Date(),
      severity: randomSeverity,
      isResolved: false,
      actions: ['Investigate', 'Assign staff', 'Monitor situation']
    };
  }
}

// Configure service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

const PriorityAlert: React.FC = () => {
  const [alerts, setAlerts] = useState<PriorityAlertItem[]>(INITIAL_ALERTS);
  const [alertHistory, setAlertHistory] = useState<PriorityAlertItem[]>([]);
  const [activeAlert, setActiveAlert] = useState<PriorityAlertItem | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [showAssignDialog, setShowAssignDialog] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const webSocketRef = useRef<MockWebSocket | null>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // In a real app, this would be your WebSocket endpoint
    const wsUrl = 'ws://event-server.example/alerts';
    webSocketRef.current = new MockWebSocket(wsUrl);
    
    // Handle incoming messages
    webSocketRef.current.addEventListener('message', (event) => {
      try {
        const newAlert = JSON.parse(event.data) as PriorityAlertItem;
        
        // Add the new alert
        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
        
        // Show notification
        if (notificationsEnabled) {
          showPushNotification(newAlert);
        }
        
        // Show in-app notification
        setNotificationMessage(`New ${newAlert.severity.toLowerCase()} alert: ${newAlert.message}`);
        setShowNotification(true);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Clean up WebSocket connection
    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.removeEventListener('message');
        webSocketRef.current.close();
      }
    };
  }, [notificationsEnabled]);
  
  // Initialize service worker and request notification permission
  useEffect(() => {
    const initializeNotifications = async () => {
      await registerServiceWorker();
      const permissionGranted = await requestNotificationPermission();
      setNotificationsEnabled(permissionGranted);
    };
    
    initializeNotifications();
  }, []);
  
  // Show push notification
  const showPushNotification = (alert: PriorityAlertItem) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Event Alert', {
        body: alert.message,
        icon: '/logo192.png', // Path to your notification icon
        tag: alert.id
      });
      
      notification.onclick = () => {
        window.focus();
        setActiveAlert(alert);
      };
    }
  };
  
  // Mark alert as resolved
  const handleResolveAlert = useCallback((alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, isResolved: true } 
          : alert
      )
    );
    
    // Add to history if it's the active alert
    if (activeAlert && activeAlert.id === alertId) {
      const resolvedAlert = { ...activeAlert, isResolved: true };
      setAlertHistory(prev => [resolvedAlert, ...prev]);
      setActiveAlert(null);
    }
    
    // Show notification
    setNotificationMessage('Alert marked as resolved');
    setShowNotification(true);
  }, [activeAlert]);
  
  // Open assign staff dialog
  const handleOpenAssignDialog = useCallback((alert: PriorityAlertItem) => {
    setActiveAlert(alert);
    setShowAssignDialog(true);
  }, []);
  
  // Handle staff selection
  const handleStaffChange = (event: SelectChangeEvent) => {
    setSelectedStaff(event.target.value);
  };
  
  // Assign staff to alert
  const handleAssignStaff = () => {
    if (activeAlert && selectedStaff) {
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === activeAlert.id 
            ? { ...alert, assignedTo: selectedStaff } 
            : alert
        )
      );
      
      // Update active alert
      setActiveAlert(prev => prev ? { ...prev, assignedTo: selectedStaff } : null);
      
      // Close dialog
      setShowAssignDialog(false);
      setSelectedStaff('');
      
      // Show notification
      setNotificationMessage('Staff assigned to alert');
      setShowNotification(true);
    }
  };
  
  // Ignore/dismiss alert
  const handleIgnoreAlert = useCallback((alertId: string) => {
    // Move to history
    const alertToIgnore = alerts.find(a => a.id === alertId);
    if (alertToIgnore) {
      setAlertHistory(prev => [{ ...alertToIgnore, isResolved: true }, ...prev]);
    }
    
    // Remove from active alerts
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    
    // Clear active alert if needed
    if (activeAlert && activeAlert.id === alertId) {
      setActiveAlert(null);
    }
    
    // Show notification
    setNotificationMessage('Alert dismissed');
    setShowNotification(true);
  }, [activeAlert, alerts]);
  
  // View alert details
  const handleViewAlert = useCallback((alert: PriorityAlertItem) => {
    setActiveAlert(alert);
  }, []);
  
  // Close notification
  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  
  // Get severity level styling
  const getSeverityStyle = (severity: keyof typeof SEVERITY) => {
    const severityInfo = SEVERITY[severity];
    return {
      color: severityInfo.color,
      borderColor: severityInfo.color,
      icon: severityInfo.icon,
      badge: severityInfo.badge
    };
  };
  
  // Get formatted time (e.g., "10 min ago")
  const getFormattedTime = (timestamp: Date | string) => {
    try {
      const now = new Date();
      let date: Date;
      
      // Handle if timestamp is already a date object or a string
      if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        // If it's a string, try to parse it
        date = new Date(timestamp);
      } else {
        // If not a valid format, return the original
        return String(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return String(timestamp);
      }
      
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      
      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting time:', error);
      return String(timestamp);
    }
  };
  
  // Filter active (unresolved) alerts
  const activeAlerts = alerts.filter(alert => !alert.isResolved);
  
  // Count alerts by severity
  const criticalCount = activeAlerts.filter(alert => alert.severity === 'CRITICAL').length;
  const highCount = activeAlerts.filter(alert => alert.severity === 'HIGH').length;
  const mediumCount = activeAlerts.filter(alert => alert.severity === 'MEDIUM').length;
  const lowCount = activeAlerts.filter(alert => alert.severity === 'LOW').length;
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          Priority Alerts
          <Badge 
            badgeContent={activeAlerts.length} 
            color="error"
            sx={{ ml: 1 }}
          />
        </Typography>
        
        <Box display="flex" gap={1}>
          <Tooltip title="View alert history">
            <IconButton size="small" onClick={() => setShowHistory(true)}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}>
            <IconButton 
              size="small" 
              color={notificationsEnabled ? "primary" : "default"}
              onClick={async () => {
                if (!notificationsEnabled) {
                  const permissionGranted = await requestNotificationPermission();
                  setNotificationsEnabled(permissionGranted);
                }
              }}
            >
              <NotificationsActiveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Alert summary chips */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {criticalCount > 0 && (
          <Chip 
            icon={<ErrorIcon />} 
            label={`${criticalCount} Critical`} 
            sx={{ 
              bgcolor: 'rgba(211, 47, 47, 0.1)', 
              color: '#d32f2f', 
              fontWeight: 'medium',
              mb: 1
            }} 
          />
        )}
        {highCount > 0 && (
          <Chip 
            icon={<ErrorIcon />} 
            label={`${highCount} High`} 
            sx={{ 
              bgcolor: 'rgba(244, 67, 54, 0.1)', 
              color: '#f44336', 
              fontWeight: 'medium',
              mb: 1
            }} 
          />
        )}
        {mediumCount > 0 && (
          <Chip 
            icon={<WarningIcon />} 
            label={`${mediumCount} Medium`} 
            sx={{ 
              bgcolor: 'rgba(255, 152, 0, 0.1)', 
              color: '#ff9800', 
              fontWeight: 'medium',
              mb: 1
            }} 
          />
        )}
        {lowCount > 0 && (
          <Chip 
            icon={<InfoIcon />} 
            label={`${lowCount} Low`} 
            sx={{ 
              bgcolor: 'rgba(33, 150, 243, 0.1)', 
              color: '#2196f3', 
              fontWeight: 'medium',
              mb: 1
            }} 
          />
        )}
      </Stack>
      
      {/* Active alert list */}
      {activeAlerts.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {activeAlerts.map((alert) => {
            const severityStyle = getSeverityStyle(alert.severity);
            return (
              <Slide key={alert.id} direction="right" in={true} mountOnEnter unmountOnExit>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    mb: 2, 
                    borderLeft: 4, 
                    borderColor: severityStyle.color,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                >
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ py: 1 }}
                    secondaryAction={
                      <Box>
                        <Tooltip title="Mark as resolved">
                          <IconButton 
                            edge="end" 
                            aria-label="resolve" 
                            onClick={() => handleResolveAlert(alert.id)}
                            size="small"
                            sx={{ color: 'success.main' }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign staff">
                          <IconButton 
                            edge="end" 
                            aria-label="assign" 
                            onClick={() => handleOpenAssignDialog(alert)}
                            size="small"
                            sx={{ color: 'primary.main' }}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss alert">
                          <IconButton 
                            edge="end" 
                            aria-label="ignore" 
                            onClick={() => handleIgnoreAlert(alert.id)}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: severityStyle.color }}>
                        {severityStyle.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'medium' }}>
                            {alert.message}
                          </Typography>
                          <Chip 
                            label={alert.severity} 
                            size="small" 
                            sx={{ 
                              bgcolor: `${severityStyle.color}20`, 
                              color: severityStyle.color,
                              fontWeight: 'medium',
                              fontSize: '0.7rem'
                            }} 
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ my: 0.5 }}
                          >
                            {alert.details}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                component="span"
                              >
                                Source: {alert.source}
                              </Typography>
                              {alert.assignedTo && (
                                <Chip 
                                  label={`Assigned: ${AVAILABLE_STAFF.find(s => s.id === alert.assignedTo)?.name || 'Staff'}`} 
                                  size="small" 
                                  sx={{ ml: 1, fontSize: '0.7rem' }} 
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {getFormattedTime(alert.timestamp)}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  
                  {/* Recommended actions */}
                  {alert.actions && alert.actions.length > 0 && (
                    <Collapse in={true}>
                      <Box px={2} pb={1}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Recommended actions:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                          {alert.actions.map((action, idx) => (
                            <Chip 
                              key={idx} 
                              label={action} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  )}
                </Paper>
              </Slide>
            );
          })}
        </List>
      ) : (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 3, 
            textAlign: 'center', 
            color: 'text.secondary',
            bgcolor: 'background.default'
          }}
        >
          <RefreshIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
          <Typography>No active alerts at this time</Typography>
        </Paper>
      )}
      
      {/* Staff assignment dialog */}
      <Dialog open={showAssignDialog} onClose={() => setShowAssignDialog(false)}>
        <DialogTitle>
          Assign Staff to Alert
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            {activeAlert?.message}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {activeAlert?.details}
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="staff-select-label">Assign staff member</InputLabel>
            <Select
              labelId="staff-select-label"
              value={selectedStaff}
              label="Assign staff member"
              onChange={handleStaffChange}
            >
              {AVAILABLE_STAFF.map((staff) => (
                <MenuItem 
                  key={staff.id} 
                  value={staff.id}
                  disabled={!staff.isAvailable}
                >
                  <Box>
                    <Typography variant="body1">{staff.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {staff.role} {!staff.isAvailable && '(Unavailable)'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            fullWidth
            label="Additional instructions (optional)"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignStaff} 
            variant="contained" 
            color="primary"
            disabled={!selectedStaff}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alert history dialog */}
      <Dialog 
        open={showHistory} 
        onClose={() => setShowHistory(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Alert History
        </DialogTitle>
        <DialogContent dividers>
          {alertHistory.length > 0 ? (
            <List>
              {alertHistory.map((alert) => {
                const severityStyle = getSeverityStyle(alert.severity);
                return (
                  <Paper 
                    key={alert.id} 
                    elevation={1} 
                    sx={{ 
                      mb: 2, 
                      borderLeft: 4, 
                      borderColor: severityStyle.color,
                      opacity: 0.8
                    }}
                  >
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: severityStyle.color }}>
                          {severityStyle.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" component="span">
                              {alert.message}
                            </Typography>
                            <Chip 
                              label={alert.severity} 
                              size="small" 
                              sx={{ 
                                bgcolor: `${severityStyle.color}20`, 
                                color: severityStyle.color,
                                fontWeight: 'medium',
                                fontSize: '0.7rem'
                              }} 
                            />
                            <Chip 
                              label="Resolved" 
                              size="small" 
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }} 
                            />
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ my: 0.5 }}
                            >
                              {alert.details}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Source: {alert.source}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {typeof alert.timestamp === 'string' 
                                  ? alert.timestamp 
                                  : alert.timestamp.toLocaleString()}
                              </Typography>
                            </Box>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <HistoryIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography>No alert history available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity="info" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PriorityAlert; 