# API Documentation

A collection of lists and a tool for answering questions about Juralio's API surface from
third parties — particularly when scoping external security reviews and penetration tests.

## Inventory

Plain text high level lists of aspects of the app to give an idea for scoping.

## History

Captures of API list in time to allow for simple diffs.

## Tool

gentable.py - reads in urlmapping.txt (copied from server), combines with descriptions and outputs an HTML table to api.html in current directory.

apidescriptions.py - Python dictionary of API descriptions. Carried over from an earlier
security-review submission - potentially has old unused entries.

## How to run

1. Run gentable.py
2. Add descriptions for new endpoints to apidescriptions.py
3. Re-run gentable.py and save a version in the history folder.
