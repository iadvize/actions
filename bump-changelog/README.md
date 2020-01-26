Bump changelog Action
======================================

Bump a changelog version.

## Usage

Assuming you have a changelog file following the [keepachangelog](https://keepachangelog.com/en/1.0.0/) syntax.
You want to set a version for the `## Unreleased` part, create a new empty unreleased part and add the
corresponding compare links.

The Github Workflow to use this action looks like this : 

```yaml
name: Hello world

on: someEvent 

jobs:
  build:
    runs-on: ubuntu-18.04

    name: 'Bump changelog version'

    steps:
      - uses: iadvize/actions/bump-changelog@<version>
        with:
          path: 'path/to/CHANGELOG.md' 
          version: '1.0.1' 

      - run: |
          git add path/to/CHANGELOG.md
          git commit -m "Bump changelog version"
          git push
```

### Inputs

See [`action.yml`](./action.yml) for the list of action inputs.

