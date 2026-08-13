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
import JurDeliverable from '../../assets/images/JurDeliverable'
import { Typography } from '@mui/material'
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'
import { makeStyles } from 'tss-react/mui'
import { t } from 'i18next'

const style = makeStyles()(theme => ({
  column: {
    backgroundColor: rawColours.primary.grey[100],
    padding: theme.spacing(2),
    borderRight: `solid 1px ${rawColours.primary.grey.main}`,
  },
  heading: {
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontWeight: 600,
    color: juralioColours.darkText.secondary,
    marginBottom: theme.spacing(1.5),
  },
  deliverableItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  deliverableIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  deliverableName: {
    color: juralioColours.darkText.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emptyText: {
    color: juralioColours.darkText.secondary,
    fontStyle: 'italic',
  },
}))

const AssumptionDeliverableList = props => {
  const { deliverables = [] } = props
  const { classes } = style()

  return (
    <div className={classes.column} data-test="deliverables-header">
      <Typography variant="caption" className={classes.heading}>
        {t('matterCosts.assumptions.deliverablesHeading')}
      </Typography>
      {deliverables.length > 0 ? (
        deliverables.map(d => (
          <div key={d.id} className={classes.deliverableItem}>
            <JurDeliverable
              scale={'0.7'}
              stroke={juralioColours.darkText.primary}
              className={classes.deliverableIcon}
            />
            <Typography variant="body2" className={classes.deliverableName}>
              {d.name}
            </Typography>
          </div>
        ))
      ) : (
        <Typography variant="caption" className={classes.emptyText}>
          {t('matterCosts.assumptions.deliverableCount', { count: 0 })}
        </Typography>
      )}
    </div>
  )
}
export default AssumptionDeliverableList
