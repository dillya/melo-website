# Melo Website repository

This repository contains the source code of the website for [Melo](https://melo.re) project.

## Getting started

The [Melo website](https://melo.re) is entirely generated with:

- [Astro](https://astro.build/) for static generation and templating,
- [Floating UI](https://floating-ui.com/) for Tooltips and Popover components,
- [Iconify](https://iconify.design/) for Icon components,
- [React](https://react.dev/) for interactive components,
- [TailwindCSS](https://tailwindcss.com/) for CSS utility classes.

### Pre-requires

A recent version of `npm` is necessary to build the project: the version `9.2.0` was used to setup
this project.

On **Debian** / **Ubuntu** OS, the default packaged version can be used:

```sh
sudo apt install npm
```

Then, the development dependencies can be installed as usual with:

```sh
npm install
```

### Build a production site

The `package.json` is embedding default commands to build and preview the production site:

- Build the production site into `dist`

```sh
npm run build
```

- Preview the production site at [localhost:4321](http://localhost:4321) (requires a `build` before)

```sh
npm run preview
```

### Development mode

The `package.json` is also providing a **development** mode to iterate without rebuilding every time:

```sh
npm run dev
```

This command make a local development server accessible at [localhost:4321](http://localhost:4321).

### Astro commands

Finally, the **astro** command line client can be accessed with:

```
npm run astro ARGS
```

## Copyright / License

All files from this repository are distributed under the [MIT](LICENSE) license.

Copyright @ 2025 Alexandre Dilly - Sparod
