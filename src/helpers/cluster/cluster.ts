/* eslint-disable @typescript-eslint/no-var-requires */
import env from 'constant/env'
import { chunk } from 'lodash'

const cluster = require('cluster')

function Cluster(urls: string[]) {
  // const responses = []

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
}

export { Cluster }
