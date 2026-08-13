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
import com.juralio.post.Post
import com.juralio.post.authors.PostAuthor
import grails.gorm.transactions.Transactional

@Transactional
class PostAuthorDAOService {
    PostAuthor addAuthorToPost(Post post, AppUser author) {
        return new PostAuthor(post: post, user: author).save()
    }

    PostAuthor removeAuthorFromPost(Post post, AppUser author) {
        PostAuthor record = PostAuthor.findByPostAndUser(post, author)

        if (record) {
            post.removeFromAuthors(record)
        }
        return record

    }
}