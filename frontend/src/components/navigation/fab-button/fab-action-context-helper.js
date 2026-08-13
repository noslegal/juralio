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
  isInAnyTemplateContext,
  isInTemplateListContext,
  isInOrganisationContext,
  isInMatterAdmin,
  validLocationForTaskFromTemplate,
} from '../common/location-context-helper'

import { FAB_CONTEXT } from '../../../app/constants'

export const checkActionsForSysAdmin = context =>
  context === FAB_CONTEXT.SYS_ADMIN_CONTEXT ? true : false

export const checkActionsForUsers = (context, location) => {
  if (
    context === FAB_CONTEXT.TEMPLATE_CONTEXT ||
    context === FAB_CONTEXT.TEMPLATE_LIST_CONTEXT
  )
    return false

  if (context === FAB_CONTEXT.SYS_ADMIN_CONTEXT) return false
  if (
    context === FAB_CONTEXT.TASK_FROM_TEMPLATE_CONTEXT &&
    !validLocationForTaskFromTemplate(location)
  ) {
    return false
  }
  if (
    (context === FAB_CONTEXT.TEMPLATE_CONTEXT &&
      !isInAnyTemplateContext(location)) ||
    (context === FAB_CONTEXT.PROJECT_CONTEXT &&
      isInAnyTemplateContext(location))
  )
    return false

  if (
    context === FAB_CONTEXT.TEMPLATE_LIST_CONTEXT &&
    !isInTemplateListContext(location)
  )
    return false

  if (
    (context === FAB_CONTEXT.ORG_ADMIN_CONTEXT &&
      !isInOrganisationContext(location)) ||
    (context !== FAB_CONTEXT.ORG_ADMIN_CONTEXT &&
      isInOrganisationContext(location))
  )
    return false
  if (
    context === FAB_CONTEXT.MATTER_ADMIN_CONTEXT &&
    !isInMatterAdmin(location)
  )
    return false

  if (context === FAB_CONTEXT.POST_CONTEXT) {
    return false
  }
  if (
    context === FAB_CONTEXT.GLOBAL_CONTEXT &&
    validLocationForTaskFromTemplate(location)
  ) {
    return false
  }
  // Default to showing action.
  return true
}

export const checkActionsForKnowledgeManagers = (context, location) => {
  if (context === FAB_CONTEXT.SYS_ADMIN_CONTEXT) return false
  if (
    (context === FAB_CONTEXT.TEMPLATE_CONTEXT &&
      !isInAnyTemplateContext(location)) ||
    (context === FAB_CONTEXT.PROJECT_CONTEXT &&
      isInAnyTemplateContext(location))
  )
    return false

  if (
    context === FAB_CONTEXT.TASK_FROM_TEMPLATE_CONTEXT &&
    !validLocationForTaskFromTemplate(location)
  ) {
    return false
  }

  if (
    context === FAB_CONTEXT.TEMPLATE_LIST_CONTEXT &&
    !isInTemplateListContext(location)
  )
    return false

  if (
    (context === FAB_CONTEXT.ORG_ADMIN_CONTEXT &&
      !isInOrganisationContext(location)) ||
    (context !== FAB_CONTEXT.ORG_ADMIN_CONTEXT &&
      isInOrganisationContext(location))
  )
    return false
  if (
    context === FAB_CONTEXT.MATTER_ADMIN_CONTEXT &&
    !isInMatterAdmin(location)
  )
    return false
  if (context === FAB_CONTEXT.POST_CONTEXT) {
    return false
  }
  if (
    context === FAB_CONTEXT.GLOBAL_CONTEXT &&
    validLocationForTaskFromTemplate(location)
  ) {
    return false
  }
  // Default to showing action.
  return true
}
