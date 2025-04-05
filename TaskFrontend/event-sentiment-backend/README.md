# Event Sentiment Dashboard Backend

A Node.js service with Express and PostgreSQL that provides APIs and real-time WebSocket communication for the Event Sentiment Dashboard.

## Features

- RESTful API endpoints for feedback, live chats, and external API data
- Real-time updates via WebSocket
- PostgreSQL database for data persistence
- CRUD operations for all data types

## Database Schema

The database consists of three main tables:

1. **attendee_feedback** - Stores feedback from event attendees
   - `id` - UUID primary key
   - `source` - Source of the feedback (twitter, instagram, in-app, etc.)
   - `sentiment` - Classification of sentiment (positive, neutral, negative)
   - `message` - The actual feedback text
   - `timestamp` - When the feedback was submitted

2. **live_chats** - Stores chat messages from event sessions
   - `id` - UUID primary key
   - `user_id` - User identifier
   - `session_id` - Session/room identifier
   - `message` - Chat message content
   - `sentiment_score` - Numerical score of sentiment (-1.0 to 1.0)
   - `timestamp` - When the message was sent

3. **api_data** - Stores raw data from external APIs
   - `id` - UUID primary key
   - `platform` - Source platform name
   - `raw_data` - JSONB field containing the raw data
   - `processed_flag` - Whether the data has been processed
   - `retrieved_at` - When the data was retrieved

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd event-sentiment-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example`:
   ```
   PORT=3001
   NODE_ENV=development
   PGHOST=localhost
   PGUSER=postgres
   PGDATABASE=event_sentiment
   PGPASSWORD=postgres
   PGPORT=5432
   WS_PORT=3002
   LOG_LEVEL=info
   ```

4. Create the PostgreSQL database:
   ```
   createdb event_sentiment
   ```

5. Run database migrations:
   ```
   npm run migrate
   ```

## Usage

Start the development server:
```
npm run dev
```

Start the production server:
```
npm start
```

## API Endpoints

### Attendee Feedback

- `GET /api/feedback` - Get all feedback with optional filtering
- `GET /api/feedback/:id` - Get specific feedback by ID
- `POST /api/feedback` - Create new feedback
- `PUT /api/feedback/:id` - Update existing feedback
- `DELETE /api/feedback/:id` - Delete feedback
- `GET /api/feedback/analytics/distribution` - Get sentiment distribution by time period

### Live Chats

- `GET /api/chats` - Get all chat messages with optional filtering
- `GET /api/chats/:id` - Get specific chat by ID
- `GET /api/chats/session/:sessionId` - Get all chats from a session
- `POST /api/chats` - Create new chat message
- `PUT /api/chats/:id` - Update existing chat
- `DELETE /api/chats/:id` - Delete chat message
- `GET /api/chats/analytics/by-session` - Get sentiment data grouped by session
- `GET /api/chats/analytics/trend` - Get sentiment trend over time

### API Data

- `GET /api/data` - Get all API data with optional filtering
- `GET /api/data/:id` - Get specific API data by ID
- `GET /api/data/unprocessed/list` - Get unprocessed API data
- `POST /api/data` - Create new API data record
- `POST /api/data/batch` - Create multiple API data records
- `PUT /api/data/:id` - Update API data
- `PUT /api/data/:id/processed` - Mark API data as processed
- `DELETE /api/data/:id` - Delete API data
- `GET /api/data/analytics/platform-stats` - Get statistics by platform

## WebSocket API

Connect to the WebSocket server at `ws://localhost:3001/ws`

### Client to Server Messages

- **Ping**
  ```json
  { "type": "ping" }
  ```

- **Subscribe to Channels**
  ```json
  { 
    "type": "subscribe", 
    "channels": ["alerts", "feedback", "chats"] 
  }
  ```

- **Unsubscribe from Channels**
  ```json
  { 
    "type": "unsubscribe", 
    "channels": ["alerts"] 
  }
  ```

### Server to Client Messages

- **Connection Confirmation**
  ```json
  {
    "type": "connection",
    "status": "connected",
    "clientId": "12345678",
    "message": "Connected to Event Sentiment WebSocket server"
  }
  ```

- **Broadcast Message**
  ```json
  {
    "type": "broadcast",
    "channel": "alerts",
    "data": { ... },
    "timestamp": 1617293932123
  }
  ```

## Running in Production

For production deployment, it's recommended to:

1. Set `NODE_ENV=production` in the .env file
2. Use a process manager like PM2
3. Set up proper database credentials and security

## License

MIT 