import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

def train_crop_model(dataset_path='crop_recommendation.csv'):
    # Check if dataset exists
    if not os.path.exists(dataset_path):
        print(f"Dataset {dataset_path} not found. Please download it from Kaggle.")
        print("Mocking a basic model for now...")
        
        # Create a mock dataset for testing purposes if the Kaggle dataset is not present
        data = {
            'N': [90, 85, 60, 74, 78],
            'P': [42, 58, 55, 35, 42],
            'K': [43, 41, 44, 40, 42],
            'temperature': [20.8, 21.7, 23.0, 26.4, 20.1],
            'humidity': [82.0, 80.3, 82.3, 80.1, 81.6],
            'ph': [6.5, 7.0, 7.8, 6.9, 7.6],
            'rainfall': [202.9, 226.6, 263.9, 242.8, 262.7],
            'label': ['rice', 'rice', 'rice', 'rice', 'rice']
        }
        df = pd.DataFrame(data)
    else:
        df = pd.read_csv(dataset_path)
    
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. Train Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    # 3. Evaluate & Save Model
    if len(X_test) > 0:
        accuracy = rf_model.score(X_test, y_test)
        print(f"Model trained with accuracy: {accuracy * 100:.2f}%")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    joblib.dump(rf_model, 'models/crop_engine.pkl')
    print("Model saved to models/crop_engine.pkl")

if __name__ == "__main__":
    train_crop_model()
