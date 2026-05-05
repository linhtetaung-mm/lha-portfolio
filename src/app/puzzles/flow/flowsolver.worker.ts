import { VisualFlowSolver } from './FlowSolverEngine';

self.onmessage = (e: MessageEvent) => {
  const { size, grid } = e.data;
  
  // We pass a callback to the engine to report progress every 5000 steps
  const engine = new VisualFlowSolver(size, grid, (steps) => {
    self.postMessage({ type: 'progress', steps });
  });

  const startTime = performance.now();
  const solution = engine.solve();
  const duration = performance.now() - startTime;

  self.postMessage({ type: 'result', solution });

//   self.postMessage({ type: 'result', solution, duration });
};