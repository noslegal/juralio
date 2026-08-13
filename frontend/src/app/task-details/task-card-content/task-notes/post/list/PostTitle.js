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
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../../../theme/juralio-colours'

const styles = theme => ({
  root: {
    padding: theme.spacing(),
    paddingLeft: theme.spacing(2),
  },
  title: {
    cursor: 'default',
    color: juralioColours.darkText.primary,
    fontWeight: theme.typography.fontWeightBold,
  },
})
const PostTitle = props => {
  const { t } = useTranslation()

  return (
    <div className={props.classes.root}>
      <Typography
        data-test="note-list-new-post-button"
        variant="h6"
        className={props.classes.title}
      >
        {props.isDeliverable
          ? t('entity.postsInThisDeliverable')
          : props.isMilestone
            ? t('entity.postsInThisMilestone')
            : t('entity.postsInThisTask')}
      </Typography>
    </div>
  )
}
export default withStyles(PostTitle, styles)
