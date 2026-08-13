databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1603709336000-1") {
        addColumn(tableName: "task") {
            column(name: "date_created", type: "timestamp")
        }
    }
}

