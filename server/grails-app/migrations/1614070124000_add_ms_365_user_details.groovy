databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1614070124000 - 1) {
        addColumn(tableName: "app_user") {
            column(name: "third_party_user_id", type: "VARCHAR(5000)", defaultValue: null)
            column(name: "is_third_party_user", type: "BOOLEAN", defaultValue: false)
            column(name: "third_party_provider", type: "VARCHAR(5000)", defaultValue: null)
        }

        /*
          insert your migration here, e.g.

          createTable(tableName: "film") {
              column(name: "id", type: "int8") {
                  constraints(nullable: "false", primaryKey: "true", primaryKeyName: "filmPK")
              }
              column(name: "title", type: "varchar(255)")
              column(name: "description", type: "text")
          }
        */
    }
}
