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
import com.juralio.aws.SESService
import com.juralio.common.UserDecoratorService
import com.juralio.config.ConfigService
import com.juralio.matterevent.payload.PostMarkedFinalPayload
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.PostCreatedPayload
import com.juralio.post.author.PostAuthorService
import com.juralio.post.authors.PostAuthor
import com.juralio.post.dao.PostAuthorDAOService
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.post.exception.FinalisedPostEditException
import com.juralio.post.exception.InvalidLinkUrlException
import com.juralio.post.exception.PostContentTooLongException
import com.juralio.post.member.PostMemberService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.project.ProjectWithPostsService
import com.juralio.task.Task
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.exception.InvalidDestinationParent
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import org.jsoup.Jsoup
import org.springframework.security.access.AccessDeniedException

import java.util.regex.Matcher

@Transactional
class TaskPostsService {

    TaskService taskService
    TaskPostsDAOService taskPostsDAOService
    TaskDAOService taskDAOService
    SpringSecurityService springSecurityService
    PostAuthorService postAuthorService
    PostHelperService postHelperService
    PostAuthorDAOService postAuthorDAOService
    MatterService matterService
    ProjectService projectService
    ProjectWithPostsService projectWithPostsService
    PostMemberService postMemberService
    UserDecoratorService userDecoratorService
    TaskAuthorisationService taskAuthorisationService
    TaskPostsAuthorisationService taskPostsAuthorisationService
    ConfigService configService
    SESService sesService
    MatterEventService matterEventService


