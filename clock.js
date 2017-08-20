import { audioCtx } from './sampler.js';

const SCHEDULE_AHEAD = 1;
const worker = new Worker('./ticker.js');

let lastScheduleTime = audioCtx.currentTime;

worker.addEventListener('message', schedule);

function schedule() {
  const currentTime = audioCtx.currentTime;

  if (lastScheduleTime > currentTime + SCHEDULE_AHEAD) {
    return;
  }

  // Schedule some audio events occuring over the next second...
  // lastScheduleTime must increase as events are scheduled
}
