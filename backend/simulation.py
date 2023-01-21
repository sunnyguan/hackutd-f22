import json
import random
from collections import deque, defaultdict
from multiprocessing import Pool
import heapq


def ASSERT_DOUBLE_EQ(a, b):
    assert abs(a - b) < 0.001


def ASSERT_DOUBLE_GEQ(a, b):
    assert a - b > -0.001


NUM_THREADS = 6

# S&P 500, dividends reinvested
STOCKS_HISTORICAL = [(1928, 0.4381), (1929, -0.0830), (1930, -0.2512), (1931, -0.4384), (1932, -0.0864), (1933, 0.4998),
                     (1934, -0.0119), (1935, 0.4674), (1936, 0.3194), (1937, -0.3534), (1938, 0.2928), (1939, -0.0110),
                     (1940, -0.1067), (1941, -0.1277), (1942, 0.1917), (1943, 0.2506), (1944, 0.1903), (1945, 0.3582),
                     (1946, -0.0843), (1947, 0.0520), (1948, 0.0570), (1949, 0.1830), (1950, 0.3081), (1951, 0.2368),
                     (1952, 0.1815), (1953, -0.0121), (1954, 0.5256), (1955, 0.3260), (1956, 0.0744), (1957, -0.1046),
                     (1958, 0.4372), (1959, 0.1206), (1960, 0.0034), (1961, 0.2664), (1962, -0.0881), (1963, 0.2261),
                     (1964, 0.1642), (1965, 0.1240), (1966, -0.0997), (1967, 0.2380), (1968, 0.1081), (1969, -0.0824),
                     (1970, 0.0356), (1971, 0.1422), (1972, 0.1876), (1973, -0.1431), (1974, -0.2590), (1975, 0.3700),
                     (1976, 0.2383), (1977, -0.0698), (1978, 0.0651), (1979, 0.1852), (1980, 0.3174), (1981, -0.0470),
                     (1982, 0.2042), (1983, 0.2234), (1984, 0.0615), (1985, 0.3124), (1986, 0.1849), (1987, 0.0581),
                     (1988, 0.1654), (1989, 0.3148), (1990, -0.0306), (1991, 0.3023), (1992, 0.0749), (1993, 0.0997),
                     (1994, 0.0133), (1995, 0.3720), (1996, 0.2268), (1997, 0.3310), (1998, 0.2834), (1999, 0.2089),
                     (2000, -0.0903), (2001, -0.1185), (2002, -0.2197), (2003, 0.2836), (2004, 0.1074), (2005, 0.0483),
                     (2006, 0.1561), (2007, 0.0548), (2008, -0.3655), (2009, 0.2594), (2010, 0.1482), (2011, 0.0210),
                     (2012, 0.1589), (2013, 0.3215), (2014, 0.1352), (2015, 0.0136), (2016, 0.1196), (2017, 0.2183),
                     (2018, -0.0438), (2019, 0.3149), (2020, 0.1840), (2021, 0.3092), (2022, -0.1811)]

# Bloomberg U.S. Aggregate Bond Index
BONDS_HISTORICAL = [(1976, 0.1560), (1977, 0.0300), (1978, 0.0140), (1979, 0.0190), (1980, 0.0270), (1981, 0.0630),
                    (1982, 0.3260), (1983, 0.0840), (1984, 0.1515), (1985, 0.2211), (1986, 0.1526), (1987, 0.0276),
                    (1988, 0.0789), (1989, 0.1453), (1990, 0.0896), (1991, 0.1600), (1992, 0.0740), (1993, 0.0975),
                    (1994, -0.0292), (1995, 0.1847), (1996, 0.0363), (1997, 0.0965), (1998, 0.0869), (1999, -0.0082),
                    (2000, 0.1163), (2001, 0.0844), (2002, 0.1026), (2003, 0.0410), (2004, 0.0434), (2005, 0.0243),
                    (2006, 0.0433), (2007, 0.0697), (2008, 0.0524), (2009, 0.0593), (2010, 0.0654), (2011, 0.0784),
                    (2012, 0.0421), (2013, -0.0202), (2014, 0.0597), (2015, 0.0055), (2016, 0.0265), (2017, 0.0354),
                    (2018, 0.0001), (2019, 0.0872), (2020, 0.0751), (2021, -0.0154), (2022, -0.1301)]


class Portfolio:
    savings: float
    loans: list[[float, float]]  # (-rate, remaining) heap

    def __init__(self):
        self.savings = 0
        self.loans = []

    def loans_value(self):
        return -sum(x[1] for x in self.loans)

    def net_worth(self):
        return self.savings + self.loans_value()

    def simulate_growth(self, cash_comp, stocks_comp, bonds_comp, stocks_rate, bonds_rate):
        # If savings go negative, in debt -> no "growth". Assume this debt is interest-free
        if self.savings > 0:
            # Break down and adjust growth on each savings category
            cash = cash_comp * self.savings
            stocks = stocks_comp * self.savings * (1 + stocks_rate)
            bonds = bonds_comp * self.savings * (1 + bonds_rate)

            # Re-agg categories
            self.savings = cash + stocks + bonds

        # Grow loan debt for the year
        for loan in self.loans:
            loan_rate, loan_debt = loan
            loan[1] += loan_debt * (-loan_rate)


