#!/bin/bash
cd apps/backend
export PYTHONPATH=$PWD:$PWD/../..
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload