export const DEFAULTS = {
  salary: [
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
  "investments-0": [
    {
      x: 20,
      y: 100,
    },
    {
      x: 100,
      y: 100,
    },
  ],
  "investments-1": [
    { x: 20, y: 75 },
    { x: 100, y: 75 },
  ],
  "investments-2": [
    { x: 20, y: 25 },
    { x: 100, y: 25 },
  ],
  "budget-0": [
    { x: 20, y: 60000 },
    { x: 100, y: 60000 },
  ],
  "budget-1": [
    { x: 20, y: 40000 },
    { x: 100, y: 40000 },
  ],
  "budget-2": [
    { x: 20, y: 30000 },
    { x: 100, y: 30000 },
  ],
  "budget-3": [
    { x: 20, y: 20000 },
    { x: 100, y: 20000 },
  ],
  "y-label-width": 80,
};

export function getOrDefault(name) {
  return JSON.parse(localStorage.getItem(name)) || DEFAULTS[name];
}
