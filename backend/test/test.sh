#!/bin/bash

curl -X POST -H "Content-Type: application/json" 'http://127.0.0.1:5000/compute-returns' -d '@test_data.json'