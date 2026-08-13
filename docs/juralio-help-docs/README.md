# Juralio help documentation

The complete end-user help documentation for [Juralio](https://juralio.com), a
legal matter management platform, released as plain Markdown so that it can be
adapted, extended and published in whatever help tool you prefer.

67 articles, one file per article, each with structured front matter.

## Why this exists

Product documentation is usually locked inside the vendor's help tool. That
makes it hard to fork, hard to translate, hard to diff, and impossible to reuse
when you move tools. This repository is the same documentation as source: no
vendor lock-in, no proprietary export format, no assets you cannot relicense.

It is also a worked example of a documentation set organised around a faceted
tag scheme rather than a folder hierarchy, which may be of interest
independently of the product.

## Layout

```
articles/          one Markdown file per article, flat, named by id
tags.yml           the controlled vocabulary all front matter must use
config.yml         deployment-specific values substituted at export time
index.json         generated machine-readable manifest
index.md           generated human-browsable index, faceted by tag
scripts/
  validate.py      enforces front matter, vocabulary, links and house style
  build_index.py   regenerates index.json and index.md
  export.py        emits Docusaurus, MkDocs, JSON and CSV bundles
tools/migration/   the one-off scripts that produced this repo from the
                   original single-file Google Docs export, kept for provenance
```

The directory is deliberately flat. Folder hierarchies become a second source
of truth that drifts from the tags, and every help tool wants a different
grouping anyway. Structure lives in front matter; `scripts/build_index.py`
projects it into whatever shape you need.

## Article format

```markdown
---
id: matter-permissions
title: "Matter permissions"
type: reference
role: [matter-admin, matter-editor, matter-viewer, matter-creator]
object: [matter, workstream, task, post]
surface: [matter-admin]
lifecycle: set-up
summary: "What matter creators, admins, editors and viewers can each see and change."
related: [matter-roles, add-remove-matter-people, account-types]
---

# Matter permissions

...
```

Five tag axes, all drawn from `tags.yml`:

| Axis | Cardinality | What it answers |
| --- | --- | --- |
| `type` | exactly one | What kind of article is this - concept, how-to, reference or troubleshooting? |
| `role` | one or more | Who needs it? |
| `object` | one to four | What domain nouns is it about? |
| `surface` | one or more | Where in the product does it live? |
| `lifecycle` | exactly one | At what stage does the reader need it? |

`role` carries most of the weight. In a permissions-heavy product, most reader
questions are really "am I allowed to do this?", so filtering by role is the
single most useful cut through the set.

Internal links are relative: `[matter permissions](./matter-permissions.md)`.
They resolve when browsing the repository on GitHub and are rewritten by
`scripts/export.py` for targets that need a different form.

## Placeholders

Anything specific to a particular deployment is a `{{token}}` substituted from
`config.yml` at export time - currently `{{support_email}}` and
`{{support_channel}}`. Fork `config.yml`, not the articles. `validate.py`
rejects tokens that `config.yml` does not define.

## Using it

```bash
pip install pyyaml markdown

python3 scripts/validate.py      # check the set is well formed
python3 scripts/build_index.py   # regenerate index.json and index.md
python3 scripts/export.py        # write dist/ bundles for several tools
```

`export.py` targets:

- **docusaurus** - a `docs/` tree with Docusaurus front matter and tags
- **mkdocs** - a `docs/` tree plus a generated `mkdocs.yml` with lifecycle-based nav
- **json** - `dist/articles.json`, each record carrying Markdown and rendered
  HTML. This is the route for API-based help centres such as Help Scout Docs,
  Zendesk Guide, Intercom Articles or Document360: iterate the records and POST
  them to your provider.
- **csv** - `dist/articles.csv` for spreadsheet-driven bulk importers

If you are importing into a tool with categories or collections, the
`lifecycle` axis is the most natural mapping, with `role` and `object` as
keywords or secondary tags.

## No screenshots

There are none, deliberately. The documentation is written to be intelligible
without them, which keeps the set light, translatable, and free of assets you
would have to relicense or rebrand when forking. If you add screenshots for
your own deployment, keep them in an `assets/` directory and reference them
relatively - and be aware that they will diverge from upstream as the product
changes.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the article types, the house style,
the size band, and the rules for extending `tags.yml`.

CI runs `scripts/validate.py --strict` on every pull request.

## Provenance

This set was derived from Juralio's Help Scout knowledge base, exported via
Google Docs into a single Markdown file. Converting that file into this
repository involved splitting four oversized articles, merging several
fragments, removing duplicated passages, stripping Google Docs escape
artefacts, and replacing three link regimes - single-file anchors, public Help
Scout URLs, and login-gated Help Scout URLs - with relative links. The scripts
that did it are in `tools/migration/`, and a summary of the editorial changes
is in `tools/migration/CHANGES.md`.

## Licence

The documentation in `articles/` is licensed under
[Creative Commons Attribution 4.0 International](LICENSE) (CC BY 4.0). You may
share and adapt it, including commercially, provided you give appropriate
credit and indicate whether changes were made.

The scripts in `scripts/` and `tools/` are licensed under the
[Apache License 2.0](LICENSE-CODE).

"Juralio" is a trademark. The licence covers the text, not the name: if you
publish a modified version, please do not present it as official Juralio
documentation.
