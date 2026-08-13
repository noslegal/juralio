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

import com.juralio.blockers.TaskBlockedByInProgress
import com.juralio.blockers.TaskBlockerException
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.datetime.exception.DateConsistencyException
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import org.apache.commons.lang.time.DateUtils
import org.grails.web.json.JSONObject

import java.time.Instant

@Transactional
class TaskConsistencyService {
    TaskService taskService
    TaskParentHelperService taskParentHelperService
    TaskSiblingsService taskSiblingsService
    TaskBlockerService taskBlockerService
    TaskAuthorisationService taskAuthorisationService

    def getChildren(Task t, Boolean add) {
        List<Task> tasks = []
        if (add) {
            tasks.push(t)
        }
        t.tasks?.each { tasks = (tasks << getChildren(it as Task, true)).flatten() }
        return tasks.flatten()
    }

    def getParents(Task t, isMove = false) {
        List<Task> tasks = []
        if (isMove) {
            if (t.parent && t.parent in Task) {
                tasks.push(t.parent)
                tasks = (tasks << getParents(t.parent)).flatten()
            }
        } else {
            def parentTask = taskParentHelperService.getParentTask(t.id)
            if (parentTask) {
                tasks.push(parentTask)
                tasks = (tasks << getParents(parentTask)).flatten()
            }
        }
        return tasks.flatten()
    }


    def getDateChange(Task task, updatedProperties) {
        if (updatedProperties.plannedStartDate) {
            if (task.plannedStartDate == null) {
                return 0
            }
            def newDate = Date.from(Instant.parse(updatedProperties.get('plannedStartDate') as String))
            def currentDate = new Date(task.plannedStartDate.getTime())
            return (newDate - currentDate)
        }
        if (updatedProperties.plannedEndDate) {
            if (task.plannedEndDate == null) {
                return 0
            }
            def newDate = Date.from(Instant.parse(updatedProperties.get('plannedEndDate') as String))
            def currentDate = new Date(task.plannedEndDate.getTime())
            return (newDate - currentDate)
        }
        if (updatedProperties.actualStartDate) {
            def newDate = Date.from(Instant.parse(updatedProperties.get('actualStartDate') as String))
            def currentDate = new Date(task.actualStartDate.getTime())
            return (newDate - currentDate)
        }
        if (updatedProperties.actualEndDate) {
            def newDate = Date.from(Instant.parse(updatedProperties.get('actualEndDate') as String))
            def currentDate = new Date(task.actualEndDate.getTime())
            return (newDate - currentDate)
        }
        return 0
    }

