databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1601976411000-1") {
        addColumn(tableName: "task") {
            column(name: "task_parent_when_archived", type: "BIGINT", defaultValue: -1)
        }
    }
}
