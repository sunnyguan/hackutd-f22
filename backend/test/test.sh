#!/bin/bash

curl -X POST -H "Content-Type: application/json" 'http://127.0.0.1:5000/compute-monte-carlo' -d '@test_data.json'
curl -X POST -H "Content-Type: application/json" 'http://127.0.0.1:5000/compute-backtest' -d '@test_data.json'