def simulate_life(stocks_historical, bonds_historical, savings, loans, expenses, _i, num_years, sample=True):
    expenses = deque(sorted(expenses))

    if sample:
        # Draw samples for every year
        stocks_historical = random.choices(stocks_historical, k=num_years)
        bonds_historical = random.choices(bonds_historical, k=num_years)
    else:
        # Keep order as-is, but ensure we have enough data to simulate all the years requested
        assert len(stocks_historical) >= num_years and len(bonds_historical) >= num_years

    def simulate_year(p: Portfolio, yr: int):
        nonlocal savings

        stocks_rate = stocks_historical[year]
        bonds_rate = bonds_historical[year]

        # Make purchases if there is an expense:
        while expenses and (expenses[0][0] - 20) <= yr:  # year "0" is age 20.
            age, immediate, debt, loan_rate = expenses.popleft()
            p.savings -= immediate
            heapq.heappush(p.loans, [-loan_rate, debt])

        # Pay off highest interest loans first
        loan_budget = loans[year]
        while p.loans and loan_budget > 0:
            loan_payment = min(loan_budget, p.loans[0][1])
            loan_budget -= loan_payment
            p.loans[0][1] -= loan_payment
            if p.loans[0][1] <= 0.01:
                heapq.heappop(p.loans)

        # Put remaining loan budget and un-budgeted salary into savings
        p.savings += loan_budget + savings[yr]

        # Adjust bond and stock values (hopefully net growth)
        p.simulate_growth(_i['cash'][yr], _i['stocks'][yr], _i['bonds'][yr], stocks_rate, bonds_rate)

    timeline = []
    # Initialize portfolio
    portfolio = Portfolio()

    # Calculate year-end balances
    for year in range(num_years):
        simulate_year(portfolio, year)
        timeline.append(portfolio.net_worth())

    return timeline


def monte_carlo_sim(investments: dict[str, list[float]], savings: list[float], loans, expenses, start_year, num_sims=3):
    _i = investments  # name is too long
    last_n = 2022 - start_year
    assert 1928 < start_year < 2022
    assert len(set(len(x) for x in (_i['cash'], _i['stocks'], _i['bonds'], savings, loans))) == 1
    num_years = len(_i['cash'])
    for i in range(num_years):
        ASSERT_DOUBLE_EQ(_i['cash'][i] + _i['stocks'][i] + _i['bonds'][i], 1)

    # Build bootstrap banks out of last_n years
    stocks_historical = [x[1] for x in STOCKS_HISTORICAL[-last_n:]]
    bonds_historical = [x[1] for x in BONDS_HISTORICAL[-last_n:]]

    # Simulate in threads
    with Pool(NUM_THREADS) as p:
        jobs = [
            p.apply_async(simulate_life, (stocks_historical, bonds_historical, savings, loans, expenses, _i, num_years))
            for _ in
            range(num_sims)]
        sim_results = []
        for job in jobs:
            timeline = job.get()
            sim_results.append(timeline)

    # Build results and return
    aggregate_results = defaultdict(list)
    for sim_year in zip(*sim_results):
        sim_year = sorted(sim_year)
        aggregate_results['low'].append(sim_year[int(num_sims * 0.05)])
        aggregate_results['mid'].append(sum(sim_year) / len(sim_year))
        aggregate_results['high'].append(sim_year[int(num_sims * 0.95)])

    return {
        'time_series': aggregate_results,
    }


def backtest_sim(investments: dict[str, list[float]], savings: list[float], loans, expenses, start_year: int):
    _i = investments  # name is too long
    assert 1928 < start_year < 2022
    assert len(set(len(x) for x in (_i['cash'], _i['stocks'], _i['bonds'], savings, loans))) == 1
    num_years = min(len(_i['cash']), 2022 - start_year)
    for i in range(num_years):
        ASSERT_DOUBLE_EQ(_i['cash'][i] + _i['stocks'][i] + _i['bonds'][i], 1)

    # Generate time series out of last_n years
    stocks_historical = [x[1] for x in STOCKS_HISTORICAL if start_year <= x[0]]
    bonds_historical = [x[1] for x in BONDS_HISTORICAL if start_year <= x[0]]

    # Do one simulation using real data
    timeline, stocks_rate_sum, bonds_rate_sum = simulate_life(stocks_historical, bonds_historical, savings, loans,
                                                              expenses, _i, num_years, sample=False)

    return {
        'time_series': {
            'net_worth': timeline
        }
    }


if __name__ == '__main__':
    CASH = [0.1] * 40
    STOCKS = [0.6] * 40
    BONDS = [0.3] * 40
    SAVINGS = [5000] * 40
    LOANS = [5000] * 40

    EXPENSES = [(20, 10000, 90000, 0.037), (25, 8000, 22000, 0.044), (32, 80000, 320000, 0.073)]

    # Number of years of history to use for calculations
    START_YEAR = 1957

    monte_carlo_results = monte_carlo_sim({
        'cash': CASH,
        'stocks': STOCKS,
        'bonds': BONDS,
    }, SAVINGS, LOANS, EXPENSES, START_YEAR, num_sims=5000)

    # print(json.dumps(monte_carlo_results, indent=2))

    backtest_results = backtest_sim({
        'cash': CASH,
        'stocks': STOCKS,
        'bonds': BONDS,
    }, SAVINGS, LOANS, EXPENSES, START_YEAR)

    print(json.dumps(backtest_results, indent=2))
