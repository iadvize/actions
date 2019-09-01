Issue comment Action
======================================

This Github action adds a comment on an issue or pull request.

## Usage

```yaml
name: Hello world

on: pull_request

jobs:
  build:
    runs-on: ubuntu-18.04

    name: 'Say hello'

    steps:
      - uses: iadvize/actions/issue-comment@<version>
        if: github.event.action == 'opened'
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          issue_number: ${{ github.event.number }}
          comment: 'Hello world'


```

### Inputs

See [`action.yml`](./action.yml) for the list of action inputs.
