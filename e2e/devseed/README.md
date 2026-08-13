# DevSeed

This is not a test suite but sets up sample data for development and testing.

1. Stop grails
2. Clean DB
3. Start grails
4. Run init_devseed.sh in e2e folder

`init_devseed.sh` runs every spec in this directory via Cypress. The specs are:

## seed_spec.js - General purpose dataset

Creates the following users (including 'matter creator' from Grails seed data):

| Names         |        Username               | Role
|---------------|-------------------------------|---------
|User9 User9    |	juruser9@juralio.com	    |	Standard
|User8 User8    |	juruser8@juralio.com	    |	Standard
|User7 User7    |	juruser7@juralio.com	    |	Standard
|User6 User6    |	juruser6@juralio.com	    |	Standard
|User5 User5    |	juruser5@juralio.com	    |	Standard
|User4 User4    |	juruser4@juralio.com	    |	Standard
|User3 User3    |	juruser3@juralio.com	    |	Standard
|User2 User2    |	juruser2@juralio.com	    |	Standard
|User1 User1    |	juruser1@juralio.com	    |	Standard
|User0 User0    |	juruser0@juralio.com	    |	Standard
|Org Admin      |	jurorgadmin@juralio.com	    |   Org admin	
|Juralio User   |   juruser@juralio.com	        |   Org admin	
|matter creator |	matter.creator@juralio.com  |	Matter creator	

All are members of the default Organisation.

|Project    |   Description
|-----------|--------------
|Seed       | Small project 8 level A's and 1 level F

Seed task named task1 - has multiple notes of different types.

## recency_bulk_test_spec.js - Bulk data for the recency feature

Creates a fresh user and two identical matters, each with two workstreams
(`Workstream1`, `Workstream2`) of eight level-A tasks, the first of which has six
subtasks. Used to generate enough recently-touched content to exercise the recency
lists by hand; it is not an assertion-based test.

### Development
 
Use the DEV_MODE flag if you want to run the script multiple times without wiping the database.