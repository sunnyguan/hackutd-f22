import json
import random
from collections import deque, defaultdict
from multiprocessing import Pool

NUM_THREADS = 6

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
                     (2012, 0.1589), (2013, 0.3215), (2014, 0.1352), (2015, 0.0138), (2016, 0.1177), (2017, 0.2161),
                     (2018, -0.0423), (2019, 0.3121), (2020, 0.1802), (2021, 0.2847)]

BONDS_HISTORICAL = [(1927, 0.0317), (1928, 0.0345), (1929, 0.0336), (1930, 0.0322), (1931, 0.0393), (1932, 0.0335),
                    (1933, 0.0353), (1934, 0.0301), (1935, 0.0284), (1936, 0.0259), (1937, 0.0273), (1938, 0.0256),
                    (1939, 0.0235), (1940, 0.0201), (1941, 0.0247), (1942, 0.0249), (1943, 0.0249), (1944, 0.0248),
                    (1945, 0.0233), (1946, 0.0224), (1947, 0.0239), (1948, 0.0244), (1949, 0.0219), (1950, 0.0239),
                    (1951, 0.0270), (1952, 0.0275), (1953, 0.0259), (1954, 0.0251), (1955, 0.0296), (1956, 0.0359),
                    (1957, 0.0321), (1958, 0.0386), (1959, 0.0469), (1960, 0.0384), (1961, 0.0406), (1962, 0.0386),
                    (1963, 0.0413), (1964, 0.0418), (1965, 0.0462), (1966, 0.0484), (1967, 0.0570), (1968, 0.0603),
                    (1969, 0.0765), (1970, 0.0639), (1971, 0.0593), (1972, 0.0636), (1973, 0.0674), (1974, 0.0743),
                    (1975, 0.0800), (1976, 0.0687), (1977, 0.0769), (1978, 0.0901), (1979, 0.1039), (1980, 0.1284),
                    (1981, 0.1372), (1982, 0.1054), (1983, 0.1183), (1984, 0.1150), (1985, 0.0926), (1986, 0.0711),
                    (1987, 0.0899), (1988, 0.0911), (1989, 0.0784), (1990, 0.0808), (1991, 0.0709), (1992, 0.0677),
                    (1993, 0.0577), (1994, 0.0781), (1995, 0.0571), (1996, 0.0630), (1997, 0.0581), (1998, 0.0465),
                    (1999, 0.0644), (2000, 0.0511), (2001, 0.0505), (2002, 0.0382), (2003, 0.0425), (2004, 0.0422),
                    (2005, 0.0439), (2006, 0.0470), (2007, 0.0402), (2008, 0.0221), (2009, 0.0384), (2010, 0.0329),
                    (2011, 0.0188), (2012, 0.0176), (2013, 0.0304), (2014, 0.0217), (2015, 0.0227), (2016, 0.0245),
                    (2017, 0.0241), (2018, 0.0269), (2019, 0.0192), (2020, 0.0093), (2021, 0.0151)]


class Portfolio:
    cash: float
    stocks: float
    bonds: deque[(float, float)]  # (rate, holdings)

    def __init__(self):
        self.cash = 0
        self.stocks = 0
        self.bonds = deque(maxlen=10)  # 10-year bonds, must re-buy

    def bonds_value(self):
        return sum(x[1] for x in self.bonds)

    def value(self):
        return self.cash + self.stocks + self.bonds_value()

    def balance(self, cash_comp, stocks_comp, bonds_comp, bonds_rate):
        # Determine target amounts
        total_value = self.value()
        assert total_value >= 0
        cash_target = cash_comp * total_value
        stocks_target = stocks_comp * total_value
        bonds_target = bonds_comp * total_value

        # Buy/sell stocks to hit target
        self.cash -= stocks_target - self.stocks
        self.stocks = stocks_target

        # Buy/sell bonds to hit target
        bonds_value = self.bonds_value()

        # Sell oldest bonds
        while bonds_value > bonds_target and self.bonds:
            _, oldest_bond_value = self.bonds.popleft()
            bonds_value -= oldest_bond_value
            self.cash += oldest_bond_value

        # Buy bonds @ current rate (even 0 in bonds)
        assert bonds_target >= bonds_value
        bonds_diff = bonds_target - bonds_value
        self.bonds.append((bonds_rate, bonds_diff))
        self.cash -= bonds_diff

        # The remaining cash should be what we expect it to be
        assert abs(self.cash / cash_target - 1) < 0.01

    def simulate_growth(self, stocks_rate):
        self.stocks *= (1 + stocks_rate)
        for _ in range(len(self.bonds)):
            bond_rate, bond_value = self.bonds.popleft()
            self.bonds.append((bond_rate, bond_value * (1 + bond_rate)))


