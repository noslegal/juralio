databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1609859180000-1") {
        addColumn(tableName: "notice") {
            column(name: "image_name", type: "varchar(255)")
        }
    }

    changeSet(author: "juralio (generated)", id: "1609859180000-2") {
        sql('''
            update notice 
            set image_name = id || '.svg\'
        ''')
    }
}
