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

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Tour from 'reactour'
import { clearTour, setAvailableTours } from './tour-actions'
import tourService from './tour-service'

const TourContainer = () => {
  const tour = useSelector(state => state.tour)
  const dispatch = useDispatch()
  const showTour = tour.currentTour !== undefined
  useEffect(() => {
    tourService.getTours().then(res => {
      if (res.status === 200) {
        dispatch(setAvailableTours(res.body))
      }
    })
  }, []) // eslint-disable-line

  return showTour ? (
    <React.Fragment>
      {tour.showMask && (
        <Tour
          steps={tour.steps}
          isOpen={true}
          onRequestClose={e => {
            e && e.stopPropagation()
            tourService.hideForSession(tour.currentTour)
            dispatch(clearTour())
            tourService.getTours().then(res => {
              if (res.status === 200) {
                dispatch(setAvailableTours(res.body))
              }
            })
          }}
          showNumber={false}
          showButtons={false}
          disableFocusLock={true}
          showNavigation={false}
          data-test="close-tour"
          goToStep={tour.step}
          showCloseButton={false}
        />
      )}
      {!tour.showMask && (
        <Tour
          steps={tour.steps}
          isOpen={true}
          onRequestClose={e => {
            e && e.stopPropagation()
            tourService.hideForSession(tour.currentTour)
            dispatch(clearTour())
            tourService.getTours().then(res => {
              if (res.status === 200) {
                dispatch(setAvailableTours(res.body))
              }
            })
          }}
          disableKeyboardNavigation={true}
          showNumber={false}
          maskClassName={'no-mask'}
          showButtons={false}
          disableFocusLock={true}
          showNavigation={false}
          data-test="close-tour"
          goToStep={tour.step}
        />
      )}
    </React.Fragment>
  ) : null
}
export default TourContainer
