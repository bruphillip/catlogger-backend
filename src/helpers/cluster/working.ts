/* eslint-disable @typescript-eslint/no-var-requires */
import { Queue } from 'helpers/queue'
import { Worker } from './worker'
const process = require('process')

async function working() {
  const log = `PID: ${process.pid}`
  console.log(`${log} worker initialized`)
  const queue = new Queue(Worker)
  process.on('message', async ({ chunk }) => {
    console.log(`${log} starting process chunk`)
    const returnChunk = []
    chunk.map((payload) =>
      queue.instance.push(payload, (_, result) => returnChunk.push(result)),
    )

    await queue.instance.drain()
    console.log(`${log} chunk drained`)
    console.log(`${log} sending chunk back to Master: ${returnChunk}`)

    process.send({ chunk: returnChunk })
  })
}
working()
