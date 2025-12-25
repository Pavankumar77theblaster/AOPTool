# AOPTool Reporting Plane Dockerfile
# Report generation service with PDF support

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for WeasyPrint and PDF generation
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create reports directory
RUN mkdir -p /app/reports

# Create non-root user
RUN useradd -m -u 1000 aoptool && chown -R aoptool:aoptool /app

USER aoptool

# Expose port
EXPOSE 6000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:6000/health')"

# Run application
CMD ["python", "main.py"]
