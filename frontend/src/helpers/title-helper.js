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

import store from '../store/configure-store'

export const updateTitle = () => {
  const reduxState = store.getState()
  switch (true) {
    case /\/matter\/.*\/post\//.test(window.location.href):
      setPostTitle(reduxState.selectedTaskPostList.postDetails.post)
      break
    case /\/template\/.*\/post\/.*/.test(window.location.href):
      setPostTitle(reduxState.templateTaskPostList.postDetails.post)
      break
    case /\/matter\/.*\/task\/[0-9]*/.test(window.location.href): //task details
      setTaskTitle(reduxState.selectedTask)
      break
    case /\/template\/.*\/task\/[0-9]*/.test(window.location.href): //task details
      setTaskTitle(reduxState.selectedTemplateTask)
      break
    case /\/home/.test(window.location.href): //home
      setHomeTitle()
      break
    case /\/matter\/[0-9]*\/overview/.test(window.location.href): //matter overview
      setMatterOverviewTitle(reduxState.matterDetails)
      break
    case /\/matteradmin\/[0-9]*/.test(window.location.href): //matter overview
      setMatterAdminTitle(reduxState.matterDetails)
      break
    case /\/matter\/[0-9]*\/taskList/.test(window.location.href): //tasklist
      setTasklistTitle(reduxState.matterDetails)
      break
    case /\/matter\/[0-9]*\/taskmap/.test(window.location.href): //matter taskmap
      setMatterTaskmapTitle(reduxState.matterDetails)
      break
    case /\/matter\/[0-9]*\/roadmap/.test(window.location.href): //matter roadmap
      setMatterRoadmapTitle(reduxState.matterDetails)
      break
    case /\/matter\/[0-9]*\/costs/.test(window.location.href): //matter roadmap
      setMatterCostsTitle(reduxState.matterDetails)
      break
    case /\/matter\/[0-9]*\/workstream\/[0-9]*\/overview/.test(
      window.location.href
    ): //workstream overview
      setWorkstreamOverviewTitle(reduxState.project.workstreamOverview)
      break
    case /\/matter\/[0-9]*\/workstream\/[0-9]*\/taskmap/.test(
      window.location.href
    ): //matter taskmap
      setWorkstreamTaskmapTitle(reduxState.project)
      break
    case /\/matter\/[0-9]*\/workstream\/[0-9]*\/roadmap/.test(
      window.location.href
    ): //matter roadmap
      setWorkstreamRoadmapTitle(reduxState.project)
      break
    case /\/matter\/[0-9]*\/workstream\/[0-9]*\/taskList/.test(
      window.location.href
    ): //matter tasklist
      setTasklistTitle(reduxState.project)
      break
    case /\/organisation\/.*$/.test(window.location.href):
      setOrganisationTitle(reduxState.organisation.selectedOrganisation)
      break
    case /\/organisation\/costs$/.test(window.location.href):
      setOrganisationCostsTitle(reduxState.organisation.selectedOrganisation)
      break
    case /\/organisations$/.test(window.location.href):
      setOrganisationsTitle()
      break
    case /\/templates/.test(window.location.href):
      setTemplatesTitle()
      break
    case /\/template\/[0-9]*\/overview/.test(window.location.href): //matter overview
      setTemplateOverviewTitle(reduxState.template.template)
      break
    case /\/template\/[0-9]*\/taskmap/.test(window.location.href): //matter taskmap
      setTemplateTaskmapTitle(reduxState.template.template)
      break
    case /\/login/.test(window.location.href):
      setLoginTitle()
      break

    default:
      setUnknownTitle()
      break
  }
}

const setTaskTitle = task => {
  if (!task.isLoaded) {
    setUnknownTitle()
    return
  }
  if (task.isMilestone) {
    document.title = `Milestone | ${task.name} | Juralio`
    return
  }
  document.title = `Task | ${task.name} | Juralio`
}

const setMatterOverviewTitle = matter => {
  if (!matter.isLoaded) {
    setUnknownTitle()
    return
  }
  document.title = `Overview | ${matter?.matter?.name} | Juralio`
}

const setMatterTaskmapTitle = matter => {
  if (!matter.isLoaded || !matter.matter) {
    setUnknownTitle()
    return
  }
  document.title = `Taskmap | ${matter.matter.name} | Juralio`
}

const setTasklistTitle = matter => {
  if (!matter.isLoaded || !matter.matter) {
    setUnknownTitle()
    return
  }
  //is it a workstream
  if (matter.name) {
    document.title = `Tasklist | ${matter.name} | Juralio`
  } else {
    document.title = `Tasklist | ${matter.matter.name} | Juralio`
  }
}

const setMatterAdminTitle = matter => {
  if (!matter.isLoaded) {
    setUnknownTitle()
    return
  }
  document.title = `Admin | ${matter.matter.name} | Juralio`
}

const setMatterRoadmapTitle = matter => {
  if (!matter.isLoaded || !matter.matter) {
    setUnknownTitle()
    return
  }
  document.title = `Roadmap | ${matter.matter.name} | Juralio`
}

const setMatterCostsTitle = matter => {
  if (!matter.isLoaded || !matter.matter) {
    setUnknownTitle()
    return
  }
  document.title = `Costs | ${matter.matter.name} | Juralio`
}

const setWorkstreamOverviewTitle = workstream => {
  if (!workstream) {
    setUnknownTitle()
    return
  }
  document.title = `Overview | ${workstream.name} | Juralio`
}

const setWorkstreamTaskmapTitle = workstream => {
  if (!workstream.isLoaded) {
    setUnknownTitle()
    return
  }
  document.title = `Taskmap | ${workstream.name} | Juralio`
}

const setWorkstreamRoadmapTitle = workstream => {
  if (!workstream.isLoaded) {
    setUnknownTitle()
    return
  }
  document.title = `Roadmap | ${workstream.name} | Juralio`
}

const setHomeTitle = () => {
  document.title = 'Home | Juralio'
}

const setUnknownTitle = () => {
  document.title = 'Juralio'
}

//organisations
const setOrganisationsTitle = () => {
  document.title = 'Organisations | Juralio'
}
//organisation
const setOrganisationTitle = organisation => {
  if (!organisation) {
    setUnknownTitle()
    return
  }
  document.title = `Organisation | ${organisation.name} | Juralio`
}
//organisation costs
const setOrganisationCostsTitle = organisation => {
  if (!organisation) {
    setUnknownTitle()
    return
  }
  document.title = `Costs | ${organisation.name} | Juralio`
}
//templates
const setTemplatesTitle = () => {
  document.title = 'Templates | Juralio'
}
//template overview
const setTemplateOverviewTitle = template => {
  if (!template.name) {
    setUnknownTitle()
    return
  }
  document.title = `Overview | ${template.name} | Juralio`
}
//template taskmap
const setTemplateTaskmapTitle = template => {
  if (!template.name) {
    setUnknownTitle()
    return
  }
  document.title = `Taskmap | ${template.name} | Juralio`
}
//Login
const setLoginTitle = () => {
  document.title = 'Login | Juralio'
}
//post
const setPostTitle = post => {
  if (!post) {
    setUnknownTitle()
    return
  }
  document.title = `Post | ${post.name} | Juralio`
}
//cant visit template tasks
