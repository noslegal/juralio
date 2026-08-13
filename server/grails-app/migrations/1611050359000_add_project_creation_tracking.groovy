databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1611050359000 - 1) {
        createTable(tableName: "task_creation_context") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_creation_contextPK")
            }
            column(name: "version", type: "bigint", {
                constraints(nullable: "true")
            })
            column(name: "task_id", type: "bigint", {
                constraints(nullable: "false")
            })

            column(name: "creator_id", type: "bigint", {
                constraints(nullable: "false")
            })

            column(name: "creation_type", type: "int") {
                constraints(nullable: "false")
            }
            column(name: "template_id", type: "BIGINT") {
                constraints(nullable: "true")
            }
            column(name: "template_task_id", type: "BIGINT") {
                constraints(nullable: "true")
            }

            column(name: "task_copy_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
        addColumn(tableName: "project") {
            column(name: "template_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
        addColumn(tableName: "project") {
            column(name: "template_task_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
        addColumn(tableName: "project") {
            column(name: "creation_type", type: "int", {
                constraints(nullable: "true")
            })
        }
    }

    changeSet(author: "juralio (generated)", id: 1611050359000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_creation_context", constraintName: "FK_TASK_ID_TO_TASK", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
        addForeignKeyConstraint(baseColumnNames: "creator_id", baseTableName: "task_creation_context", constraintName: "FK_CREATOR_ID_TO_USER", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
        addForeignKeyConstraint(baseColumnNames: "template_id", baseTableName: "task_creation_context", constraintName: "FK_TEMPLATE_ID_TO_TEMPLATE", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true")
        addForeignKeyConstraint(baseColumnNames: "template_task_id", baseTableName: "task_creation_context", constraintName: "FK_TEMPLATE_TASK_ID_TO_TEMPLATE_TASK", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task_template", validate: "true")
        addForeignKeyConstraint(baseColumnNames: "task_copy_id", baseTableName: "task_creation_context", constraintName: "FK_TASK_COPY_ID_TO_TASK", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")

        addForeignKeyConstraint(baseColumnNames: "template_id", baseTableName: "project", constraintName: "FK_TEMPLATE_ID_TO_TEMPLATE", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true")
        addForeignKeyConstraint(baseColumnNames: "template_task_id", baseTableName: "project", constraintName: "FK_TEMPLATE_TASK_ID_TO_TEMPLATE_TASK", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task_template", validate: "true")

    }
}
