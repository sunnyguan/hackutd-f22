export const DEFAULTS = {
  salary: [
    [
      {
        x: 20,
        y: 130000,
      },
      { x: 59, y: 130000 },
      { x: 60, y: 10000 },
      {
        x: 100,
        y: 10000,
      },
    ],
  ],
  investments: [
    [
      {
        x: 20,
        y: 100,
      },
      {
        x: 100,
        y: 100,
      },
    ],
    [
      { x: 20, y: 75 },
      { x: 100, y: 75 },
    ],
    [
      { x: 20, y: 25 },
      { x: 100, y: 25 },
    ],
  ],
  budgets: [
    [
      { x: 20, y: 60000 },
      { x: 100, y: 60000 },
    ],
    [
      { x: 20, y: 40000 },
      { x: 100, y: 40000 },
    ],
    [
      { x: 20, y: 30000 },
      { x: 100, y: 30000 },
    ],
    [
      { x: 20, y: 20000 },
      { x: 100, y: 20000 },
    ],
  ],
  "y-label-width": 80,
};

export const POINT_PROPS = {
  pointHitRadius: 10,
  pointRadius: 5,
  pointHoverRadius: 10,
  fill: true,
  showLine: true,
};

export const SCALE_PROPS = {
  min: 0,
  display: false,
  ticks: {
    color: "white",
  },
};

export function getOrDefault(name) {
  return JSON.parse(localStorage.getItem(name)) || DEFAULTS[name];
}
