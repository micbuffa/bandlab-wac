import { audioCtx } from './sampler.js';


const worker = new Worker('./ticker.js');
const callbacks = [];

export const SCHEDULE_AHEAD = 1;

export function onTick(fn) {
  callbacks.push(fn);
}

let lastScheduleTime = audioCtx.currentTime;

worker.addEventListener('message', function() {
  const currentTime = audioCtx.currentTime;

  if (lastScheduleTime > currentTime + SCHEDULE_AHEAD) {
    return;
  }

  for (let i = 0; i < callbacks.length; i++) {
    callbacks[i]();
  }

  lastScheduleTime = currentTime + SCHEDULE_AHEAD;
});
