import sys
import traceback

from flask import Flask, request, make_response
from flask_cors import CORS

from simulation import monte_carlo_sim, backtest_sim

app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def root_():
    return make_response({
        'message': "Online!",
    }, 200)


@app.route('/compute-monte-carlo', methods=['POST'])
def compute_monte_carlo():
    try:
        j = request.get_json()
        investments = {
            'cash': j['time_series']['cash'],
            'stocks': j['time_series']['stocks'],
            'bonds': j['time_series']['bonds'],
        }
        savings = j['time_series']['savings']
        start_year = j['start_year']
        num_sims = min(10000, max(100, j['num_sims']))

        monte_carlo_results = monte_carlo_sim(investments, savings, start_year, num_sims)
    except AssertionError as e:
        _, _, tb = sys.exc_info()
        tb_info = traceback.extract_tb(tb)
        filename, line, func, text = tb_info[-1]
        return make_response({
            'text': text,
            'loc': f"{filename}:{line}",
            'tb': [f"{filename}:{line} - '{text}'" for filename, line, func, text in tb_info]
        }, 422)

    return make_response(monte_carlo_results, 200)


@app.route('/compute-backtest', methods=['POST'])
def compute_backtest_():
    try:
        j = request.get_json()
        investments = {
            'cash': j['time_series']['cash'],
            'stocks': j['time_series']['stocks'],
            'bonds': j['time_series']['bonds'],
        }
        savings = j['time_series']['savings']
        start_year = j['start_year']

        backtest_results = backtest_sim(investments, savings, start_year)
    except AssertionError as e:
        _, _, tb = sys.exc_info()
        tb_info = traceback.extract_tb(tb)
        filename, line, func, text = tb_info[-1]
        return make_response({
            'text': text,
            'loc': f"{filename}:{line}",
            'tb': [f"{filename}:{line} - '{text}'" for filename, line, func, text in tb_info]
        }, 422)

    return make_response(backtest_results, 200)
