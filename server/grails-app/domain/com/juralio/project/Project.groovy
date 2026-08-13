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

package com.juralio.project

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.task.Task
import com.juralio.template.ProjectTemplate
import com.juralio.template.TaskTemplate
import grails.plugins.orm.auditable.Auditable
import server.PrivateWorkstreamMember

class Project implements Auditable {
    public static final int MAXIMUM_POSTS = 500
    public static final NAME = "name"

    String name
    String description
    List tasks
    Date creationDate = new Date()
    Date closedDate
    AppUser creator
    AppUser closer
    Integer creation_type
    ProjectTemplate template
    TaskTemplate template_task
    Project deletedMirror
    String referenceNumber
    Boolean active = true
    Boolean isPrivate = false
    int height
    int depth
    ProjectVisitRecency mostRecentVisit
    Boolean isPendingDeletion = false

    static transients = ['taskCounts', 'levelATasks', 'updateMeta', 'postCount', 'peopleCount', 'privateWorkstreamTeam', 'isPrivateMember','height','depth','mostRecentVisit']


    TaskCountsDTO taskCounts
    List<Task> levelATasks
    List<PrivateWorkstreamMember> privateWorkstreamTeam = []
    Long postCount
    Long peopleCount
    Boolean isPrivateMember
    def updateMeta = [:]

    static hasMany = [tasks: Task]
    static belongsTo = [matter: Matter]
    static constraints = {
        creationDate nullable: false, bindable: false
        name nullable: false, blank: false, size: 1..70, unique: 'matter'
        description nullable: true, size: 0..2400
        deletedMirror nullable: true
        referenceNumber nullable: true, bindable: false
        creator nullable: true
        closer nullable: true
        closedDate nullable: true
        creation_type nullable: true
        template nullable: true
        template_task nullable: true
    }
    static mapping = {
        sort: "name"
        referenceNumber updateable: false
    }
}
