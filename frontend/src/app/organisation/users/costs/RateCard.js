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

import { Chip, Divider, Paper, Typography } from '@mui/material'
import React from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import costsService from '../../../../services/costs/costs-service'
import GroupIcon from '@mui/icons-material/Group'
import OrganisationIcon from '../../../../assets/images/OrganisationIcon'
import juralioColours from '../../../../theme/juralio-colours'
import SearchIcon from '@mui/icons-material/Search'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import rawColours from '../../../../theme/raw-colours'
import { MattersIcon } from '../../../../theme/navigation/CommonIcons'
import { useTranslation } from 'react-i18next'
import { POSITIONS } from '../../../constants'

const useStyles = makeStyles()(theme => ({
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: '20% 50% 25% 5%',
    borderRadius: theme.spacing(3),
    minHeight: theme.spacing(12),
  },
  clickable: {
    cursor: 'pointer',
  },
  cardIcon: {
    scale: '1.5',
  },
  smallIcon: {
    scale: '0.7',
  },
  cardIconDiv: {
    color: juralioColours.whiteText.primary,
    borderTopLeftRadius: theme.spacing(3),
    borderBottomLeftRadius: theme.spacing(3),
  },
  cardIconText: {
    textAlign: 'center',
    textAlignLast: 'center',
  },
  endIconDiv: {
    textAlign: 'center',
    alignContent: 'center',
    color: juralioColours.whiteText.primary,
    borderTopRightRadius: theme.spacing(3),
    borderBottomRightRadius: theme.spacing(3),
  },
  cardBandClientNotRetired: {
    backgroundColor: juralioColours.rateTableCards.clientNotRetired,
    opacity: '70%',
  },
  cardBandClientRetired: {
    backgroundColor: juralioColours.rateTableCards.clientRetired,
    opacity: '70%',
  },
  cardBandOrgNotRetired: {
    backgroundColor: juralioColours.rateTableCards.orgNotRetired,
    opacity: '70%',
  },
  cardBandOrgRetired: {
    backgroundColor: juralioColours.rateTableCards.orgRetired,
    opacity: '70%',
  },
  cardBandMatter: {
    backgroundColor: rawColours.primary.primary.main,
    opacity: '70%',
  },
  iconWrapperDraft: {
    textAlignLast: 'center',
    height: '100%',
    marginTop: '6%',
  },
  iconWrapperNoDraft: {
    textAlignLast: 'center',
    height: '100%',
    marginTop: '10%',
  },
  chipWrapper: {
    marginBottom: '4px',
  },
  textDiv: {
    paddingLeft: theme.spacing(1.5),
  },
  templateLocationText: {
    paddingLeft: theme.spacing(1),
  },
  divider: {
    width: '40%',
  },
  currencyText: {
    paddingLeft: theme.spacing(2),
  },
  templateIconDiv: {
    backgroundColor: juralioColours.rateTableCards.orgNotRetired,
    borderRadius: '50%',
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  infoSection: {
    paddingTop: '8px',
  },
  infoSectionRetired: {
    paddingTop: '8px',
    backgroundColor: rawColours.primary.grey.main,
  },
  currencySection: {
    paddingTop: '4%',
    textAlign: '-webkit-center',
  },
  currencySectionRetired: {
    paddingTop: '4%',
    textAlign: '-webkit-center',
    backgroundColor: rawColours.primary.grey.main,
  },
  displayFlex: {
    display: 'flex',
  },
  draftChip: {
    backgroundColor: juralioColours.taskStatus.inProgress,
    marginTop: theme.spacing(0.5),
  },
  retiredChip: {
    backgroundColor: juralioColours.rateTableCards.retiredChip,
    marginTop: theme.spacing(0.5),
    color: juralioColours.whiteText.primary,
  },
  disabledStyling: {
    display: 'grid',
    gridTemplateColumns: '20% 50% 25% 5%',
    borderRadius: theme.spacing(3),
    minHeight: theme.spacing(12),
    backgroundColor: rawColours.primary.grey.main,
  },
}))

const cardBandClass = (classes, rate) => {
  if (rate.client && !rate.is_retired) return classes.cardBandClientNotRetired
  if (rate.client && rate.is_retired) return classes.cardBandClientRetired
  if (!rate.client && !rate.matter && !rate.is_retired)
    return classes.cardBandOrgNotRetired
  if (!rate.client && !rate.matter && rate.is_retired)
    return classes.cardBandOrgRetired
  return classes.cardBandMatter
}

