# Metrics Gathering CLI

CLI tool to gather contributor metrics of a git repository.

## Setup

Install npm dependencies after cloning the repo: `npm i`

## Usage

* View usage: `npm start`
* Run the application (without compiling): `npm start <absolute_path_to_git_repository>`
* Run test cases: `npm test`
* Lint the source: `npm run lint`
* Compile the source: `npm run build`
* Run the compiled application: `npm run start:built <absolute_path_to_git_repository>`

## Assumptions

The CLI updates the `README.md` file with the *number of committers with multiple contributions* in the target git repository using magic comments.
Please place the following comment block in the `README.md` file.

```md
<!-- AUTO-GENERATED-CONTENT:START (inline) -->
<!-- AUTO-GENERATED-CONTENT:END -->
```
