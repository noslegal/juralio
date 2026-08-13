databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1617204381000 - 1) {
        sql '''
        ALTER TABLE task
        ADD COLUMN dates_linked_to_siblings BOOLEAN NOT NULL DEFAULT false
      '''
        sql '''UPDATE task set dates_linked_to_siblings=false'''
    }
}
