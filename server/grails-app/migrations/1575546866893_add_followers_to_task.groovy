databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1575546866893-1") {
        createTable(tableName: "task_follower") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_followerPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "task_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1575546866893-2") {
        addUniqueConstraint(columnNames: "task_id, user_id", constraintName: "UK3fb90a9134f07e57c81575546157", tableName: "task_follower")
    }

    changeSet(author: "juralio (generated)", id: "1575546866893-3") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "task_follower", constraintName: "FK1wg63dj67cg3ejpmvna2km157", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1575546866893-4") {
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_follower", constraintName: "FKicbd88jdegbd1cqcha6il8157", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }
}
