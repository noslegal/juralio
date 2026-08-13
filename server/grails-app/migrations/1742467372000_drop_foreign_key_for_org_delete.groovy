databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1742467372000-1) {
        dropForeignKeyConstraint(baseTableName: "task", constraintName: "FK4yrax92n1jfvcwpqgpoducvp2")
        addForeignKeyConstraint(baseColumnNames: "archived_by_id", baseTableName: "task", constraintName: "FK4yrax92n1jfvcwpqgpoducvp2", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")

          dropForeignKeyConstraint(baseTableName: "task_creation_context", constraintName: "fk_template_id_to_template")
        addForeignKeyConstraint(baseColumnNames: "template_id", baseTableName: "task_creation_context", constraintName: "fk_template_id_to_template", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true", onDelete: "CASCADE")

          dropForeignKeyConstraint(baseTableName: "inbox_notification", constraintName: "FKaebe1t5ws8br1ysfbr240nwk4")
        addForeignKeyConstraint(baseColumnNames: "target_user_id", baseTableName: "inbox_notification", constraintName: "FKaebe1t5ws8br1ysfbr240nwk4", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")

                dropForeignKeyConstraint(baseTableName: "task_template_post", constraintName: "fk_ttp_postid_col")
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "task_template_post", constraintName: "fk_ttp_postid_col", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true", onDelete: "CASCADE")

        dropForeignKeyConstraint(baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_filter_user_id")
        addForeignKeyConstraint(baseColumnNames: "filter_user_id", baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_filter_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
}
