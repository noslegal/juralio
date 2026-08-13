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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.dao.PlaceholdersDAOService
import com.juralio.organisation.Organisation
import com.juralio.post.Post
import com.juralio.post.TaskPostsAuthorisationService
import com.juralio.post.member.PostMemberService
import com.juralio.post.members.PostMember
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.team.TaskTeamMember
import com.juralio.task.team.TaskTeamMemberService
import grails.gorm.transactions.Transactional
import org.hibernate.Hibernate

@Transactional
class PlaceholdersService {
    PlaceholdersDAOService placeholdersDAOService
    MatterService matterService
    TaskTeamMemberService taskTeamMemberService
    PostMemberService postMemberService
    ProjectService projectService
    TaskAuthorisationService taskAuthorisationService
    TaskPostsAuthorisationService taskPostsAuthorisationService
    MatterAuthorisationService matterAuthorisationService

    Placeholders getUnproxyedPlacehodlers(def placeholders){
        return Hibernate.unproxy(placeholders) as Placeholders
    }

    Placeholders getPlaceholder(long placeholderId, long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Placeholders placeholder = placeholdersDAOService.getPlaceholder(placeholderId)
        return placeholder
    }

    List<Placeholders> getAllPlaceholders() {
        List<Placeholders> allPlaceholders = placeholdersDAOService.getAllPlaceholders()
        return allPlaceholders
    }

    List<Placeholders> getAllPlaceholdersForMatter(long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(matterId)
        List<Placeholders> placeholders  = placeholdersDAOService.getPlaceholdersForMatter(matter)
        placeholders.each {Placeholders placeholder ->
            List<Task> tasks = getPlaceholderUsageMatter(matterId, placeholder.id, false)
            placeholder.taskCount = tasks.size()

            List<Post> posts = getPlaceholderPostUsage(matterId, placeholder.id)
            placeholder.postCount = posts.size()
        }
        return placeholders
    }

    List<Placeholders> getAllPlaceholdersForOrganisation(Organisation org) {
        List<Placeholders> placeholders  = placeholdersDAOService.getPlaceholdersForOrganisation(org)
        return placeholders
    }

    List<Task> getPlaceholderUsageMatter(long matterId, long placeholderId, boolean inProgress) {
        if (!matterAuthorisationService.hasTeamMemberAccess(matterId) &&!matterAuthorisationService.hasAdminAccess(matterId)) {
            throw new Exception()
        }
        List<Project> projects = projectService.getProjectsByMatterId(matterId, false, false)
        List<Task> result = []

        for (Project project in projects) {
            for (Task task in (project.tasks as List<Task>)) {
                for (TaskTeamMember teamMember in task.teamMembers) {
                    for(Placeholders placeholder in teamMember.placeholder){
                        if (placeholder.id == placeholderId) {
                            if(inProgress && task.status == 'in-progress'){
                                result.add(task)
                                break
                            }else if(!inProgress) {
                                result.add(task)
                                break
                            }
                        }
                    }
                }
            }
        }

        result.sort({ a, b -> a.name <=> b.name })
        result.sort({ a, b -> a.level <=> b.level })
        return result
    }

    List<Post> getPlaceholderPostUsage(long matterId, long placeholderId) {
        List<Project> projects = projectService.getProjectsByMatterId(matterId, false, false)
        List<Post> result = []

        for (Project project in projects) {
            for (Task task in (project.tasks as List<Task>)) {
                for(Post post in (task.posts as List<Post>))
                for (PostMember postMember in (post.members as List<PostMember>)) {
                    for(Placeholders placeholder in postMember.placeholder){
                        if (placeholder.id == placeholderId) {
                            result.add(post)
                        }
                    }
                }
            }
        }

        result.sort({ a, b -> a.name <=> b.name })
        return result
    }

    def createPlaceholder(ValidatedParameterMap validatedParams, AppUser currentUser, Matter matter)  throws Exception{
        Placeholders placeholderUser = new Placeholders(validatedParams)
        placeholderUser.organisation = currentUser.organisation
        placeholderUser.matter = matter

        def savedPlaceholder = placeholdersDAOService.save(placeholderUser)
        if(validatedParams.postId){
            Post post = Post.findById(validatedParams.postId as long)
            Task task = Task.findById(validatedParams.taskId as long)
            if (task.project.matter!=matter||!taskPostsAuthorisationService.hasWriteAccess(task.id,post,task.project.id)||task.posts.findAll(p->p.id ==post.id).size()<1){
                throw new Exception('Bad request')
            }
            savedPlaceholder = postMemberService.addPostMemberPlaceholder(matter,savedPlaceholder.id,task.id,post.id,task.projectId)

        }else if(validatedParams.taskId){
            Task task = Task.findById(validatedParams.taskId as long)
            if (task.project.matter!=matter||!taskAuthorisationService.hasWriteAccess(task.id,task.projectId)){
                throw new Exception('Bad request')
            }
            savedPlaceholder = taskTeamMemberService.addPlaceholderTeamMember(validatedParams.taskId as long,savedPlaceholder.id,task.projectId)
        }
        return savedPlaceholder
    }

    Placeholders updatePlaceholder(Placeholders placeholderToUpdate, ValidatedParameterMap params) {
        if(params.firstName){
            placeholderToUpdate.firstName = params.firstName
        }

        if(params.lastName){
            placeholderToUpdate.lastName = params.lastName
        }

        if(params.emailAddress){
            placeholderToUpdate.emailAddress = params.emailAddress
        }

        Placeholders savedPlaceholder = placeholdersDAOService.save(placeholderToUpdate)
        return savedPlaceholder
    }



    private static List<TaskTeamMember> listTaskTeamMemberInstancesByPlaceholderTeamMember(Placeholders placeholder){
        return TaskTeamMember.findAllByPlaceholder(placeholder)
    }

    private static  List<PostMember> listPostMemberInstancesByPlaceholderPostMember(Placeholders placeholder){
        return PostMember.findAllByPlaceholder(placeholder)
    }

    void merge(Long masterPlaceholderId,Long minorPlaceHolderId) throws Exception{
        Placeholders master = placeholdersDAOService.getPlaceholder(masterPlaceholderId)
        Placeholders minor   = placeholdersDAOService.getPlaceholder(minorPlaceHolderId)
        if(!master || !minor) throw new Exception('Placeholder not found')
        //TTM
        List<TaskTeamMember> masterTtms = listTaskTeamMemberInstancesByPlaceholderTeamMember(master)
        List<TaskTeamMember> ttms = listTaskTeamMemberInstancesByPlaceholderTeamMember(minor)
        ttms.each {TaskTeamMember ttm ->
            if(masterTtms.find {TaskTeamMember it -> it.taskId == ttm.taskId}){
                ttm.delete()
            } else {
                ttm.placeholder = master
                ttm.save()
            }
        }
        //Post attendees
        List<PostMember> masterPostMembers = listPostMemberInstancesByPlaceholderPostMember(master)
        List<PostMember> postMembers = listPostMemberInstancesByPlaceholderPostMember(minor)
        postMembers.each{PostMember pm ->
            if(masterPostMembers.find {PostMember it -> it.postId == pm.postId}){
                pm.delete()
            } else {
                pm.placeholder = master
                pm.save()
            }
        }
        minor.delete(flush:true)
    }
    Placeholders disablePlaceholder(Placeholders placeholderToDisable){
        placeholderToDisable.enabled = false
        Placeholders savedPlaceholder = placeholdersDAOService.save(placeholderToDisable)
        return savedPlaceholder
    }
}