def simulate_life(stocks_historical, bonds_historical, savings, _i, num_years):
    stocks_rate_sum = 0
    bonds_rate_sum = 0

    def simulate_year(p: Portfolio, yr: int):
        nonlocal stocks_rate_sum, bonds_rate_sum

        # Set rates for next year
        stocks_rate = random.choice(stocks_historical)
        bonds_rate = random.choice(bonds_historical)

        stocks_rate_sum += stocks_rate
        bonds_rate_sum += bonds_rate

        # Sell bonds if expired (sell before re-balancing)
        if len(p.bonds) == p.bonds.maxlen:
            _, bond_value = p.bonds.popleft()
            p.cash += bond_value

        # Add savings to cash (could be negative if expenses > income)
        p.cash += savings[yr]

        # Re-balance to new composition
        p.balance(_i['cash'][yr], _i['stocks'][yr], _i['bonds'][yr], bonds_rate)

        # Adjust bond and stock values (hopefully net growth)
        p.simulate_growth(stocks_rate)

    timeline = []
    # Initialize portfolio
    portfolio = Portfolio()

    # Calculate year-end balances
    for year in range(num_years):
        simulate_year(portfolio, year)
        timeline.append(portfolio.value())

    return timeline, stocks_rate_sum, bonds_rate_sum


def monte_carlo_sim(investments: dict[str, list[float]], savings: list[float], start_year, num_sims=3):
    _i = investments  # name is too long
    last_n = 2022 - start_year
    assert 0 < last_n < 90
    assert len(set(len(x) for x in (_i['cash'], _i['stocks'], _i['bonds'], savings))) == 1
    num_years = len(_i['cash'])
    assert all(_i['cash'][i] + _i['stocks'][i] + _i['bonds'][i] == 1 for i in range(num_years))

    # Build bootstrap banks out of last_n years
    stocks_historical = [x[1] for x in STOCKS_HISTORICAL[-last_n:]]
    bonds_historical = [x[1] for x in BONDS_HISTORICAL[-last_n:]]

    # Collect stats across all simulations on what rates get drawn
    stocks_rate_sum = 0
    bonds_rate_sum = 0

    # Simulate in threads
    with Pool(NUM_THREADS) as p:
        jobs = [p.apply_async(simulate_life, (stocks_historical, bonds_historical, savings, _i, num_years)) for _ in
                range(num_sims)]
        sim_results = []
        for job in jobs:
            timeline, stocks_rate_sub_sum, bonds_rate_sub_sum = job.get()
            sim_results.append(timeline)
            stocks_rate_sum += stocks_rate_sub_sum
            bonds_rate_sum += bonds_rate_sub_sum

    # Build results and return
    aggregate_results = defaultdict(list)
    for sim_year in zip(*sim_results):
        sim_year = sorted(sim_year)
        aggregate_results['low'].append(sim_year[int(num_sims * 0.05)])
        aggregate_results['mid'].append(sum(sim_year) / len(sim_year))
        aggregate_results['high'].append(sim_year[int(num_sims * 0.95)])

    return {
        'time_series': aggregate_results,
        'avg_stocks_yoy': stocks_rate_sum / num_sims / num_years,
        'avg_bonds_yoy': bonds_rate_sum / num_sims / num_years,
    }


def backtest_sim(cash: list[float], stocks: list[float], bonds: list[float], savings: list[float], start_year=None):
    # default to earliest year we have data for
    pass


if __name__ == '__main__':
    CASH = [0.1] * 40
    STOCKS = [0.6] * 40
    BONDS = [0.3] * 40
    SAVINGS = [5000] * 40

    # Number of years of history to use for calculations
    LAST_N = 65

    monte_carlo_results = monte_carlo_sim({
        'cash': CASH,
        'stocks': STOCKS,
        'bonds': BONDS,
    }, SAVINGS, LAST_N, num_sims=5000)

    print(json.dumps(monte_carlo_results, indent=2))
