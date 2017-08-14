const fs = require('fs')
const path = require('path')
const util = require('util')
const argv = require('yargs').argv
const moment = require('moment')

const read = util.promisify(fs.readFile)
const write = util.promisify(fs.writeFile)

const stats = require('./stats')

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
  const countByUser = stats.getCountByUser(lines)
  await writeToFile(countByUser, 'countByUser')
}

run()