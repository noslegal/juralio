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
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import {
  Checkbox,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import costsService from '../../../../services/costs/costs-service'
import uniqBy from 'lodash/uniqBy'

const AddGradeDialog = props => {
  const { t } = useTranslation()
  const [rate, setRate] = useState(0)
  const existingRates = props.rates
  const allGrades = props.grades
  const allRateTypes = props.rateTypes.filter(
    rt => !rt.isAgreedClient && !rt.isAgreedMatter
  )
  const periods = props.periods
  const rtdId = props.rtdId

  const [selectedGrade, setSelectedGrade] = useState('Choose a grade')

  const checkGradeUsage = () => {
    let gradesUsedWithRateTypes = uniqBy(
      existingRates.map(o => ({
        id: o.gradeId + '' + o.rateTypeId,
        gradeName: o.gradeName,
        gradeId: o.gradeid,
        rt: o.rateTypeName,
      })),
      'id'
    )
    let gradeList = []
    allGrades.forEach(grade => {
      if (
        gradesUsedWithRateTypes.filter(v => v.gradeName === grade.name).length <
        allRateTypes.length
      ) {
        gradeList.push(grade)
      }
    })
    return gradeList
  }

  const availableGrades = checkGradeUsage()

  const [rateOptionsForGrades, setRateOptionsForGrades] = useState()
  const [error, setError] = useState(true)

  const handleAction = () => {
    let payload = []
    periods.forEach((period, index) => {
      rateOptionsForGrades.forEach(option => {
        if (option.isSelected === true) {
          //add to payload
          payload.push({
            gradeId: option.grade.id,
            rateTypeId: option.rt.id,
            periodId: period.periodId,
            rate: index === periods.length - 1 ? parseFloat(rate) : null,
            rate_table_detailsId: rtdId,
            isAddGrade: true,
          })
        }
      })
    })
    costsService.bulkCreateRates(payload).then(res => {
      if (res.status === 200) {
        props.closeHandler(false)
        //update table data on front end
        costsService.getRateTable(rtdId).then(res => {
          props.setRates(res.body)
        })
      }
    })
  }

  const checkRateTypeUsage = selectedGrade => {
    let gradesUsedWithRateTypes = uniqBy(
      existingRates.map(o => ({
        id: o.gradeId + '' + o.rateTypeId,
        gradeName: o.gradeName,
        rt: { name: o.rateTypeName, id: o.rateTypeId },
      })),
      'id'
    )
    let ratesUsedByGrade = gradesUsedWithRateTypes
      .filter(v => v.gradeName === selectedGrade.name)
      .map(x => x.rt.id)
    let availableRts = []
    allRateTypes.forEach(rate => {
      if (!ratesUsedByGrade.includes(rate.id)) {
        availableRts.push({ grade: selectedGrade, rt: rate, isSelected: false })
      }
    })
    setRateOptionsForGrades(availableRts)
  }

  useEffect(() => {
    checkGradeUsage()
    //eslint-disable-next-line
  }, [])

  const updateSelectedRateTypes = (newValue, rt, index) => {
    let x = rateOptionsForGrades
    if (newValue === true) {
      rt.isSelected = true
      x[index] = rt
      setRateOptionsForGrades(x)
    } else {
      rt.isSelected = false
      x[index] = rt
      setRateOptionsForGrades(x)
    }
    setError(x.filter(v => v.isSelected === true).length < 1)
  }

  return (
    <JuralioDialog
      titleIcon={null}
      titleText={'Add grade to table'}
      disabled={error}
      actionLabel={t('common.add')}
      handleAction={() => {
        handleAction()
      }}
      handleCancel={() => {
        props.closeHandler(false)
      }}
      open={props.display}
    >
      <DialogContent>
        <div>
          <Typography>Choose a grade to add:</Typography>
          <div>
            <Select
              data-test="grade-dropdown"
              value={selectedGrade}
              onChange={e => {
                setSelectedGrade(e.target.value)
                checkRateTypeUsage(e.target.value)
              }}
              style={{ width: 'fit-content', minWidth: '120px' }}
            >
              {availableGrades.map(grade => (
                <MenuItem value={grade} data-test={grade.name}>
                  {t(grade.name)}
                </MenuItem>
              ))}
            </Select>
            <div>
              {rateOptionsForGrades && (
                <FormControl
                  required
                  error={error}
                  component="fieldset"
                  variant="standard"
                >
                  <FormGroup>
                    {rateOptionsForGrades.map((rt, index) => (
                      <FormControlLabel
                        data-test={rt.rt.name}
                        label={rt.rt.name}
                        control={
                          <Checkbox
                            onChange={e => {
                              updateSelectedRateTypes(
                                e.target.checked,
                                rt,
                                index
                              )
                            }}
                          />
                        }
                      />
                    ))}
                    <FormControlLabel
                      label={t('Rate')}
                      control={
                        <TextField
                          data-test="new-rate"
                          variant="outlined"
                          type="number"
                          onChange={e => {
                            setRate(e.target.value)
                          }}
                          value={rate}
                          slotProps={{
                            htmlInput: {
                              min: 0,
                              style: {
                                textAlign: 'center',
                                width: '100px',
                                borderRadius: '0px',
                                paddingRight: '8px',
                              },
                            },
                          }}
                        ></TextField>
                      }
                    />
                  </FormGroup>
                  <FormHelperText>
                    Pick at least 1 rate type to add, Rate will be applied to
                    most recent period
                  </FormHelperText>
                </FormControl>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}
export default AddGradeDialog
