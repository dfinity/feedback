# DX Feedback Board (name TBD)

> #### An IC developer feedback dapp powered by Motoko.

---

## Context

This application is indended as a realistic full-stack dapp with a Motoko backend. 

## Local Development

Make sure that [Node.js](https://nodejs.org/en/) `>= 16.x` and the latest version of [`dfx`](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) are installed on your system.

Clone this repository and run the following commands in the project root:

```sh
dfx start --clean --background # Run dfx in the background
npm run setup # Install packages, deploy canisters, and generate type bindings

npm start # Start the development server
```

When ready, run `dfx deploy` to build and deploy your application.

## Technology Stack

**Front-end Webapp:**
- [TypeScript](https://www.typescriptlang.org/): JavaScript extended with syntax for types
- [Vite](https://vitejs.dev/): high-performance tooling for front-end web development
- [React](https://reactjs.org/): a component-based UI library
- [Zustand](https://www.npmjs.com/package/zustand): a simple, clean state management library
- [Sass](https://sass-lang.com/): an extended syntax for CSS stylesheets
- [Prettier](https://prettier.io/): code formatting for a wide range of supported languages

**Back-end Service:**
- [Motoko](https://github.com/dfinity/motoko#readme): a safe and simple programming language for the Internet Computer
- [mo-dev](https://github.com/dfinity/motoko-dev-server#readme): a live reload development server for Motoko
- [MOPS](https://j4mwm-bqaaa-aaaam-qajbq-cai.ic0.app/): an on-chain community package manager for Motoko
