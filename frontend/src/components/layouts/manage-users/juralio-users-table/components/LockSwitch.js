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

import Lock from '@mui/icons-material/Lock'
import LockOpen from '@mui/icons-material/LockOpen'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../../theme/juralio-colours'

const useStyles = makeStyles()(() => ({
  icon: {
    color: juralioColours.darkControl.backgroundSecondary,
    cursor: 'pointer',
  },
}))

const LockSwitch = props => {
  const { classes } = useStyles()
  const handleClick = e => {
    if (props.handleToggle) {
      props.handleToggle(!props.open)
    }
    e.stopPropagation()
  }
  return (
    <div data-test="lock-switch" onClick={handleClick}>
      {props.open ? (
        <LockOpen data-test="lock-switch-open" className={classes.icon} />
      ) : (
        <Lock data-test="lock-switch-closed" className={classes.icon} />
      )}
    </div>
  )
}

LockSwitch.propTypes = {
  open: PropTypes.bool.isRequired,
  handleToggle: PropTypes.func,
}

export default LockSwitch
