const fs = require('fs')
const path = require('path')
const util = require('util')
const _ = require('lodash')
const argv = require('yargs').argv
const moment = require('moment')

const read = util.promisify(fs.readFile)
const write = util.promisify(fs.writeFile)

function getCountByUser(lines) {

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

  return output
}

function getPath() {
  const input = argv.input
  if (!input)
    throw Error('use --input to pass the file path')

  const result = path.resolve(input)

  if (!fs.existsSync(result))
    throw Error(`file does not exists **** ${result}`)
  return result
}

async function getLines(inputPath) {
  const txt = await read(inputPath, 'utf8')
  const lines = txt.split('\r\n')
  return lines
}

function getFileName(key) {
  return `./output/${key}.${moment().format('YYYYMMDD.HHmm')}.csv`
}

async function writeToFile(data, key) {
  const filename = getFileName(key)
  await write(filename, data, 'utf8')
  console.log("Done. see file at: \r\n", filename);
}

async function run() {
  const lines = await getLines(getPath())
  const countByUser = getCountByUser(lines)
  await writeToFile(countByUser, 'countByUser')
}

run()