databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1631610922000 - 1) {
        addColumn(tableName: "matter") {
            column(name: "description", type: "varchar(500)")
        }
    }
}
