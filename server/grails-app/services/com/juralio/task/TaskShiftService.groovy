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
import com.juralio.costs.CostsService
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.MatterAuthorisationService
import com.juralio.organisation.Organisation
import com.juralio.task.datetime.exception.DateBoundaryException
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

import java.text.Format
import java.text.SimpleDateFormat

@Transactional
class TaskShiftService {
    TaskService taskService
    TaskAuthorisationService taskAuthorisationService
    CostsService costsService
    SpringSecurityService springSecurityService
    CostsAuthorisationService costsAuthorisationService


    private static Boolean checkIfDateBeforeMinDate(Date newDate, Date minDate){
        if(!newDate || !minDate){
            return false
        }
        return newDate < minDate
    }

    private static Boolean checkIfDateAfterMaxDate(Date newDate, Date maxDate){
        if(!newDate || !maxDate){
            return false
        }
        return maxDate < newDate
    }

    private static Date subtractDaysFromDate(Date date, Long count) {
        Calendar calendar = Calendar.getInstance()
        calendar.setTime(date)
        calendar.add(Calendar.DAY_OF_MONTH, -count as int)
        return calendar.getTime()
    }

    private static Date addDaysToDate(Date date, Long count) {
        Calendar calendar = Calendar.getInstance()
        calendar.setTime(date)
        calendar.add(Calendar.DAY_OF_MONTH, count as int)
        return calendar.getTime()
    }

    private Task subtractDaysFromTask(Task task, String dateType, Long amount, Date minDate) throws DateBoundaryException{
        if(!task[dateType]){
            return task
        }
        task[dateType] = subtractDaysFromDate(task[dateType] as Date,amount)
        if(minDate) {
            if (checkIfDateBeforeMinDate(task[dateType] as Date,minDate)){
                //out of bounds
                task.discard()
                 throw new DateBoundaryException()
            }
        }
        def currentUser = springSecurityService.getCurrentUser()
        if( costsAuthorisationService.organisationCostsEnabled(currentUser.organisation as Organisation)){
            costsService.isValidRemoveFromProjectionPeriods(task)
        }
        return task

    }

    private Task addDaysToTask(Task task, String dateType, Long amount, Date maxDate) throws DateBoundaryException{
        if(!task[dateType]){
            return task
        }
        task[dateType] = addDaysToDate(task[dateType] as Date,amount)
        if(maxDate) {
            if (checkIfDateAfterMaxDate(task[dateType] as Date,maxDate)){
                //out of bounds
                task.discard()
                throw new DateBoundaryException()
            }
        }

        def currentUser = springSecurityService.getCurrentUser() as AppUser
        if(costsAuthorisationService.organisationCostsEnabled(currentUser.organisation)){
            costsService.isValidRemoveFromProjectionPeriods(task)
        }
        return task
    }


    private List<Object> shiftBackwardsInTime(Task task, Long amount, Date minDate) throws DateBoundaryException{
        switch(task.status){
            case TaskStatus.DONE.value():
                task = subtractDaysFromTask(task,'actualStartDate',amount,minDate)
                task = subtractDaysFromTask(task,'actualEndDate',amount,minDate)
                break;
            case TaskStatus.IN_PROGRESS.value():
                task = subtractDaysFromTask(task,'actualStartDate',amount,minDate)
                task = subtractDaysFromTask(task,'plannedEndDate',amount,minDate)
                break;
            case TaskStatus.NOT_STARTED.value():
                task = subtractDaysFromTask(task,'plannedStartDate',amount,minDate)
                task = subtractDaysFromTask(task,'plannedEndDate',amount,minDate)
                break;
            default:
                throw new Exception('Bad Task Status')
                break;
        }
            if(task.tasks && task.tasks.size()>0){
                task.tasks.each {Task subTask ->
                    shiftBackwardsInTime(subTask,amount,minDate)
                }
            }
        task.save()
        return
    }


    private  List<Object> shiftForwardsInTime(Task task, Long amount, Date maxDate) throws DateBoundaryException{
        switch(task.status){
            case TaskStatus.DONE.value():
                task = addDaysToTask(task,'actualStartDate',amount,maxDate)
                task = addDaysToTask(task,'actualEndDate',amount,maxDate)
                break;
            case TaskStatus.IN_PROGRESS.value():
                task = addDaysToTask(task,'actualStartDate',amount,maxDate)
                task = addDaysToTask(task,'plannedEndDate',amount,maxDate)
                break;
            case TaskStatus.NOT_STARTED.value():
                task = addDaysToTask(task,'plannedStartDate',amount,maxDate)
                task = addDaysToTask(task,'plannedEndDate',amount,maxDate)
                break;
            default:
                throw new Exception('Bad Task Status')
                break;
        }
            if(task.tasks && task.tasks.size()>0){
                task.tasks.each {Task subTask ->
                    shiftForwardsInTime(subTask,amount,maxDate)
                }
            }
        task.save()
        return

    }

    def shift(Long taskId,Long projectId,String directionInTime,Long amount) throws DateBoundaryException{
        if(!taskAuthorisationService.hasWriteAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task= taskService.getTask(taskId,projectId)
        if(task.status != TaskStatus.NOT_STARTED.value()){
            throw new Exception('Bad task status')
        }
        def minMax = taskService.getMinMaxBoundsUpTree(taskId,projectId)
        String min = minMax.get('minDate',null)
        String max = minMax.get('maxDate',null)
        Format formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss:SSS");
        Date minDate = null
        Date maxDate = null
        Calendar calendar = Calendar.getInstance()
        if(min){
            calendar.setTime(formatter.parse(min))
            minDate = calendar.getTime()
        }
        if(max){
            calendar.setTime(formatter.parse(max))
            maxDate = calendar.getTime()
        }
        switch(directionInTime){
            case 'forward':
                shiftForwardsInTime(task,amount,maxDate)
                break;
            case 'backward':
                shiftBackwardsInTime(task,amount,minDate)
                break;
            default:
                throw new Exception('Bad Payload')
                break;
        }
        return

    }
}
