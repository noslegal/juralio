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
import rawColours from '../../theme/raw-colours'
import juralioColours from '../../theme/juralio-colours'
import ArrowCircleIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import JurCoins from '../../assets/images/JurCoins'
import CostsDashboardImg from './CostsDashboardImg'
import CostsRatesSetImg from './CostsRatesSetImg'

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
  },
  stepCircleActive: {
    backgroundColor: rawColours.primary.primary.main,
    color: rawColours.primary.white.primary,
  },
  stepCircleInactive: {
    backgroundColor: rawColours.primary.grey.main,
    color: rawColours.primary.black[100],
  },
  stepConnector: {
    width: 2,
    height: 36,
    margin: '3px 0',
    borderRadius: 1,
  },
  stepConnectorActive: {
    backgroundColor: rawColours.primary.primary.main,
  },
  stepConnectorInactive: {
    backgroundColor: rawColours.primary.grey.main,
  },
  stepContent: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(2),
  },
  stepLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
  stepLabelActive: {
    color: rawColours.primary.black.black,
    fontWeight: 500,
  },
  stepLabelInactive: {
    color: rawColours.primary.black[100],
  },
  ratesButton: {
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    borderColor: juralioColours.darkText.primary,
    backgroundColor: rawColours.primary.white.primary,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
    },
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

const CostInitialScreen = props => {
  const { pageInfo, setSelectedPage, setShowRatesModal } = props
  const { classes } = useStyles()
  const { t } = useTranslation()

  const ratesDone = pageInfo.finishedMatterRates
  const steps = [
    { labelKey: 'matterCosts.initialScreenStep1', showRatesButton: ratesDone },
    { labelKey: 'matterCosts.initialScreenStep2' },
    { labelKey: 'matterCosts.initialScreenStep3' },
  ]

  const activeStep = ratesDone ? 1 : 0

  return (
    <div className={classes.outer}>
      <Paper className={classes.container}>
        <Typography className={classes.title} variant="h4">
          {ratesDone
            ? t('matterCosts.initialScreenProjectionTitle')
            : t('matterCosts.initialScreenTitle')}
        </Typography>

        <div className={classes.body}>
          <div className={classes.leftCol}>
            <div>
              {steps.map((step, index) => {
                const isActive = index <= activeStep
                return (
                  <div key={index} className={classes.stepRow}>
                    <div className={classes.stepCircleCol}>
                      <div
                        className={`${classes.stepCircle} ${
                          isActive
                            ? classes.stepCircleActive
                            : classes.stepCircleInactive
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`${classes.stepConnector} ${
                            isActive
                              ? classes.stepConnectorActive
                              : classes.stepConnectorInactive
                          }`}
                        />
                      )}
                    </div>
                    <div className={classes.stepContent}>
                      <div className={classes.stepLabelRow}>
                        <Typography
                          variant="body2"
                          className={
                            isActive
                              ? classes.stepLabelActive
                              : classes.stepLabelInactive
                          }
                        >
                          {t(step.labelKey)}
                        </Typography>
                        {step.showRatesButton && (
                          <Button
                            className={classes.ratesButton}
                            variant="outlined"
                            size="small"
                            endIcon={
                              <JurCoins
                                customColour={juralioColours.darkText.secondary}
                              />
                            }
                            onClick={() => setShowRatesModal(true)}
                          >
                            {t('matterCosts.initialScreenRatesButton')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={classes.rightCol}>
            {ratesDone ? <CostsRatesSetImg /> : <CostsDashboardImg />}
            <Typography variant="h6" className={classes.trackText}>
              {t('matterCosts.initialScreenTrack')}
            </Typography>
            <Button
              data-test="get-started"
              className={classes.ctaButton}
              variant="contained"
              endIcon={<ArrowCircleIcon />}
              onClick={() => setSelectedPage(ratesDone ? 2 : 1)}
            >
              {ratesDone
                ? t('matterCosts.initialScreenProjectionButton')
                : t('matterCosts.initialScreenButton')}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  )
}

export default CostInitialScreen
