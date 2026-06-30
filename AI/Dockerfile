# syntax=docker/dockerfile:1.7
FROM python:3.10-slim

WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết cho OpenCV, psycopg2 và compile
RUN apt-get update --allow-releaseinfo-change && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt dependencies của Python
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copy mã nguồn
COPY . .

EXPOSE 8000

# Chạy server FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
