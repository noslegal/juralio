databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1616666364000 - 1) {
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
        createTable(tableName: 'visit') {
            column(name: "id", type: "int8") {
                constraints(nullable: "false", primaryKey: "true")
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "url_partial", type: "varchar(255)") {
                constraints(nullable: "true")
            }
            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "true")
            }
        }
    }
}
