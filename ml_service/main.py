from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import random

app = FastAPI(title="Agri AI ML Microservice")

# Try to load models, handle gracefully if they don't exist yet
crop_model = None
crop_model_path = 'models/crop_engine.pkl'
if os.path.exists(crop_model_path):
    crop_model = joblib.load(crop_model_path)

class SoilTelemetry(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class MarketData(BaseModel):
    crop: str
    historical_prices: list

@app.get("/health")
async def health_check():
    return {"status": "ML Microservice is running", "models_loaded": {"crop_engine": crop_model is not None}}

@app.post("/predict/crop")
async def predict_crop(data: SoilTelemetry):
    if crop_model is None:
        # Fallback to a mock prediction if the model hasn't been trained yet
        crops = ['rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate', 'banana', 'mango', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'cotton', 'jute', 'coffee']
        return {
            "recommended_crop": random.choice(crops),
            "confidence": "Medium (Mock Model)",
            "note": "Train the model using train_crop.py to get actual predictions."
        }
    
    # Prepare input feature array
    features = [[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]]
    
    # Inference
    prediction = crop_model.predict(features)
    
    return {
        "recommended_crop": prediction[0],
        "confidence": "High"
    }

@app.post("/predict/market")
async def predict_market(data: MarketData):
    # This is a mock ARIMA implementation. 
    # In production, use statsmodels.tsa.arima.model.ARIMA or Prophet
    
    if not data.historical_prices:
        raise HTTPException(status_code=400, detail="No historical prices provided")
    
    # Calculate a simple trend based on the mock data
    latest_price = data.historical_prices[-1] if isinstance(data.historical_prices[-1], (int, float)) else 1500
    
    # Generate mock forecast timeline (next 7 days)
    forecast = []
    current_price = float(latest_price)
    trend_factor = random.choice([-1, 1]) * random.uniform(0.01, 0.05) # 1% to 5% daily change
    
    for i in range(1, 8):
        current_price = current_price * (1 + trend_factor)
        forecast.append(round(current_price, 2))
        
    trend = "UP" if trend_factor > 0 else "DOWN"
        
    return {
        "crop": data.crop,
        "trend": trend,
        "forecast_timeline": forecast
    }
