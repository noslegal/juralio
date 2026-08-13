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
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskBlocker
import com.juralio.task.TaskConsistencyService
import com.juralio.task.TaskService
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import org.grails.web.json.JSONObject

@Transactional
class TaskBlockerService {
    TaskBlockerDAOService taskBlockerDAOService
    TaskService taskService
    TaskConsistencyService taskConsistencyService
    TaskAuthorisationService taskAuthorisationService

    TaskBlocker getTaskBlockerById(Long id) {
        return taskBlockerDAOService.getTaskBlockerById(id)
    }

    List<TaskBlocker> getTaskBlockersByBlocker(Task task){
        return taskBlockerDAOService.getTaskBlockersByBlocker(task)
    }
    List<TaskBlocker> getTaskBlockersByBlocked(Task task){
        return taskBlockerDAOService.getTaskBlockersByBlocked(task)
    }

    List<TaskBlocker> getTaskBlockersByBlocker(Long taskId, Long projectId){
        if (!taskAuthorisationService.hasReadAccess(taskId,projectId)) {
            throw new Exception()
        }
        Task task = taskService.getTask(taskId, projectId)
        return taskBlockerDAOService.getTaskBlockersByBlocker(task)
    }

    List<TaskBlocker> getTaskBlockersByBlocked(Long taskId,Long projectId){
        if (!taskAuthorisationService.hasReadAccess(taskId,projectId)) {
            throw new Exception()
        }
        Task task = taskService.getTask(taskId, projectId)
        return taskBlockerDAOService.getTaskBlockersByBlocked(task)
    }


    TaskBlocker addTaskBlocker(Long blockerId, Long blockedId, Long projectId){
        if (!taskAuthorisationService.hasWriteAccess(blockerId,blockedId,projectId)) {
            throw new Exception()
        }
        Task blocker = taskService.getTask(blockerId, projectId)
        Task blocked = taskService.getTask(blockedId, projectId)

        if(checkIfValidBlock(blocker,blocked)) {
            taskBlockerDAOService.createTaskBlocker(blocker, blocked)
        } else{
            throw new Exception('invalid block')
        }
    }

    TaskBlocker addTaskBlocker(Task blocker, Task  blocked){
        taskBlockerDAOService.createTaskBlocker(blocker, blocked)
    }

    List<TaskBlocker> generateBlockedDataObject(Long taskId, Long projectId){
        if (!taskAuthorisationService.hasReadAccess(taskId,projectId)) {
            throw new Exception()
        }
        List<TaskBlocker> blockedBy = getTaskBlockersByBlocked(taskId,projectId)
        List<TaskBlocker> blocks = getTaskBlockersByBlocker(taskId,projectId)
        JSONObject responseObject = new JSONObject()
        responseObject.put('blockers', blockedBy)
        responseObject.put('blocks', blocks)

        List<TaskBlocker> combinedList = blockedBy + blocks
        return combinedList
    }

    List<TaskBlocker> generateBlockedDataObject(Task task){
        List<TaskBlocker> blockedBy = getTaskBlockersByBlocked(task)
        List<TaskBlocker> blocks = getTaskBlockersByBlocker(task)
        JSONObject responseObject = new JSONObject()
        responseObject.put('blockers', blockedBy)
        responseObject.put('blocks', blocks)

        List<TaskBlocker> combinedList = blockedBy + blocks
        return combinedList
    }

    void deleteTaskBlocker(Long task1Id,Long task2Id, Long projectId) throws Exception{
        if (!taskAuthorisationService.hasWriteAccess(task1Id,task2Id,projectId)) {
            throw new Exception()
        }
        Task t1 = taskService.getTask(task1Id, projectId)
        Task t2 = taskService.getTask(task2Id, projectId)
        TaskBlocker blocker = taskBlockerDAOService.getTaskBlockerByTasks(t1,t2)
        if(!blocker){
            blocker = taskBlockerDAOService.getTaskBlockerByTasks(t2,t1)
        }
        if(!blocker){
            throw new Exception('cant find blocker')
        }
        taskBlockerDAOService.deleteTaskBlocker(blocker.id)
    }

    void deleteTaskBlocker(TaskBlocker blockToDelete) throws Exception{
        taskBlockerDAOService.deleteTaskBlocker(blockToDelete.id)
    }


    private Long getRootTaskId(def task){
        Long rootTaskId = task.id
        if(task.parent != null && task.level != 1){
            rootTaskId = getRootTaskId(task.parent)
        }
        return rootTaskId
    }

