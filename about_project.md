
---

🧾 AI-Based Travel Itinerary Planning & Vehicle Booking System — Full Project Description

📌 Project Overview  
This project aims to develop a smart travel planning system for Sri Lanka that automatically generates optimized travel itineraries and recommends suitable vehicles based on user requirements.

The system integrates:
- destination recommendation  
- itinerary planning  
- route optimization  
- vehicle selection  

into a single intelligent platform.

---

🎯 Core Objective  

The main goal is to build an **AI-powered cluster ranking system** that can recommend the most suitable travel regions based on user preferences, and then generate a complete itinerary using rule-based logic.

---

🧠 AI vs Non-AI Responsibilities  

✅ AI Components:
- Cluster scoring (main ML model)
- Personalized recommendation based on user preferences
- Ranking travel regions

❌ Non-AI Components:
- Clustering (K-Means, pre-processing step)
- Itinerary generation (rule-based)
- Route optimization (greedy / nearest neighbor)
- Vehicle recommendation (rule-based)

👉 Important: AI is only used where learning is meaningful (ranking), not forced into every part.

---

📊 Dataset Structure  

The system uses **3 main datasets**:

---

1️⃣ Places Dataset (730+ rows)

Purpose:
- Store all tourist locations
- Used for itinerary generation and distance calculations

Structure:
- Place_ID  
- Place_Name  
- Category  
- Latitude / Longitude  
- Time_Needed (H)  
- Rating  
- real_distance (from Katunayake Airport)  
- Cluster_Name  

Notes:
- Each place belongs to a cluster  
- Distance is precomputed using APIs  

---

2️⃣ Cluster Dataset (ML Input Dataset)

Purpose:
- Represents each travel region as a feature vector  
- Used directly by the AI model  

Structure:
- Cluster_Name  
- Category distributions (Adventure, Beach, Culture, Hiking, History, Nature, etc.)  
- Num_Places (normalized)  
- Avg_Distance (normalized)  

Key Idea:
Each cluster represents a **type of travel experience**, not just a location.

Example:
- A cluster might be 40% Beach + 30% Nature → suitable for mixed travelers  

---

3️⃣ Training Dataset (Synthetic — To Be Generated)

Purpose:
- Train the MLP model  

Structure:
- User features:
  - Likes_Beach (0/1)  
  - Likes_Mountain (0/1)  
  - Likes_Culture (0/1)  
  - Likes_Adventure (0/1)  
  - Budget (1–3)  
  - Total_Days (1–7)  

- Cluster features (from dataset 2)

- Target:
  - Score (0–100)

Important:
This dataset is **synthetically generated using a scoring function**, not manually labeled.

---

🧠 AI Model Design  

Model:
- MLP Regressor

Input:
- User preferences  
- Cluster features  

Output:
- Score (0–100) representing suitability of a cluster  

Purpose:
- Rank clusters based on user needs  

---

⚙️ System Workflow  

1. User Input:
   - Preferences (beach, mountain, etc.)
   - Budget
   - Trip duration

2. AI Processing:
   - Model scores all clusters
   - Clusters ranked by score

3. Selection:
   - Top clusters selected based on number of days

4. Itinerary Generation:
   - Select places within clusters
   - Organize day-wise plan
   - Optimize route

5. Vehicle Recommendation:
   - Based on distance and group size (rule-based)

---

🧩 Key Design Decisions  

✅ What We Consider:
- User preferences (strong influence)  
- Distance from starting point (Katunayake Airport)  
- Budget vs distance  
- Trip duration vs distance  

❌ What We Do NOT Consider:
- Terrain complexity (removed to simplify model)  
- Group size in AI (handled outside ML)  
- Real cost data (approximated using distance)  

---

🧠 Scoring Logic (Concept)

The model learns from a simulated scoring function:

Score =
- Preference Match (major influence)
- Distance vs Trip Duration
- Budget vs Distance
- Small randomness (to improve generalization)

---

⚠️ Important Constraints  

- No real labeled data → synthetic data must be realistic  
- Avoid hard rules → use weighted scoring  
- Keep model simple but meaningful  
- Ensure features are normalized  

---

🚀 Future Enhancements  

- Add real user feedback for retraining  
- Include hotel recommendations  
- Add real cost estimation  
- Improve route optimization using advanced algorithms  
- Use reinforcement learning for itinerary improvement  

---

✅ Final Insight  

This system is designed as a **hybrid intelligent system**:

- AI handles *decision-making (ranking)*  
- Algorithms handle *execution (planning & routing)*  

This makes the system:
- scalable  
- explainable  
- practical for real-world use  

---
:::

---

