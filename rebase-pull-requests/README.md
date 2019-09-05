Rebase Pull Requests Action
======================================

This Github action rebase pull requests.

## Usage

```yaml
name: Rebase pull requests push on master

on: 
  push:
    branches:
    - master

jobs:
  build:
    runs-on: ubuntu-18.04

    name: 'Rebase branch on master'

    steps:
      - uses: actions/checkout@v1

      - uses: iadvize/actions/rebase-pull-requests@<version>
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

See [`action.yml`](./action.yml) for the list of action inputs.
