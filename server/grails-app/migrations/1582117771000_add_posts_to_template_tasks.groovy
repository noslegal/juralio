databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1582117771000 - 1) {
        createTable(tableName: "task_template_post") {
            column(name: "task_template_posts_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "post_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: 1582117771000 - 3) {
            addForeignKeyConstraint(baseColumnNames: "task_template_posts_id", baseTableName: "task_template_post", constraintName: "FK_TTP_TTID_COL", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task_template", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: 1582117771000 - 5) {
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "task_template_post", constraintName: "FK_TTP_POSTID_COL", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true")
    }
}
