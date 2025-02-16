# Developer Experience Feedback Board

> #### An ICP developer feedback dapp powered by Motoko.

---

This project is hosted on-chain and is available at [dx.internetcomputer.org](https://dx.internetcomputer.org).

## As an example project and workflow

In addition to running as a real-world service, this project is designed to be an ideal starting point for building a full-stack Motoko dapp with a [live reload](https://blog.logrocket.com/complete-guide-full-stack-live-reload/) workflow.

**Related projects:**

1. [`mo-dev`](https://github.com/dfinity/motoko-dev-server) provides live reloading for Motoko canisters.
2. [Vite + React + Motoko](https://github.com/rvanasa/vite-react-motoko) is a beginner-friendly starter project that was originally used for this repository.


## Local Development

Make sure that [Node.js](https://nodejs.org/en/) `>= 16.x` and the latest version of [`dfx`](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) are installed on your system.

Clone this repository and run the following commands in the project root:

```sh
dfx start --clean --background # Run dfx in the background
npm run setup # Install packages, deploy canisters, and generate type bindings

npm start # Start the development server
```

When ready, run `dfx deploy` to build and deploy the application.

## Technology Stack

**Front-end Webapp:**
- [TypeScript](https://www.typescriptlang.org/): JavaScript extended with syntax for types
- [Vite](https://vitejs.dev/): high-performance tooling for front-end web development
- [React](https://reactjs.org/): a component-based UI library
- [Zustand](https://www.npmjs.com/package/zustand): a simple, clean state management library
- [Tailwind](https://tailwindcss.com/): a highly expressive, utility-first CSS framework
- [Prettier](https://prettier.io/): code formatting for a wide range of supported languages

**Back-end Service:**
- [Motoko](https://github.com/dfinity/motoko#readme): a safe and simple programming language for the Internet Computer
- [Mops](https://mops.one): an on-chain community package manager for Motoko
- [mo-dev](https://github.com/dfinity/motoko-dev-server#readme): a live reload development server for Motoko

---

This project is early in development. Please feel free to report a bug, ask a question, or request a feature on the project's [GitHub issues](https://github.com/dfinity/feedback/issues) page.

Contributions are welcome! Please check out the [contributor guidelines](https://github.com/dfinity/feedback/blob/main/.github/CONTRIBUTING.md) for more information.
