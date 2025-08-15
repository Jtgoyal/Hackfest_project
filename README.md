# 🚀 AI-Powered Event Sentinel: Real-Time Sentiment Analysis

A submission for **Hack</Fest '25** (Problem Statement 6). This project provides a real-time, AI-powered solution for monitoring attendee sentiment and detecting issues during live events.

---

## 🎯 The Problem

Event organizers frequently struggle to gauge attendee sentiment in real-time. Traditional methods like post-event surveys and manual social media monitoring are too slow to address problems as they arise. Critical issues—such as long queues, poor audio quality, overcrowding, or speaker dissatisfaction—often go unnoticed until after the event, leading to a negative experience and missed opportunities for immediate intervention.

The challenge lies in efficiently aggregating and analyzing feedback from numerous sources like social media, in-app chats, and live Q&A sessions. A manual approach is not only inefficient but also prone to inaccuracies.

## ✨ Our Solution: Event Sentinel

We are building an AI-driven system that empowers event organizers to detect and respond to concerns as they happen, ensuring a seamless and positive event experience.

Our platform will:
*   **Aggregate** feedback from multiple channels in real-time.
*   **Analyze** the sentiment and content of the feedback using advanced AI models.
*   **Alert** organizers to pressing issues and negative sentiment trends instantly.
*   **Provide** a clear and actionable dashboard for quick decision-making.

---

## 🌟 Key Features

*   **📈 Real-Time Sentiment Dashboard:** A central dashboard visualizing overall event sentiment, key topics of discussion, and sentiment trends over time.
*   **📡 Multichannel Integration:** Connects with APIs from major social media platforms, messaging apps, and event management tools to pull in a constant stream of feedback.
*   **🚨 Smart Alert System:** Uses Natural Language Processing (NLP) to identify urgent issues (e.g., "sound is terrible," "huge line for entry") and sends immediate notifications to event staff.
*   **💡 Actionable Insights:** Generates post-event reports highlighting successes and areas for improvement, backed by data-driven insights.

## 🛠️ Technology Stack

This is the proposed technology stack for our project:

*   **Frontend:** React.js, Tailwind CSS, Recharts (for data visualization)
*   **Backend:** Python (FastAPI), Uvicorn
*   **AI/ML:** Hugging Face Transformers (for sentiment analysis), Scikit-learn, NLTK
*   **Database:** PostgreSQL (for structured data), Redis (for caching and real-time tasks)
*   **Deployment:** Docker, Nginx, AWS/Google Cloud

---

## ⚙️ Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

*   Python 3.9+ and Pip
*   Node.js and npm/yarn
*   Git

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Laaksh1205/Hackfest_project.git
    cd Hackfest_project
    ```

2.  **Set up the Backend:**
    ```sh
    cd backend
    pip install -r requirements.txt
    # Add your API keys to a .env file
    cp .env.example .env
    ```

3.  **Set up the Frontend:**
    ```sh
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```sh
    # From the /backend directory
    uvicorn main:app --reload
    ```

2.  **Start the Frontend Development Server:**
    ```sh
    # From the /frontend directory
    npm start
    ```

3.  Open your browser and visit `http://localhost:3000`.

---

## 🤝 How to Contribute

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 🧑‍💻 Team

*   [Laaksh Parikh/Teammate 1]
*   [Ashmit Banerjee/Teammate 2]
*   [Chirag Chattani/Teammate 3]
*   [Hemant Singh/Teammate 4]
*   [Jatin Goyal/Teammate 5]
---
