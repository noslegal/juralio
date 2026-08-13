databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1643636056000 - 1) {
        addColumn(tableName: "task_template") {
            column(name: "is_milestone", type: "BOOLEAN", defaultValue: "false")
        }
    }
}
