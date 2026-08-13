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

import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import {
  cleanState,
  fetchMatters,
  startLazyLoading,
  stopLazyLoading,
} from '../matter-list/matter-list-actions'
import HomeLeftHandTabColumn from './HomeLeftHandTabColumn'
import HomeRightHandColumn from './HomeRightHandColumn'
import DesktopHomeZeroState from './zero-state/DesktopHomeZeroState'

const styles = theme => ({
  inboxContainer: {
    paddingTop: theme.spacing(3),
    overflow: 'hidden',
    flex: '1',
    flexDirection: 'column',
    display: 'flex',
  },
  inboxOverview: {
    flex: '2',
    marginTop: theme.spacing(3),
  },
})

const FIRST_LOAD = 4

const DesktopHomeLayout = () => {
  const dispatch = useDispatch()
  const matters = useSelector(state => state.matters)
  const [fullyLoaded, setFullyLoaded] = useState(false)
  const [startedLoading, setStartedLoading] = useState(false)
  const self = useRef(false)

  const fetchNextMatters = (startIndex = 0, endIndex = FIRST_LOAD) => {
    dispatch(fetchMatters(startIndex, endIndex)).then(res => {
      if (self.current && res && res.length > 0) {
        fetchNextMatters(endIndex, endIndex + FIRST_LOAD)
      } else {
        dispatch(stopLazyLoading())
        setFullyLoaded(true)
      }
    })
  }

  useEffect(() => {
    dispatch(cleanState())

    setStartedLoading(true)
    self.current = true
    dispatch(startLazyLoading())
    fetchNextMatters()
    return () => {
      dispatch(stopLazyLoading())
      self.current = false
    }
  }, []) //eslint-disable-line

  if (
    fullyLoaded &&
    matters.matters.filter(m => m.matterStatus === 'active').length === 0
  ) {
    return <DesktopHomeZeroState />
  }
  return (
    <>
      <HomeLeftHandTabColumn />
      <HomeRightHandColumn
        fullyLoaded={fullyLoaded}
        startedLoading={startedLoading}
      />
    </>
  )
}

export default withStyles(DesktopHomeLayout, styles)
