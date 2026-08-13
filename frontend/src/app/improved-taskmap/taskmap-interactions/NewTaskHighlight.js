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

import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
const styles = makeStyles()(theme => ({
  newHighlight: {
    border: `solid 2px ${juralioColours.taskMap.newTasksHighlight}`,
    borderRadius: '4px',
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: '1002',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.grey[100]
      ),
    },
  },
  newHighlightText: {
    color: juralioColours.taskMap.newTasksHighlight,
    backgroundColor: 'rgba(255,255,255,0.45)',
    position: 'absolute',
    right: '2px',
    bottom: '2px',
    borderRadius: '1px 0px',
    zIndex: '1001',
  },
}))
const NewTaskHighlight = props => {
  const { classes } = styles()
  const { t } = useTranslation()

  return (
    <div
      className={classes.newHighlight}
      onClick={props.onClick}
      data-test="newArea"
    >
      <div className={classes.newHighlightText}>
        <Typography>{t('common.new')}</Typography>
      </div>
      {props.children}
    </div>
  )
}
export default NewTaskHighlight