    List<Task> findStatusConsistencyIssues(Task updatedTask, def updateProperties, def ignoredTasks, boolean forceUseParent = false, boolean isMove = false) {
        List<Task> affectedTasks = []
        List<Task> relatedTasks = []


        Task t
        if (forceUseParent) {
            t = updatedTask
        } else {
            t = taskService.getTaskOnly(updatedTask.id, updatedTask.projectId)
        }

        if (isMove) {
            List<Task> parentTasks = getParents(t, forceUseParent).flatten()
            relatedTasks = (relatedTasks << getParents(t, forceUseParent).flatten()).flatten()
            //relatedTasks = (relatedTasks << getChildren(t, false).flatten()).flatten()
            relatedTasks = relatedTasks.flatten()

            if (updateProperties.plannedStartDate) {
                Date plannedStartDate = Date.from(Instant.parse(updateProperties.get('plannedStartDate') as String))
                Date earliestStartDate = plannedStartDate
                relatedTasks.each { Task rt ->
                    //        if (rt.plannedStartDate != null) {
                    if (rt.level < updatedTask.level) {
                        //parent
                        Date rtDate
                        Boolean isSameDay
                        if(rt.plannedStartDate) {
                            rtDate = new Date(rt.plannedStartDate.getTime())
                            isSameDay = DateUtils.isSameDay(rtDate, plannedStartDate)
                        }
                        Date rtEndDate
                        if(rt.plannedEndDate){
                            rtEndDate = new Date(rt.plannedEndDate.getTime())
                        }

                        if (rtDate > plannedStartDate && !isSameDay && rt.status==TaskStatus.NOT_STARTED.value()) {
                            earliestStartDate = rtDate
                            affectedTasks.push([id: rt.id, plannedStartDate: plannedStartDate, level: rt.level])
                        }
                        if(rtEndDate && rtEndDate < plannedStartDate && !isSameDay && rt.status==TaskStatus.NOT_STARTED.value()){
                            affectedTasks.push([id: rt.id, plannedEndDate: updatedTask.plannedStartDate, level: rt.level])
                        }
                    }
//                        else {
//                            //child
//                            Date rtDate = new Date(rt.plannedStartDate.getTime())
//                            Boolean isSameDay = DateUtils.isSameDay(rtDate, earliestStartDate)
//                            if (rtDate < earliestStartDate && !isSameDay) {
//                                affectedTasks.push([id: rt.id, plannedStartDate: earliestStartDate, level: rt.level])
//                            }
//
//                        }
                    if (rt.datesLinkedToSiblings) {
                        def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, plannedStartDate: latestEndDate, level: rt.level], ignoredTasks)
                        affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
                    }
                    //             }
                }
            }
            if (updateProperties.plannedEndDate) {
                Date plannedEndDate = Date.from(Instant.parse(updateProperties.get('plannedEndDate') as String))
                Date latestEndDate = plannedEndDate
                relatedTasks.each { Task rt ->
                    Date rtStartDate
                    if(rt.plannedStartDate){
                        rtStartDate = new Date(rt.plannedStartDate.getTime())
                    }
                    if(rt.actualStartDate){
                        rtStartDate = new Date(rt.actualStartDate.getTime())
                    }
                    if (rtStartDate && rtStartDate > plannedEndDate && updatedTask.plannedStartDate == null) {
                        affectedTasks.push([id: rt.id, plannedStartDate: updatedTask.plannedEndDate, level: rt.level])
                    } else if (rtStartDate && updatedTask.plannedStartDate && rtStartDate > updatedTask.plannedStartDate && rt.status==TaskStatus.NOT_STARTED.value()) {
                        affectedTasks.push([id: rt.id, plannedStartDate: updatedTask.plannedStartDate, level: rt.level])
                    }
                    if (rt.plannedEndDate != null) {
                        if (rt.level < updatedTask.level) {
                            //parent
                            Date rtDate = new Date(rt.plannedEndDate.getTime())
                            Boolean isSameDay = DateUtils.isSameDay(rtDate, plannedEndDate)


                            if (rtDate < plannedEndDate && !isSameDay) {
                                latestEndDate = rtDate
                                if(updatedTask.status!=TaskStatus.DONE.value()){
                                    affectedTasks.push([id: rt.id, plannedEndDate: plannedEndDate, level: rt.level])
                                }
                            }

                        }

//                        else {
//                            //child
//                            Date rtDate = new Date(rt.plannedEndDate.getTime())
//                            Boolean isSameDay = DateUtils.isSameDay(rtDate, latestEndDate)
//                            if (rtDate < plannedEndDate && !isSameDay) {
//                                affectedTasks.push([id: rt.id, plannedStartDate: plannedEndDate, level: rt.level])
//                            }
//
//                        }
                        if (rt.datesLinkedToSiblings) {
                            def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, plannedEndDate: latestEndDate, level: rt.level], ignoredTasks)
                            affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
                        }
                    }
                }
            }
            if (updateProperties.actualStartDate) {
                Date actualStartDate = Date.from(Instant.parse(updateProperties.get('actualStartDate') as String))
                Date earliestStartDate = actualStartDate
                relatedTasks.each { Task rt ->
                    if (rt.actualStartDate != null ) {
                        if (rt.level < updatedTask.level) {
                            //parent
                            Date rtDate = new Date(rt.actualStartDate.getTime())
                            Boolean isSameDay = DateUtils.isSameDay(rtDate, actualStartDate)

                            if (rtDate > actualStartDate && !isSameDay) {
                                earliestStartDate = rtDate
                                affectedTasks.push([id: rt.id, actualStartDate: actualStartDate, level: rt.level])
                            }

                            if(rt.plannedEndDate &&  updatedTask.status==TaskStatus.IN_PROGRESS.value() && rt.plannedEndDate.before(updatedTask.actualStartDate) && updatedTask.plannedEndDate==null){
                                affectedTasks.push([id: rt.id, plannedEndDate:null, level: rt.level])
                            }

                        }
//                        else {
//                            //child
//                            Date rtDate = new Date(rt.actualStartDate.getTime())
//                            Boolean isSameDay = DateUtils.isSameDay(rtDate, earliestStartDate)
//                            if (rtDate < earliestStartDate && !isSameDay) {
//                                affectedTasks.push([id: rt.id, plannedStartDate: earliestStartDate, level: rt.level])
//                            }
//
//                        }
                        if (rt.datesLinkedToSiblings) {
                            def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, plannedStartDate: earliestStartDate, level: rt.level], ignoredTasks)
                            affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
                        }
                    } else if(rt.status == TaskStatus.NOT_STARTED.value() ){
                        if(rt.plannedEndDate &&  rt.plannedEndDate.before(updatedTask.actualStartDate) && updatedTask.plannedEndDate==null){
                            affectedTasks.push([id: rt.id, plannedEndDate:null, level: rt.level])
                        }
                    }
                }
            }
            if (updateProperties.actualEndDate) {
                Date actualEndDate = Date.from(Instant.parse(updateProperties.get('actualEndDate') as String))
                Date latestEndDate = actualEndDate
                relatedTasks.each {Task  rt ->
                    if (rt.actualEndDate != null ) {
                        if (rt.level < updatedTask.level) {
                            //parent
                            Date rtDate = new Date(rt.actualEndDate.getTime())
                            Boolean isSameDay = DateUtils.isSameDay(rtDate, actualEndDate)

                            if (rtDate < actualEndDate && !isSameDay) {
                                latestEndDate = rtDate
                                affectedTasks.push([id: rt.id, actualEndDate: actualEndDate, level: rt.level])
                            }
                        }
//                        else {
//                            //child
//                            Date rtDate = new Date(rt.actualEndDate.getTime())
//                            Boolean isSameDay = DateUtils.isSameDay(rtDate, latestEndDate)
//                            if (rtDate < latestEndDate && !isSameDay) {
//                                affectedTasks.push([id: rt.id, plannedStartDate: latestEndDate, level: rt.level])
//                            }
//
//                        }
                        if (rt.datesLinkedToSiblings) {
                            def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, plannedStartDate: latestEndDate, level: rt.level], ignoredTasks)
                            affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
                        }
                    } else if(rt.status != TaskStatus.DONE.value()  ){
                        //dont think we want this
                        //affectedTasks.push([id: rt.id, actualStartDate: actualEndDate, level: rt.level])
                    }
                }
            }
