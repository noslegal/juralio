# Contributing

## The one rule that matters

Decide what **type** the article is before you write a word. Most documentation
that reads badly is a how-to and an explanation and a reference table fighting
each other inside one file. Pick one, and move the other material into its own
article with a `related` link.

## The four types

### `concept`

Explains what something is and why it behaves as it does. No numbered steps.
The reader is trying to build a mental model, not complete a task.

```
# <Noun phrase>

One or two sentences saying what this is.

## <Aspect>

## <Aspect>

## <Constraints or gotchas>
```

Examples: `matters-and-workstreams`, `matter-positions`, `blocking-links`.

### `how-to`

Gets one specific job done. Opens by saying what role or permission you need,
because in this product that is the most common reason a how-to fails. Then
steps. No conceptual digressions - link out instead.

```
# <Verb phrase>

You need to be a <role> to do this.

## <Stage>

1. ...
2. ...

## <Stage>
```

Examples: `create-a-matter`, `add-remove-matter-people`, `rate-tables`.

### `reference`

Lookup material: lists, tables, limits, permissions, definitions. Optimised for
scanning, not reading. Prefer tables and bulleted lists over prose. No
narrative.

Examples: `matter-permissions`, `accepted-urls`, `removing-task-links`.

### `troubleshooting`

Titled as the symptom, in the reader's words, not the cause. Opens by
confirming the symptom, then explains the cause, then the fix.

Example: `sso-email-change`.

## Size

Target **150 to 600 words**. `validate.py` warns below 40 and above 700.

- Over the band, the article is usually two articles. Split on the seam where
  the type changes - the concept half and the how-to half.
- Under the band, either the topic belongs inside a neighbour, or it is a
  legitimate short reference. Short reference articles are fine. Short how-tos
  usually are not, because a how-to that short is a step in someone else's
  how-to.

## Style

- UK English, second person, present tense. "You need to be a matter admin",
  not "the user must possess matter admin rights".
- Straight quotes and apostrophes, never curly. The validator enforces this;
  it keeps search and grep honest.
- No bold-wrapped headings. If a line is a heading, mark it up as one.
- Heading levels must not skip. H2 then H3, never H2 then H4.
- Never use "simply", "just", "easy" or "obviously" about a task the reader has
  come to the documentation to work out.
- Product UI labels in **bold**: the **Accounts** tab, the **FINALISE** button.
- Do not describe an icon by pointing at it ("select this icon"). Name it.
- Do not put deployment-specific details in article text. Use a `{{token}}` and
  define it in `config.yml`.

## Front matter

Every key in the template is required. See `tags.yml` for the vocabulary and
what each term means.

- `id` must equal the filename without `.md`. Once published, an id is a
  permanent URL. Do not rename it; if a title changes, change `title` only.
- `summary` is one sentence under 200 characters. It is reused as the search
  snippet and the card description, so make it say what the reader will learn,
  not what the article "covers".
- `related` should list two to five genuinely useful next articles, not every
  article that shares a tag. Faceted browsing already handles that.
- `object` should be one to four nouns. If you need five, the article is
  probably too broad.

## Extending the vocabulary

`tags.yml` is a controlled vocabulary and adding to it is a deliberate act. A
pull request that adds a term must say which existing terms were considered and
why they do not fit. Free tagging is not permitted: a tag set anyone can extend
silently stops discriminating within a release or two.

Removing or renaming a term requires updating every article that uses it in the
same pull request. `validate.py` will catch you if you forget.

## Before you open a pull request

```bash
python3 scripts/validate.py --strict
python3 scripts/build_index.py
```

Commit the regenerated `index.json` and `index.md` alongside your change. CI
runs the same two commands and fails if the index is stale.

## Adding a new article

1. Copy an existing article of the same type as a starting point.
2. Name the file for its id: lowercase, hyphenated, stable.
3. Fill in the front matter first, the body second. If you cannot write the
   `summary` in one sentence, the scope is wrong.
4. Add the new id to the `related` list of at least one existing article.
   `validate.py` warns about orphans.
