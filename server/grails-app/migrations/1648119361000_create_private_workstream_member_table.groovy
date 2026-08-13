databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1648119361000-1") {
        createTable(tableName: "private_workstream_member") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "private_workstream_memberPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "workstream_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1648119361000-2") {
        addForeignKeyConstraint(baseColumnNames: "workstream_id", baseTableName: "private_workstream_member", constraintName: "FK1wg63dj67cg3ejpmvna2km2n0", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1648119361000-3") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "private_workstream_member", constraintName: "FK1wg63dj67cg3ejpmvna2km2n1", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

}
