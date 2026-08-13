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

import {
  getMatterOverviewUrl,
  getOrganisationAdminUrl,
  getTaskDetailsUrl,
  getWorkstreamTaskPostUrl,
} from '../../components/navigation/common/location-context-helper'

const navigationService = {
  goToTarget: (history, details) => {
    let url = ''
    if (details.postId) {
      url = getWorkstreamTaskPostUrl(
        details.matterId,
        details.projectId,
        details.taskId,
        details.postId
      )
    } else if (details.taskId) {
      url = getTaskDetailsUrl(
        details.matterId,
        details.projectId,
        details.taskId
      )
    } else if (details.projectId) {
    } else if (details.matterID) {
      // Upper case ID is deliberate.
      url = getMatterOverviewUrl(details.matterId)
    } else if (details.matterAdminId) {
      //will take you to the overview will go back to look at if you can go to matter admin
      url = getMatterOverviewUrl(details.matterAdminId)
      //url = getMatterAdminUrl(details.matterAdminId)
    } else if (details.deletedMatter) {
      url = getOrganisationAdminUrl()
    }

    // Fall back to home rather than navigating to an empty path (e.g.
    // RemovedFromMatter, where the user no longer has access to the matter, or
    // any event that resolves to no target) — an empty url is a dead click.
    history(url || '/home')
  },
}

export default navigationService
