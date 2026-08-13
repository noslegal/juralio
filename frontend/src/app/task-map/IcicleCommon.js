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

export const LOADING_SPINNER_SIZE = 200

const HALF_SPINNER_SIZE = Math.floor(LOADING_SPINNER_SIZE / 2)

export const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  mapWrapper: {
    flex: 1,
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(1),
      position: 'relative',
    },
  },
  loadingProgressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transition: 'height 500ms linear 0s',
    zIndex: theme.zIndex.modal,
  },
  loadingProgressCircle: {
    textAlign: 'center',
    marginLeft: `calc(50% - ${HALF_SPINNER_SIZE}px)`,
    marginTop: `calc(20% - ${HALF_SPINNER_SIZE}px)`,
  },
  buttonTray: {
    display: 'flex',
    zIndex: 10,
    position: 'absolute',
    top: theme.spacing(10.5),
    right: theme.spacing(4),
  },
  buttonTrayMobile: {
    top: 'auto',
    left: theme.spacing(4),
    bottom: theme.spacing(1),
  },
  buttonTrayButton: {
    marginLeft: theme.spacing(1),
    background: 'white',
    opacity: 0.8,
    paddingTop: 0,
    paddingBottom: 0,
    '&:hover': {
      opacity: 1,
      background: 'white',
    },
  },
})

export const OVERVIEW_HEIGHT_THRESHOLD = 25
export const MOBILE_OVERVIEW_HEIGHT_THRESHOLD = 50
