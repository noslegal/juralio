databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1700046381000-1) {

     addColumn(tableName: "rate_table_details") {
            column(name: "matter_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
 
    }
}