    Task sortBlockersForTaskmap(Task task) {
        int blockerCount = taskBlockerDAOService.getBlockerCount(task)
        int blockedCount = taskBlockerDAOService.getBlockedCount(task)

        task.isBlocked = blockedCount > 0
        task.isBlocker = blockerCount > 0

        return task
    }

    Boolean checkIfValidBlock(Task blocker, Task blocked){
        Long maxBlocks = 20
        if(blocker.projectId != blocked.projectId){
            return false
        }
        List<TaskBlocker> blocksCausedByBlocker = taskBlockerDAOService.getTaskBlockersByBlocker(blocker)
        List<TaskBlocker> blocksCausedByBlocked = taskBlockerDAOService.getTaskBlockersByBlocked(blocker)
        if((blocksCausedByBlocker.size() +blocksCausedByBlocked.size()) >= maxBlocks){
            return false
        }
        List<TaskBlocker> blocksCausedByBlockedTask = taskBlockerDAOService.getTaskBlockersByBlocker(blocked)
        List<TaskBlocker> blocksCausedByBlockerTask = taskBlockerDAOService.getTaskBlockersByBlocked(blocked)
        if((blocksCausedByBlockerTask.size() + blocksCausedByBlockedTask.size()) >= maxBlocks){
            return false
        }
        TaskBlocker existingBlock = blocksCausedByBlocker.find {it.blocked.id == blocked.id}
        if(!existingBlock){
            existingBlock = blocksCausedByBlockedTask.find {it.blocked.id == blocker.id}
        }
        if(existingBlock){
            return false
        }
        TaskBlocker blockedAlreadyBlockingBlocker = taskBlockerDAOService.getTaskBlockerByTasks(blocked as Task,blocker as Task)
        if(blockedAlreadyBlockingBlocker){
            return false
        }
        if(blocker.status == TaskStatus.NOT_REQUIRED.value() || blocker.archivedDate != null || blocker.status == TaskStatus.DONE.value()){
            return false
        }
        if(blocked.status == TaskStatus.NOT_REQUIRED.value() || blocked.archivedDate != null || blocked.status == TaskStatus.DONE.value()){
            return false
        }
        if(blocker.getParent() != blocked.getParent()){ //not siblings
            Long blockerRoot = getRootTaskId(blocker)
            Long blockedRoot =  getRootTaskId(blocked)
            if(blockedRoot == blockerRoot){ //if in same tree
                return false
            }
        }
        if(blocked.status == TaskStatus.IN_PROGRESS.value()){
            return false // can't block an in progress task
        }
        return true
    }

    Boolean checkIfValidBlockAfterChange(Task blocker, Task blocked,updatedTask){
        Long maxBlocks = 20
        if(blocker.id==updatedTask.id){
            blocker=updatedTask
        }else{
            blocked=updatedTask
        }
        if(blocker.projectId != blocked.projectId){
            return false
        }

        if(updatedTask.parent!=null){
            if(updatedTask.parent.projectId!= blocker.projectId ||updatedTask.parent.projectId!= blocked.projectId){
                return false
            }
        }

        List<TaskBlocker> blocksCausedByBlocker = taskBlockerDAOService.getTaskBlockersByBlocker(blocker)
        List<TaskBlocker> blocksCausedByBlocked = taskBlockerDAOService.getTaskBlockersByBlocked(blocker)
        if((blocksCausedByBlocker.size() +blocksCausedByBlocked.size()) >= maxBlocks){
            return false
        }
        List<TaskBlocker> blocksCausedByBlockedTask = taskBlockerDAOService.getTaskBlockersByBlocker(blocked)
        List<TaskBlocker> blocksCausedByBlockerTask = taskBlockerDAOService.getTaskBlockersByBlocked(blocked)
        if((blocksCausedByBlockerTask.size() + blocksCausedByBlockedTask.size()) >= maxBlocks){
            return false
        }

        if(blocker.status == TaskStatus.NOT_REQUIRED.value() || blocker.archivedDate != null || blocker.status == TaskStatus.DONE.value()){
            return false
        }
        if(blocked.status == TaskStatus.NOT_REQUIRED.value() || blocked.archivedDate != null || blocked.status == TaskStatus.DONE.value()){
            return false
        }
        if(blocker.getParent() != blocked.getParent()){ //not siblings
            Long blockerRoot = getRootTaskId(blocker)
            Long blockedRoot =  getRootTaskId(blocked)
            if(blockedRoot == blockerRoot){ //if in same tree
                return false
            }
        }
        if(blocked.status == TaskStatus.IN_PROGRESS.value()){
            return false // can't block an in progress task
        }
        if(blocked.projectId!=blocker.projectId){
            return false //can't block in another workstream
        }
        return true
    }

