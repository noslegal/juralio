databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1666097160000-1) {
        createTable(tableName: "task_blocker") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "taks_blockerPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "blocker_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "blocked_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "relationship", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }

    }
}
