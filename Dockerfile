FROM python:3.10-slim

# Install system dependencies for XGBoost/LightGBM
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set Matplotlib config directory to a writable path
ENV MPLCONFIGDIR=/tmp/matplotlib

# Copy Python dependencies file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI backend and frontend static files
COPY main.py .
COPY frontend ./frontend

# Expose FastAPI port
EXPOSE 8000

# Optional: environment variables
ENV PYTHONUNBUFFERED=1

# Command to run the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
