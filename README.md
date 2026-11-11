# AQI Prediction Platform

A Machine Learning-based web application that predicts the Air Quality Index (AQI) and its corresponding air quality category using pollutant measurements, city, and date.

**Live Application:** https://aqiprediction-six.vercel.app

**Backend API:** https://aqi-prediction-41332437350.asia-south1.run.app

---

## 1. Project Overview

The AQI Prediction Platform uses Machine Learning to estimate air pollution levels.

Users can enter:
- City
- Date
- PM2.5 and PM10
- NO, NO2, NOx and NH3
- CO, SO2 and O3
- Benzene, Toluene and Xylene

The application produces two predictions:

1. **AQI Prediction (Regression):** Estimates the numerical AQI value.
2. **AQI Category Prediction (Classification):** Predicts the corresponding air quality category.

## 2. Technologies Used

| Component | Technology |
|---|---|
| Programming Language | Python |
| Machine Learning | Scikit-learn |
| ML Algorithms | Random Forest |
| Data Processing | Pandas, NumPy |
| Backend | Flask |
| Frontend | React |
| Frontend Build Tool | Vite |
| Styling | CSS |
| Containerization | Docker |
| Container Registry | Docker Hub |
| Backend Deployment | Google Cloud Run |
| Frontend Deployment | Vercel |
| Version Control | Git and GitHub |

## 3. Machine Learning Implementation

### Dataset

The project uses the `city_day.csv` dataset containing historical air quality measurements.

- Original records: 29,531
- Records after removing missing target values: 24,850
- Original features: 16 columns

### Data Preprocessing

The following preprocessing techniques are implemented:

- Handling missing values.
- Removing records with missing target values.
- Extracting Year, Month and Day from the Date column.
- One-hot encoding of City.
- Median imputation.
- Feature standardization using StandardScaler.
- Splitting data into training and testing sets.

**Train-Test Split:**
- Training: 80%
- Testing: 20%
- Random State: 42
- Stratification used for classification.

The imputer and scaler are fitted using training data only.

### Machine Learning Algorithms

Two separate Random Forest models are trained.

**1. Random Forest Regressor**

Predicts the numerical AQI value.

Target variable: `AQI`

**2. Random Forest Classifier**

Predicts the AQI category.

Target variable: `AQI_Bucket`

Both models use:

- n_estimators = 100
- random_state = 42
- n_jobs = -1

### Model Evaluation

**Regression Results**

| Metric | Result |
|---|---:|
| MAE | 19.90 |
| MSE | 1524.83 |
| RMSE | 39.05 |
| R² Score | 0.9212 |

**Classification Results**

| Metric | Result |
|---|---:|
| Accuracy | 81.61% |
| Weighted Precision | 81.50% |
| Weighted Recall | 81.61% |
| Weighted F1 Score | 81.43% |

### Saved Model

The trained models and preprocessing information are saved using Python Pickle.

File: `models/aqi_model.pkl`

The artifact contains:
- Regression model
- Classification model
- Feature names
- Imputer statistics
- Scaler mean and scale

The model artifact is excluded from GitHub because of its approximately 232 MB size. It is included in the Docker image used for backend deployment.

## 4. Application Architecture

The application follows a frontend-backend architecture.

```text
             USER
               |
               v
       React Frontend
          (Vercel)
               |
          HTTP POST
               |
               v
        Flask Backend
       (Google Cloud Run)
               |
               v
      Data Preprocessing
               |
          +----+----+
          |         |
          v         v
      Random     Random
      Forest     Forest
     Regressor  Classifier
          |         |
          v         v
       AQI Value  AQI Category
          |         |
          +----+----+
               |
               v
         JSON Response
               |
               v
       React Frontend
               |
               v
         Display Results
```

## 5. Backend API

The backend is developed using Flask.

### API Endpoints

**GET /**

Checks whether the backend is running.

**POST /predict**

Accepts pollutant measurements and returns both predictions.

Example request:

```json
{
  "City": "Delhi",
  "Date": "2016-01-09",
  "PM2.5": 123,
  "PM10": 135,
  "NO": 14,
  "NO2": 54,
  "NOx": 35,
  "NH3": 25,
  "CO": 63,
  "SO2": 87,
  "O3": 90,
  "Benzene": 68,
  "Toluene": 53,
  "Xylene": 75
}
```

Example response:

```json
{
  "aqi_category": "Severe",
  "predicted_aqi": 732.65
}
```

Flask-CORS is enabled to allow communication between the separately hosted frontend and backend.

## 6. Deployment

The project is deployed using Docker, Docker Hub, Google Cloud Run and Vercel.

### Backend Deployment

1. Flask application containerized using Docker.
2. Docker image built and uploaded to Docker Hub.
3. Docker image deployed to Google Cloud Run.
4. Backend API made publicly accessible.

**Docker Hub:** https://hub.docker.com/r/peacekeeper91/aqi-prediction

**Google Cloud Run:** https://aqi-prediction-41332437350.asia-south1.run.app

### Frontend Deployment

1. React application built using Vite.
2. GitHub repository connected to Vercel.
3. Production API URL configured through an environment variable.
4. Frontend deployed on Vercel.

**Live Website:** https://aqiprediction-six.vercel.app

## 7. Project Structure

```text
AQI_ML/
│
├── dataset/
│   └── city_day.csv
│
├── models/
│   ├── aqi_model.pkl
│   └── confusion_matrix.png
│
├── notebooks/
│   └── AQI_Model.ipynb
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── app.py
├── aqi_model.py
├── Dockerfile
├── requirements.txt
├── .dockerignore
├── .gitignore
└── README.md
```

## 8. Running the Project Locally

### Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

### Backend

Create and activate the Python environment, then install dependencies:

```bash
pip install -r requirements.txt
```

Ensure the trained model artifact is available at:

```text
models/aqi_model.pkl
```

Start the Flask application:

```bash
python app.py
```

The backend normally runs at:

`http://127.0.0.1:5000`

For local frontend development, configure the API URL to use the local Flask server.

## 9. Future Improvements

Potential improvements include:

- Integration of real-time air quality data.
- Historical AQI trend visualization.
- Interactive pollution analysis dashboards.
- Improved model experimentation and optimization.
- Additional prediction and monitoring features.

## 10. Author

**Project:** AQI Prediction Platform

**GitHub:** https://github.com/peacekeeper777/AQI_ML

**Live Application:** https://aqiprediction-six.vercel.app

---

*This project demonstrates the integration of Machine Learning, full-stack web development, containerization, and cloud deployment in a practical application.*
