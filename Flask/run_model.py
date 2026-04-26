from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# ✅ load once (VERY IMPORTANT)
model = joblib.load("model/mlp.pkl")
scaler = joblib.load("model/scaler.pkl")
clusters = pd.read_csv("data/cluster_with_distance copy.csv")

# keep cluster names separately
cluster_names = clusters['Cluster_Name']
cluster_features = clusters.drop(columns=['Cluster_Name'])


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # ✅ extract user input
        user = {
            'Likes_Beach': data['Likes_Beach'],
            'Likes_Mountain': data['Likes_Mountain'],
            'Likes_Culture': data['Likes_Culture'],
            'Likes_Adventure': data['Likes_Adventure'],
            'Budget': data['Budget'],
            'Total_Days': data['Total_Days']
        }

        rows = []

        # ✅ build input for each cluster
        for i in range(len(cluster_features)):
            row = user.copy()

            for col in cluster_features.columns:
                row[col] = cluster_features.iloc[i][col]

            rows.append(row)

        df = pd.DataFrame(rows)

        # ✅ ensure column order matches training
        df = df[scaler.feature_names_in_]

        # ✅ scale
        scaled = scaler.transform(df)

        # ✅ predict
        scores = model.predict(scaled)

        # ✅ attach names
        results = []
        for i in range(len(scores)):
            results.append({
                "cluster": cluster_names.iloc[i],
                "score": float(scores[i])
            })

        # ✅ sort
        results = sorted(results, key=lambda x: x['score'], reverse=True)

        return jsonify({"clusters": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)