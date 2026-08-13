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

import {
  Typography,
  MenuItem,
  TextField,
  Select,
  FormControlLabel,
  RadioGroup,
  FormControl,
  Radio,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import {
  CURRENCIES,
  POSITIONS,
  RATE_TABLE_BUILD_FORM,
  RATE_TABLE_TYPES,
} from '../../../constants'
import uniqBy from 'lodash/uniqBy'

const useStyles = makeStyles()(theme => ({
  questionDivider: {
    paddingTop: theme.spacing(3),
  },
  selectControl: {
    width: '200px',
  },
  noteText: {
    paddingTop: theme.spacing(1),
  },
  radioGroupWrapper: { width: 'fit-content' },
}))

const BuildNewTableForm = props => {
  const {
    currency,
    location,
    workType,
    period,
    rateTableType,
    rateTableTemplate,
    rateTableDetails,
    clientName,
    position,
  } = props

  const { t } = useTranslation()
  const { classes } = useStyles()
  const [locationShow, setLocationShow] = useState(
    RATE_TABLE_BUILD_FORM.SPECIFIC
  )
  const [workTypeShow, setWorkTypeShow] = useState(
    RATE_TABLE_BUILD_FORM.SPECIFIC
  )

  useEffect(() => {
    wipeData()
    if (!props.isFirstTimeFlow) {
      props.setRateTableType()
    }
    props.setButtonDisabled(true)
    //eslint-disable-next-line
  }, [])

  const wipeData = () => {
    props.setLocation('')
    props.setWorkType('')
    props.setPeriod(undefined)
    props.setCurrency('')
    props.setClientName('')
    props.setRateTableTemplate('')
  }

  useEffect(() => {
    if (
      rateTableType === RATE_TABLE_TYPES.ORGANISATION &&
      (currency === '' || location === '' || workType === '')
    ) {
      props.setButtonDisabled(true)
    } else if (
      rateTableType === RATE_TABLE_TYPES.CLIENT &&
      (currency === '' ||
        location === '' ||
        workType === '' ||
        clientName === '' ||
        rateTableTemplate === '')
    ) {
      props.setButtonDisabled(true)
    } else if (rateTableType === undefined) {
      props.setButtonDisabled(true)
    } else {
      props.setButtonDisabled(false)
    }
    //eslint-disable-next-line
  }, [
    currency,
    location,
    workType,
    period,
    clientName,
    rateTableTemplate,
    rateTableType,
  ])

  const renderCurrency = () => {
    let validCurr
    if (rateTableType === RATE_TABLE_TYPES.CLIENT) {
      const validRTDs = rateTableDetails.filter(rtd => {
        if (
          !rtd.rateTableDetails.client &&
          !rtd.rateTableDetails.draft &&
          !rtd.rateTableDetails.is_retired
        ) {
          return rtd.rateTableDetails.currency
        }
      })
      validCurr = uniqBy(
        validRTDs.map(rtd => {
          if (!rtd.rateTableDetails.client && !rtd.rateTableDetails.draft) {
            return { name: rtd.rateTableDetails.currency }
          }
        }),
        'name'
      )
    } else {
      validCurr = CURRENCIES
    }

    return (
      <>
        <Typography variant="subtitle1" className={classes.questionDivider}>
          {t('organisationAdmin.costs.stage6P2')}
        </Typography>
        <FormControl className={classes.selectControl}>
          <Select
            data-test="select-currency"
            label={t('organisationAdmin.costs.selectCurrency')}
            value={currency}
            onChange={e => {
              props.setCurrency(e.target.value)
            }}
          >
            {validCurr.map(curr => {
              return (
                <MenuItem data-test={curr.name} value={curr.name}>
                  {curr.name}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </>
    )
  }
  const renderLocation = () => {
    return (
      <>
        <Typography
          data-test="select-location"
          variant="subtitle1"
          className={classes.questionDivider}
        >
          {t('organisationAdmin.costs.stage6P4')}
        </Typography>
        <RadioGroup
          className={classes.radioGroupWrapper}
          value={locationShow}
          onChange={e => {
            if (e.target.value === RATE_TABLE_BUILD_FORM.ANY) {
              props.setLocation('Any location')
              setLocationShow(e.target.value)
            } else {
              props.setLocation('')
              setLocationShow(e.target.value)
            }
          }}
        >
          <FormControlLabel
            value={RATE_TABLE_BUILD_FORM.ANY}
            control={<Radio data-test="any-location" size="small" />}
            label={
              <Typography variant="caption">
                {t('organisationAdmin.costs.buildForm.anyLocation')}
              </Typography>
            }
          />
          <FormControlLabel
            value={RATE_TABLE_BUILD_FORM.SPECIFIC}
            control={<Radio data-test="specific-location" size="small" />}
            label={
              <Typography variant="caption">
                {t('organisationAdmin.costs.buildForm.specificLocations')}
              </Typography>
            }
          />
        </RadioGroup>
        {locationShow === RATE_TABLE_BUILD_FORM.SPECIFIC && (
          <>
            <TextField
              className={classes.textField}
              value={location}
              data-test="location-field"
              onChange={e => {
                if (e.target.value.length <= 50)
                  props.setLocation(e.target.value)
              }}
              helperText={t(
                'organisationAdmin.costs.buildForm.locationExample'
              )}
            />
          </>
        )}
      </>
    )
  }
  const renderWorkType = () => {
    return (
      <>
        <Typography
          data-test="select-worktype"
          variant="subtitle1"
          className={classes.questionDivider}
        >
          {t('organisationAdmin.costs.stage6P3')}
        </Typography>
        <RadioGroup
          className={classes.radioGroupWrapper}
          value={workTypeShow}
          onChange={e => {
            if (e.target.value === RATE_TABLE_BUILD_FORM.ANY) {
              props.setWorkType('Any type of work')
              setWorkTypeShow(e.target.value)
            } else {
              props.setWorkType('')
              setWorkTypeShow(e.target.value)
            }
          }}
        >
          <FormControlLabel
            value={RATE_TABLE_BUILD_FORM.ANY}
            control={<Radio data-test="any-worktype" size="small" />}
            label={
              <Typography variant="caption">
                {t('organisationAdmin.costs.buildForm.anyWorkType')}
              </Typography>
            }
          />
          <FormControlLabel
            value={RATE_TABLE_BUILD_FORM.SPECIFIC}
            control={<Radio data-test="specific-worktype" size="small" />}
            label={
              <Typography variant="caption">
                {t('organisationAdmin.costs.buildForm.specificWorkType')}
              </Typography>
            }
          />
        </RadioGroup>
        {workTypeShow === RATE_TABLE_BUILD_FORM.SPECIFIC && (
          <>
            <TextField
              className={classes.textField}
              value={workType}
              data-test="work-type-field"
              onChange={e => {
                if (e.target.value.length <= 50) {
                  props.setWorkType(e.target.value)
                }
              }}
              helperText={t(
                'organisationAdmin.costs.buildForm.workTypeExample'
              )}
            />
          </>
        )}
      </>
    )
  }
  const renderPeriod = () => {
    return (
      <>
        <Typography
          data-test="date-picker"
          variant="subtitle1"
          className={classes.questionDivider}
        >
          {t('organisationAdmin.costs.stage6P5')}
        </Typography>
        <DatePicker
          label=" "
          variant="inline"
          openTo="month"
          views={['year', 'month']}
          format="yyyy-MM"
          value={period}
          onChange={e => {
            props.setPeriod(new Date(e))
          }}
        />
      </>
    )
  }
  const renderClientName = () => {
    return (
      <>
        <Typography variant="subtitle1" className={classes.questionDivider}>
          {position.name === POSITIONS.CLIENT.name
            ? t('organisationAdmin.costs.buildForm.advisorName')
            : t('organisationAdmin.costs.stage6P6')}
        </Typography>
        <TextField
          className={classes.textField}
          value={clientName}
          data-test="client-name-field"
          onChange={e => {
            if (e.target.value.length <= 50) {
              props.setClientName(e.target.value)
            }
          }}
        />
      </>
    )
  }
  const renderTemplateRTD = () => {
    return (
      <>
        <Typography variant="subtitle1" className={classes.questionDivider}>
          {t('organisationAdmin.costs.stage6P7')}
        </Typography>
        <FormControl className={classes.selectControl}>
          <Select
            data-test={'choose-ref-table'}
            disabled={currency === ''}
            value={rateTableTemplate}
            onChange={e => {
              props.setRateTableTemplate(e.target.value)
            }}
          >
            {rateTableDetails
              .filter(rtd => rtd.rateTableDetails.draft === false)

              .map(rtd => {
                if (
                  !rtd.rateTableDetails.client &&
                  rtd.rateTableDetails.currency === currency
                ) {
                  return (
                    <MenuItem
                      value={rtd.rateTableDetails.id}
                      data-test={'ref-table'}
                    >
                      {rtd.rateTableDetails.location +
                        ' | ' +
                        rtd.rateTableDetails.work_type}
                    </MenuItem>
                  )
                }
              })}
          </Select>
        </FormControl>

        <Typography className={classes.noteText}>
          {t('organisationAdmin.costs.stage6P8')}
        </Typography>
      </>
    )
  }

  const renderOrgForm = () => {
    return (
      <>
        {renderCurrency()}
        {renderWorkType()}
        {renderLocation()}
        {/* {renderPeriod()} */}
      </>
    )
  }
  const renderClientForm = () => {
    return (
      <>
        {renderClientName()}
        {renderCurrency()}
        {renderWorkType()}
        {renderLocation()}
        {/* {renderPeriod()} */}
        {renderTemplateRTD()}
      </>
    )
  }
  const renderAdvisorAgreedForm = () => {
    return (
      <>
        {renderClientName()}
        {renderCurrency()}
        {renderWorkType()}
        {renderLocation()}
        {/* {renderPeriod()} */}
        {renderTemplateRTD()}
      </>
    )
  }

  const renderForm = () => {
    if (position?.name === POSITIONS.CLIENT.name) {
      if (rateTableType === RATE_TABLE_TYPES.ORGANISATION) {
        return renderOrgForm()
      } else if (rateTableType === RATE_TABLE_TYPES.ADVISOR_AGREED) {
        return renderAdvisorAgreedForm()
      }
    } else {
      if (rateTableType === RATE_TABLE_TYPES.ORGANISATION) {
        return renderOrgForm()
      } else if (rateTableType === RATE_TABLE_TYPES.CLIENT) {
        return renderClientForm()
      }
    }
  }

  return (
    <div>
      {!props.isFirstTimeFlow && (
        <>
          <Typography
            variant="h6"
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage8P1'),
            }}
          ></Typography>
          <FormControl component="fieldset">
            <RadioGroup
              value={rateTableType}
              onChange={e => {
                wipeData()
                props.setRateTableType(e.target.value)
              }}
              aria-label="auth-method"
            >
              <FormControlLabel
                value={RATE_TABLE_TYPES.ORGANISATION}
                control={<Radio />}
                label={
                  position.name === POSITIONS.CLIENT.name
                    ? t('organisationAdmin.costs.buildForm.targetRatesOrg')
                    : t('organisationAdmin.costs.buildForm.ratePoliciesOrg')
                }
              />
              {position.name === POSITIONS.CLIENT.name ? (
                <FormControlLabel
                  value={RATE_TABLE_TYPES.ADVISOR_AGREED}
                  control={<Radio />}
                  label={t('organisationAdmin.costs.buildForm.advisorRates')}
                />
              ) : (
                <FormControlLabel
                  value={RATE_TABLE_TYPES.CLIENT}
                  control={<Radio />}
                  label={t('organisationAdmin.costs.buildForm.clientRates')}
                />
              )}
            </RadioGroup>
          </FormControl>
        </>
      )}
      {renderForm()}
    </div>
  )
}

export default BuildNewTableForm
