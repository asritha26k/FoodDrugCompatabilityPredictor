FROM python:3.11-slim-bullseye

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install system dependencies (minimal, --no-install-recommends to reduce image size)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    gnupg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libxext6 \
    libxrender1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheel to avoid build issues
RUN python -m pip install --upgrade pip setuptools wheel

# Copy requirements first for better layer caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the application (includes main.py and any .joblib files)
COPY . /app

# Expose port
EXPOSE 8000

# Simple healthcheck to verify the app is responding on the configured port
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD bash -c 'nc -z localhost ${PORT:-8000} || exit 1'

# Run the application using the PORT provided by Render (falls back to 8000)
CMD ["bash", "-lc", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
