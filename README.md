
# use-compares
[![package version](https://img.shields.io/npm/v/use-compares.svg?style=flat-square)](https://npmjs.org/package/use-compares)
[![package downloads](https://img.shields.io/npm/dm/use-compares.svg?style=flat-square)](https://npmjs.org/package/use-compares)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/use-compares.svg?style=flat-square)](https://npmjs.org/package/use-compares)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Deep, custom and deterministic comparison for useEffect, useLayoutEffect, useMemo and useCallback React hooks.

## Table of Contents

- [use-compares](#use-compares)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Install](#install)
  - [Usage](#usage)
  - [Contribute](#contribute)
  - [License](#license)

## About

`useEffect`, `useLayoutEffect`, `useMemo` and `useCallback` hooks with the addition of a custom, deep or deterministic comparison of dependencies in contrast of reference equality.

This is useful for you when you want to ensure a hook only runs under specific comparison conditions. [A good mental](https://kyleshevlin.com/mental-model-of-use-effect/) to have is to see it is a if conditional comparing the previous props with the current:

```
useEffect(() => {
  if (prev !== current) {
    // Do it
  }
}, [current])
```

## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com). 

```sh
$ npm install use-compares
$ # OR
$ yarn add use-compares
```

## Usage

```js
import {
  // Allows a custom comparison function to be provided
  useCustomCompareMemo,
  useCustomCompareCallback,
  useCustomCompareEffect,
  useCustomCompareLayoutEffect,

  // Performs a deep comparison using the dequal/lite package
  useDeepCompareMemo,
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareLayoutEffect,

  // Performs a consistent hash comparison using the json-stringify-deterministic package
  useDeterministicCompareMemo,
  useDeterministicCompareCallback,
  useDeterministicCompareEffect,
  useDeterministicCompareLayoutEffect
} from "use-compares"
```

The custom compare hooks except an additional third argument which compares the current props with the previous props:

```js

import { useCustomCompareEffect } from "use-compares/custom"
import { dequal as isEqual } from "dequal/lite"

const Component = () => {

  useCustomCompareEffect(() => {
    console.log('Deep effect')
  }, [{foo: true}], isEqual)

  return null
}
```

The `deep` and `deterministic` compare varations can be seen as varations of the `custom` compare hook with the comparison function already provided using an external libary:
- [`dequal`](https://www.npmjs.com/package/dequal) - For deep comparsion.
- [`json-stringify-deterministic`](https://www.npmjs.com/package/json-stringify-deterministic) - For consistent hashed key comparison.

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`.
2. Commit your changes: `git commit -am "Add some feature"`.
3. Push to the branch: `git push origin my-new-feature`.
4. Submit a pull request.

## License

MIT © Tiaan du Plessis
    