const RateCard = props => {
  const {
    rate,
    orgId,
    noClick,
    periods,
    setStage,
    disabled,
    setSelectedRTD,
    setFullPeriod,
    setRates,
    position,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const matterDetails = useSelector(state => state.matterDetails)
  const bandClass = cardBandClass(classes, rate)

  return (
    <Paper
      data-test="rate-table-card"
      onClick={() => {
        if (!noClick) {
          setSelectedRTD(rate)
          costsService.getRateTable(rate.id).then(res => {
            setFullPeriod(periods)
            setRates(res.body)
            if (rate.draft && !rate.client) {
              setStage(13)
            } else if (rate.draft && rate.client) {
              setStage(14)
            } else {
              setStage(12)
            }
          })
        }
      }}
      className={`${disabled ? classes.disabledStyling : classes.gridWrapper}${
        !noClick ? ` ${classes.clickable}` : ''
      }`}
    >
      <div className={`${classes.cardIconDiv} ${bandClass}`}>
        <div
          className={
            rate.draft ? classes.iconWrapperDraft : classes.iconWrapperNoDraft
          }
        >
          {rate.client ? (
            <GroupIcon className={classes.cardIcon} />
          ) : rate.matter ? (
            <MattersIcon className={classes.cardIcon} />
          ) : (
            <OrganisationIcon className={classes.cardIcon} />
          )}
          <Typography className={classes.cardIconText}>
            {rate.client
              ? position?.name === POSITIONS.CLIENT.name
                ? t('organisationAdmin.costs.rateTable.advisorAgreedRates')
                : t('organisationAdmin.costs.rateTable.clientAgreedRates')
              : rate.matter
                ? t('organisationAdmin.costs.rateTable.matterAgreedRates')
                : t('organisationAdmin.costs.rateTable.orgRatePolicies')}
          </Typography>
          <div className={classes.chipWrapper}>
            {rate.draft && (
              <Chip
                size="small"
                className={classes.draftChip}
                label={t('common.draft')}
              />
            )}
            {rate.is_retired && (
              <Chip
                size="small"
                className={classes.retiredChip}
                label={t('common.retired')}
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={
          rate.is_retired ? classes.infoSectionRetired : classes.infoSection
        }
      >
        {rate.client && (
          <Typography variant="h6" className={classes.textDiv}>
            {rate.client_name}
          </Typography>
        )}
        {rate.matter ? (
          <div>
            <Typography variant="h6" className={classes.textDiv}>
              {matterDetails.matter.name +
                ' | ' +
                matterDetails.matter.matterId}
            </Typography>
          </div>
        ) : (
          <Typography variant="h6" className={classes.textDiv}>
            {rate.location + ' | ' + rate.work_type}
          </Typography>
        )}

        <div className={classes.displayFlex}>
          <Typography variant="body1" className={classes.textDiv}>
            {getDateDisplayString(rate.initalPeriod.startDate, 'MMM YYYY')}
          </Typography>
          {rate.matter && (
            <div className={classes.displayFlex}>
              <Typography variant="body1" className={classes.textDiv}>
                {t('matterCosts.rateTable.basedOn')}
              </Typography>
              <div className={classes.templateIconDiv}>
                <OrganisationIcon className={classes.smallIcon} />
              </div>
              <Typography
                variant="body1"
                className={classes.templateLocationText}
              >
                {rate.location + ' | ' + rate.work_type}
              </Typography>
            </div>
          )}
          {rate.client && (rate.rateTableDetails || rate.associated_id) && (
            <div className={classes.displayFlex}>
              <Typography variant="body1" className={classes.textDiv}>
                {t('matterCosts.rateTable.basedOn')}
              </Typography>
              <div className={classes.templateIconDiv}>
                <OrganisationIcon className={classes.smallIcon} />
              </div>
              <Typography
                variant="body1"
                className={classes.templateLocationText}
              >
                {rate.templateLocation + ' | ' + rate.templateWorkType}
              </Typography>
            </div>
          )}
        </div>
      </div>

      <div
        className={
          rate.is_retired
            ? classes.currencySectionRetired
            : classes.currencySection
        }
      >
        <Typography className={classes.currencyText} variant="h4">
          {rate.currency.substr(0, 3)}
        </Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.currencyText} variant="body1">
          {rate.currency.substr(5, 100)}
        </Typography>
      </div>
      <div className={`${classes.endIconDiv} ${bandClass}`}>
        {!noClick && (
          <>
            <SearchIcon />
            <Typography>{t('common.view')}</Typography>
          </>
        )}
      </div>
    </Paper>
  )
}

export default RateCard
