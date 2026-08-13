databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1642416432000 - 1) {
        addColumn(tableName: "task_recency") {
            column(name: "matter_id", type: "BIGINT")
        }
    }
}
