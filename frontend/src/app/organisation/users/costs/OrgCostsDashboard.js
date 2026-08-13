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

import { useTranslation } from 'react-i18next'
import RateCard from './RateCard'
import {
  Button,
  Typography,
  Menu,
  MenuItem,
  Switch,
  FormGroup,
  FormControlLabel,
} from '@mui/material'
import rawColours from '../../../../theme/raw-colours'
import JurCosts from '../../../../assets/images/JurCostsIcon'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { uniqBy } from 'lodash'
import CostsFilterButton from './CostsFilterButton'
import SearchFilter from '../../../template-list/SearchFilter'
import image from '../../../../assets/images/CostsZeroState.png'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'

const useStyles = makeStyles()(theme => ({
  confirmButton: {
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
    '&:disabled': {
      color: rawColours.primary.black[100],
    },
  },
  buttonIcon: {
    marginLeft: theme.spacing(1.5),
  },
  filterWrapper: {
    display: 'flex',
    marginBottom: theme.spacing(2.5),
  },
  currencyWrapper: {
    display: 'flex',
    marginBottom: '12px',
  },
  currencyButton: {
    color: rawColours.primary.black[200],
    borderColor: rawColours.primary.black[200],
    textTransform: 'none',
  },
  formGroup: {
    marginLeft: '16px',
    marginTop: '-4px',
  },
  zeroStateWrapper: {
    justifyItems: 'center',
    marginTop: '16px',
  },
  zeroStateImage: {
    width: '450px',
    height: '200px',
  },
  createButtonWrapper: {
    marginTop: '12px',
    marginBottom: '12px',
  },
  createButton: {
    width: '100%',
  },
  rateCardDiv: {
    marginBottom: theme.spacing(2),
  },
}))

const OrgCostsDashboard = props => {
  const {
    stage,
    rateTableDetails,
    setSelectedRTD,
    setRates,
    setStage,
    orgId,
    setFullPeriod,
    position,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState()
  const [selectedCurrency, setSelectedCurrency] = useState()
  const [filterString, setFilterString] = useState('')
  const [showRetired, setShowRetired] = useState(false)
  const [selectedCostsFilter, setSelectedCostsFilter] = useState(0)

  const isInFilterList = rateCard => {
    switch (parseInt(selectedCostsFilter)) {
      case 0:
        return true
      case 1:
        return !rateCard.draft
      case 2:
        return rateCard.draft
      default:
        return true
    }
  }

  const open = Boolean(anchorEl)
  const costsEnum = {
    0: t('All'),
    1: t('Active'),
    2: t('Draft'),
  }

  const filterRateCardsBySearchString = rateCard => {
    return (
      rateCard?.location?.toLowerCase().includes(filterString.toLowerCase()) ||
      rateCard?.work_type?.toLowerCase().includes(filterString.toLowerCase()) ||
      rateCard?.client_name?.toLowerCase().includes(filterString.toLowerCase())
    )
  }

  const rateCards = Array.isArray(rateTableDetails)
    ? rateTableDetails
        .filter(
          rtd =>
            isInFilterList(rtd.rateTableDetails) &&
            filterRateCardsBySearchString(rtd.rateTableDetails) &&
            rtd.rateTableDetails.matter === false &&
            (!rtd.rateTableDetails.is_retired ||
              (rtd.rateTableDetails.is_retired && showRetired)) &&
            (rtd.rateTableDetails.currency === selectedCurrency ||
              selectedCurrency === undefined ||
              selectedCurrency === 'All')
        )
        .sort(
          (a, b) =>
            b.rateTableDetails.is_retired - a.rateTableDetails.is_retired
        )
    : []

  const handleCurrencyClick = e => {
    setAnchorEl(e.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const renderCurrency = () => {
    if (!rateTableDetails) return <></>
    const validRTDs = rateTableDetails
      ? rateTableDetails.filter(
          rtd =>
            !rtd.rateTableDetails.client && !rtd.rateTableDetails.is_retired
        )
      : []
    const uniqRTD = uniqBy(
      validRTDs
        .filter(rtd => !rtd.rateTableDetails.client)
        .map(rtd => ({ name: rtd.rateTableDetails.currency })),
      'name'
    )
    const validCurr = [{ name: 'All', id: 'x' }, ...uniqRTD]

    return (
      <div className={classes.currencyWrapper}>
        <Button
          className={classes.currencyButton}
          variant="outlined"
          startIcon={<JurCosts colour={rawColours.primary.black[200]} />}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={handleCurrencyClick}
        >
          {selectedCurrency
            ? selectedCurrency
            : t('organisationAdmin.costs.selectCurrency')}
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          {validCurr.map(curr => (
            <MenuItem
              key={curr.id ?? curr.name}
              value={curr.name}
              onClick={() => {
                setSelectedCurrency(curr.name)
                setSelectedRTD({ id: 'x' })
                handleClose()
              }}
            >
              {curr.name}
            </MenuItem>
          ))}
        </Menu>
      </div>
    )
  }

  return (
    <>
      <div className={classes.filterWrapper}>
        {renderCurrency()}
        <CostsFilterButton
          costsEnum={costsEnum}
          selectedCostsFilter={selectedCostsFilter}
          setSelectedCostsFilter={setSelectedCostsFilter}
        />
        <SearchFilter
          filterString={filterString}
          setFilterString={setFilterString}
          helperText={t('organisationAdmin.costs.filterRateTables')}
        />
        <FormGroup className={classes.formGroup}>
          <FormControlLabel
            control={
              <Switch
                checked={showRetired}
                onChange={() => setShowRetired(!showRetired)}
                color="primary"
                data-test="show-retied-rtd"
              />
            }
            label={
              <Typography>
                {t('organisationAdmin.costs.showRetired')}
              </Typography>
            }
          />
        </FormGroup>
      </div>
      {rateTableDetails.length === 0 && (
        <div className={classes.zeroStateWrapper}>
          <div>
            <img
              src={image}
              alt="Zero state graphic"
              data-test="zero-state-image"
              className={classes.zeroStateImage}
            />
          </div>
          <Typography variant="subtitle1">
            {t('organisationAdmin.costs.zeroStateMessage')}
          </Typography>
          <div className={classes.createButtonWrapper}>
            <Button
              onClick={() => setStage(5)}
              className={`${classes.confirmButton} ${classes.createButton}`}
              variant="outlined"
            >
              {t('organisationAdmin.costs.createRateTable')}
              <ArrowCircleRightOutlinedIcon className={classes.buttonIcon} />
            </Button>
          </div>
          <Typography>{t('organisationAdmin.costs.findOutMore')}</Typography>
        </div>
      )}
      {rateTableDetails.length > 0 && (
        <div>
          {rateCards.map(rtd => (
            <div key={rtd.rateTableDetails.id} className={classes.rateCardDiv}>
              <RateCard
                setRates={setRates}
                rate={rtd.rateTableDetails}
                periods={rtd.periods}
                setStage={setStage}
                setFullPeriod={setFullPeriod}
                orgId={orgId}
                setSelectedRTD={setSelectedRTD}
                noClick={false}
                position={position}
              />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default OrgCostsDashboard
