import pandas as pd
import numpy as np
import pickle
import os
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

# Load dataset
df = pd.read_csv("dataset/city_day.csv")
df = df.dropna(subset=["AQI", "AQI_Bucket"])

# Separate features and targets
x = df.drop(columns=["AQI", "AQI_Bucket"])
y_reg = df["AQI"]
y_class = df["AQI_Bucket"]

# Split dataset
x_train, x_test, y_reg_train, y_reg_test, y_class_train, y_class_test = train_test_split(
    x, y_reg, y_class, test_size=0.2, random_state=42, stratify=y_class
)

# Extract date features
for data in [x_train, x_test]:
    data["Date"] = pd.to_datetime(data["Date"])
    data["Year"] = data["Date"].dt.year
    data["Month"] = data["Date"].dt.month
    data["Day"] = data["Date"].dt.day

# Encode City
x_train = pd.get_dummies(x_train, columns=["City"], dtype=int)
x_test = pd.get_dummies(x_test, columns=["City"], dtype=int)
x_train, x_test = x_train.align(x_test, join="left", axis=1, fill_value=0)

x_train = x_train.drop(columns=["Date"])
x_test = x_test.drop(columns=["Date"])
feature_names = x_train.columns.tolist()

# Handle missing values
imputer = SimpleImputer(strategy="median")
x_train = imputer.fit_transform(x_train)
x_test = imputer.transform(x_test)

# Scale features
scaler = StandardScaler()
x_train = scaler.fit_transform(x_train)
x_test = scaler.transform(x_test)

# Train models
rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
rf_model.fit(x_train, y_reg_train)

rf_class = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf_class.fit(x_train, y_class_train)

# Regression evaluation
reg_pred = rf_model.predict(x_test)

print("\nREGRESSION PERFORMANCE")
print("MAE:", mean_absolute_error(y_reg_test, reg_pred))
print("MSE:", mean_squared_error(y_reg_test, reg_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_reg_test, reg_pred)))
print("R2 Score:", r2_score(y_reg_test, reg_pred))

# Classification evaluation
class_pred = rf_class.predict(x_test)

print("\nCLASSIFICATION PERFORMANCE")
print("Accuracy:", accuracy_score(y_class_test, class_pred))
print("Precision:", precision_score(y_class_test, class_pred, average="weighted"))
print("Recall:", recall_score(y_class_test, class_pred, average="weighted"))
print("F1 Score:", f1_score(y_class_test, class_pred, average="weighted"))

print("\nCLASSIFICATION REPORT")
print(classification_report(y_class_test, class_pred))

# Confusion matrix heatmap
cm = confusion_matrix(y_class_test, class_pred, labels=rf_class.classes_)

sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=rf_class.classes_, yticklabels=rf_class.classes_)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("AQI Confusion Matrix")
plt.tight_layout()
os.makedirs("models", exist_ok=True)
plt.savefig("models/confusion_matrix.png")
plt.show()

# Save models and preprocessing data
aqi_data = {
    "reg_model": rf_model,
    "class_model": rf_class,
    "feature_names": feature_names,
    "imputer_stats": imputer.statistics_,
    "scaler_mean": scaler.mean_,
    "scaler_scale": scaler.scale_
}

with open("models/aqi_model.pkl", "wb") as file:
    pickle.dump(aqi_data, file)

print("\nAQI models saved successfully!")
