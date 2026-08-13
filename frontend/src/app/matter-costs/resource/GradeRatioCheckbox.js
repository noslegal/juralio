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

import { Checkbox } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const GradeRatioCheckbox = props => {
  const matterCosts = useSelector(state => state.matterCosts)

  const getValue = () => {
    return matterCosts.payload
      ?.find(category => category.categoryId === props.categoryId)
      .grades.find(grade => grade.gradeId === props.id).ratioValue
  }

  const [checked, setChecked] = useState(getValue() === 0 ? false : true)

  useEffect(() => {
    setChecked(getValue() === 0 ? false : true)
  }, [matterCosts]) //eslint-disable-line

  const handleUpdate = () => {
    if (checked) {
      props.updatePayload(0, 0, true, false, props.categoryId, props.id)
    } else {
      props.updatePayload(
        props.categoryValue,
        0,
        true,
        true,
        props.categoryId,
        props.categoryId,
        props.id
      )
    }
  }

  return (
    <Checkbox
      checked={checked}
      disabled={props.categoryValue === 0 || props.disabled}
      onChange={handleUpdate}
    />
  )
}
export default GradeRatioCheckbox
