/* eslint-disable @typescript-eslint/no-var-requires */
import env from 'constant/env'
// import { Queue } from 'helpers/queue'
import { chunk } from 'lodash'

// import { Worker } from './worker'

const process = require('process')
const cluster = require('cluster')

type WorkerMessageProps = { chunk: string[] }

function Cluster(urls: string[]) {
  const responses = []

  console.log(`starting Cluster`)

  if (cluster.isMaster) {
    const maxPerCluster = Math.floor(urls.length / env.CPUS_NODES)

    console.log(`maxPerCluster: ${maxPerCluster}`)

    const urlChunked = chunk(urls, maxPerCluster)
    cluster.setupMaster({
      ...cluster.settings,
      exec: `${__dirname}/working.js`,
      silent: false,
    })

    for (let i = 0; i < env.CPUS_NODES; i++) {
      const worker = cluster.fork()
      setTimeout(() => {
        worker.send({ chunk: urlChunked[i] })
      }, 500)

      worker.on('message', ({ chunk }) => {
        console.log(`Master received message ${chunk}`)
      })
    }
  }

  // if (cluster.isWorker) {
  //   const log = `PID: ${process.pid}`
  //   console.log(`${log} worker initialized`)
  //   const queue = new Queue(Worker)
  //   process.on('message', async ({ chunk }: WorkerMessageProps) => {
  //     console.log(`${log} starting process chunk`)
  //     const returnChunk = []
  //     chunk.map((payload) =>
  //       queue.instance.push(payload, (_, result) => returnChunk.push(result)),
  //     )

  //     await queue.instance.drain()
  //     console.log(`${log} chunk drained`)
  //     console.log(`${log} sending chunk back to Master: ${returnChunk}`)

  //     process.send({ chunk: returnChunk })
  //   })
  // }
}

export { Cluster }
