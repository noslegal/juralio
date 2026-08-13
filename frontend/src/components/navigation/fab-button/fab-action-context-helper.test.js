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
  checkActionsForSysAdmin,
  checkActionsForUsers,
} from './fab-action-context-helper'
import { FAB_CONTEXT } from '../../../app/constants'

const mockHomeLocation = { pathname: '/home' }
const mockTemplateLocation = { pathname: '/template' }
const mockTemplatesLocation = { pathname: '/template' }
const mockOrgAdminLocation = { pathname: '/organisation' }

describe('fab-action-context-helper', () => {
  describe('checkActionsForUsers - global actions', () => {
    it('should return false for sys admin action on Home Screen', () => {
      expect(
        checkActionsForUsers(FAB_CONTEXT.SYS_ADMIN_CONTEXT, mockHomeLocation)
      ).toEqual(false)
    })
    it('should return false for sys admin action on Template Screen', () => {
      expect(
        checkActionsForUsers(
          FAB_CONTEXT.SYS_ADMIN_CONTEXT,
          mockTemplateLocation
        )
      ).toEqual(false)
    })
  })

  describe('checkActionsForUsers - global actions', () => {
    it('should return true for global action on Home Screen', () => {
      expect(
        checkActionsForUsers(FAB_CONTEXT.GLOBAL_CONTEXT, mockHomeLocation)
      ).toEqual(true)
    })

    it('should return true for global action on Template Screen', () => {
      expect(
        checkActionsForUsers(FAB_CONTEXT.GLOBAL_CONTEXT, mockTemplateLocation)
      ).toEqual(true)
    })
  })

  describe('checkActionsForUsers - template actions', () => {
    it('should return true for template action on Home Screen', () => {
      expect(
        checkActionsForUsers(FAB_CONTEXT.TEMPLATE_CONTEXT, mockTemplateLocation)
      ).toEqual(false)
    })

    it('should return true for template list action on Template Screen', () => {
      expect(
        checkActionsForUsers(
          FAB_CONTEXT.TEMPLATE_LIST_CONTEXT,
          mockTemplateLocation
        )
      ).toEqual(false)
    })
  })

  describe('checkActionsForUsers - templates actions', () => {
    it('should return true for templates action on Templates Screen', () => {
      expect(
        checkActionsForUsers(
          FAB_CONTEXT.TEMPLATE_CONTEXT,
          mockTemplatesLocation
        )
      ).toEqual(false)
    })

    it('should return false for templates list action on Template Screen', () => {
      expect(
        checkActionsForUsers(
          FAB_CONTEXT.TEMPLATE_LIST_CONTEXT,
          mockTemplatesLocation
        )
      ).toEqual(false)
    })
  })

  describe('checkActionsForUsers - org admin actions', () => {
    it('should return true for templates action on Templates Screen', () => {
      expect(
        checkActionsForUsers(
          FAB_CONTEXT.ORG_ADMIN_CONTEXT,
          mockOrgAdminLocation
        )
      ).toEqual(true)
    })

    it('should return false for org admin action on Template Screen', () => {
      expect(
        checkActionsForUsers(
          FAB_CONTEXT.ORG_ADMIN_CONTEXT,
          mockTemplatesLocation
        )
      ).toEqual(false)
    })
  })

  describe('checkActionsForSysAdmin - all contexts', () => {
    it('should return true', () => {
      expect(checkActionsForSysAdmin(FAB_CONTEXT.SYS_ADMIN_CONTEXT)).toEqual(
        true
      )
    })

    it('should return false for all other contexts', () => {
      expect(checkActionsForSysAdmin(FAB_CONTEXT.GLOBAL_CONTEXT)).toEqual(false)
      expect(checkActionsForSysAdmin(FAB_CONTEXT.ORG_ADMIN_CONTEXT)).toEqual(
        false
      )
      expect(checkActionsForSysAdmin(FAB_CONTEXT.PROJECT_CONTEXT)).toEqual(
        false
      )
      expect(checkActionsForSysAdmin(FAB_CONTEXT.TEMPLATE_CONTEXT)).toEqual(
        false
      )
      expect(
        checkActionsForSysAdmin(FAB_CONTEXT.TEMPLATE_LIST_CONTEXT)
      ).toEqual(false)
    })
  })
})
