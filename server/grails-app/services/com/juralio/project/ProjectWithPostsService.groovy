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
import com.juralio.post.Post
import com.juralio.post.TaskPostsAuthorisationService
import com.juralio.post.authors.PostAuthor
import com.juralio.task.Task
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic

@CompileStatic
class ProjectWithPosts {
    long id
    String name
    String description
    String referenceNumber
    List<PostDTO> posts = []
}


@CompileStatic
class PostUserDTO {
    String username
    String firstname
    String lastname
    Integer avatarColorIndex
    Integer avatarImageIndex
    long appUserId

    PostUserDTO(String username,
                String firstname,
                String lastname, Integer avatarImageIndex, Integer avatarColorIndex, long appUserId) {
        this.username = username
        this.firstname = firstname
        this.lastname = lastname
        this.avatarColorIndex = avatarColorIndex
        this.avatarImageIndex = avatarImageIndex
        this.appUserId = appUserId
    }
}

@CompileStatic
class PostDTO {
    long id
    PostUserDTO creator = new PostUserDTO('', '', '', -1, -1, -1)
    List<PostUserDTO> authors = []
    String name
    String type
    Date dateCreated
    Date lastUpdated
    String referenceNumber
    boolean finalised
    long taskId
}

@CompileStatic
@Transactional
class ProjectWithPostsService {

    SpringSecurityService springSecurityService
    TaskPostsAuthorisationService taskPostsAuthorisationService

    ProjectWithPosts createProjectWithPosts(Project project) {
        ProjectWithPosts overview = new ProjectWithPosts()
        overview.id = project.id as long
        overview.name = project.name
        overview.referenceNumber = project.referenceNumber
        overview.description = project.description

        overview.posts = getPosts(project)

        return overview
    }

    long getPostCount(Project project) {
        long postCount = 0

        for (Task task in (project.tasks as List<Task>)) {
            postCount += task.posts ? task.posts.size() : 0
        }

        return postCount
    }

    long getUsersWorkstreamPostCount(Project project) {
        long postCount = 0
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser

        for (Task task in (project.tasks as List<Task>)) {
            if (task.posts) {
                task.posts.each { Post post ->
                    if (taskPostsAuthorisationService.hasUserPostAccess(post, currentUser)) {
                        postCount++
                    }
                }
            }
        }

        return postCount
    }

    List<PostDTO> getPosts(Project project) {
        List<PostDTO> posts = []
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser

        for (Task task in (project.tasks as List<Task>)) {
            for (Post post in (task.posts as List<Post>)) {
                if (taskPostsAuthorisationService.hasUserPostAccess(post, currentUser)) {
                    PostDTO postDetails = new PostDTO()
                    for (PostAuthor author in (post.authors as List<PostAuthor>)) {
                        AppUser user = author.getUser()
                        postDetails.authors.add(new PostUserDTO(
                                user.username,
                                user.firstname,
                                user.lastname,
                                user.avatarImageIndex,
                                user.avatarColorIndex,
                                user.id
                        ))
                    }
                    postDetails.creator.username = post.creator.username
                    postDetails.creator.firstname = post.creator.firstname
                    postDetails.creator.lastname = post.creator.lastname
                    postDetails.id = post.id as long
                    postDetails.name = post.name
                    postDetails.type = post.type
                    postDetails.dateCreated = post.dateCreated
                    postDetails.lastUpdated = post.lastUpdated
                    postDetails.referenceNumber = post.referenceNumber
                    postDetails.finalised = post.finalised
                    postDetails.taskId = task.id as long
                    posts.add(postDetails)
                }
            }
        }
        return posts
    }
}
