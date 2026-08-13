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

package com.juralio.post

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.post.authors.PostAuthor
import com.juralio.post.members.PostMember
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.template.TaskTemplate
import grails.plugins.orm.auditable.Auditable

class Post implements Auditable {

    String name
    String type
    String url = null
    String description
    Date dateCreated
    Date lastUpdated
    AppUser creator
    AppUser finalisedBy = null
    String referenceNumber
    Date startTime = null
    Date endTime = null

    Date archivedDate
    AppUser archivedBy
    Matter matterWhenArchived
    Project projectWhenArchived
    Long taskWhenArchivedId // Making this a Task makes Grail init this on Post creation which we DON'T want.

    boolean privatePost = false

    boolean finalised = false

    static hasMany = [
            authors: PostAuthor,
            members: PostMember
    ]

    static mapping = {
        referenceNumber updateable: false
        authors lazy: false, cascade: "all,delete-orphan"
        members lazy: false, cascade: "all,delete-orphan"

    }

    Task task
    TaskTemplate taskTemplate

    static transients = ['task', 'taskTemplate']

    static constraints = {
        name nullable: false, blank: false, size: 1..50
        dateCreated bindable: false
        lastUpdated bindable: false
        type nullable: true, size: 1..50
        url nullable: true, size: 0..30000
        description nullable: true, size: 0..30000
        creator nullable: false, bindable: false
        finalisedBy nullable: true, bindable: false
        privatePost nullable: false
        finalised nullable: false
        referenceNumber nullable: true, bindable: false
        startTime nullable: true
        endTime nullable: true
        archivedDate nullable: true, bindable: false
        archivedBy nullable: true, bindable: false
        matterWhenArchived nullable: true, bindable: false
        projectWhenArchived nullable: true, bindable: false
        taskWhenArchivedId nullable: true, bindable: false
    }
}
