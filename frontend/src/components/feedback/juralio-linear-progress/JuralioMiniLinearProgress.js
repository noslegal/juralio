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

import LinearProgress from '@mui/material/LinearProgress'
import PropTypes from 'prop-types'
import React, { useState } from 'react'

const MINIMUM_PROGRESS_DISPLAY_TIME = 3000
const progressBarLoadedStyle = { height: 0 }

const JuralioMiniLinearProgress = props => {
  const { show, height } = props
  const progressBarLoadingStyle = { height }
  const [progressBarStyle, setProgressBarStyle] = useState(
    progressBarLoadedStyle
  )
  const isHidden = progressBarStyle.height === 0

  if (show && isHidden) {
    setProgressBarStyle(progressBarLoadingStyle)
  } else {
    setTimeout(() => {
      setProgressBarStyle(progressBarLoadedStyle)
    }, MINIMUM_PROGRESS_DISPLAY_TIME)
  }

  return (
    <>
      <LinearProgress style={progressBarStyle} />
      <div style={{ maxHeight: isHidden ? height : 0 }}>&nbsp;</div>
    </>
  )
}

JuralioMiniLinearProgress.propTypes = {
  show: PropTypes.bool.isRequired,
  height: PropTypes.number,
}

export default JuralioMiniLinearProgress
