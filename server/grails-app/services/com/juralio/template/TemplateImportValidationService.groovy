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

import com.juralio.post.PostHelperService
import org.jsoup.Jsoup

class TemplateImportValidationService {

    static transactional = false

    PostHelperService postHelperService

    static final int SUPPORTED_SCHEMA_VERSION = 1
    static final int MAX_TASKS = 300
    static final int MAX_TASK_DEPTH = 6
    static final int MAX_SUBTASKS_PER_TASK = 8
    static final int MAX_PHASES = 16
    static final int MAX_RESOURCES = 50
    static final int MAX_NAME_LENGTH = 70
    static final int MAX_POST_NAME_LENGTH = 50
    // Description limits mirror the frontend rich-text editors, which count
    // visible characters rather than the raw HTML stored in the database.
    static final int MAX_DESCRIPTION_LENGTH = 500
    static final int MAX_POST_CONTENT_LENGTH = 1000
    static final int MAX_URL_LENGTH = 2000
    static final List<String> URL_POST_TYPES = ['Document Link', 'Web Link']
    static final String MEETING_POST_TYPE = 'Meeting'

    ValidationResult validate(Map templateDocument) {
        if (!templateDocument) {
            return ValidationResult.fail('INVALID_PAYLOAD', 'Template document is empty')
        }

        if (!(templateDocument.metadata instanceof Map)) {
            return ValidationResult.fail('SCHEMA_VERSION_MISMATCH', "Unsupported schema version. Expected version ${SUPPORTED_SCHEMA_VERSION}.")
        }
        Map metadata = templateDocument.metadata as Map
        if (!(metadata.schemaVersion instanceof Number) || (metadata.schemaVersion as Integer) != SUPPORTED_SCHEMA_VERSION) {
            return ValidationResult.fail('SCHEMA_VERSION_MISMATCH', "Unsupported schema version. Expected version ${SUPPORTED_SCHEMA_VERSION}.")
        }

        String name = templateDocument.name as String
        if (!name || name.trim().isEmpty()) {
            return ValidationResult.fail('MISSING_NAME', 'Template name is required')
        }
        if (name.length() > MAX_NAME_LENGTH) {
            return ValidationResult.fail('NAME_TOO_LONG', "Template name must be ${MAX_NAME_LENGTH} characters or fewer")
        }

        String description = templateDocument.description as String
        if (description && visibleLength(description) > MAX_DESCRIPTION_LENGTH) {
            return ValidationResult.fail('DESCRIPTION_TOO_LONG', 'Template description is too long')
        }

        if (templateDocument.tasks) {
            if (!(templateDocument.tasks instanceof List)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Tasks must be a list')
            }
            List tasks = templateDocument.tasks as List

            if (tasks.size() > MAX_PHASES) {
                return ValidationResult.fail('TOO_MANY_PHASES', "Template exceeds maximum phase count of ${MAX_PHASES}")
            }

            int totalCount = countTasks(tasks)
            if (totalCount > MAX_TASKS) {
                return ValidationResult.fail('TASK_COUNT_EXCEEDED', "Template exceeds maximum task count of ${MAX_TASKS}")
            }

            int depth = maxDepth(tasks)
            if (depth > MAX_TASK_DEPTH) {
                return ValidationResult.fail('TASK_NESTING_TOO_DEEP', "Task nesting exceeds maximum depth of ${MAX_TASK_DEPTH}")
            }

            ValidationResult taskResult = validateTaskNodes(tasks, true)
            if (!taskResult.valid) return taskResult
        }

        if (templateDocument.resources) {
            if (!(templateDocument.resources instanceof List)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Resources must be a list')
            }
            List resources = templateDocument.resources as List
            if (resources.size() > MAX_RESOURCES) {
                return ValidationResult.fail('TOO_MANY_RESOURCES', "Template exceeds maximum resource count of ${MAX_RESOURCES}")
            }
            ValidationResult resourceResult = validateResources(resources)
            if (!resourceResult.valid) return resourceResult
        }

        return ValidationResult.ok()
    }

