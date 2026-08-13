databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1774277179000-1) {
            addColumn(tableName: "matter"){
            column(name: "department", type: "VARCHAR(60)",{
              constraints(nullable: "true")
            })
        }
    }
}
