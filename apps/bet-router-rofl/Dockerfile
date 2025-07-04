# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
# Using --no-cache-dir reduces the image size
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY main.py .
COPY client.py .

# The entrypoint is the main script.
# Arguments like --marketplace-id and --market-id will be passed at runtime.
# Example: docker run <image_name> --marketplace-id 2 --market-id 123
ENTRYPOINT ["python", "main.py"] 