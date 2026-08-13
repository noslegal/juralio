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
import { useSelector } from 'react-redux'
import { LinearProgress } from '@mui/material'
import { getValue } from '../resource/GradeRatioHelper'
import { CATEGORY_COLOURS } from '../../constants'

const RatioLineBar = props => {
  const matterCosts = useSelector(state => state.matterCosts)
  const [value, setValue] = useState(
    getValue(
      matterCosts,
      props.isHour,
      props.isCategory,
      props.id,
      props.categoryId
    )
  )

  useEffect(() => {
    setValue(
      getValue(
        matterCosts,
        props.isHour,
        props.isCategory,
        props.id,
        props.categoryId
      )
    )
  }, [matterCosts]) //eslint-disable-line

  return (
    <div>
      <LinearProgress
        style={{ backgroundColor: 'lightgrey' }}
        sx={{
          '& .MuiLinearProgress-bar': {
            backgroundColor: CATEGORY_COLOURS[props.colour_idx].primary,
          },
        }}
        variant="determinate"
        value={value > 0 ? 100 : 0}
      />
    </div>
  )
}
export default RatioLineBar
