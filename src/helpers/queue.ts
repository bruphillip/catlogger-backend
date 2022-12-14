import async, { QueueObject } from 'async'
import env from 'constant/env'

export class Queue {
  instance: QueueObject<any>

  constructor(worker: any) {
    const asyncWorker = async.asyncify(worker)
    this.instance = async.queue(asyncWorker, env.PARALLEL_QUEUE)
  }
}
