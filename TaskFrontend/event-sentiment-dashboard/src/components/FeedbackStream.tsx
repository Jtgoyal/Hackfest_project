import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Divider, 
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import ChatIcon from '@mui/icons-material/Chat';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import RateReviewIcon from '@mui/icons-material/RateReview';

// Define feedback item type
interface FeedbackItem {
  id: number;
  text: string;
  source: 'twitter' | 'instagram' | 'in-app' | 'qa' | 'review';
  userName: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  userAvatar?: string;
}

const FeedbackStream: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const listRef = useRef<HTMLUListElement>(null);

  // Initial mock data
  const initialFeedback: FeedbackItem[] = [
    {
      id: 1,
      text: "The keynote speaker was amazing! Great insights on AI in events.",
      source: 'twitter',
      userName: '@eventgoer1',
      timestamp: '2 mins ago',
      sentiment: 'positive'
    },
    {
      id: 2,
      text: "Audio in Hall B keeps cutting out. Please fix this ASAP!",
      source: 'in-app',
      userName: 'Alex M.',
      timestamp: '3 mins ago',
      sentiment: 'negative'
    },
    {
      id: 3,
      text: "Workshop registration process was smooth, but the line for coffee is too long.",
      source: 'review',
      userName: 'Jamie L.',
      timestamp: '5 mins ago',
      sentiment: 'neutral'
    },
    {
      id: 4,
      text: "When does the networking session start? The schedule says 2pm but the app says 2:30pm.",
      source: 'qa',
      userName: 'Conference Attendee',
      timestamp: '6 mins ago',
      sentiment: 'neutral'
    },
    {
      id: 5,
      text: "Loving the event vibes! #TechConference2023 #Amazing",
      source: 'instagram',
      userName: '@techfan22',
      timestamp: '8 mins ago',
      sentiment: 'positive'
    },
    {
      id: 6,
      text: "The registration queue is taking forever! Been waiting for 25 minutes already.",
      source: 'twitter',
      userName: '@impatientuser',
      timestamp: '10 mins ago',
      sentiment: 'negative'
    }
  ];

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
      setFeedback(initialFeedback);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Simulate new feedback coming in regularly
  useEffect(() => {
    if (loading) return;

    const newFeedbackMessages = [
      {
        text: "Main stage presentation is fantastic! Learning so much.",
        source: 'in-app' as const,
        userName: 'Taylor W.',
        sentiment: 'positive' as const
      },
      {
        text: "There's a huge line at the food truck area. Need more options!",
        source: 'twitter' as const,
        userName: '@foodlover99',
        sentiment: 'negative' as const
      },
      {
        text: "Session on 'Future of Event Tech' was decent. Expected more demos though.",
        source: 'review' as const,
        userName: 'Jordan K.',
        sentiment: 'neutral' as const
      },
      {
        text: "Will the panel discussion slides be available after the event?",
        source: 'qa' as const,
        userName: 'Conference Attendee',
        sentiment: 'neutral' as const
      },
      {
        text: "Awesome event setup and decorations! #EventDesign",
        source: 'instagram' as const,
        userName: '@designfreak',
        sentiment: 'positive' as const
      },
      {
        text: "The WiFi keeps dropping in the east wing. Can someone fix it?",
        source: 'in-app' as const,
        userName: 'Chris T.',
        sentiment: 'negative' as const
      }
    ];
    
    const interval = setInterval(() => {
      // Add a new random feedback item every few seconds
      const randomIndex = Math.floor(Math.random() * newFeedbackMessages.length);
      const newItem = newFeedbackMessages[randomIndex];
      
      const newFeedbackItem: FeedbackItem = {
        id: Date.now(),
        text: newItem.text,
        source: newItem.source,
        userName: newItem.userName,
        timestamp: 'just now',
        sentiment: newItem.sentiment
      };
      
      setFeedback((prevFeedback: FeedbackItem[]) => {
        // Update timestamps for existing items
        const updatedFeedback = prevFeedback.map((item: FeedbackItem) => {
          if (item.timestamp === 'just now') {
            return { ...item, timestamp: '1 min ago' };
          } else if (item.timestamp === '1 min ago') {
            return { ...item, timestamp: '2 mins ago' };
          } else {
            // Extract the number from timestamps like "X mins ago"
            const match = item.timestamp.match(/^(\d+)/);
            if (match) {
              const mins = parseInt(match[1], 10);
              return { ...item, timestamp: `${mins + 1} mins ago` };
            }
            return item;
          }
        });
        
        // Add new item at the top
        return [newFeedbackItem, ...updatedFeedback.slice(0, 19)]; // Keep only the last 20 items
      });
      
      // Scroll to top when new item arrives
      if (listRef.current) {
        listRef.current.scrollTop = 0;
      }
    }, 8000); // Add new feedback every 8 seconds
    
    return () => clearInterval(interval);
  }, [loading]);

  // Handle filter change
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter feedback items based on selected filter and search query
  const filteredFeedback = feedback.filter((item: FeedbackItem) => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'positive' && item.sentiment === 'positive') ||
                         (filter === 'neutral' && item.sentiment === 'neutral') ||
                         (filter === 'negative' && item.sentiment === 'negative') ||
                         (filter === item.source);
    
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'twitter':
        return <TwitterIcon fontSize="small" color="primary" />;
      case 'instagram':
        return <InstagramIcon fontSize="small" sx={{ color: '#C13584' }} />;
      case 'in-app':
        return <ChatIcon fontSize="small" color="secondary" />;
      case 'qa':
        return <QuestionAnswerIcon fontSize="small" color="info" />;
      case 'review':
        return <RateReviewIcon fontSize="small" color="action" />;
      default:
        return null;
    }
  };

  // Get sentiment chip
  const getSentimentChip = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Chip label="Positive" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'medium' }} />;
      case 'neutral':
        return <Chip label="Neutral" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57c00', fontWeight: 'medium' }} />;
      case 'negative':
        return <Chip label="Negative" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 'medium' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading feedback stream...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Live Feedback Stream</Typography>
        <IconButton size="small">
          <FilterListIcon />
        </IconButton>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
        <TextField
          placeholder="Search feedback..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={filter}
            onChange={handleFilterChange}
            displayEmpty
          >
            <MenuItem value="all">All Sources</MenuItem>
            <MenuItem value="twitter">Twitter</MenuItem>
            <MenuItem value="instagram">Instagram</MenuItem>
            <MenuItem value="in-app">In-App Chat</MenuItem>
            <MenuItem value="qa">Q&A</MenuItem>
            <MenuItem value="review">Reviews</MenuItem>
            <Divider />
            <MenuItem value="positive">Positive</MenuItem>
            <MenuItem value="neutral">Neutral</MenuItem>
            <MenuItem value="negative">Negative</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List sx={{ height: 'calc(100% - 130px)', overflow: 'auto' }} ref={listRef}>
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((item: FeedbackItem, index: number) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start">
                <Box sx={{ pr: 2, pt: 1 }}>
                  <Avatar 
                    alt={item.userName} 
                    src={item.userAvatar}
                    sx={{ bgcolor: item.source === 'twitter' ? '#1da1f2' : 
                                  item.source === 'instagram' ? '#C13584' : 
                                  item.source === 'in-app' ? '#9c27b0' : 
                                  item.source === 'qa' ? '#2196f3' : '#757575' }}
                  >
                    {getSourceIcon(item.source)}
                  </Avatar>
                </Box>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" component="span">
                        {item.userName}
                      </Typography>
                      {getSentimentChip(item.sentiment)}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.primary" sx={{ my: 1 }}>
                        {item.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.timestamp}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < filteredFeedback.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))
        ) : (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography variant="body2" color="text.secondary">
              No feedback matches your filters
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default FeedbackStream; 