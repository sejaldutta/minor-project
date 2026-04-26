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

@app.get("/health")
def health():
    return {"status": "ok"}
# ✅ Prediction API
@app.post("/predict")
def predict(data: dict):
    try:
        features = np.array([[ 
            float(data.get("temperature", 0)),
            float(data.get("volume_fraction", 0)),
            float(data.get("density_np1", 0)),
            float(data.get("density_np2", 0)),
            float(data.get("density_bf", 0)),
            float(data.get("volume", 0))
        ]])

        prediction = model.predict(features)

        return {
            "prediction": float(prediction[0]),
            "status": "success"
        }

    except Exception as e:
        print(f"Backend Error: {e}")
        return {"error": str(e), "status": "failed"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=10000)
