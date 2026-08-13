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

import React, { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TimePeriodPicker from './TimePeriodPicker'
import { TimePeriods } from './TimePeriodPickerConstants'
import TimePeriodPickerPopover from './TimePeriodPickerPopover'

const TimePeriodPickerContainer = props => {
  const { timePeriodOptions, setTimePeriodOptions } = props
  const { t } = useTranslation()
  const timePeriods = TimePeriods(t)
  const [currentTimePeriod, setCurrentTimePeriod] = useState(0) // default entire
  const [showTimePeriodPickerPopover, setShowTimePeriodPickerPopover] =
    useState(false)
  const [enabledButtons, setEnableButtons] = useState({
    left: false,
    right: false,
  })

  useEffect(() => {
    const daysInRange = props.roadmapData.actualDaysInRange
    const validTimePeriodOptions = [0]
    if (daysInRange < 8) {
      //dont render
      setTimePeriodOptions(null)
    } else {
      if (daysInRange > 366) {
        validTimePeriodOptions.push(4) //year
      }
      if (daysInRange > 92) {
        validTimePeriodOptions.push(3) //quarter
      }
      if (daysInRange > 28) {
        // For minimum month of FEB.
        validTimePeriodOptions.push(2) //monthly
      }
      if (daysInRange > 7) {
        validTimePeriodOptions.push(1) //weekly
      }
      setTimePeriodOptions(validTimePeriodOptions)
      setEnableButtons({
        left: validTimePeriodOptions.indexOf(currentTimePeriod) > 0,
        right:
          validTimePeriodOptions.indexOf(currentTimePeriod) <
          validTimePeriodOptions.length - 1,
      })
    }
  }, [props.roadmapData, currentTimePeriod, setTimePeriodOptions])

  const selectNextTimeOption = () => {
    const nextTimePeriod =
      timePeriodOptions[timePeriodOptions.indexOf(currentTimePeriod) + 1]
    if (nextTimePeriod > -1) {
      setCurrentTimePeriod(nextTimePeriod)
      setEnableButtons({
        left: timePeriodOptions.indexOf(nextTimePeriod) > 0,
        right:
          timePeriodOptions.indexOf(nextTimePeriod) <
          timePeriodOptions.length - 1,
      })
      props.setTimePeriod(nextTimePeriod)
    } else {
      //something's gone wrong, hide the picker
      setTimePeriodOptions(null)
    }
  }

  const selectPreviousTimeOption = () => {
    const previousTimePeriod =
      timePeriodOptions[timePeriodOptions.indexOf(currentTimePeriod) - 1]
    if (previousTimePeriod > -1) {
      setCurrentTimePeriod(previousTimePeriod)
      setEnableButtons({
        left: timePeriodOptions.indexOf(previousTimePeriod) > 0,
        right:
          timePeriodOptions.indexOf(previousTimePeriod) <
          timePeriodOptions.length - 1,
      })
      props.setTimePeriod(previousTimePeriod)
    } else {
      //something's gone wrong, hide the picker
      setTimePeriodOptions(null)
    }
  }

  const openTimePeriodPickerPopover = () => {
    setShowTimePeriodPickerPopover(true)
  }

  const getCurrentTimePeriodText = () => {
    return timePeriods[currentTimePeriod]
  }

  const selectOption = option => {
    setCurrentTimePeriod(option)
    setEnableButtons({
      left: timePeriodOptions.indexOf(option) > 0,
      right: timePeriodOptions.indexOf(option) < timePeriodOptions.length - 1,
    })
    setShowTimePeriodPickerPopover(false)
    props.setTimePeriod(option)
  }
  if (timePeriodOptions == null) {
    return null
  }

  return (
    <Fragment>
      <TimePeriodPicker
        displayText={getCurrentTimePeriodText()}
        disableLeft={!enabledButtons.left}
        disableRight={!enabledButtons.right}
        selectNextTimeOption={selectNextTimeOption}
        selectPreviousTimeOption={selectPreviousTimeOption}
        nextTimeOption={
          timePeriodOptions[timePeriodOptions.indexOf(currentTimePeriod) + 1]
        }
        disabled={props.disabled}
        previousTimeOption={
          timePeriodOptions[timePeriodOptions.indexOf(currentTimePeriod) - 1]
        }
        openTimePeriodPickerPopover={openTimePeriodPickerPopover}
      />
      {showTimePeriodPickerPopover && (
        <TimePeriodPickerPopover
          timePeriodOptions={timePeriodOptions}
          currentSelection={currentTimePeriod}
          selectOption={selectOption}
        />
      )}
    </Fragment>
  )
}

export default TimePeriodPickerContainer
