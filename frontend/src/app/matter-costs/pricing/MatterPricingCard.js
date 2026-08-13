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
import { useTranslation } from 'react-i18next'
import AlarmIcon from '@mui/icons-material/AccessAlarm'
import { Typography } from '@mui/material'
import rawColours from '../../../theme/raw-colours'
import Handshake from '../../../assets/images/JurHandshake'
import TimeWithCap from '../../../assets/images/JurTimeWithCap'

const useStyles = makeStyles()(theme => ({
  divWrapper: {
    display: 'grid',
    gridTemplateColumns: '15% 30% 30% 25%',
    margin: theme.spacing(2),
  },
  iconWrapper: {
    marginTop: theme.spacing(1.5),
  },
  div1: {
    backgroundColor: '#cac8c1',
    padding: theme.spacing(2),
    textAlign: 'center',
    borderColor: rawColours.primary.black[200],
    borderRight: '1px solid',
    borderRadius: '16px 0px 0px 16px',
  },
  div2: {
    backgroundColor: '#cac8c1',
    padding: theme.spacing(2),
    textAlign: 'center',
    borderColor: rawColours.primary.black[200],
    borderLeft: '1px solid',
    borderRight: '1px solid',
  },
  div3: {
    backgroundColor: rawColours.primary.primary.light,
    padding: theme.spacing(2),
    textAlign: 'center',
    borderColor: rawColours.primary.black[200],
    borderLeft: '1px solid',
    borderRight: '1px solid',
  },
  div4: {
    backgroundColor: rawColours.primary.grey.main,
    padding: theme.spacing(2),
    textAlign: 'center',
    borderColor: rawColours.primary.black[200],
    borderLeft: '1px solid',
    borderRadius: '0px 16px 16px 0px',
  },
  titleText: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: '14px',
  },
}))

const MatterPricingCard = props => {
  const { value, type, currency } = props
  const { classes } = useStyles()
  const { t } = useTranslation()

  const getDiv1Content = () => {
    if (parseInt(type) === 0 && !value) {
      return <AlarmIcon fontSize="large" />
    } else if (parseInt(type) === 0 && value) {
      return (
        <div className={classes.iconWrapper}>
          <TimeWithCap />
        </div>
      )
    } else {
      return (
        <div className={classes.iconWrapper}>
          <Handshake />
        </div>
      )
    }
  }

  const getDiv2Content = () => {
    if (parseInt(type) === 0 && !value) {
      return (
        <Typography variant="subtitle1">
          {t('matterCosts.pricingCard.timeBased')}
        </Typography>
      )
    } else if (parseInt(type) === 0 && value) {
      return (
        <div>
          <Typography variant="h6">
            {currency.substr(0, 3) +
              ' ' +
              value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </Typography>
          <Typography variant="subtitle1">
            {t('matterCosts.pricingCard.timeBasedCap')}
          </Typography>
        </div>
      )
    } else if (parseInt(type) === 1 && value) {
      return (
        <div>
          <Typography variant="subtitle1">
            {t('matterCosts.pricingCard.fixedFee')}
          </Typography>
          <Typography variant="h6">
            {currency.substr(0, 3) +
              ' ' +
              value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </Typography>
        </div>
      )
    } else {
      return (
        <div>
          <Typography variant="h6">
            {t('matterCosts.pricingCard.proBono')}
          </Typography>
          <Typography variant="h6">
            {t('matterCosts.pricingCard.noFee')}
          </Typography>
        </div>
      )
    }
  }

  return (
    <div className={classes.divWrapper}>
      <div className={classes.div1}>{getDiv1Content()}</div>
      <div className={classes.div2}>{getDiv2Content()}</div>
      <div className={classes.div3}>
        <Typography className={classes.titleText}>
          {t('matterCosts.pricingCard.scope&assumptions')}
        </Typography>
        <Typography className={classes.subtitleText}>
          {t('matterCosts.pricingCard.wholeNoAssumptions')}
        </Typography>
      </div>
      <div className={classes.div4}>
        <Typography className={classes.titleText}>
          {t('matterCosts.pricingCard.duration')}
        </Typography>
        <Typography className={classes.subtitleText}>
          {t('matterCosts.pricingCard.wholeMatter')}
        </Typography>
      </div>
    </div>
  )
}

export default MatterPricingCard
