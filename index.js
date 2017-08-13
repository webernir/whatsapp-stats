const fs = require('fs')
const path = require('path')
const util = require('util')
const _ = require('lodash')
const uuid = require('uuid/v4')

async function run() {
  const read = util.promisify(fs.readFile)
  const write = util.promisify(fs.writeFile)
  const txt = await read(path.resolve('./data/chat.20170810.txt'), 'utf8')
  let lines = txt.split('\r\n')

  let filtered = lines
    .filter(line => !line.includes('group'))
    .filter(line => !line.includes('removed'))
    .filter(line => !line.includes('left'))
    .filter(line => !line.includes('added'))
    .filter(line => !line.includes('changed'))
    .filter(line => !line.includes('joined'))
    .filter(line => line.includes(':', line.indexOf(':') + 1))
    .filter(line => line.substring(0, 5).includes('/'))

  let items = filtered.map((line, index) => ({
    time: line.substring(0, line.indexOf(' - ')),
    member: line.substring(line.indexOf('- ') + 2, line.indexOf(':', line.indexOf('- '))),
    index,
    line
  }))

  let grouped = _.groupBy(items, 'member')

  let result = Object.keys(grouped).map(gr => ({ member: gr, count: grouped[gr].length })).sort((a, b) => b.count - a.count)

  let output = result.map(item => `${item.member},${item.count}\r\n`)

  await write(`./output/result.${uuid()}.csv`, output, 'utf8')
}

run()