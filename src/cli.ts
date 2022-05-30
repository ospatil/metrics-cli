#!/usr/bin/env node
import meow from 'meow';
import { main } from './main.js';

const cli = meow(
  `
	Usage
	  $ metrics-cli <absolute_path_to_git_repository>

	Options
	  --projects-dir, -p Projects directory name under the git repository (default: "packages")

	Examples
	  $ metrics-cli /Users/frodo/work-dir/my-git-repo
`,
  {
    importMeta: import.meta,
    flags: {
      projectsDir: {
        type: 'string',
        alias: 'p',
        default: 'packages',
      },
    },
  },
);

if (cli.input.length === 0) {
  cli.showHelp();
}

main(cli.input[0], cli.flags.projectsDir);
