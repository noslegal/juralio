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
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import MatterMasonryContainer from './matter-masonry/MatterMasonryContainer'

const HomeRightHandColumn = props => {
  const matters = useSelector(state => state.matters)

  const { classes } = makeStyles()(theme => ({
    wrapper: {
      marginLeft: theme.spacing(2),
      width: `calc(100% - ${theme.spacing(60)})`,
    },
    mobileWrapper: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }))()

  return (
    <div
      className={props.isMobile ? classes.mobileWrapper : classes.wrapper}
      data-test="home-right-hand-column]"
    >
      <MatterMasonryContainer
        fullyLoaded={props.fullyLoaded}
        matters={
          matters.matters
            ? matters.matters.filter(m => m.matterStatus === 'active')
            : null
        }
        startedLoading={props.startedLoading}
      />
    </div>
  )
}

export default HomeRightHandColumn
