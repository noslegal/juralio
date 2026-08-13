databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1661332903000-1) {
        sql """
          		    ALTER TABLE project_template ADD COLUMN company_image VARCHAR(500);
        """
    }
}
