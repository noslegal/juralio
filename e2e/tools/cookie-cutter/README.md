# cookie cutter

A tool to automate making API security tests for checking status codes.

# About

This is a tool to create Cypress API security tests from a template.

It takes the URLs from URLMappings.groovy in the server code to make a list of endpoint settings, such as for example:

```json
[
  ...
  {
    "endpoint": "/api/matters",
    "permissions": {
      "GET": "OK",
      "POST": "METHOD_NOT_ALLOWED",
      "PATCH": "METHOD_NOT_ALLOWED",
      "DELETE": "METHOD_NOT_ALLOWED"
    }
  },
  ...
]
```

You can then use this as an input file for this tool to set the expected responses for a user role.

e.g. take `outputs/list_of_endpoints.json` and copy it into `inputs/matterViewer_permissions.json` and change the `"permissions"` section to what is the expected response code for the different endpoints for the matter viewer role.

The created Cypress test files will be written to the security Cypress folder, in `e2e/security/cypress/e2e/cookie-cut/`.

# How to run

```
npm install
npm run cookie-cutter
```

This will show a menu:

```
=====================================================
=============== Cypress cookie cutter ===============
=====================================================

----  .__o
----- _-_<,
---  (*)/'(*)
---------------------------

What would you like to do?
1 - Create a json file from URLMappings
2 - Use an input file to create a Cypress file per endpoint
3 - Use an input file to create one Cypress file with all endpoints

q - Exit

Please pick an option:

```

The `inputs` folder is for inputs into the program.

Remember to update the `config.js` file.

# About Options

## Option 1

Scans `UrlMappings.groovy` and creates a `.json` file to be used as input for options 2/3.

## Option 2

Uses `INPUT_PATH` file specified in `config.js` to create lots of Cypress files, one per endpoint.

## Option 3

Uses `INPUT_PATH` file specified in `config.js` to create one big Cypress test file.

# Troubleshooting

### Can't find file x

This relies on relative paths in the code base.
It's assuming it is being run from `npm run cookie-cutter` in the directory `juralio-mm/e2e/tools/cookie-cutter`.
