import async, { QueueObject } from 'async'
import env from 'constant/env'

export class QueueCluster {
  instance: QueueObject<any>

  constructor(private worker: any) {
    const asyncWorker = async.asyncify(worker)
    this.instance = async.queue(asyncWorker, env.CPUS_NODES)
  }
}
