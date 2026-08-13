databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1588002349884-23") {
        addColumn(tableName: "project") {
            column(name: "description", type: "varchar(500)")
        }
    }
}
