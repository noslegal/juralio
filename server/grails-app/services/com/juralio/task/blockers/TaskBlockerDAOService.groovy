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

package com.juralio.task.blockers

import com.juralio.task.Task
import com.juralio.task.TaskBlocker
import com.juralio.task.TaskService
import grails.gorm.transactions.Transactional

@Transactional
class TaskBlockerDAOService {
    TaskService taskService

    TaskBlocker getTaskBlockerById(Long id) {
        return TaskBlocker.findById(id)
    }
    TaskBlocker getTaskBlockerByTasks(Task blocker, Task blocked){
        return TaskBlocker.findByBlockedAndBlocker(blocker,blocked)
    }


    List<TaskBlocker> getTaskBlockersByBlocker(Task task){
        return TaskBlocker.findAllByBlocker(task)
    }
    List<TaskBlocker> getTaskBlockersByBlocked(Task task){
        return TaskBlocker.findAllByBlocked(task)
    }

    List<TaskBlocker> getTaskBlockersByBlocker(Long taskId, Long projectId){
        Task task = taskService.getTask(taskId, projectId)
        return TaskBlocker.findAllByBlocker(task)
    }
    List<TaskBlocker> getTaskBlockersByBlocked(Long taskId,Long projectId){
        Task task = taskService.getTask(taskId, projectId)
        return TaskBlocker.findAllByBlocked(task)
    }


    TaskBlocker createTaskBlocker(Task blocker, Task blocked, relationship=0){
        TaskBlocker newBlocker = new TaskBlocker(blocked:blocked,blocker:blocker,relationship: relationship)
        newBlocker.save(flush:true,failOnError:true)
        return newBlocker
    }

    def deleteTaskBlocker(Long id){
        TaskBlocker taskBlocker = getTaskBlockerById(id)
        taskBlocker.delete(flush:true,failOnError: true)
    }

    int getBlockerCount(Task task) {
        return TaskBlocker.countByBlocker(task)
    }

    int getBlockedCount(Task task) {
        return TaskBlocker.countByBlocked(task)
    }
}
