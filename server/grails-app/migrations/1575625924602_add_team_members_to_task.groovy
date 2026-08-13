databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1575625924602-10") {
        createTable(tableName: "task_team_member") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_team_memberPK")
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

    changeSet(author: "juralio (generated)", id: "1575625924602-11") {
        addUniqueConstraint(columnNames: "task_id, user_id", constraintName: "UK3fb90a9134f07e57c8c5daa4e6ec", tableName: "task_team_member")
    }

    changeSet(author: "juralio (generated)", id: "1575625924602-12") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "task_team_member", constraintName: "FK1wg63dj67cg3ejpmvna2km2nw", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1575625924602-13") {
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_team_member", constraintName: "FKicbd88jdegbd1cqcha6il8wiq", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }
}
