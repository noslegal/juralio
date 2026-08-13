databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1746111630000-1) {
            addColumn(tableName: "task") {
            column(name: "is_deliverable", type: "BOOLEAN", defaultValue: "false")
        }

                addColumn(tableName: "task_template") {
            column(name: "is_deliverable", type: "BOOLEAN", defaultValue: "false")
        }
    }
}
