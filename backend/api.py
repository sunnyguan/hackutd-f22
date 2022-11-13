from flask import Flask, request, make_response
from flask_cors import CORS

from simulation import monte_carlo_sim

app = Flask(__name__)
CORS(app)


@app.route('/', methods=['GET'])
def root_():
    return make_response({
        'message': "Online!",
    }, 200)


@app.route('/compute-returns', methods=['POST'])
def compute_returns_():
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

    return make_response(monte_carlo_results, 200)
