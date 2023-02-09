import 'websocket-polyfill'

import chalk from 'chalk'
import pkg from 'nostr-tools'
const { SimplePool, relayInit } = pkg

import { getTimeDiff, sleep } from './utils.js'

// config log
const log = console.log;
const error = chalk.red;
const success = chalk.green;
const info = chalk.yellow;
const warn = chalk.bgYellow;

// config broadcast
const evKinds = [0,1,3,6,7,10002]
const mins = 10
const interval = 1500      

const fromRelays = [
  'wss://relay.damus.io',
  'wss://relay.snort.social',
  'wss://nostr.oxtr.dev',
  'wss://nos.lol',
  'wss://relay.current.fyi',
  'wss://nostr.bitcoiner.social'
]

const toRelays = [
  'wss://no-str.org',
  'wss://nostr.bongbong.com',
]

// init pools
const relayFromPool = new SimplePool()
const relayToPool = new SimplePool()

// get events
const current = Date.now()/1000
let events = await relayFromPool.list(fromRelays, [
  {
    kinds: evKinds,
    since: Math.round(current - (60 * mins)),
    limit: 100
  }
])

await sleep(interval)
log(info(`Received ${events.length} events.`))

// send events
log(success(`Start broadcasting...`))

/* TODO: pool.pub hasn't been implemented on fiatjaf side */
toRelays.forEach(async relayUrl => {

  const relay = await relayToPool.ensureRelay(relayUrl)

  relay.on('connect', () => {
    log(success(`connected to ${relay.url}`))
  })

  events.forEach(event => {
    let pub = relay.publish(event)
    //log(event)

    pub.on('ok', () => {
      log(success(`${relay.url} has accepted our event`))
    })
    pub.on('failed', reason => {
      log(error(`failed to publish to ${relay.url}: ${reason}`))
    })
  })

  await sleep(interval)
  relay.close()
})

await relayFromPool.close(fromRelays)