    private int visibleLength(String html) {
        if (!html) return 0
        return Jsoup.parse(html).text().length()
    }

    private int countTasks(List tasks) {
        int count = tasks.size()
        tasks.each { task ->
            if (task instanceof Map && task.tasks instanceof List) {
                count += countTasks(task.tasks as List)
            }
        }
        return count
    }

    private int maxDepth(List tasks, int currentDepth = 1) {
        int depth = currentDepth
        tasks.each { task ->
            if (task instanceof Map && task.tasks instanceof List) {
                depth = Math.max(depth, maxDepth(task.tasks as List, currentDepth + 1))
            }
        }
        return depth
    }

    private ValidationResult validateTaskNodes(List tasks, boolean isPhaseLevel = false) {
        for (task in tasks) {
            if (task == null || !(task instanceof Map)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Invalid task entry in task list')
            }
            Map taskMap = task as Map

            String taskName = taskMap.name as String
            if (!taskName || taskName.trim().isEmpty()) {
                return ValidationResult.fail('TASK_MISSING_NAME', 'All tasks must have a name')
            }
            if (taskName.length() > MAX_NAME_LENGTH) {
                return ValidationResult.fail('TASK_NAME_TOO_LONG', "Task name must be ${MAX_NAME_LENGTH} characters or fewer")
            }

            String taskDesc = taskMap.description as String
            if (taskDesc && visibleLength(taskDesc) > MAX_DESCRIPTION_LENGTH) {
                return ValidationResult.fail('TASK_DESCRIPTION_TOO_LONG', 'A task description is too long')
            }

            def rawMilestone = taskMap.isMilestone
            if (rawMilestone != null && !(rawMilestone instanceof Boolean)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Task isMilestone must be a boolean')
            }
            def rawDeliverable = taskMap.isDeliverable
            if (rawDeliverable != null && !(rawDeliverable instanceof Boolean)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Task isDeliverable must be a boolean')
            }
            boolean isMilestone = rawMilestone == true
            boolean isDeliverable = rawDeliverable == true

            if (isPhaseLevel && isMilestone) {
                return ValidationResult.fail('INVALID_PHASE_TYPE', 'Milestones cannot be top-level phases')
            }

            if (isPhaseLevel && isDeliverable) {
                return ValidationResult.fail('INVALID_PHASE_TYPE', 'Deliverables cannot be top-level phases')
            }

            if (isMilestone && isDeliverable) {
                return ValidationResult.fail('MILESTONE_IS_DELIVERABLE', 'A task cannot be both a milestone and a deliverable')
            }

            if (taskMap.tasks != null && !(taskMap.tasks instanceof List)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Task subtasks must be a list')
            }
            List subtasks = taskMap.tasks as List

            if (isMilestone && subtasks) {
                return ValidationResult.fail('MILESTONE_HAS_SUBTASKS', 'Milestone tasks cannot have subtasks')
            }

            if (subtasks) {
                if (subtasks.size() > MAX_SUBTASKS_PER_TASK) {
                    return ValidationResult.fail('TOO_MANY_SUBTASKS', "A task cannot have more than ${MAX_SUBTASKS_PER_TASK} subtasks")
                }
                ValidationResult childResult = validateTaskNodes(subtasks, false)
                if (!childResult.valid) return childResult
            }

            if (taskMap.posts != null && !(taskMap.posts instanceof List)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Task posts must be a list')
            }
            List posts = taskMap.posts as List
            if (posts) {
                ValidationResult postResult = validatePosts(posts)
                if (!postResult.valid) return postResult
            }
        }
        return ValidationResult.ok()
    }

