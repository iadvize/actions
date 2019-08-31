iAdvize's Github actions
==================

This is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) of [Github actions](https://github.com/features/actions)
we're using at [iAdvize](https://github.com/iadvize).

It contains : 

- [`iadvize/actions/build-javascript-actions`](./build-javascript-actions) 

## Usage

Each action can be used in your workflow this way : 

```yml
steps:
    - uses: iadvize/actions/<action>@<ref>
```

Each action comes with its own documentation. Start by looking at `./<action>/README.md`.

## Releases

Because [Javascript actions](https://help.github.com/en/articles/about-actions#types-of-actions) need to be pushed on
the repo built (ie. with `node_modules` , transpilation, etc.) we use a special workflow : 

1. We develop new features with Pull requests based on `master`. `node_modules` and transpiled code should be hidden
   with `.gitignore`.

2. Once merged on master a workflow is in charge of building them on the `release` branch. It will remove
   `node_modules` and transpiled code from each action `.gitignore`, build, `git add`, and push.

3. To version a release. Create a [Github release](https://help.github.com/en/articles/creating-releases) based on the
   `release` branch (and not `master`, that's the trick)

4. Use the new action release in your workflow with `uses: iadvize/actions/<action>@<version>` where `<version>` is the
   tag of the last release.

Because of the way versioning of Github actions is done, we can not have separate version for actions in this monorepo.
That is to say that if the last release is `1.1.1` and a Pull request create a breaking on an action, you will logically want to create a `2.0.0` release once merged. This will be applied to all actions in this repository. Each action will have to be used with `2.0.0` up then, even if no breaking have been done on it.

## Contribute

Look at contribution guidelines here : [CONTRIBUTING.md](CONTRIBUTING.md)
