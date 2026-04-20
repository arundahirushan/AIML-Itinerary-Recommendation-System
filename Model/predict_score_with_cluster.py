import pandas as pd
import joblib
import os

# ========================== Load Model, Scaler & Cluster Data ==========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = joblib.load(os.path.join(BASE_DIR, 'mlp.pkl'))
    scaler = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))
    cluster_df = pd.read_csv(os.path.join(BASE_DIR, 'cluster_with_distance.csv'))
except FileNotFoundError as e:
    print(f"File not found: {e}")
    print("Make sure mlp.pkl, scaler.pkl, and cluster_with_distance.csv are inside the Model folder.")
    exit()

print("Model, Scaler, and Cluster data loaded successfully!\n")

# Normalize cluster names for safer matching
cluster_df['Cluster_Name'] = cluster_df['Cluster_Name'].astype(str).str.strip().str.lower()

# Feature columns (MUST match training order)
feature_columns = [
    'Likes_Beach', 'Likes_Mountain', 'Likes_Culture', 'Likes_Adventure',
    'Budget', 'Total_Days',
    'Adventure', 'Architecture', 'Beach', 'Birding', 'Culture',
    'Hiking', 'History', 'Museum', 'Nature', 'Park', 'Relax',
    'Religious', 'Safari', 'Shopping', 'Viewpoint',
    'Num_Places', 'Avg_Distance'
]

# ========================== Input Helper ==========================
def get_valid_int(prompt, valid_values=None):
    while True:
        try:
            value = int(input(prompt))
            if valid_values and value not in valid_values:
                print(f"Please enter one of {valid_values}")
                continue
            return value
        except ValueError:
            print("Invalid input. Please enter a number.")

# ========================== Prediction Function ==========================
def predict_score():
    print("\nEnter your preferences:\n")

    try:
        likes_beach = get_valid_int("Likes_Beach (0 or 1): ", [0, 1])
        likes_mountain = get_valid_int("Likes_Mountain (0 or 1): ", [0, 1])
        likes_culture = get_valid_int("Likes_Culture (0 or 1): ", [0, 1])
        likes_adventure = get_valid_int("Likes_Adventure (0 or 1): ", [0, 1])
        budget = get_valid_int("Budget (1=Low, 2=Medium, 3=High): ", [1, 2, 3])
        total_days = get_valid_int("Total_Days: ")

        # Show clusters
        print("\nAvailable Clusters:")
        print([name.title() for name in cluster_df['Cluster_Name'].unique()])

        # Mandatory cluster selection
        while True:
            cluster_name = input("\nEnter Cluster_Name: ").strip().lower()
            if cluster_name in cluster_df['Cluster_Name'].values:
                break
            else:
                print("Invalid Cluster_Name. Please choose from the list above.")

        # Get cluster row
        row = cluster_df[cluster_df['Cluster_Name'] == cluster_name].iloc[0]

        # Build input
        input_dict = {
            'Likes_Beach': likes_beach,
            'Likes_Mountain': likes_mountain,
            'Likes_Culture': likes_culture,
            'Likes_Adventure': likes_adventure,
            'Budget': budget,
            'Total_Days': total_days,
            'Adventure': row['Adventure'],
            'Architecture': row['Architecture'],
            'Beach': row['Beach'],
            'Birding': row['Birding'],
            'Culture': row['Culture'],
            'Hiking': row['Hiking'],
            'History': row['History'],
            'Museum': row['Museum'],
            'Nature': row['Nature'],
            'Park': row['Park'],
            'Relax': row['Relax'],
            'Religious': row['Religious'],
            'Safari': row['Safari'],
            'Shopping': row['Shopping'],
            'Viewpoint': row['Viewpoint'],
            'Num_Places': row['Num_Places'],
            'Avg_Distance': row['Avg_Distance']
        }

        print(f"\nUsing cluster: {cluster_name.title()}")

        # Convert to DataFrame
        df_input = pd.DataFrame([input_dict])

        # Ensure column order
        df_input = df_input[feature_columns]

        # Scale
        X_scaled = scaler.transform(df_input)

        # Predict
        score = model.predict(X_scaled)[0]

        print("\n" + "=" * 50)
        print(f"Predicted Score: {float(score):.2f} / 100")
        print("=" * 50)

    except Exception as e:
        print(f"\nError occurred: {e}")

# ========================== Run Loop ==========================
if __name__ == "__main__":
    while True:
        predict_score()
        again = input("\nPredict again? (y/n): ").strip().lower()
        if again != 'y':
            print("Goodbye!")
            break