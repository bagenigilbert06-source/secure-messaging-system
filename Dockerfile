FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed to build psycopg2 and other packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       gcc \
       libpq-dev \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements first to leverage docker layer caching
COPY backend/requirements.txt /app/requirements.txt

RUN pip install --upgrade pip setuptools wheel \
    && pip install -r /app/requirements.txt

# Copy repository
COPY . /app

WORKDIR /app/backend

EXPOSE 5000

CMD ["python", "app.py"]
