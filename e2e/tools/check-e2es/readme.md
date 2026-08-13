E2e Spec File Scanner Application
---------------------------------

Keeping the e2e tests well named, consistent and organised is key to getting the most value out of them. 

This tool performs checks on the filenames, spec names and contents in order to keep them in a good state.

History
-------

A hack time tool produced a linter which checked names and highlight other potential indicators of issues. This is the production version of this tool.

To run:
1. (First time only) npm install
2. npm run check-e2es

To run and get a summary of the results only:
1. npm run check-e2es summary
 
To run and post the summary to Slack — it goes to whichever channel your
`SLACK_WEBHOOK_URL` is configured for. Note that the post is not guarded: if that variable
is unset the underlying `curl` fails and the error is swallowed, so you get no message and
no warning.
1. npm run check-e2es summary notify
