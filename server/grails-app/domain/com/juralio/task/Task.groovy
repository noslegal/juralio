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

package com.juralio.task

import com.juralio.auth.AppUser
import com.juralio.post.Post
import com.juralio.project.Project
import com.juralio.project.TaskCountsDTO
import com.juralio.task.follower.TaskFollower
import com.juralio.task.label.TaskLabel
import com.juralio.task.seenBy.TaskSeenBy
import com.juralio.task.status.TaskStatus
import com.juralio.task.team.TaskTeamMember
import grails.plugins.orm.auditable.Auditable
import java.time.LocalDate

class Task implements Auditable {
    public static final String NAME = "name"
    public static final String DATE_CREATED = "dateCreated"

    public static final int MAXIMUM_PROJECT_TASKS = 300
    public static final int MAXIMUM_PHASE_COUNT = 16
    public static final int MAXIMUM_SUBTASK_COUNT = 8
    public static final int MAXIMUM_TASK_LEVEL = 6
    public static final int LEVEL_A = 1
    public static final int LEVEL_F = 6

    Date dateCreated
    Date lastUpdated
    String name
    short level = 1
    String description
    List<Task> tasks
    String previousStatus
    String status
    Date plannedStartDate
    Date actualStartDate
    Date plannedEndDate
    Date actualEndDate
    boolean isParked = false
    String referenceNumber
    Date archivedDate
    AppUser archivedBy
    AppUser createdBy
    long taskParentWhenArchived
    def parent
    String restoreToProjectName
    String restoreToProjectId
    String restoreToParentName
    List<String> activities
    Boolean datesLinkedToSiblings = false
    def updateMeta = [:]
    Boolean isCurrentUserFollower = false
    Boolean isMilestone = false
    Boolean isDeliverable = false
    List<TaskBlocker> blockers
    Boolean isBlocked = false
    Boolean isBlocker = false
    TaskCountsDTO taskCounts
    List<Object> milestones
    Long listIdx = 0
    def postCount

    static hasMany = [
            tasks      : Task,
            posts      : Post,
            followers  : TaskFollower,
            teamMembers: TaskTeamMember,
            seenBy     : TaskSeenBy,
            labels     : TaskLabel,
            blockers   : TaskBlocker
    ]

    static belongsTo = [project: Project]

    static transients = ['milestones','taskCounts', 'activities', 'parent', 'restoreToProjectName', 'restoreToProjectId', 'restoreToParentName', 'updateMeta', 'isCurrentUserFollower','blockers', 'isBlocked', 'isBlocker','postCount']

    static mapping = {
        referenceNumber bindable: false, updateable: false
        teamMembers bindable: false, batchSize: 12, lazy: false
        followers bindable: false, batchSize: 12, lazy:false
        seenBy bindable: false, batchSize: 8, lazy: false
        tasks lazy: false
        posts lazy: false
        labels lazy: false
    }

    static constraints = {
        name nullable: false, blank: false, size: 1..70
        dateCreated bindable: false
        lastUpdated bindable: false
        level min: 1 as short
        description nullable: true, size: 0..2400
        plannedStartDate nullable: true
        previousStatus nullable: true, bindable: false
        isParked nullable: true, bindable: false
        referenceNumber nullable: true, bindable: false
        archivedDate nullable: true, bindable: false
        archivedBy nullable: true, bindable: false
        createdBy nullable: true, blank: true, bindable: false
        taskParentWhenArchived nullable: true
        seenBy nullable: true, blank: true, bindable: false
        datesLinkedToSiblings nullable: false, blank: false
        isMilestone blank: false
        listIdx nullable: true

        status validator: { status, task -> return TaskStatus.getAllValues().contains(status) }

        actualStartDate(nullable: true, validator:
                { actualStartDate, task ->
                    if (actualStartDate) {
                        return !actualStartDate.after(new Date())
                    }
                })
        plannedEndDate(nullable: true, validator:
                { plannedEndDate, task ->
                    if (plannedEndDate && task.plannedStartDate && !task.actualStartDate) {
                        return !plannedEndDate.before(task.plannedStartDate)
                    }
                })
        actualEndDate(nullable: true, validator:
                { actualEndDate, task ->
                    if (actualEndDate) {
                        if (actualEndDate.after(Date.from(LocalDate.now().atStartOfDay(java.time.ZoneId.systemDefault()).plusHours(23).plusMinutes(59).toInstant()))) {
                            return false
                        }
                        if (task.actualStartDate) {
                            return !actualEndDate.before(task.actualStartDate)
                        }
                    }
                })
    }
}
