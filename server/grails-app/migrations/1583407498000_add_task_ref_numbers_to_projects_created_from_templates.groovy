databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1583407498000 - 1) {
        grailsChange {
            change {
                sql.eachRow("""
											SELECT task.*, project.matter_id
											FROM task
											INNER JOIN project ON task.project_id=project.id
											INNER JOIN matter ON project.matter_id=matter.id
											WHERE matter.deleted_mirror_id IS NOT NULL
											ORDER BY matter_id, id
											""") {
                    row ->
                        def sequence = "matter_content_reference_" + "$row.matter_id"

                        def updateStatement = """
													UPDATE task
                          SET reference_number = 'JUR' || nextval($sequence)
                          WHERE id = $row.id AND reference_number IS NULL
                          """

                        sql.execute(updateStatement)
                }
            }
        }
    }
}
