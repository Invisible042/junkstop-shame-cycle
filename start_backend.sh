#!/bin/bash
cd /home/runner/workspace
export PYTHONPATH=/home/runner/workspace
python -m uvicorn apps.backend.main:app --host 0.0.0.0 --port 8000