import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from final import get_sentiment_data, get_emotion_data, get_cluster_data

st.set_page_config(layout="wide", page_title="NLP Dashboard")

st.title("🧠 NLP Analysis Dashboard")

# Load and cache data from your final.py logic
@st.cache_data
def load_data():
    sentiment_df = get_sentiment_data()
    emotion_df = get_emotion_data()
    cluster_info, cluster_df = get_cluster_data()
    return sentiment_df, emotion_df, cluster_info, cluster_df

sentiment_df, emotion_df, cluster_info, cluster_df = load_data()

# --- Sentiment Pie Chart ---
st.subheader("📊 Sentiment Analysis")
sentiment_counts = sentiment_df['Sentiment'].value_counts()

fig1, ax1 = plt.subplots()
ax1.pie(sentiment_counts, labels=sentiment_counts.index, autopct='%1.1f%%', startangle=90, colors=['#00cc96', '#ff6361', '#ffa600'])
ax1.axis('equal')
st.pyplot(fig1)

# --- Emotion Heatmap ---
st.subheader("🔥 Emotion Detection Heatmap")
pivot = emotion_df.pivot_table(index="TextID", columns="Emotion", values="Score", fill_value=0)
fig2, ax2 = plt.subplots(figsize=(12, 6))
sns.heatmap(pivot, cmap="YlGnBu", ax=ax2)
st.pyplot(fig2)

# --- Densest Cluster Alert ---
st.subheader("🧠 Densest Cluster Info")
densest_cluster_id = cluster_info['densest_cluster']
num_points = cluster_info['num_points']
st.markdown(f"**Densest Cluster:** {densest_cluster_id} with **{num_points}** points.")

with st.expander("Show Cluster Sample Data"):
    st.dataframe(cluster_df[cluster_df['Cluster'] == densest_cluster_id])
