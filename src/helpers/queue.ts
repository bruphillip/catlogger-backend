import async, { QueueObject } from 'async'

const PARALLEL = 5

export class Queue {
  instance: QueueObject<any>

  constructor(private worker: any) {
    const asyncWorker = async.asyncify(worker)
    this.instance = async.queue(asyncWorker, PARALLEL)
  }
}
