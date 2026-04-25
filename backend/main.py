from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import joblib
import uvicorn
app = FastAPI()
origins = [
    "https://minor-project-frontend-three.vercel.app",
    "http://localhost:3000", # Keep this for local testing
]

# ✅ Enable CORS (VERY IMPORTANT for Vercel frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load your trained ML model
model = joblib.load("model.pkl")

@app.get("/")
def home():
    return {"message": "Nanofluid API running"}

# ✅ Prediction API
@app.post("/predict")
def predict(data: dict):
    try:
        # Expected input from frontend
        temp = data["temperature"]
        phi = data["volume_fraction"]
        rho1 = data["density_np1"]
        rho2 = data["density_np2"]
        rho_bf = data["density_bf"]
        volume = data["volume"]

        # Convert to model input format
        features = np.array([[temp, phi, rho1, rho2, rho_bf, volume]])

        prediction = model.predict(features)

        return {
            "prediction": float(prediction[0]),
            "status": "success"
        }

    except Exception as e:
        return {"error": str(e)}
