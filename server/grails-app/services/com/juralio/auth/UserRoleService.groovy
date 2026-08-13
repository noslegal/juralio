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

package com.juralio.auth

import grails.gorm.transactions.Transactional

@Transactional
class UserRoleService {

    UserRole assignRoleToUser(AppUser user, Role role) {
        if (!UserRole.exists(user.id, role.id)) {
            UserRole.create(user, role)
        }
    }

    boolean removeRoleFromUser(AppUser user, Role role) {
        if (UserRole.exists(user.id, role.id)) {
            UserRole.remove(user, role)
        }
    }

    boolean hasSysadminRole(AppUser user) {
        Role sysadminRole = Role.findByAuthority(Roles.SYSADMIN.code())
        return user && sysadminRole && UserRole.exists(user.id, sysadminRole.id)
    }

    boolean hasOrgAdminRole(AppUser user) {
        Role orgAdminRole = Role.findByAuthority(Roles.ORG_ADMIN.code())
        return user && orgAdminRole && UserRole.exists(user.id, orgAdminRole.id)
    }

    boolean hasMatterCreatorRole(AppUser user) {
        Role matterCreator = Role.findByAuthority(Roles.MATTER_CREATOR.code())
        return user && matterCreator && UserRole.exists(user.id, matterCreator.id)
    }

    boolean hasKnowledgeManagerRole(AppUser user) {
        Role knowledgeManager = Role.findByAuthority(Roles.KNOWLEDGE_MANAGER.code())
        return user && knowledgeManager && UserRole.exists(user.id, knowledgeManager.id)
    }

    boolean hasOrgOwnerRole(AppUser user) {
        Role orgOwner = Role.findByAuthority(Roles.ORG_OWNER.code())
        return user && orgOwner && UserRole.exists(user.id, orgOwner.id)
    }

    boolean hasSystemTemplateManagerRole(AppUser user) {
        Role systemTemplateManager = Role.findByAuthority(Roles.SYSTEM_TEMPLATE_MANAGER.code())
        return user && systemTemplateManager && UserRole.exists(user.id, systemTemplateManager.id)
    }

    List<String> getAuthoritiesByUser(AppUser user) {
        List<UserRole> userRoles = UserRole.findAllByUser(user)
        List<String> authorities = []
        userRoles.each { UserRole userRole ->
            authorities.add(userRole.role.authority)
        }
        return authorities
    }
}
