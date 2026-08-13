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

import React, { useState } from 'react'

import { makeStyles } from 'tss-react/mui'
import { Button, Tooltip } from '@mui/material'
import { useTranslation } from 'react-i18next'
import rawColours from '../../theme/raw-colours'
import juralioColours from '../../theme/juralio-colours'
import JurCoins from '../../assets/images/JurCoins'
import AssumptionIcon from '../../assets/images/JurAssumptions'

const useStyles = makeStyles()(theme => ({
  buttonWrapper: {
    width: 'fit-content',
    marginLeft: 'auto',
    display: 'flex',
  },
  selectedButton: {
    margin: theme.spacing(0.5),
    textTransform: 'none',
    fontWeight: 'bold',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black[100],
    },
  },
  ratesButton: {
    margin: theme.spacing(0.5),
    display: 'flex',
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    border: 'solid 1px',
    borderColor: juralioColours.darkText.primary,
    backgroundColor: rawColours.primary.white.primary,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[100],
    },
  },
}))

const MatterCostsHeaderButtons = props => {
  const {
    isMatterAdmin,
    pageInfo,
    showRatesModal,
    setShowRatesModal,
    disableRatesModal,
    showAssumptionsModal,
    setShowAssumptionsModal,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()

  const disableAll = !isMatterAdmin && !pageInfo?.finishedMatterResource
  const [isHovering, setIsHovering] = useState(false)

  return (
    <>
      <div className={classes.buttonWrapper}>
        {!showAssumptionsModal && (
          <Tooltip
            title={t('matterCosts.navDisabledTooltip')}
            disableHoverListener={!disableAll}
          >
            <div style={{ paddingLeft: '8px' }}>
              <Tooltip
                title={
                  props.isSnapshot
                    ? t('matterCosts.headerButton.ratesProjectionHeader')
                    : t('matterCosts.headerButton.ratesMatterHeader')
                }
              >
                <Button
                  data-test={'show-rates-modal'}
                  style={
                    showRatesModal
                      ? {
                          zIndex: 1200,
                          top: '100px',
                          right: '20px',
                          position: 'absolute',
                        }
                      : {}
                  }
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  endIcon={
                    <JurCoins
                      customColour={
                        showRatesModal
                          ? rawColours.primary.grey.main
                          : juralioColours.darkText.secondary
                      }
                    />
                  }
                  variant={showRatesModal ? 'contained' : 'outlined'}
                  disabled={disableRatesModal}
                  onClick={() => {
                    if (props.isSnapshot) {
                      props.setSelectedSnapshotRates(props.snapshotRates)
                      props.setSelectedSnapshotRtd(props.snapshotRtd)
                      props.setSelectedSnapshotPeriods(props.snapshotPeriods)
                      props.setSelectedSnapshotDate &&
                        props.setSelectedSnapshotDate(props.snapshotDate)
                    } else {
                      props.setSelectedSnapshotRates(null)
                      props.setSelectedSnapshotRtd(null)
                      props.setSelectedSnapshotPeriods(null)
                      props.setSelectedSnapshotDate &&
                        props.setSelectedSnapshotDate(null)
                    }
                    showRatesModal
                      ? setShowRatesModal(false)
                      : setShowRatesModal(true)
                  }}
                  className={
                    showRatesModal
                      ? classes.selectedButton
                      : classes.ratesButton
                  }
                >
                  {t('matterCosts.rates')}
                </Button>
              </Tooltip>
            </div>
          </Tooltip>
        )}
        {!showRatesModal && (
          <Tooltip disableHoverListener={!disableAll}>
            <div div style={{ paddingLeft: '8px' }}>
              <Tooltip
                title={
                  props.isSnapshot
                    ? t('matterCosts.headerButton.assProjectionHeader')
                    : t('matterCosts.headerButton.assMatterHeader')
                }
              >
                <Button
                  data-test="assumptions-button"
                  endIcon={<AssumptionIcon color="black" />}
                  variant="outlined"
                  className={classes.ratesButton}
                  onClick={() => {
                    if (!showAssumptionsModal) {
                      if (
                        props.isSnapshot &&
                        props.setSelectedSnapshotAssumptions
                      ) {
                        props.setSelectedSnapshotAssumptions({
                          assumptions: props.snapshotAssumptions,
                          costTimeEstimateList: props.snapshotCostTimeEstimates,
                        })
                        props.setSelectedSnapshotDate &&
                          props.setSelectedSnapshotDate(props.snapshotDate)
                      } else if (props.setSelectedSnapshotAssumptions) {
                        props.setSelectedSnapshotAssumptions(null)
                        props.setSelectedSnapshotDate &&
                          props.setSelectedSnapshotDate(null)
                      }
                    }
                    showAssumptionsModal
                      ? setShowAssumptionsModal(false)
                      : setShowAssumptionsModal(true)
                  }}
                >
                  {t('matterCosts.assumptions.assumptions')}
                </Button>
              </Tooltip>
            </div>
          </Tooltip>
        )}
      </div>
    </>
  )
}

export default MatterCostsHeaderButtons
