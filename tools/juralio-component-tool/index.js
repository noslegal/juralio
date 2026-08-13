#!/usr/bin/env node
const yargs = require('yargs')
const {
  buildComponent,
  buildTableComponent,
} = require('./Lib/buildTableComponent')

const options = yargs
  .usage('Usage: -n <name>')
  .option('n', {
    alias: 'name',
    describe: 'Name of your component',
    type: 'string',
    demandOption: true,
  })
  .option('c', {
    alias: 'columns',
    describe: 'Your table column names',
    type: 'string',
    demandOption: false,
  }).argv

const isDataTable = options.c ? true : false
console.log(options, isDataTable)
console.log(`Building... ${options.name}`)

if (isDataTable) {
  buildTableComponent(options)
} else {
  buildComponent(options)
}

console.log(`Component saved to ${options.name}.js`)
