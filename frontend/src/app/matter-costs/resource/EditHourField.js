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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { TextField, InputAdornment, Tooltip } from '@mui/material'
import { checkCategoryDisabled, getValue } from '../resource/GradeRatioHelper'
import useDebounce from '../../../hooks/debounce-hook'

const useStyles = makeStyles()(theme => ({
  field: { paddingLeft: 8, width: '90%' },
}))

const EditHourField = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const matterCosts = useSelector(state => state.matterCosts)
  const index = props.index
  const [ratioValue, setRatioValue] = useState({
    value: getValue(
      matterCosts,
      props.isHour,
      props.isCategory,
      props.id,
      props.categoryId
    ),
    doUpdate: false,
  })
  const handleIsDisabled = () => {
    if (!props.isHour) {
      if (props.isCategory) {
        let value = checkCategoryDisabled(matterCosts, props.id)
        if (value === true) {
          return true
        } else {
          if (
            getValue(
              matterCosts,
              props.isHour,
              props.isCategory,
              props.id,
              props.categoryId
            ) !== value
          ) {
            updateValue(value)
          }
          return false
        }
      } else {
        let value = getValue(
          matterCosts,
          true,
          props.isCategory,
          props.id,
          props.categoryId
        )
        return value < 1
      }
    }
  }
  const debounceValue = useDebounce(ratioValue, 500)
  const [isDisabled, setIsDisabled] = useState(handleIsDisabled)
  const [error, setError] = useState()

  useEffect(() => {
    if (debounceValue.value !== 0 && debounceValue.doUpdate === true) {
      updateValue(ratioValue.value)
    }
  }, [debounceValue]) //eslint-disable-line

  const updateValue = value => {
    if (value !== '') {
      setError(isError(value))
      props.updatePayload(
        value,
        index,
        props.isHour,
        props.isCategory,
        props.categoryId,
        props.id
      )
    }
  }

  useEffect(() => {
    setRatioValue({
      value: getValue(
        matterCosts,
        props.isHour,
        props.isCategory,
        props.id,
        props.categoryId
      ),
      doUpdate: false,
    })
    setIsDisabled(handleIsDisabled())
  }, [JSON.stringify(matterCosts.payload)]) //eslint-disable-line

  const isError = value => {
    if (value < 0 || value > 100) {
      return true
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      const fields = Array.from(document.querySelectorAll('input')) || []
      const position = fields.indexOf(e.target)
      if (fields.length - 2 === position) {
        fields[2] && fields[2].focus()
      } else {
        if (props.value !== null || props.value !== undefined) {
          fields[position + 1] && fields[position + 1].focus()
        } else {
          fields[position + 2] && fields[position + 2].focus()
        }
      }
    }
  }

  return (
    <Tooltip
      disableFocusListener={!isDisabled}
      disableHoverListener={!isDisabled}
      title={
        !props.isCategory
          ? t('organisationAdmin.costs.grades.gradeRecoveryDisabledTT')
          : t('organisationAdmin.costs.grades.categoryRecoveryDisabledTT')
      }
    >
      <div className={classes.field}>
        <TextField
          data-test="edit-hour-field"
          onKeyDown={handleKeyDown}
          disabled={isDisabled || props.disabled}
          type={'number'}
          value={isDisabled ? undefined : ratioValue.value}
          onChange={e => {
            setRatioValue({ value: e.target.value, doUpdate: true })
          }}
          error={error}
          onFocusCapture={event => {
            event.target.select()
          }}
          onBlur={() => {
            if (ratioValue.value === '') {
              setError(isError(0))
              props.updatePayload(
                0,
                index,
                props.isHour,
                props.isCategory,
                props.categoryId,
                props.id
              )
            }
          }}
          onWheel={e => e.target.blur()}
          helperText={error ? 'Must be between 0 & 100' : ''}
          placeholder={t('matterCosts.n/a')}
          slotProps={{
            input: {
              style: {
                height: props.height ? props.height + 'px' : '',
                fontWeight: props.isHour ? '600' : '400',
              },
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            },
            htmlInput: { min: 1, max: 100 },
          }}
        />
      </div>
    </Tooltip>
  )
}
export default EditHourField