    Post createTaskPost(long taskId,
                        long projectId,
                        long matterId,
                        String name,
                        String description,
                        boolean privatePost,
                        String type,
                        String url,
                        String startTime,
                        String endTime,
                        boolean finalised) throws InvalidLinkUrlException, InvalidDestinationParent {
        if (!postHelperService.isValidPostLinkURL(url)) {
            throw new InvalidLinkUrlException()
        }

        // If figma file, add onto url to make it embed
        if (url =~ /https:\/\/([\w\.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/) {
            url = "https://www.figma.com/embed?embed_host=astra&url=" + url
        }

        Task task = taskService.getTaskOnly(taskId, projectId)
        Matter matter = matterService.getMatterOnly(matterId)
        Project project = projectService.getProject(projectId)
        project.postCount = projectWithPostsService.getUsersWorkstreamPostCount(project)
        if(project.postCount> Project.MAXIMUM_POSTS){
            throw new Exception()
        }
        if(project.postCount >400 && project.postCount <402){
            String domain = configService.getProperty('domain')
            if (domain == '${DOMAIN}') {
                return
            }
            String subject = "Number of posts in a workstream"
            String body = "The organisation " + task.project.matter.organisation.id  + " on " + domain + " has hit 400 posts on a workstream."
            sesService.sendEmail("support@example.com", subject, body)
        }

        Boolean isTaskNotRequired = taskService.isMarkedAsNotRequired(task)
        if (isTaskNotRequired) {
            throw new InvalidDestinationParent("Cannot create posts in not-required tasks")
        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        Date startDateObject
        if (startTime == null) {
            startDateObject = null
        } else {
            startDateObject = new Date(startTime)
        }
        Date endDateObject
        if (endTime == null) {
            endDateObject = null
        } else {
            endDateObject = new Date(end)
        }

        Post newPost = taskPostsDAOService.createTaskPost(task, name, description, currentUser, privatePost, type, url, matterId, startDateObject, endDateObject, finalised)

        postAuthorService.addPostAuthor(currentUser.id as long, task.id as long, newPost.id as long, projectId)

        if (type && type.toLowerCase() == "meeting") {
            postMemberService.addPostMember(matter, currentUser.id as long, task.id as long, newPost.id as long, projectId)
        }
        matterEventService.publish(new PostCreatedPayload(
            taskId: task.id,
            taskName: task.name,
            taskReferenceNumber: task.referenceNumber,
            projectId: project.id,
            projectName: project.name,
            postId: newPost.id,
            postName: newPost.name,
            postType: newPost.type,
            postFinalised: newPost.finalised
        ), currentUser, matter)
        return newPost
    }

    List<Post> getPostsByTaskId(long taskId, long projectId) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskService.getTaskOnly(taskId, projectId)
        AppUser currentUser = springSecurityService.getCurrentUser()
        List<Post> allPosts = (task.posts.findAll {
            it.authors.find { it.user == currentUser } || it.finalised == true && it.privatePost == false
        }).toArray()
        return allPosts
    }

    List<Post> getPostsPreviewByTaskId(long taskId, long projectId, int limit) {
        if(!taskAuthorisationService.hasReadAccess(taskId,projectId)){
            throw new Exception()
        }
        Task task = taskDAOService.get(taskId)
        AppUser currentUser = springSecurityService.getCurrentUser()
        List<Post> allPosts = (task.posts.findAll { Post it ->
            it.authors.find { PostAuthor pa -> pa.user == currentUser } || it.finalised == true && it.privatePost == false
        }).toArray()
        return limit > 0 ? allPosts.take(limit) : allPosts
    }

    Post getPost(long taskId, long postId, long projectId) {
        if(!taskPostsAuthorisationService.hasReadAccess(taskId,postId,projectId)){
            throw new Exception()
        }
        Task task = taskService.getTaskOnly(taskId, projectId)
        Post post = taskPostsDAOService.getPost(postId)
        userDecoratorService.decorateActiveUsersOnMatter(post.authors.user, task.project.matter)
        userDecoratorService.decorateActiveUsersOnMatter(post.members.findAll{pm->pm.user}.user, task.project.matter)
        post.members.each {it.isPlaceholder = !it.user} //is this still needed
        return post
    }

    @CompileDynamic
    private boolean isPostAuthor(AppUser user, Post post) {
        return PostAuthor.findByUserAndPost(user, post) != null
    }

    def updatePost(Post updatedPost, def newProperties, long taskId, long projectId) throws PostContentTooLongException, FinalisedPostEditException, InvalidLinkUrlException {
        if(!taskPostsAuthorisationService.hasWriteAccess(taskId,updatedPost,projectId)){
            throw new Exception()
        }
        boolean currentPrivateStatus = updatedPost.privatePost
        boolean currentFinalisedStatus = updatedPost.finalised
        AppUser currentUser = springSecurityService.getCurrentUser()

        if (newProperties.description && Jsoup.parse(newProperties.description as String).text().size() > 1000) {
            throw new PostContentTooLongException()
        }
        if(updatedPost.isFinalised() &&  !isPostAuthor(currentUser,updatedPost)){
            throw new AccessDeniedException("""user $currentUser.id cannot update post $updatedPost.id
                                               as the post is finalised""")
        }

        String currentName = updatedPost.name
        String currentDescription = updatedPost.description

        if (!postHelperService.isValidPostLinkURL(newProperties.url)) {
            throw new InvalidLinkUrlException()
        }

        if (updatedPost.privatePost == false && newProperties.privatePost == true &&
                !updatedPost.authors.find { it.user == currentUser }) {
            postAuthorDAOService.addAuthorToPost(updatedPost, currentUser)
        }
        if (newProperties.finalised == true) {
            updatedPost.finalisedBy = currentUser
        } else if (newProperties.finalised == false) {
            updatedPost.finalisedBy = null

        }
        if (newProperties.url) {
            if (newProperties.url.contains('docs.google.com/document') && updatedPost.type.contains('Google')) {
                updatedPost.type = 'Google Doc'
            }
            if (newProperties.url.contains('drive.google.com/file') && updatedPost.type.contains('Google')) {
                updatedPost.type = 'Google Drive File'
            } else if (newProperties.url.contains('docs.google.com/presentation') && updatedPost.type.contains('Google')) {
                updatedPost.type = 'Google Slides'
            } else if (newProperties.url.contains('docs.google.com/spreadsheets') && updatedPost.type.contains('Google')) {
                updatedPost.type = 'Google Sheet'
            }
            String drivePatterns = ~/.*docs.google.com\/(document|presentation|spreadsheets)/
            Matcher matcher = newProperties.url =~ drivePatterns
            matcher.find()
            drivePatterns = ~/.*drive.google.com\/file/
            Matcher matcher2 = newProperties.url =~ drivePatterns
            matcher2.find()
            if (updatedPost.type.contains('Google') && matcher.size() == 0) {
                updatedPost.type = 'Web Link'
            } else if (!updatedPost.type.contains('Google') && matcher.size() > 0) {
                if (newProperties.url.contains('docs.google.com/document')) {
                    updatedPost.type = 'Google Doc'
                } else if (newProperties.url.contains('docs.google.com/presentation')) {
                    updatedPost.type = 'Google Slides'
                } else if (newProperties.url.contains('docs.google.com/spreadsheets')) {
                    updatedPost.type = 'Google Sheet'
                }
            }

            if (matcher2.size() > 0) {
                updatedPost.type = 'Google Drive File'
            }
            if (!newProperties.url.contains('miro.com/app/board') && !newProperties.url.contains('miro.com/app/live-embed') && updatedPost.type.contains('Miro Board')) {
                updatedPost.type = 'Web Link'
            }
            if (newProperties.url.contains('miro.com/app/board') || newProperties.url.contains('miro.com/app/live-embed')) {
                updatedPost.type = 'Miro Board'
            }

            // If figma file, add onto url to make it embed
            if (newProperties.url && newProperties.url =~ /https:\/\/([\w\.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/) {
                newProperties.url = "https://www.figma.com/embed?embed_host=astra&url=" + newProperties.url
            }
        }

        if (newProperties.type) {
            updatedPost.type = newProperties.type
        }

        updatedPost.properties = newProperties

        if (currentFinalisedStatus && (updatedPost.name != currentName || updatedPost.description != currentDescription)) {
            updatedPost.discard()
            throw new FinalisedPostEditException()
        }

        updatedPost.save()

        if (currentPrivateStatus == false && updatedPost.finalised != currentFinalisedStatus) {
            Task task = taskService.getTaskOnly(taskId, projectId)
            if (updatedPost.finalised && !updatedPost.privatePost) {
                matterEventService.publish(new PostMarkedFinalPayload(
                    taskId: task.id, taskName: task.name, taskLevel: task.level,
                    taskReferenceNumber: task.referenceNumber, taskStatus: task.status,
                    projectId: task.project.id, projectName: task.project.name,
                    postId: updatedPost.id, postName: updatedPost.name,
                    postType: updatedPost.type, postFinalised: updatedPost.finalised
                ), springSecurityService.getCurrentUser() as AppUser, task.project.matter)
            }
        }
    }

    def archivePost(long matterId, long projectId, long taskId, long postId) {
        if(!taskPostsAuthorisationService.hasArchiveAccess(taskId,postId)){
            throw new Exception()
        }
        Task task = taskService.getTaskOnly(taskId, projectId)
        Post post = taskPostsDAOService.getPost(postId)
        task.posts.remove(post)


        post.archivedBy = springSecurityService.getCurrentUser()
        post.archivedDate = new Date()
        post.matterWhenArchived = matterService.getMatterOnly(matterId)
        post.projectWhenArchived = projectService.getProjectOnly(projectId)
        post.taskWhenArchivedId = task.id


        task.save(flush: true, failOnError: true)
        post.save(flush: true, failOnError: true)

        return post
    }
}