//            if (updateProperties.plannedEndDate) {
//                Date plannedEndDate = Date.from(Instant.parse(updateProperties.get('plannedEndDate') as String))
//                relatedTasks.each { rt ->
//                    if (rt.plannedEndDate != null) {
//                        if (plannedEndDate > new Date(rt.plannedEndDate.getTime()) && updatedTask.level > rt.level) {
//                            String newPlannedEndDate = updateProperties.get('plannedEndDate')
//                            def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                            if (foundAffected) {
//                                foundAffected['plannedEndDate'] = newPlannedEndDate
//                            } else {
//                                Boolean isSameDay = DateUtils.isSameDay(new Date(rt.plannedEndDate.getTime()), Date.from(Instant.parse(newPlannedEndDate)))
//                                if (!isSameDay) {
//                                    affectedTasks.push([id: rt.id, plannedEndDate: newPlannedEndDate, level: rt.level])
//                                }
//                                if (rt.datesLinkedToSiblings) {
//                                    def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, plannedEndDate: newPlannedEndDate, level: rt.level], ignoredTasks)
//                                    affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                                }
//                            }
//                        }
//                        if (plannedEndDate < new Date(rt.plannedEndDate.getTime()) && updatedTask.level < rt.level) {
//                            String newPlannedEndDate = updateProperties.get('plannedEndDate')
//                            def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                            if (foundAffected) {
//                                foundAffected['plannedEndDate'] = newPlannedEndDate
//                            } else {
//                                Boolean isSameDay = DateUtils.isSameDay(new Date(rt.plannedEndDate.getTime()), Date.from(Instant.parse(newPlannedEndDate)))
//                                if (!isSameDay) {
//                                    affectedTasks.push([id: rt.id, plannedEndDate: newPlannedEndDate, level: rt.level])
//                                }
//                                if (rt.datesLinkedToSiblings) {
//                                    def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, plannedEndDate: newPlannedEndDate, level: rt.level], ignoredTasks)
//                                    affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                                }
//                            }
//                        }
//                    } else {
//                        if (rt.plannedEndDate == null && rt.level < updatedTask.level && rt.status == 'not-started') {
//                            String newPlannedEndDate = updateProperties.get('plannedEndDate')
//                            affectedTasks.push([id: rt.id, plannedEndDate: newPlannedEndDate, level: rt.level])
//                        }
//                    }
//
//
//                }
//            }
//            if (updateProperties.actualStartDate) {
//                Date actualStartDate = Date.from(Instant.parse(updateProperties.get('actualStartDate') as String))
//                relatedTasks.each { rt ->
//                    if (rt.actualStartDate != null && actualStartDate < new Date(rt.actualStartDate.getTime()) && updatedTask.level > rt.level) {
//                        String newActualStartDate = updateProperties.get('actualStartDate')
//                        def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                        if (foundAffected) {
//                            foundAffected['actualStartDate'] = newActualStartDate
//                        } else {
//                            Boolean isSameDay = DateUtils.isSameDay(new Date(rt.actualStartDate.getTime()), Date.from(Instant.parse(newActualStartDate)))
//                            if (!isSameDay) {
//                                affectedTasks.push([id: rt.id, actualStartDate: newActualStartDate, level: rt.level])
//                            }
//                            if (rt.datesLinkedToSiblings) {
//                                def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, actualStartDate: newActualStartDate, level: rt.level], ignoredTasks)
//                                affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                            }
//                        }
//                    }
//                    if (rt.actualStartDate != null && actualStartDate > new Date(rt.actualStartDate.getTime()) && updatedTask.level < rt.level) {
//                        String newActualStartDate = updateProperties.get('actualStartDate')
//                        def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                        if (foundAffected) {
//                            foundAffected['actualStartDate'] = newActualStartDate
//                        } else {
//                            Boolean isSameDay = DateUtils.isSameDay(new Date(rt.actualStartDate.getTime()), Date.from(Instant.parse(newActualStartDate)))
//                            if (!isSameDay) {
//                                affectedTasks.push([id: rt.id, actualStartDate: newActualStartDate, level: rt.level])
//                            }
//                            if (rt.datesLinkedToSiblings) {
//                                def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, actualStartDate: newActualStartDate, level: rt.level], ignoredTasks)
//                                affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                            }
//                        }
//                    }
//                    if (rt.actualStartDate == null && rt.level < updatedTask.level) {
//                        def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                        if (foundAffected) {
//                            foundAffected['actualStartDate'] = newActualStartDate
//                        } else {
//                            Boolean isSameDay = false
//                            if (!isSameDay) {
//                                affectedTasks.push([id: rt.id, actualStartDate: updatedTask.actualStartDate, level: rt.level])
//                            }
//                            if (rt.datesLinkedToSiblings) {
//                                def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, actualStartDate: updatedTask.actualStartDate, level: rt.level], ignoredTasks)
//                                affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                            }
//                        }
//                    }
//                }
//            }
//            if (updateProperties.actualEndDate) {
//                Date actualEndDate = Date.from(Instant.parse(updateProperties.get('actualEndDate') as String))
//                relatedTasks.each { rt ->
//                    if (rt.actualEndDate != null && actualEndDate > new Date(rt.actualEndDate.getTime()) && updatedTask.level > rt.level) {
//                        String newActualEndDate = updateProperties.get('actualEndDate')
//                        def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                        if (foundAffected) {
//                            foundAffected['actualEndDate'] = newActualEndDate
//                        } else {
//                            Boolean isSameDay = DateUtils.isSameDay(new Date(rt.actualEndDate.getTime()), Date.from(Instant.parse(newActualEndDate)))
//                            if (!isSameDay) {
//                                affectedTasks.push([id: rt.id, actualEndDate: newActualEndDate, level: rt.level])
//                            }
//                            if (rt.datesLinkedToSiblings) {
//                                def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, actualEndDate: newActualEndDate, level: rt.level], ignoredTasks)
//                                affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                            }
//                        }
//                    }
//                    if (rt.actualEndDate != null && actualEndDate < new Date(rt.actualEndDate.getTime()) && updatedTask.level < rt.level) {
//                        String newActualEndDate = updateProperties.get('actualEndDate')
//                        def foundAffected = affectedTasks.find { it['id'] == rt.id }
//                        if (foundAffected) {
//                            foundAffected['actualEndDate'] = newActualEndDate
//                        } else {
//                            Boolean isSameDay = DateUtils.isSameDay(new Date(rt.actualEndDate.getTime()), Date.from(Instant.parse(newActualEndDate)))
//                            if (!isSameDay) {
//                                affectedTasks.push([id: rt.id, actualEndDate: newActualEndDate, level: rt.level])
//                            }
//                            if (rt.datesLinkedToSiblings) {
//                                def affectedLinkedTasks = findStatusConsistencyIssues(rt, [id: rt.id, actualEndDate: newActualEndDate, level: rt.level], ignoredTasks)
//                                affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                            }
//                        }
//                    }
//                }
//            }
        }

        if (updatedTask.datesLinkedToSiblings && getDateChange(updatedTask, updateProperties) != 0) {
            //update the linked tasks
            def dateDiff = getDateChange(updatedTask, updateProperties)
            List<Task> siblings = taskSiblingsService.getTaskSiblings(updatedTask).findAll { it.datesLinkedToSiblings && !ignoredTasks.contains(it) }
            siblings.each { sibling ->
                def siblingProperties
                if (updateProperties.plannedStartDate && sibling.plannedStartDate) {
                    def x = new Date(sibling.plannedStartDate.getTime())
                    def y = dateDiff as int
                    def z = DateUtils.addDays(x, y).format("yyyy-MM-dd'T'HH:MM:ss.SSS").toString() + 'Z'
                    siblingProperties = [id: sibling.id, plannedStartDate: z, isLinkMove: true, level: sibling.level]
                }
                if (updateProperties.plannedEndDate && sibling.plannedEndDate) {
                    def x = new Date(sibling.plannedEndDate.getTime())
                    def y = dateDiff as int
                    def z = DateUtils.addDays(x, y).format("yyyy-MM-dd'T'HH:MM:ss.SSS").toString() + 'Z'
                    siblingProperties = [id: sibling.id, plannedEndDate: z, isLinkMove: true, level: sibling.level]
                }
                if (updateProperties.actualStartDate && sibling.actualStartDate) {
                    def x = new Date(sibling.actualStartDate.getTime())
                    def y = dateDiff as int
                    def z = DateUtils.addDays(x, y).format("yyyy-MM-dd'T'HH:MM:ss.SSS").toString() + 'Z'
                    siblingProperties = [id: sibling.id, actualStartDate: z, isLinkMove: true, level: sibling.level]
                }
                if (updateProperties.actualEndDate && sibling.actualEndDate) {
                    def x = new Date(sibling.actualEndDate.getTime())
                    def y = dateDiff as int
                    def z = DateUtils.addDays(x, y).format("yyyy-MM-dd'T'HH:MM:ss.SSS").toString() + 'Z'
                    siblingProperties = [id: sibling.id, actualEndDate: z, isLinkMove: true, level: sibling.level]
                }
                if (!siblingProperties) {
                    return
                }
                def affectedSiblingRelations = findStatusConsistencyIssues(sibling, siblingProperties, ignoredTasks << updatedTask)

                affectedSiblingRelations.each { affectedRelation ->
                    def foundTask = affectedTasks.find { it.id == affectedRelation.id } //.find(t -> t.id == affectedRelation.id)
                    if (foundTask) {
                        Task foundTaskDetails = taskService.getTaskOnly(foundTask.id, sibling.projectId)
                        if (siblingProperties.plannedStartDate) {
                            Date foundTaskDate = Date.from(Instant.parse(foundTask.get('plannedStartDate') as String))
                            Date siblingDate = new Date(sibling.plannedStartDate.getTime())
                            Boolean foundTaskLater = foundTaskDate > siblingDate
                            if (foundTaskDetails.level > sibling.level) {
                                //take earlier
                                if (foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            } else {
                                //later
                                if (!foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            }
                        }
                        if (siblingProperties.plannedEndDate) {
                            Date foundTaskDate = Date.from(Instant.parse(foundTask.get('plannedEndDate') as String))
                            Date siblingDate = new Date(sibling.plannedEndDate.getTime())
                            Boolean foundTaskLater = foundTaskDate > siblingDate
                            if (foundTaskDetails.level > sibling.level) {
                                //take later
                                if (!foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }

                            } else {
                                //earlier
                                if (foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            }
                        }
                        if (siblingProperties.actualStartDate) {
                            Date foundTaskDate = Date.from(Instant.parse(foundTask.get('actualStartDate') as String))
                            Date siblingDate = new Date(sibling.actualStartDate.getTime())
                            Boolean foundTaskLater = foundTaskDate > siblingDate
                            if (foundTaskDetails.level > sibling.level) {
                                //take earlier
                                if (foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            } else {
                                //later
                                if (!foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            }
                        }
                        if (siblingProperties.actualEndDate) {
                            Date foundTaskDate = Date.from(Instant.parse(foundTask.get('actualEndDate') as String))
                            Date siblingDate = new Date(sibling.actualEndDate.getTime())
                            Boolean foundTaskLater = foundTaskDate > siblingDate

                            if (foundTaskDetails.level > sibling.level) {
                                //take later
                                if (!foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            } else {
                                //earlier
                                if (foundTaskLater) {
                                    affectedTasks = affectedTasks.findAll { it.id != foundTask.id }
                                    affectedTasks = (affectedTasks << affectedRelation).flatten()
                                }
                            }
                        }
                    } else {
                        affectedTasks = (affectedTasks << affectedRelation).flatten()
                    }
                }
                affectedTasks.push(siblingProperties)

            }

        }


        return affectedTasks.unique { a, b -> a.id <=> b.id }.sort { it.level }

    }

    def findDateConsistencyIssues(Task updatedTask, updatedProperties, Boolean ignoreParents) throws DateConsistencyException {
        if(!taskAuthorisationService.hasWriteAccess(updatedTask.id,updatedTask.projectId)){
            throw new Exception()
        }
        List<Task> tasksWithDateIssues = []
        List<Task> childrenTasks = []

        //quickly check parent boundary first, only for original updated task

        if (!ignoreParents && updatedTask.level > 1) {
            Task parentTask = taskParentHelperService.getParentTask(updatedTask.id)
            Date psd = updatedProperties.plannedStartDate ? Instant.parse(updatedProperties.plannedStartDate).toDate() : null
            Date ped = updatedProperties.plannedEndDate ? Instant.parse(updatedProperties.plannedEndDate).toDate() : null
            Date asd = updatedProperties.actualStartDate ? Instant.parse(updatedProperties.actualStartDate).toDate() : null
            Date aed = updatedProperties.actualEndDate ? Instant.parse(updatedProperties.actualEndDate).toDate() : null
            if (parentTask.status == TaskStatus.NOT_STARTED.value()) {
                //look as psd and ped
                if (parentTask.plannedStartDate && updatedProperties.plannedStartDate && parentTask.plannedStartDate as Date > psd) {
//if parent has PSD and it is after tasks new PSD
                    throw new DateConsistencyException()
                }
                if (parentTask.plannedEndDate && updatedProperties.plannedEndDate && ped > parentTask.plannedEndDate as Date) {
                    //if parent has an PED and it is before tasks new PED
                    throw new DateConsistencyException()
                }
            } else if (parentTask.status == TaskStatus.IN_PROGRESS.value()) {
                if (parentTask.actualStartDate && updatedProperties.actualStartDate && parentTask.actualStartDate as Date > asd) {
// if parent has ASD and it is after tasks new ASD
                    throw new DateConsistencyException()
                }
                if (parentTask.actualStartDate && updatedProperties.plannedStartDate && parentTask.actualStartDate as Date > psd) {
// if parent has ASD and it is after tasks new PSD
                    throw new DateConsistencyException()
                }
                if (parentTask.plannedEndDate && updatedProperties.plannedEndDate && ped > parentTask.plannedEndDate as Date) {
                    //if parent has an PED and it is before tasks new PED
                    throw new DateConsistencyException()
                }

            } else if (parentTask.status == TaskStatus.DONE.value()) {
                if (parentTask.actualStartDate && updatedProperties.actualStartDate && parentTask.actualStartDate as Date > asd) {
// if parent has ASD and it is after tasks new ASD
                    throw new DateConsistencyException()
                }
                if (parentTask.actualEndDate && updatedProperties.actualEndDate && aed > parentTask.actualEndDate as Date) {
                    // if parent has AED and it is before tasks new new AED
                    throw new DateConsistencyException()
                }
            }
        }
        //ripple changes down tree if needed
        childrenTasks = (childrenTasks << getChildren(updatedTask, false).flatten()).flatten()
        childrenTasks.forEach(child -> {
            //if new properties includes PSD
            if (updatedProperties.plannedStartDate) {
                Date plannedStartDate = Date.from(Instant.parse(updatedProperties.get('plannedStartDate') as String))
                //if child task
                if (child.plannedStartDate != null && plannedStartDate > new Date(child.plannedStartDate.getTime())) {
                    String plannedStartDateStr = updatedProperties.get('plannedStartDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['plannedStartDate'] = plannedStartDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.plannedStartDate.getTime()), Date.from(Instant.parse(plannedStartDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, plannedStartDate: plannedStartDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
                if (child.plannedEndDate != null && plannedStartDate > new Date(child.plannedEndDate.getTime())) {
                    String plannedEndDateStr = updatedProperties.get('plannedStartDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['plannedEndDate'] = plannedEndDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.plannedEndDate.getTime()), Date.from(Instant.parse(plannedEndDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, plannedEndDate: plannedEndDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
            }
            //if new properties includes PED
            if (updatedProperties.plannedEndDate) {
                Date plannedEndDate = Date.from(Instant.parse(updatedProperties.get('plannedEndDate') as String))
                if (child.plannedEndDate != null && plannedEndDate < new Date(child.plannedEndDate.getTime())) {
                    String plannedEndDateStr = updatedProperties.get('plannedEndDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['plannedEndDate'] = plannedEndDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.plannedEndDate.getTime()), Date.from(Instant.parse(plannedEndDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, plannedEndDate: plannedEndDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
                if (child.plannedStartDate != null && plannedEndDate < new Date(child.plannedStartDate.getTime())) {
                    String plannedStartDateStr = updatedProperties.get('plannedEndDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['plannedStartDate'] = plannedStartDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.plannedStartDate.getTime()), Date.from(Instant.parse(plannedStartDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, plannedStartDate: plannedStartDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
                if (child.actualEndDate != null && plannedEndDate < new Date(child.actualEndDate.getTime())) {
                    String plannedEndDateStr = updatedProperties.get('plannedEndDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['actualEndDate'] = plannedEndDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.actualEndDate.getTime()), Date.from(Instant.parse(plannedEndDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, actualEndDate: plannedEndDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
                if (child.actualStartDate != null && plannedEndDate < new Date(child.actualStartDate.getTime())) {
                    String plannedStartDateStr = updatedProperties.get('plannedEndDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['actualStartDate'] = plannedStartDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.actualStartDate.getTime()), Date.from(Instant.parse(plannedStartDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, actualStartDate: plannedStartDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
            }
            //if new properties includes ASD
            if (updatedProperties.actualStartDate) {
                Date actualStartDate = Date.from(Instant.parse(updatedProperties.get('actualStartDate') as String))
                if (child.actualStartDate != null && actualStartDate > new Date(child.actualStartDate.getTime())) {
                    String actualStartDateStr = updatedProperties.get('actualStartDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['actualStartDate'] = actualStartDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.actualStartDate.getTime()), Date.from(Instant.parse(actualStartDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, actualStartDate: actualStartDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            def affectedLinkedTasks = findStatusConsistencyIssues(child, [id: child.id, actualStartDate: actualStartDateStr, level: child.level], ignoredTasks)
//                            affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                        }
                    }
                } else if (child.actualStartDate == null && (child.plannedStartDate && actualStartDate > new Date(child.plannedStartDate.getTime()))) {
                    String actualStartDateStr = updatedProperties.get('actualStartDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['plannedStartDate'] = actualStartDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.plannedStartDate.getTime()), Date.from(Instant.parse(actualStartDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, plannedStartDate: actualStartDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            def affectedLinkedTasks = findStatusConsistencyIssues(child, [id: child.id, actualStartDate: actualStartDateStr, level: child.level], ignoredTasks)
//                            affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                        }
                    }
                }
                if(child.actualEndDate != null && (actualStartDate > new Date(child.actualEndDate.getTime()))){
                    String actualEndDateStr = updatedProperties.get('actualStartDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['actualEndDate'] = actualEndDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.actualEndDate.getTime()), Date.from(Instant.parse(actualEndDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, actualEndDate: actualEndDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            def affectedLinkedTasks = findStatusConsistencyIssues(child, [id: child.id, actualStartDate: actualStartDateStr, level: child.level], ignoredTasks)
//                            affectedTasks = (affectedTasks << affectedLinkedTasks).flatten()
//                        }
                    }
                }
            }
            //if new properties includes AED
            if (updatedProperties.actualEndDate) {
                Date actualEndDate = Date.from(Instant.parse(updatedProperties.get('actualEndDate') as String))
                if (child.actualEndDate != null && actualEndDate < new Date(child.actualEndDate.getTime())) {
                    String actualEndDateStr = updatedProperties.get('actualEndDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['actualEndDate'] = actualEndDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.actualEndDate.getTime()), Date.from(Instant.parse(actualEndDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, actualEndDate: actualEndDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                } else if (child.actualEndDate == null && child.plannedEndDate && (actualEndDate < new Date(child.plannedEndDate.getTime()))) {
                    String actualEndDateStr = updatedProperties.get('actualEndDate')
                    def foundAffected = tasksWithDateIssues.find { it['id'] == child.id }
                    if (foundAffected) {
                        foundAffected['plannedEndDate'] = actualEndDateStr
                    } else {
                        Boolean isSameDay = DateUtils.isSameDay(new Date(child.actualEndDate.getTime()), Date.from(Instant.parse(actualEndDateStr)))
                        if (!isSameDay) {
                            tasksWithDateIssues.push([id: child.id, plannedEndDate: actualEndDateStr, level: child.level])
                        }
//                        if (child.datesLinkedToSiblings) {
//                            ignoreParents = true
//                            def affectedLinkedTasks = findDateConsistencyIssues(child, [id: child.id, plannedStartDate: plannedStartDateStr, level: child.level], ignoreParents,ignoredTasks)
//                            tasksWithDateIssues = (tasksWithDateIssues << affectedLinkedTasks).flatten()
//                        }
                    }
                }
            }
        })
        return tasksWithDateIssues.unique { a, b -> a.id <=> b.id }.sort { it.level }
    }

    def findBlockerConsistencyIssues(Task updatedTask, Boolean forceTrue, throwError) throws TaskBlockerException {
        List<TaskBlocker> invalidBlocks = []
        List<TaskBlocker> blocked = taskBlockerService.getTaskBlockersByBlocked(updatedTask)
        List<TaskBlocker> blocker = taskBlockerService.getTaskBlockersByBlocker(updatedTask)
        if (blocked.size() > 0) {
            blocked.forEach(block -> {
                if (!taskBlockerService.checkIfValidBlockAfterChange(block.blocker, block.blocked, updatedTask)) {
                    invalidBlocks.add(block)
                    if (forceTrue) {
                        taskBlockerService.deleteTaskBlocker(block)
                    }
                }

            })

        }
        if (blocker.size() > 0) {
            blocker.forEach(block -> {
                if (!taskBlockerService.checkIfValidBlockAfterChange(block.blocker, block.blocked, updatedTask)) {
                    invalidBlocks.add(block)
                    if (forceTrue) {
                        taskBlockerService.deleteTaskBlocker(block)
                    }
                }

            })
        }
        if (throwError && !forceTrue) {
            if (invalidBlocks.size() > 0 && !forceTrue) {
                //updatedTask.status = updatedTask.previousStatus
                updatedTask.discard()
                throw new TaskBlockedByInProgress()
            }
        }
        return invalidBlocks
    }

    def findBlockerConsistencyIssuesBeforeChange(Task updatedTask, Boolean forceTrue, throwError, String status) throws TaskBlockerException {
        List<TaskBlocker> invalidBlocks = []
        List<TaskBlocker> blocked = taskBlockerService.getTaskBlockersByBlocked(updatedTask)
        List<TaskBlocker> blocker = taskBlockerService.getTaskBlockersByBlocker(updatedTask)
        if (blocked.size() > 0) {
            blocked.forEach(block -> {
                if (!taskBlockerService.checkIfValidBlockAfterChange(block.blocker, block.blocked, updatedTask, status)) {
                    invalidBlocks.add(block)
                    if (forceTrue) {
                        taskBlockerService.deleteTaskBlocker(block)
                    }
                }

            })

        }
        if (blocker.size() > 0) {
            blocker.forEach(block -> {
                if (!taskBlockerService.checkIfValidBlockAfterChange(block.blocker, block.blocked, updatedTask)) {
                    invalidBlocks.add(block)
                    if (forceTrue) {
                        taskBlockerService.deleteTaskBlocker(block)
                    }
                }

            })
        }
        if (throwError && !forceTrue) {
            if (invalidBlocks.size() > 0 && !forceTrue) {
                updatedTask.discard()
                throw new TaskBlockedByInProgress()
            }
        }
        return invalidBlocks
    }

    def getProblemDatesFromSubtasks(List<Task> subtasks, Boolean ignorePED=false) {
        List<Date> allDatesToSort = []
        subtasks.forEach(subtask -> {
            if (subtask.actualStartDate) {
                allDatesToSort.push(subtask.actualStartDate)
            } else if (subtask.plannedStartDate) {
                allDatesToSort.push(subtask.plannedStartDate)
            }
            if (subtask.actualEndDate) {
                allDatesToSort.push(subtask.actualEndDate)
            } else if (subtask.plannedEndDate && !ignorePED) {
                allDatesToSort.push(subtask.plannedEndDate)
            }
        })
        Collections.sort(allDatesToSort)
        Date earliestDate = allDatesToSort.size() > 0 ? allDatesToSort[0] : new Date(1970, 0, 0)
        Date latestDate = allDatesToSort.size() > 0 ? allDatesToSort[allDatesToSort.size() - 1] : new Date(9999, 12, 31)
        JSONObject problemDates = new JSONObject()
        problemDates.put('earliestDate', earliestDate)
        problemDates.put('latestDate', latestDate)

        return problemDates
    }
}