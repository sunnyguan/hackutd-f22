# Financial Planner

Financial planning made easy.  

Made for HackUTD IX.  

## Inspiration

Financial planning is often neglected by college students; tools like Mint are not customizable enough for life's uncertainties. There is no flexibility to plan for salary growth, investment strategy changes, or budget adjustments. Spreadsheets are powerful and customizable, but they are too cumbersome for the general population.

Building smart financial habits is crucial for college students. Our project makes it easier for college students to plan and view their financial trajectory, in their transition into working adulthood.

## What it does

Our project provides an easy-to-use and highly customizable net worth projection model, with digest-able risk metrics. Based on users' salary, budget, and portfolio distribution, we create an all-in-one net worth chart that visualizes the user's future financial trajectory and helps them with their retirement goals. Users can adjust their portfolio distribution using a simple draggable graph, and they can also adjust their budget levels including rent, food, transportation, and also loans. All of these factors are taken into account for the main chart.

## How we built it

We use NextJS with React and ChartJS on the front-end, and we used Flask server for the backend. We deployed using Vercel and our backend is on AWS. The backend server uses Monte Carlo simulations as well as backtesting via historical data to provide a comprehensive prediction of the future.

### Monte Carlo simulations

Monte Carlo simulations provide an easy way to model the uncertainty of the future. Markets shift and interest rates change. We run thousands of simulations of market simulations to give the user a picture of what their future looks like, with 90% two-sided percentile-method confidence intervals mean projections. Each year is simulated by taking characteristics from real years in history as far back as 1928, to allow the user to have a good indication of their portfolio’s risk and reward.

### Backtesting

Users can also backtest their financial plans based on actual data, giving them a single net worth trajectory. This enables users to put themselves in real-life events, such as recessions, and see how well their plan holds up.

## Challenges we ran into

There were a lot of challenges with ChartJS since we wanted to present users with an intuitive UI. These challenges include making stacked adjustable charts and interpolating new points on click events.

On the backend, the Monte Carlo simulation had to be optimized for low latency performance even when running many iterations over a large dataset. This was partially solved by parallelizing the simulation into multiple threads, for increased performance on HPC (high-performance compute) VMs provided by GCP.

## Accomplishments that we're proud of

The visualization is very intuitive, and user can fine-tune their inputs to a much higher degree than services like Mint or PersonalCapital.

## What's next for Financial Planner

We want this project to be as accessible and easy to use as possible. So, the next step is to develop this to fit onto smartphones. This will require a complete redesign of visualizations and interactions, but it will bring us one step closer to reaching every student that needs to plan their finances.
