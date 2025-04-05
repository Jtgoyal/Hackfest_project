# Event Sentiment Dashboard

A React-based dashboard for monitoring event sentiment and managing priority alerts in real-time.

## Features

- **Real-time Sentiment Gauge**: Visualizes current event sentiment (positive/neutral/negative)
- **Trending Issues Table**: Identifies and prioritizes issues requiring attention
- **Live Feedback Stream**: Shows feedback from various sources with sentiment analysis
- **Alert History Panel**: Tracks alert history and resolution status
- **Metrics Overview Cards**: Displays key performance indicators and event statistics

## Priority Alert Component

The Priority Alert component provides real-time monitoring and management of escalating issues during events. It includes the following features:

### Key Features

- **Color-coded Severity Levels**: Visual differentiation between Critical, High, Medium, and Low priority alerts
- **Quick Action Buttons**: 
  - Mark Resolved: Close and archive alerts
  - Assign Staff: Delegate alerts to available staff members
  - Ignore: Dismiss non-relevant alerts
- **Real-time Updates**: WebSocket connection for live alert generation and updates
- **Alert History**: Track resolved alerts and response patterns
- **Push Notifications**: Browser notifications for critical alerts via Service Workers
- **Staff Assignment**: Assign alerts to team members with role-based filtering
- **Recommended Actions**: Suggested next steps for each alert type

### Technical Implementation

- **WebSockets**: Real-time bidirectional communication for immediate alerts
- **Local State**: Alert history stored in component state with persistence capabilities
- **Service Workers**: Background processing for push notifications even when app is in background
- **Responsive Design**: Mobile-friendly alert management interface
- **Animations**: Smooth transitions for new alerts and status changes

### Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Enable notifications when prompted by the browser for the full experience

### Push Notification Support

The component uses the Web Push API and Service Workers to enable notifications even when the app is in the background or closed. The notification system:

- Requests permission from users before sending notifications
- Shows actionable notifications with "View" and "Dismiss" buttons
- Opens the relevant alert when clicked
- Works offline thanks to service worker caching

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Future Enhancements

- Integration with external notification systems (SMS, Email)
- Mobile app push notifications via Firebase Cloud Messaging
- Customizable alert templates
- Audio alerts for critical notifications
- Analytics for response times and resolution patterns

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/event-sentiment-dashboard.git
cd event-sentiment-dashboard
```

2. Install dependencies
```
npm install
```

3. Run the application
```
npm start
```

The application will run on [http://localhost:3000](http://localhost:3000)

## Project Structure

```
event-sentiment-dashboard/
  ├── public/              # Public assets
  ├── src/                 # Source files
  │   ├── components/      # React components
  │   │   ├── AlertHistory.tsx
  │   │   ├── FeedbackStream.tsx
  │   │   ├── MetricsOverview.tsx
  │   │   ├── SentimentGauge.tsx
  │   │   └── TrendingIssues.tsx
  │   ├── App.tsx          # Main App component
  │   └── index.tsx        # Application entry point
  └── package.json         # Dependencies and scripts
```

## Technologies Used

- React
- TypeScript
- Material-UI
- Chart.js

## Demo Data

This dashboard currently uses simulated data that updates automatically to demonstrate functionality. In a production environment, you would integrate with:

- Social media APIs (Twitter, Instagram, LinkedIn)
- Chat and Q&A platforms
- Feedback collection systems
- Custom sentiment analysis services

## Responsive Design

The dashboard is fully responsive and adapts to different screen sizes:
- Desktop: Full multi-column layout
- Tablet: Reorganized grid for medium screens
- Mobile: Single column layout with scrollable panels 