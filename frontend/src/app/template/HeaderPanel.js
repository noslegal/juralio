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
import juralioColours from '../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    height: theme.spacing(9),
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: theme.zIndex.appBar,
    backgroundColor: juralioColours.taskMap.snackbarBackground,
    boxShadow: `0px 2px 2px 0px ${juralioColours.move.shadow}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

const HeaderPanel = props => {
  const { classes } = useStyles()

  return <div className={classes.root}>{props.children}</div>
}

export default HeaderPanel
