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
  'wss://nostr.bostonbtc.com',
  'wss://nostr-relay.texashedge.xyz',
  'wss://nostr.radixrat.com'
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
    limit: 200
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

  // I am not sure about this part
  await sleep(10 * events.length)
  relay.close()
  log(info(`connection to ${relay.url} closed`))
})

await relayFromPool.close(fromRelays)