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
import NoPermission from '../../components/data-display/no-permission/NoPermission'
import { DesktopIcicleContainer } from '../../components/icicle'
import { TASK_MAP_VIEW_MODE_ENUM } from '../constants'
import { OVERVIEW_HEIGHT_THRESHOLD } from './IcicleCommon'

export const INTERACTIVE_MIN_CELL_HEIGHT = 90
export const HEIGHT_OFFSET = 36

export const COMPACT_INTERACTIVE_MIN_CELL_HEIGHT = 40

export const getContent = (props, redirectToTaskDetails, styles) => {
  const { t, project } = props
  if (props.isForbidden)
    return (
      <NoPermission
        text={t('taskmapZeroState.permissionToAccessProjectDenied')}
      />
    )

  if (!props.project.active && props.project.isLoaded) {
    return (
      <NoPermission
        data-test="workstream-closed"
        text={t('taskmapZeroState.workstreamClosed')}
      />
    )
  }

  return (
    <React.Fragment>
      <div className={props.classes.mapWrapper}>
        <div
          style={{
            height: `calc(100% - ${HEIGHT_OFFSET}px)`,
            marginTop: `${HEIGHT_OFFSET}px`,
          }}
        >
          <DesktopIcicleContainer
            viewOnly={props.viewOnly}
            selectionMode={props.selectionMode}
            highlightedTaskList={props.highlightedTaskList}
            updateNameHandler={props.updateNameHandler}
            confirmStatusChangeHandler={props.confirmStatusChangeHandler}
            createNewTaskHandler={props.createNewTaskHandler}
            data={project}
            childrenPropertyName="tasks"
            parentPropertyName="referenceNumber"
            interactiveProps={{
              minCellHeight:
                props.detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT
                  ? COMPACT_INTERACTIVE_MIN_CELL_HEIGHT
                  : INTERACTIVE_MIN_CELL_HEIGHT,
              fixedCellWidth: 450,
              id: props.id,
            }}
            interactiveMode={props.interactiveMode}
            cellClickHandler={redirectToTaskDetails}
            overviewHeightThreshold={OVERVIEW_HEIGHT_THRESHOLD}
            isMatterAdmin={props.isMatterAdmin}
            reorderTaskHandler={props.reorderTaskHandler}
            handleTaskMove={props.handleTaskMove}
            getTaskDetails={props.getTaskDetails}
            getLatestPost={props.getLatestPost}
            dismissNewTasks={props.dismissNewTasks}
            moveTargets={props.moveTargets}
            moveTaskToNewParent={props.moveTaskToNewParent}
            selectedItem={props.selectedItem}
            recentlyMovedTasks={props.recentlyMovedTasks}
            newTasks={props.newTasks}
            styles={styles}
            matterId={props.matterId}
            doneTasksToShow={props.doneTasksToShow}
            filteredLabels={props.filteredLabels}
            detailedView={props.detailedView}
            externalUser={props.externalUser}
          />
        </div>
        {/* <Hidden mdUp>
          <MobileIcicleContainer
            data={project}
            childrenPropertyName="tasks"
            parentPropertyName="referenceNumber"
            id={props.id}
            cellClickHandler={redirectToTaskDetails}
            overviewHeightThreshold={MOBILE_OVERVIEW_HEIGHT_THRESHOLD}
            matterId={props.matterId}
            filteredLabels={props.filteredLabels}
          />
        </Hidden> */}
      </div>
    </React.Fragment>
  )
}
