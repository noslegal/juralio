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

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setupExperimentalSettings } from '../app/experimental/experimental-actions'
import experimentalServices from '../services/experimental/experimental-services'

export default function useExperimentalSettings() {
  const experimentalOptions = useSelector(state => state.experimental)
  const [loaded, setLoaded] = useState(false)
  const dispatch = useDispatch()
  useEffect(() => {
    if (Object.keys(experimentalOptions).length === 0) {
      experimentalServices.getExperimentalConfig().then(response => {
        dispatch(setupExperimentalSettings(response))
        setLoaded(true)
      })
    } else {
      setLoaded(true)
    }
  }, [experimentalOptions]) //eslint-disable-line

  return { options: experimentalOptions, loaded: loaded }
}
