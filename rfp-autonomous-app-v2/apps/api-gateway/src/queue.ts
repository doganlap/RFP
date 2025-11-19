import { Queue, Worker, Job } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const rfpQueue = new Queue('rfp_pipeline', { connection });

export function registerWorker(processor: (job: Job) => Promise<void>) {
  return new Worker('rfp_pipeline', processor, { connection });
}
