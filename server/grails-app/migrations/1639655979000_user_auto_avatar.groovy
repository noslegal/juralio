databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1639655979000 - 1) {
        addColumn(tableName: "app_user") {
            column(name: "avatar_color_index", type: "int8")
            column(name: "avatar_image_index", type: "int8")
        }

        sql('''
            UPDATE app_user SET avatar_color_index = round(random() * 4) 
        ''')

        sql('''
            UPDATE app_user SET avatar_image_index = round(random() * 21) 
        ''')
    }
}
