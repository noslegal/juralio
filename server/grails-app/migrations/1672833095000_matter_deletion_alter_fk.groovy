databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1672833095000 - 1) {
        dropForeignKeyConstraint(baseTableName: "matter_recency", constraintName: "FK1802kqe7wwlh7fy7rxmhe5f7b")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_recency", constraintName: "FK1802kqe7wwlh7fy7rxmhe5f7b", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "inbox_notification", constraintName: "FKd9pr66yyfkqvjxarx9r817ihd")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "inbox_notification", constraintName: "FKd9pr66yyfkqvjxarx9r817ihd", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "matter_admin", constraintName: "FKfrqj79bhg9gxniwku55m1fup6")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_admin", constraintName: "FKfrqj79bhg9gxniwku55m1fup6", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

    }
    changeSet(author: "juralio (generated)", id: "1672833095000-2") {
        dropForeignKeyConstraint(baseTableName: "inbox_notification", constraintName: "FKd9pr66yyfkqvjxarx9r817ihd")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "inbox_notification", constraintName: "FKd9pr66yyfkqvjxarx9r817ihd", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "matter_admin", constraintName: "FKfrqj79bhg9gxniwku55m1fup6")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_admin", constraintName: "FKfrqj79bhg9gxniwku55m1fup6", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-3") {
        dropForeignKeyConstraint(baseTableName: "user_inbox_notification", constraintName: "FK1prkedre1tskpu4bdckccjebg")
        addForeignKeyConstraint(baseColumnNames: "notification_id", baseTableName: "user_inbox_notification", constraintName: "FK1prkedre1tskpu4bdckccjebg", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "inbox_notification", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-4") {
        dropForeignKeyConstraint(baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-5") {
        dropForeignKeyConstraint(baseTableName: "task", constraintName: "FKk8qrwowg31kx7hp93sru1pdqa")
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "task", constraintName: "FKk8qrwowg31kx7hp93sru1pdqa", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-6") {
        dropForeignKeyConstraint(baseTableName: "task", constraintName: "FKk8qrwowg31kx7hp93sru1pdqa")
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "task", constraintName: "FKk8qrwowg31kx7hp93sru1pdqa", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-7") {
        dropForeignKeyConstraint(baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-8") {
        dropForeignKeyConstraint(baseTableName: "task_recency", constraintName: "FKptlivdud8vcsl3y2uvka3egbx")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_recency", constraintName: "FKptlivdud8vcsl3y2uvka3egbx", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-9") {
        dropForeignKeyConstraint(baseTableName: "task_creation_context", constraintName: "FK_TASK_ID_TO_TASK")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_creation_context", constraintName: "FK_TASK_ID_TO_TASK", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-10") {
        dropForeignKeyConstraint(baseTableName: "task_task", constraintName: "FKhx03pg4qy2hjddt7v2ub77pki")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_task", constraintName: "FKhx03pg4qy2hjddt7v2ub77pki", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-11") {
        dropForeignKeyConstraint(baseTableName: "link_resource", constraintName: "FK_link_resource_matter_id")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "link_resource", constraintName: "FK_link_resource_matter_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-12") {
        dropForeignKeyConstraint(baseTableName: "task_post", constraintName: "FKb7c4x6vqupvydangbvgjv9vp2")
        addForeignKeyConstraint(baseColumnNames: "task_posts_id", baseTableName: "task_post", constraintName: "FKb7c4x6vqupvydangbvgjv9vp2", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-13") {
        sql("""
            delete
            from link_resource_visit 
            where id in(select link_resource_visit.id from link_resource_visit
            left join link_resource on link_resource.id = link_resource_visit.link_resource_id
            where link_resource.id is null)
        """)
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "inactive_label", constraintName: "FK5522c3uh9sw2snpb7asq", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "label", constraintName: "FK1ujjmtosuhsbpjg2453u", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "link_resource_id", baseTableName: "link_resource_visit", constraintName: "FKcomd2tv90696kypkdofu", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "link_resource", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_party", constraintName: "FKrj1lvi5yiwa8v5ca8can", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_party_id", baseTableName: "matter_party_member", constraintName: "FK4bwkhh9c9e129suc64xj", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_team_member", constraintName: "FKnnuuzswscb9aakbukglm", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_viewer", constraintName: "FK63dzm7n3rzsd35yv6uqd", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "post_author", constraintName: "FKbap03ls7863bu831s3mu", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "post_member", constraintName: "FK29oiil9pppncfypn7qyi", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "workstream_id", baseTableName: "private_workstream_member", constraintName: "FKxa6rj6cmumxd0eo3wb8v", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "project_recency", constraintName: "FKjap7wbli736x27xvuof5", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "project_visit_recency", constraintName: "FKhhmypdgdwq188om8z9f6", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")

        addForeignKeyConstraint(baseColumnNames: "blocker_id", baseTableName: "task_blocker", constraintName: "FKl4hxqjcf2lbxyvm8cw3u", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_follower", constraintName: "FKri74at3ivcsj8hwvtolr", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_label", constraintName: "FK43o78a883jsv63m4l9mq", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_seen_by", constraintName: "FK7ndewz9pqxy1z5m5010q", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_team_member", constraintName: "FK5cbr7pdwk1kcz2mvcb0v", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }

    changeSet(author: "juralio (generated)", id: "1672833095000-14") {
        dropForeignKeyConstraint(baseTableName: "task_team_member", constraintName: "FKicbd88jdegbd1cqcha6il8wiq")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_team_member", constraintName: "FKicbd88jdegbd1cqcha6il8wiq", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }

    changeSet(author: "juralio (generated)", id: "1672833095000-15") {
        dropForeignKeyConstraint(baseTableName: "task_follower", constraintName: "FKicbd88jdegbd1cqcha6il8157")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_follower", constraintName: "FKicbd88jdegbd1cqcha6il8157", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")

    }
    changeSet(author: "juralio (generated)", id: "1672833095000-16") {
        dropForeignKeyConstraint(baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_matter_id")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_matter_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-17") {
        dropForeignKeyConstraint(baseTableName: "matter_viewer", constraintName: "FKl0ejhfiyb3lyarwd3a2egp5uk")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_viewer", constraintName: "FKl0ejhfiyb3lyarwd3a2egp5uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-18") {
        dropForeignKeyConstraint(baseTableName: "notification_filter_user_recency", constraintName: "FK2m1o1cvvsrt7kutoxr2vg1l1i")
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "notification_filter_user_recency", constraintName: "FK2m1o1cvvsrt7kutoxr2vg1l1i", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-19") {
        dropForeignKeyConstraint(baseTableName: "private_workstream_member", constraintName: "FK1wg63dj67cg3ejpmvna2km2n0")

        addForeignKeyConstraint(baseColumnNames: "workstream_id", baseTableName: "private_workstream_member", constraintName: "FK1wg63dj67cg3ejpmvna2km2n0", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
    }

    changeSet(author: "juralio (generated)", id: "1672833095000-20") {
        dropForeignKeyConstraint(baseTableName: "task_creation_context", constraintName: "FK_TASK_COPY_ID_TO_TASK")

        addForeignKeyConstraint(baseColumnNames: "task_copy_id", baseTableName: "task_creation_context", constraintName: "FK_TASK_COPY_ID_TO_TASK", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-21") {
        dropForeignKeyConstraint(baseTableName: "post", constraintName: "FK_ARCHIVE_MATTER_ID_OF_POST")
        dropForeignKeyConstraint(baseTableName: "post", constraintName: "FK_ARCHIVE_PROJECT_ID_OF_POST")
        dropForeignKeyConstraint(baseTableName: "post", constraintName: "FK_ARCHIVE_TASK_ID_OF_POST")
        addForeignKeyConstraint(baseColumnNames: "matter_when_archived_id", baseTableName: "post", constraintName: "FK_ARCHIVE_MATTER_ID_OF_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "project_when_archived_id", baseTableName: "post", constraintName: "FK_ARCHIVE_PROJECT_ID_OF_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "task_when_archived_id", baseTableName: "post", constraintName: "FK_ARCHIVE_TASK_ID_OF_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")

    }
    changeSet(author: "juralio (generated)", id: "1672833095000-22") {
        dropForeignKeyConstraint(baseTableName: "post_author", constraintName: "FKd94154654a8nkvieu89w7t6ok")
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "post_author", constraintName: "FKd94154654a8nkvieu89w7t6ok", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true", onDelete: "CASCADE")
    }

    changeSet(author: "juralio (generated)", id: "1672833095000-23") {
        dropForeignKeyConstraint(baseTableName: "post_member", constraintName: "FK_POST_ID_TO_POST")
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "post_member", constraintName: "FK_POST_ID_TO_POST", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-24"){
        dropForeignKeyConstraint(baseTableName: "task_post", constraintName: "FK3wgtid4ytnh7kn5w12p84hpim")
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "task_post", constraintName: "FK3wgtid4ytnh7kn5w12p84hpim", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-25"){
        dropForeignKeyConstraint(baseTableName: "project", constraintName: "FKjk5cup7d9rd2kap5j6w9odb4p")
        addForeignKeyConstraint(baseColumnNames: "deleted_mirror_id", baseTableName: "project", constraintName: "FKjk5cup7d9rd2kap5j6w9odb4p", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")

    }
    changeSet(author: "juralio (generated)", id: "1672833095000-26"){
        dropForeignKeyConstraint(baseTableName: "matter", constraintName: "FK6su8yoqkoirduuwbugctkuo9i")
        addForeignKeyConstraint(baseColumnNames: "deleted_mirror_id", baseTableName: "matter", constraintName: "FK6su8yoqkoirduuwbugctkuo9i", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-27"){
        dropForeignKeyConstraint(baseTableName: "inbox_notification", constraintName: "FKsf8vlwa965ycvlkj9cvwkm0qs")
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "inbox_notification", constraintName: "FKsf8vlwa965ycvlkj9cvwkm0qs", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true", onDelete: "CASCADE")
    }

    changeSet(author: "juralio (generated)", id: "1672833095000-28"){
        dropForeignKeyConstraint(baseTableName: "inbox_notification", constraintName: "FKcf5skqh21lkd36bj7puxfiqax")
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "inbox_notification", constraintName: "FKcf5skqh21lkd36bj7puxfiqax", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-29"){
        addForeignKeyConstraint(baseColumnNames: "label_id", baseTableName: "inactive_label", constraintName: "FK5522c3uh9sw2snpb7asy", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "label", validate: "true", onDelete: "CASCADE")

    }
    changeSet(author: "juralio (generated)", id: "1672833095000-30"){
        dropNotNullConstraint(columnDataType: "bigint", columnName: "label_id", tableName: "inactive_label")
    }
    changeSet(author: "juralio (generated)", id: "1672833095000-31"){
        dropForeignKeyConstraint(baseTableName: "link_resource", constraintName: "FK_link_resource_workstream_id")
        addForeignKeyConstraint(baseColumnNames: "workstream_id", baseTableName: "link_resource", constraintName: "FK_link_resource_workstream_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true", onDelete: "CASCADE")

    }

}
