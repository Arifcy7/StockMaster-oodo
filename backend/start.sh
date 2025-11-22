#!/bin/bash
# Start script for the Flask backend

# Activate virtual environment
source venv/bin/activate

# Export environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Start the Flask server
python app.py