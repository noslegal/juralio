databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1616603796000 - 1) {
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
        sql '''
            ALTER TABLE app_user
            ADD teams_ejection_partial  VARCHAR(255)
        '''
    }
}
