Assert labels Action
======================================

Assert labels presence on pull request

## Usage

The Github Workflow to use this action looks like this : 

```yaml
name: Hello world

on: pull_request 

jobs:
  build:
    runs-on: ubuntu-18.04

    name: 'Assert version labels'

    steps:
      - uses: iadvize/actions/assert-labels@<version>
        with:
          only-one-of: 'no-release,patch,minor,major'
```

### Inputs

See [`action.yml`](./action.yml) for the list of action inputs.


### Outpus

The action create two outputs: 

- `valid`. `true` if assertion is valid
- `label`. The label present if assertion is valid
