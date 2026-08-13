databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1607338806000-1") {
        addColumn(tableName: "organisation") {
            column(name: "logo", type: "varchar(5000)")
        }
    }
}
