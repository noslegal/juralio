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

import React from 'react'
import { makeStyles } from 'tss-react/mui'
import MinimisedMinimapSvg from '../../../assets/images/taskmap-minimised-minimap.svg'

const useStyles = makeStyles()(theme => ({
  inverted: {
    transform: 'rotate(180deg)',
  },

  minimisedMinimap: {
    margin: '8px',
    flex: 1,
    position: 'relative',
  },

  openedMinimap: {
    margin: '8px',
    flex: 1,
    position: 'relative',
  },
}))

const MinimapIcon = props => {
  const { classes } = useStyles()

  return (
    <div
      className={
        props.inverted ? classes.openedMinimap : classes.minimisedMinimap
      }
    >
      <img
        className={props.inverted && classes.inverted}
        src={MinimisedMinimapSvg}
        alt="minimised-minimap"
      />
    </div>
  )
}

export default MinimapIcon
