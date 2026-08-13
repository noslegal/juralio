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

package com.juralio.template

import com.juralio.auth.AppUser
import com.juralio.auth.BaseAuthorisationService
import com.juralio.auth.UserRoleService
import com.juralio.post.Post
import com.juralio.post.dao.TemplateTaskPostsDAOService
import groovy.transform.CompileStatic
import org.hibernate.Hibernate

@CompileStatic
class TaskTemplateAuthorisationService extends BaseAuthorisationService {

    TemplateTaskPostsDAOService templateTaskPostsDAOService
    UserRoleService userRoleService

    boolean isTemplateVisible(Serializable templateId) {
        AppUser user = getUser()
        ProjectTemplate template = ProjectTemplate.get(templateId)
        // If the template is a draft and user is not knowledge manager
        if (template.isSystemTemplate && userRoleService.hasSystemTemplateManagerRole(user)) {
            return true
        }
        if (template.isSystemTemplate && template.published) {
            return true
        }
        if (template.isSystemTemplate && !template.published && !userRoleService.hasSystemTemplateManagerRole(user)) {
            return false
        }
        if (!template.published && !userRoleService.hasKnowledgeManagerRole(user)) {
            return false
        }
        return true
    }

    boolean isValidTaskParent(long entityId, long postId, long templateId) {
        TaskTemplate task = TaskTemplate.get(entityId)
        Post post = templateTaskPostsDAOService.getPost(postId)

        if (!isTemplateVisible(templateId)) return false
        if (!post) return false
        if (post in task.getPosts()) {
            return true
        } else {
            return false
        }
    }

    boolean isValidProjectParent(long entityId, long templateId) {
        TaskTemplate task = TaskTemplate.get(entityId)
        ProjectTemplate template = ProjectTemplate.get(templateId)

        if (!isTemplateVisible(templateId)) return false
        if (!task) return false
        if (task in template.getTasks().collect { Hibernate.unproxy(it) }) {
            return true
        } else {
            return false
        }
    }


    boolean hasReadAccess(long entityId, long templateId) {

        if (!isValidProjectParent(entityId, templateId)) return false
        AppUser user = getUser()
        TaskTemplate task = TaskTemplate.get(entityId)
        if (user.organisation && task.projectTemplate.organisation) {
            return user.organisation.id == task.projectTemplate.organisation.id
        } else {
            return (userRoleService.hasSystemTemplateManagerRole(user) && task.projectTemplate.isSystemTemplate) || (task.projectTemplate.isSystemTemplate && task.projectTemplate.published)
        }
    }

    boolean hasReadAccess(long entityId, long postId, long templateId) {
        if (!isValidTaskParent(entityId, postId, templateId)) return false
        AppUser user = getUser()
        TaskTemplate task = TaskTemplate.get(entityId)
        Post post = Post.get(postId)
        if (user.organisation && task.projectTemplate.organisation) {
            if (task.projectTemplate.published && !post.finalised && !userRoleService.hasKnowledgeManagerRole(user)) {
                return false
            }
            return user.organisation.id == task.projectTemplate.organisation.id
        } else {
            return task.projectTemplate.isSystemTemplate && (userRoleService.hasSystemTemplateManagerRole(user) || task.projectTemplate.published)
        }
    }

    boolean hasWriteAccess(long entityId, long templateId) {
        ProjectTemplate template = ProjectTemplate.get(templateId)
        if (template.isSystemTemplate && !userRoleService.hasSystemTemplateManagerRole(user)) {
            return false
        }
        if (!template.isSystemTemplate && !userRoleService.hasKnowledgeManagerRole(user)) {
            return false
        }
        return hasReadAccess(entityId, templateId) && (hasKnowledgeManagerRole() || hasSystemTemplateManagerRole())
    }

    boolean hasWriteAccess(long entityId, long postId, long templateId) {
        ProjectTemplate template = ProjectTemplate.get(templateId)
        if (template.isSystemTemplate && !userRoleService.hasSystemTemplateManagerRole(user)) {
            return false
        }
        if (!template.isSystemTemplate && !userRoleService.hasKnowledgeManagerRole(user)) {
            return false
        }
        return hasReadAccess(entityId, templateId) && (hasKnowledgeManagerRole() || hasSystemTemplateManagerRole())
    }

    boolean hasMoveAccess(long entityId, long templateId) {
        return hasWriteAccess(entityId, templateId)
    }

    boolean hasKnowledgeManagerRole() {
        AppUser user = getUser()
        return userRoleService.hasKnowledgeManagerRole(user)
    }

    boolean hasSystemTemplateManagerRole() {
        AppUser user = getUser()
        return userRoleService.hasSystemTemplateManagerRole(user)
    }
}
