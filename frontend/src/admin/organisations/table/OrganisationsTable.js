/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Button, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioTable from '../../../components/table/JuralioTable'
import { generateDownload } from '../../../services/export/export-service'
import {
  EXPORT_FORMATS,
  EXPORT_NAMES,
} from '../../../services/export/reports/common/constants-reports'
import { generateDeletedOrgData } from '../../../services/export/reports/deleted-orgs/deleted-orgs-report-helper'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    maxWidth: '100%',
  },
  tableTitle: { display: 'flex', marginBottom: theme.spacing() },
  title: { marginLeft: theme.spacing() },
  button: {
    backgroundColor: rawColours.primary.blue.light,
    color: rawColours.primary.primary.main,
    marginLeft: theme.spacing(),
    textTransform: 'unset',
    '&:hover': {
      backgroundColor: '#C3D0D7',
    },
  },
}))

const OrganisationsTable = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <div data-test="organisations-table-list" className={classes.root}>
      <div>
        <div className={classes.tableTitle}>
          <MattersIcon />
          <Typography
            data-test="table-title"
            variant="h6"
            className={classes.title}
          >
            {t('entity.organisation_other')}
          </Typography>
        </div>
        <Typography variant="overline" className={classes.organisationCount}>
          {t('sysAdmin.manageOrganisations.organisationCount', {
            count: props.rows?.length || 0,
          })}
        </Typography>
        <Button
          className={classes.button}
          variant="contained"
          onClick={() => {
            generateDownload(
              t,
              EXPORT_NAMES.DELETED_ORGS,
              EXPORT_FORMATS.EXCEL,
              generateDeletedOrgData(props.rows?.map(r => r._org) ?? [])
            )
          }}
        >
          {t('sysAdmin.organisations.exportDelOrg')}
        </Button>
      </div>
      <JuralioTable
        rows={props.rows}
        columns={props.columns}
        filters={props.filters}
        onRowClick={props.onRowClick}
        rowDataTest="organisation-list-item"
        tableBodyHeight="calc(100vh - 300px)"
      />
    </div>
  )
}

OrganisationsTable.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
}

export default OrganisationsTable