    Boolean checkIfValidBlockAfterChange(Task blocker, Task blocked,updatedTask, String status){
        Long maxBlocks = 20
        if(blocker.id==updatedTask.id){
            blocker=updatedTask
        }else{
            blocked=updatedTask
        }
        if(blocker.projectId != blocked.projectId){
            return false
        }

        if(updatedTask.parent!=null){
            if(updatedTask.parent.projectId!= blocker.projectId ||updatedTask.parent.projectId!= blocked.projectId){
                return false
            }
        }

        List<TaskBlocker> blocksCausedByBlocker = taskBlockerDAOService.getTaskBlockersByBlocker(blocker)
        List<TaskBlocker> blocksCausedByBlocked = taskBlockerDAOService.getTaskBlockersByBlocked(blocker)
        if((blocksCausedByBlocker.size() +blocksCausedByBlocked.size()) >= maxBlocks){
            return false
        }
        List<TaskBlocker> blocksCausedByBlockedTask = taskBlockerDAOService.getTaskBlockersByBlocker(blocked)
        List<TaskBlocker> blocksCausedByBlockerTask = taskBlockerDAOService.getTaskBlockersByBlocked(blocked)
        if((blocksCausedByBlockerTask.size() + blocksCausedByBlockedTask.size()) >= maxBlocks){
            return false
        }

        if(blocker.status == TaskStatus.NOT_REQUIRED.value() || blocker.archivedDate != null || blocker.status == TaskStatus.DONE.value()){
            return false
        }
        if(blocked.status == TaskStatus.NOT_REQUIRED.value() || blocked.archivedDate != null || blocked.status == TaskStatus.DONE.value()){
            return false
        }
        if(blocker.getParent() != blocked.getParent()){ //not siblings
            Long blockerRoot = getRootTaskId(blocker)
            Long blockedRoot =  getRootTaskId(blocked)
            if(blockedRoot == blockerRoot){ //if in same tree
                return false
            }
        }
        if(status == TaskStatus.IN_PROGRESS.value()){
            return false // can't block an in progress task
        }
        return true
    }

    List<Task> getValidBlocksForTask(Long taskId,Long projectId){
        if (!taskAuthorisationService.hasReadAccess(taskId,projectId)) {
            throw new Exception()
        }
        Task task = taskService.getTask(taskId, projectId)
        List<Task> validBlocks = []
        List<Task>  validBlockers = []
        List<Task> allProjectTasks = taskService.listTasks([project_id: projectId])
        allProjectTasks.forEach{
            if(it.id != task.id){
                Task fullTask = taskService.getTask(it.id,projectId)
                if(checkIfValidBlock(task,fullTask)){
                    validBlocks.add(fullTask)
                }else if (checkIfValidBlock(fullTask,task)){
                    validBlockers.add(fullTask)
                }
            }
        }
        validBlocks.addAll(validBlockers)
        validBlocks.unique()
        return validBlocks
    }

    void deleteChildrenBlocksInTree(Task updatedTask){
        def blocker =  getTaskBlockersByBlocker(updatedTask)
        if(blocker.size()>0){
            blocker.forEach(block->{
                deleteTaskBlocker(block)
            })
        }
        def blocked = getTaskBlockersByBlocked(updatedTask)
        if(blocked.size()>0) {
            blocked.forEach(block->{
                deleteTaskBlocker(block)
            })
        }

        List<Task>children = taskConsistencyService.getChildren(updatedTask,false)
        if(children.size()>0){
            children.forEach(task->{
                def childBlocked = getTaskBlockersByBlocked(task)
                if(childBlocked.size()>0){
                    childBlocked.forEach(block->{
                        deleteTaskBlocker(block)
                    })
                }
                def childBlocker = getTaskBlockersByBlocker(task)
                if(childBlocker.size()>0){
                    childBlocker.forEach(block->{
                        deleteTaskBlocker(block)
                    })
                }
            })
        }

    }

    void deleteBlockByParents(Task updatedTask,Boolean isMove){
            List<Task> parents = taskConsistencyService.getParents(updatedTask,isMove)
            List<TaskBlocker> blocker
            parents.forEach(task->{
              blocker = getTaskBlockersByBlocked(task)
                if(blocker.size()>0){
                    deleteTaskBlocker(blocker)
                }
            })

    }
}
