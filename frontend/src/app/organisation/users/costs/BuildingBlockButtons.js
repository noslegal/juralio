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

import { Button, Paper } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'
import juralioColours from '../../../../theme/juralio-colours'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()(theme => ({
  buttonWrapper: {
    marginLeft: 'auto',
    display: 'flex',
  },
  button: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    '&:hover': {
      color: rawColours.primary.grey.main,
      backgroundColor: rawColours.primary.black[200],
    },
  },
  paperHeader: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    borderRadius: theme.spacing(0),
    background:
      'linear-gradient(0deg, #F1F1EE, #F1F1EE), linear-gradient(0deg, #989390, #989390)',
    borderBottom: '1px solid',
    borderTop: '1px solid',
    borderColor: juralioColours.darkText.secondary,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
}))

const BuildingBlockButtons = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  return (
    <Paper className={classes.paperHeader}>
      <div className={classes.buttonWrapper}>
        <Button
          onClick={() => {
            props.setStage(7)
          }}
          style={
            props.stage === 7
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
        >
          <div>{t('organisationAdmin.costs.buildingBlocks.rateTable')}</div>
        </Button>
        <Button
          onClick={() => {
            props.setStage(9)
          }}
          style={
            props.stage === 9
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
        >
          {t('organisationAdmin.costs.buildingBlocks.grades')}
        </Button>
        <Button
          onClick={() => {
            props.setStage(10)
          }}
          style={
            props.stage === 10
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
        >
          {t('organisationAdmin.costs.buildingBlocks.rateTypes')}
        </Button>
        <Button
          onClick={() => {
            props.setStage(11)
          }}
          style={
            props.stage === 11
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
        >
          {t('organisationAdmin.costs.buildingBlocks.otherCosts')}
        </Button>
      </div>
    </Paper>
  )
}

export default BuildingBlockButtons
