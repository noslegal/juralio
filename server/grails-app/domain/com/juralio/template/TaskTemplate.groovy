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

import com.juralio.post.Post
import grails.plugins.orm.auditable.Auditable

class TaskTemplate implements Auditable {

    public static final NAME = "name"

    public static final MAXIMUM_TEMPLATE_TASKS = 300
    public static final NUMBER_TOP_LEVEL_TASK = 1
    public static final NUMBER_MAX_LEVEL_TASK = 6
    public static final MAXIMUM_SUBTASK_COUNT = 8
    public static final MAXIMUM_PHASE_COUNT = 16

    String name
    Short level = NUMBER_TOP_LEVEL_TASK
    String noticeboardText
    String referenceNumber
    def parent
    def source_task
    boolean isMilestone = false
    Boolean isDeliverable = false
    List<TaskTemplate> tasks
    Long listIdx = 0

    static hasMany = [tasks: TaskTemplate, posts: Post]

    static belongsTo = [projectTemplate: ProjectTemplate]

    static transients = ['parent', 'source_task']

    static constraints = {
        name nullable: false, blank: false, size: 1..70
        noticeboardText nullable: true, size: 0..30000
        level min: 1 as short
        referenceNumber nullable: true, unique: false, bindable: false
        isMilestone blank: false
    }

    static mapping = {
        tasks batchSize: 8
        posts batchSize: 12
        noticeboardText sqlType: "text"
        referenceNumber updateable: false
    }
}
