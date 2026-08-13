databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1612791526000-1") {
        createTable(tableName: "task_filter_user_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_filter_user_recencyPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "filter_user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1612791526000-2") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_matter_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1612791526000-3") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1612791526000-4") {
        addForeignKeyConstraint(baseColumnNames: "filter_user_id", baseTableName: "task_filter_user_recency", constraintName: "FK_task_filter_user_recency_filter_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
