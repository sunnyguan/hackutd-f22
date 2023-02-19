import sys
import traceback

from flask import Flask, request, make_response
from flask_cors import CORS

from multiprocessing import Pool

from simulation import monte_carlo_sim, backtest_sim

app = Flask(__name__)
CORS(app)
computation_pool = Pool(6)

EXPENSES = [(20, 10000, 90000, 0.037), (25, 8000, 22000, 0.044), (32, 80000, 320000, 0.053)]


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
        loans = j['time_series']['loans']
        expenses = j['expenses']
        start_year = j['start_year']
        num_sims = min(10000, max(100, j['num_sims']))

        monte_carlo_results = monte_carlo_sim(investments, savings, loans, expenses, start_year, computation_pool,
                                              num_sims)
    except AssertionError as e:
        _, _, tb = sys.exc_info()
        tb_info = traceback.extract_tb(tb)
        filename, line, func, text = tb_info[-1]
        raise
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
        loans = j['time_series']['loans']
        start_year = j['start_year']

        backtest_results = backtest_sim(investments, savings, loans, EXPENSES, start_year)
    except AssertionError as e:
        _, _, tb = sys.exc_info()
        tb_info = traceback.extract_tb(tb)
        filename, line, func, text = tb_info[-1]
        raise
        return make_response({
            'text': text,
            'loc': f"{filename}:{line}",
            'tb': [f"{filename}:{line} - '{text}'" for filename, line, func, text in tb_info]
        }, 422)

    return make_response(backtest_results, 200)
