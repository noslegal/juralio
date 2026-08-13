const tableTemplate = `
// Block of third party libs
import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

// Block of Material imports
import MUIDataTable from 'mui-datatables'
import { MuiThemeProvider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

// Block of Juralio imports
import { getMuiTheme } from '../../../../services/helpers/table/juralio-table-theme-helper'
import { juralioTableOptions } from '../../../../services/helpers/table/juralio-table-helper'

const tableTheme = getMuiTheme()
const TABLE_OPTIONS = {
  ...juralioTableOptions,
  isRowSelectable: () => false,
  filter: true,
  tableBodyHeight: 'calc(100vh - 360px)',
}

const useStyles = makeStyles()(theme => ({
  root: {
    border: '1px solid red', // This is to guide you in positioning your component.
    maxWidth: theme.spacing(60),
  },
  text: { color: 'black' },
}))

// The Pop handles display of ____
const COMPONENT_NAME = props => {
  const {classes} = useStyles()
  const { t } = useTranslation()

  return (
    <div data-test="COMPONENT_NAME_LOWER-wrapper" className={classes.root}>
    <MuiThemeProvider theme={tableTheme}>
      <MUIDataTable
        title={'COMPONENT_NAME'}
        data={props.data}
        columns={props.columns}
        options={TABLE_OPTIONS}
      />
    </MuiThemeProvider>
    </div>
  )
}

COMPONENT_NAME.propTypes = {
  myKeyProp: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
}

export default COMPONENT_NAME

`

const dataProvider = `
// Process raw data into format suitable for the table.
// TODO : Ensure this file is named with kebab case.
const processData = (t, data) => {
  return data.reverse()
}

export default processData
`

const tableContainerTemplate = `
// Block of third party libs
import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

// Block of Juralio imports
import COMPONENT_NAME from './COMPONENT_NAME.js'
import processData from './LOWER_COMPONENT_NAME-data-provider'

const columns = [COLUMN_NAMES]

const data = [['1234'],['5678']]

// To us in an application: import COMPONENT_NAMEContainer from './COMPONENT_NAMEContainer'
// The COMPONENT_NAMEContainer handles display of ____
const COMPONENT_NAMEContainer = props => {
  const { t } = useTranslation()

  console.log('COMPONENT_NAMEContainer:', props)
  return <COMPONENT_NAME myKeyProp={props.myKeyProp} columns={columns} data={processData(t,data)} />
}

COMPONENT_NAMEContainer.propTypes = {
  myKeyProp: PropTypes.string.isRequired,
}

export default COMPONENT_NAMEContainer
`

module.exports = { tableTemplate, dataProvider, tableContainerTemplate }
