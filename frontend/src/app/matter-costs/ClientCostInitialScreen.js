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

import React from 'react'

import { makeStyles } from 'tss-react/mui'
import { Button, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ArrowCircleIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import rawColours from '../../theme/raw-colours'
import CostsDashboardImg from './CostsDashboardImg'

const useStyles = makeStyles()(theme => ({
  outer: {
    padding: theme.spacing(4),
  },
  container: {
    padding: theme.spacing(5),
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
  },
  body: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'center',
  },
  leftCol: {
    flex: '0 0 38%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  rightCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
  },
  stepCircleCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    flexShrink: 0,
    backgroundColor: rawColours.primary.primary.main,
    color: rawColours.primary.white.primary,
  },
  stepConnector: {
    width: 2,
    height: 36,
    margin: '3px 0',
    borderRadius: 1,
    backgroundColor: rawColours.primary.primary.main,
  },
  stepContent: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(2),
  },
  stepLabel: {
    color: rawColours.primary.black.black,
    fontWeight: 500,
  },
  trackText: {
    textAlign: 'center',
    color: rawColours.primary.primary.main,
    marginTop: theme.spacing(1.5),
  },
  ctaButton: {
    textTransform: 'none',
    fontWeight: 'bold',
    marginTop: theme.spacing(3),
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
}))

const ClientCostInitialScreen = ({ onGetStarted }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const steps = [
    t('matterCosts.clientInitialScreen.step1'),
    t('matterCosts.clientInitialScreen.step2'),
    t('matterCosts.clientInitialScreen.step3'),
  ]

  return (
    <div className={classes.outer}>
      <Paper className={classes.container}>
        <Typography className={classes.title} variant="h4">
          {t('matterCosts.clientInitialScreen.title')}
        </Typography>

        <div className={classes.body}>
          <div className={classes.leftCol}>
            <div>
              {steps.map((label, index) => (
                <div key={index} className={classes.stepRow}>
                  <div className={classes.stepCircleCol}>
                    <div className={classes.stepCircle}>{index + 1}</div>
                    {index < steps.length - 1 && (
                      <div className={classes.stepConnector} />
                    )}
                  </div>
                  <div className={classes.stepContent}>
                    <Typography variant="body2" className={classes.stepLabel}>
                      {label}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={classes.rightCol}>
            <CostsDashboardImg />
            <Typography variant="h6" className={classes.trackText}>
              {t('matterCosts.clientInitialScreen.track')}
            </Typography>
            <Button
              data-test="client-costs-get-started"
              className={classes.ctaButton}
              variant="contained"
              endIcon={<ArrowCircleIcon />}
              onClick={onGetStarted}
            >
              {t('matterCosts.clientInitialScreen.button')}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  )
}

export default ClientCostInitialScreen
