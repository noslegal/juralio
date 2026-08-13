databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1582627530000 - 1) {
        grailsChange {
            change {
                sql.eachRow("""SELECT id FROM project_template ORDER BY id""") {
                    row ->
                        def createStatement = "CREATE SEQUENCE IF NOT EXISTS template_post_reference_" + "$row.id "
                        sql.execute(createStatement)
                }
            }
        }
    }
}
