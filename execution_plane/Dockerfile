# AOPTool Execution Plane Dockerfile
# Attack orchestration and tool execution

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Docker client
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    docker.io \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Note: Running as root is necessary for Docker-in-Docker access
# Security is managed through Docker socket permissions and network isolation

EXPOSE 5001

CMD ["python", "main.py"]
