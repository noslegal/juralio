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

package com.juralio.post.dao

import com.juralio.auth.AppUser
import com.juralio.matter.Placeholders
import com.juralio.post.Post
import com.juralio.post.exception.DuplicateTeamMemberException
import com.juralio.post.exception.NoValidUserException
import com.juralio.post.members.PostMember
import grails.gorm.transactions.Transactional

@Transactional
class PostMemberDAOService {
    PostMember addMemberToPost(Post post, AppUser user) {
        PostMember record = PostMember.findByPostAndUser(post, user)
        if (!record) {
            return new PostMember(post: post, user: user).save()
        }
        if (record) {
            throw new DuplicateTeamMemberException()
        }
        return record
    }

    PostMember addPlaceholderMemberToPost(Post post, Placeholders user) {
        PostMember record = PostMember.findByPostAndPlaceholder(post, user)
        if (!record) {
            return new PostMember(post: post, placeholder: user).save()
        }
        if (record) {
            throw new DuplicateTeamMemberException()
        }
        return record
    }

    PostMember removeMemberFromPost(Post post, AppUser user) {
        PostMember record = PostMember.findByPostAndUser(post, user)
        if (record) {
            record.delete()
        }
        if (!record) {
            throw new NoValidUserException()
        }

        return record
    }

    PostMember removePlaceholderMemberFromPost(Post post, Placeholders user) {
        PostMember record = PostMember.findByPostAndPlaceholder(post, user)
        if (record) {
            record.delete()
        }
        if (!record) {
            throw new NoValidUserException()
        }

        return record
    }
}