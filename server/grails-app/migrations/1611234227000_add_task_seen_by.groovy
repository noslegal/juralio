databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1611234227000 - 1) {
        createTable(tableName: "task_seen_by") {
            column(name: "id", type: "int8") {
                constraints(nullable: "false", primaryKey: "true", primaryKeyName: "task_seen_byPK")
            }
            column(name: "user_id", type: "bigint")
            column(name: "task_id", type: "bigint")
            column(name: "version", type: "bigint")
        }
        addColumn(tableName: "task") {
            column(name: "created_by_id", type: "bigint")
        }

    }
}
