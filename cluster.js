import cluster from 'node:cluster'
import { cpus } from 'node:os'
import process from 'node:process'
import crypto from 'crypto'
import axios from 'axios'

const numCPUs = cpus().length

const listOfRequests = [
  crypto.randomUUID(),
  crypto.randomUUID(),
  crypto.randomUUID(),
  crypto.randomUUID(),
  crypto.randomUUID(),
]

async function main(nodes) {
  if (cluster.isMaster) {
    console.log(`Primary ${process.pid} is running`)
    console.log(`numCPUs`)
    // Fork workers.

    console.log(JSON.stringify(cluster.settings))
    for (let i = 0; i < nodes.length; i++) {
      const worker = cluster.fork()
      setTimeout(() => {
        worker.send({ node: nodes[i] })
      }, 500)

      worker.on('message', (workerMsg) => {
        console.log(`node response ${workerMsg.node}`)
      })
    }

    cluster.on('exit', (worker) => {
      console.log(`worker ${worker.process.pid} died`)
    })

    // return new Promise((resolve) => {
    //   resolve()
    // })
  } else {
    console.log(`Worker ${process.pid} started`)
    process.on('message', ({ node }) => {
      console.log(`processing pid: ${process.pid} node: ${node}`)
      // const response = await axios.get(`http://localhost:8080/${node}`)
      console.log(`request made using ${node}`)
      process.send({
        node,
        // response,
      })

      process.exit()
    })
  }
}

main(listOfRequests)
// .then((result) => {
//   console.log(result)
// })
