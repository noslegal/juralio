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

import { mdiFileExcel } from '@mdi/js'
import { Button, SvgIcon } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React, { Fragment } from 'react'
import { CONFIG } from '../../../../app/constants'
import UseTemplateButton from '../../../../app/project/overview/items/UseTemplateButton'
import PublishToggle from '../../../../app/template/publish/PublishToggle'

export const getOverviewTitleText = (
  t,
  isMatterOverview,
  isTemplate,
  isSingleWorkstreamMatter
) => {
  if (isTemplate) return t('navigationLinks.templateOverview')
  return isMatterOverview || isSingleWorkstreamMatter
    ? t('navigationLinks.matterOverview')
    : t('navigationLinks.overview')
}

//handle 300 task count text 290-298 = tooltip1, 299 = tooltip2, 300 = tooltip3
export const getTooltipText = (t, taskCount) => {
  if (taskCount < CONFIG.PROJECT_TASK_LIMIT - 1) {
    return t('taskmapTaskAlert.tooltipP1', {
      tasks: CONFIG.PROJECT_TASK_LIMIT - taskCount,
    })
  } else if (taskCount === CONFIG.PROJECT_TASK_LIMIT - 1) {
    return t('taskmapTaskAlert.tooltipSingle')
  } else if (taskCount === CONFIG.PROJECT_TASK_LIMIT) {
    return t('taskmapTaskAlert.tooltipLimit')
  }
}

export const renderPublishToggle = (templateHasLoaded, classes) =>
  templateHasLoaded ? (
    <div className={classes.PublishToggle}>
      <PublishToggle />
    </div>
  ) : (
    <Skeleton>
      <div className={classes.PublishToggle}>
        <PublishToggle />
      </div>
    </Skeleton>
  )

export const renderUseTemplateButton = templateHasLoaded =>
  templateHasLoaded ? (
    <Fragment>
      <UseTemplateButton />
    </Fragment>
  ) : (
    <Skeleton>
      <UseTemplateButton />
    </Skeleton>
  )

export const fadeConfig = {
  enter: 1000,
  exit: 0,
}

export const renderDownloadButton = (
  t,
  classes,
  downloadProjectTaskListHandler
) => {
  return (
    <Button
      data-test="xlsx-download-button"
      className={classes.userOptionButton}
      startIcon={
        <SvgIcon className={classes.icon}>
          <path d={mdiFileExcel} />
        </SvgIcon>
      }
      onClick={downloadProjectTaskListHandler}
    >
      {t('common.download')}
    </Button>
  )
}
