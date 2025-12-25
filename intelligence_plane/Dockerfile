# AOPTool Intelligence Plane Dockerfile
# AI-driven reasoning and attack planning

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m -u 1000 aoptool && chown -R aoptool:aoptool /app
USER aoptool

EXPOSE 5000

CMD ["python", "main.py"]
