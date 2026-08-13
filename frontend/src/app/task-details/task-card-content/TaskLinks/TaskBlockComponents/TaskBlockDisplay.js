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

import { Tooltip } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JurBlocked from '../../../../../assets/images/JurBlocked'
import JurBlocker from '../../../../../assets/images/JurBlocker'
import LightButton from '../../../../../components/inputs/light-button/LightButton'
import { TASK_STATUS } from '../../../../constants'
const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    marginRight: theme.spacing(12),
  },
  icon: {
    scale: '0.75',
    color: 'black',
  },
  button: {
    marginLeft: theme.spacing(1.75),
    width: '100%',
  },
}))

const TaskBlockDisplay = props => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <Tooltip
      title={
        props.viewOnly
          ? t('taskLinking.blockTipViewOnly')
          : t('taskLinking.blockTip')
      }
    >
      <div
        style={props.zeroStateDateLink ? {} : { marginTop: '16px' }}
        className={classes.wrapper}
      >
        {props.blocks > 0 && props.block > 0 && (
          <>
            <JurBlocked className={classes.icon} />
            <div className={classes.button}>
              <LightButton
                isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
                caption={t('taskLinking.blockBlocksDisplay', {
                  blocked: props.block,
                  blocks: props.blocks,
                  pluralBlock: props.block === 1 ? '' : 's',
                  pluralBlocks: props.blocks === 1 ? '' : 's',
                })}
                viewOnly={props.viewOnly}
                clickHandler={props.clickHandler}
                data-test={'add-blockers-button'}
              />
            </div>
          </>
        )}
        {props.blocks > 0 && props.block < 1 && (
          <>
            <JurBlocker className={classes.icon} />
            <div className={classes.button}>
              <LightButton
                isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
                caption={t('taskLinking.blocksDisplay', {
                  blocks: props.blocks,
                  plural: props.blocks === 1 ? '' : 's',
                })}
                viewOnly={props.viewOnly}
                clickHandler={props.clickHandler}
                data-test={'add-blockers-button'}
              ></LightButton>
            </div>
          </>
        )}
        {props.block > 0 && props.blocks < 1 && (
          <>
            <JurBlocked className={classes.icon} />
            <div className={classes.button}>
              <LightButton
                isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
                caption={t('taskLinking.blockDisplay', {
                  blocked: props.block,
                  plural: props.block === 1 ? '' : 's',
                })}
                viewOnly={props.viewOnly}
                clickHandler={props.clickHandler}
                data-test={'add-blockers-button'}
              ></LightButton>
            </div>
          </>
        )}
      </div>
    </Tooltip>
  )
}
export default TaskBlockDisplay