    private ValidationResult validatePosts(List posts) {
        for (post in posts) {
            if (post == null || !(post instanceof Map)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Invalid entry in posts list')
            }
            Map postMap = post as Map

            String postName = postMap.name as String
            if (!postName || postName.trim().isEmpty()) {
                return ValidationResult.fail('POST_MISSING_NAME', 'All posts must have a name')
            }
            if (postName.length() > MAX_POST_NAME_LENGTH) {
                return ValidationResult.fail('POST_NAME_TOO_LONG', "Post name must be ${MAX_POST_NAME_LENGTH} characters or fewer")
            }

            String postDesc = postMap.description as String
            if (postDesc && visibleLength(postDesc) > MAX_POST_CONTENT_LENGTH) {
                return ValidationResult.fail('POST_DESCRIPTION_TOO_LONG', 'A post description is too long')
            }

            String postUrl = postMap.url as String
            if (postUrl && postUrl.length() > MAX_URL_LENGTH) {
                return ValidationResult.fail('POST_URL_TOO_LONG', 'A post URL is too long')
            }
            if (postUrl && !postHelperService.isValidPostLinkURL(postUrl)) {
                return ValidationResult.fail('INVALID_POST_URL', 'Post URL is not a valid URL')
            }

            def rawType = postMap.type
            if (rawType != null && !(rawType instanceof String)) {
                return ValidationResult.fail('INVALID_POST_TYPE', 'Post type must be a string')
            }
            String postType = rawType as String
            if (postUrl) {
                if (!postType || !URL_POST_TYPES.contains(postType)) {
                    return ValidationResult.fail('INVALID_POST_TYPE', "Post type must be one of: ${URL_POST_TYPES.join(', ')} when a URL is provided")
                }
            } else if (postType && postType != MEETING_POST_TYPE) {
                return ValidationResult.fail('INVALID_POST_TYPE', "Post type must be null or '${MEETING_POST_TYPE}' when no URL is provided")
            }

            def rawPrivate = postMap.privatePost
            if (rawPrivate != null && !(rawPrivate instanceof Boolean)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Post privatePost must be a boolean')
            }

            def rawFinalised = postMap.finalised
            if (rawFinalised != null && !(rawFinalised instanceof Boolean)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Post finalised must be a boolean')
            }

            String startTime = postMap.startTime as String
            String endTime = postMap.endTime as String
            if ((startTime || endTime) && postType != MEETING_POST_TYPE) {
                return ValidationResult.fail('INVALID_POST_TIME', 'Start and end times are only valid for Meeting posts')
            }
            if (postType == MEETING_POST_TYPE && (startTime || endTime)) {
                Date parsedStart = null
                Date parsedEnd = null
                try {
                    if (startTime) parsedStart = Date.parse("yyyy-MM-dd'T'HH:mm:ss'Z'", startTime)
                } catch (Exception ignored) {
                    return ValidationResult.fail('INVALID_POST_TIME', 'Post startTime must be a valid ISO 8601 date')
                }
                try {
                    if (endTime) parsedEnd = Date.parse("yyyy-MM-dd'T'HH:mm:ss'Z'", endTime)
                } catch (Exception ignored) {
                    return ValidationResult.fail('INVALID_POST_TIME', 'Post endTime must be a valid ISO 8601 date')
                }
                if (parsedStart && parsedEnd && !parsedEnd.after(parsedStart)) {
                    return ValidationResult.fail('INVALID_POST_TIME', 'Post endTime must be after startTime')
                }
            }
        }
        return ValidationResult.ok()
    }

    private ValidationResult validateResources(List resources) {
        for (resource in resources) {
            if (resource == null || !(resource instanceof Map)) {
                return ValidationResult.fail('INVALID_PAYLOAD', 'Invalid entry in resources list')
            }
            Map resourceMap = resource as Map

            String resourceName = resourceMap.name as String
            if (!resourceName || resourceName.trim().isEmpty()) {
                return ValidationResult.fail('RESOURCE_MISSING_NAME', 'All resources must have a name')
            }
            if (resourceName.length() > MAX_NAME_LENGTH) {
                return ValidationResult.fail('RESOURCE_NAME_TOO_LONG', "Resource name must be ${MAX_NAME_LENGTH} characters or fewer")
            }

            String resourceUrl = resourceMap.url as String
            if (resourceUrl && resourceUrl.length() > MAX_URL_LENGTH) {
                return ValidationResult.fail('RESOURCE_URL_TOO_LONG', 'A resource URL is too long')
            }
        }
        return ValidationResult.ok()
    }
}
