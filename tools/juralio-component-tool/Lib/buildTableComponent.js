const fs = require('fs')
const templates = require('../Templates/component')
const tableTemplates = require('../Templates/tables')

const save = fs.writeFileSync

const buildTableComponent = options => {
  let output = ''
  console.log('MUI Datatable requested.')

  output = tableTemplates.tableTemplate.replace(
    /LOWER_COMPONENT_NAME/g,
    options.name.toLowerCase()
  )
  output = output.replace(/COMPONENT_NAME/g, options.name)

  save(`${options.name}.js`, output)
  save(
    `${options.name}Container.js`,
    tableTemplates.tableContainerTemplate
      .replace(/LOWER_COMPONENT_NAME/g, options.name.toLowerCase())
      .replace(/COMPONENT_NAME/g, options.name)
      .replace(/COLUMN_NAMES/g, generateColumnList(options))
  )
  save(
    `${options.name.toLowerCase()}-data-provider.js`,
    tableTemplates.dataProvider.replace(
      /LOWER_COMPONENT_NAME/g,
      options.name.toLowerCase().replace(/COMPONENT_NAME/g, options.name)
    )
  )
}

const buildComponent = options => {
  let output = ''
  console.log('General component requested.')

  output = templates.template.replace(
    /LOWER_COMPONENT_NAME/g,
    options.name.toLowerCase()
  )
  output = output.replace(/COMPONENT_NAME/g, options.name)

  save(`${options.name}.js`, output)
  save(
    `${options.name}Container.js`,
    templates.containerTemplate.replace(/COMPONENT_NAME/g, options.name)
  )
}

const generateColumnList = options => {
  const columns = options.columns.split(',')
  const template = `
  {
    name: 'NAME',
    options: {
      //customBodyRender: (value, tableMeta) => {
      //  return <div>{value}</div>
      //},
      display: true,
      filter: true,
      searchable: true,
      sort: true,
    },
  },`
  let out = ''
  columns.forEach(name => {
    out += template.replace('NAME', name)
  })
  return out
}

exports.buildComponent = buildComponent
exports.buildTableComponent = buildTableComponent
