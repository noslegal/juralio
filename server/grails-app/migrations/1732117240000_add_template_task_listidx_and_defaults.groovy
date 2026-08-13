databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1732117240000-1) {
      addColumn(tableName: "task_template") {
            column(name: "list_idx", type: "bigint", defaultValue: 0) {
                constraints(nullable: "true")
            }
        }
      sql('''
          update task
          set list_idx=0
          where list_idx is null
        ''')
    }
}
