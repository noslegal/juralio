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
import SimpleChip from '../../../../components/data-display/simple-chip/SimpleChip'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    paddingLeft: theme.spacing(),
  },
}))

const NotificationCountChip = props => {
  const { classes } = useStyles()
  const { alert, label } = props
  const chipWidth = label?.length === 3 ? 20 : 14

  const chipOptions = {
    dataTest: 'notification-chip',
    backgroundColor: alert
      ? rawColours.notificationCount.primary
      : rawColours.notificationCount.secondary,
    color: juralioColours.whiteText.primary,
    minWidth: chipWidth,
    maxWidth: chipWidth,
    height: 14,
  }

  if (label.length === 0) {
    return null
  }

  return (
    <div className={classes.root}>
      <SimpleChip text={label} options={chipOptions} />
    </div>
  )
}

export default NotificationCountChip
