import { isAbsolute, join } from 'node:path';
import process from 'node:process';
import shell from 'shelljs';
import { countBy, mergeWith, values } from 'lodash-es';
import markdownMagic from 'markdown-magic';

/**
 * main fuction that carries out the following cli flow.
 * 1. validate preconditions
 * 2. get contributors for each project
 * 3. get the contributions per committer
 * 4. get the multiple contributions count
 * 5. update README.md file in the target repo
 * @param dir string
 * @param projectsDir string
 */
export function main(dir: string, projectsDir: string) {
  validatePreConditions(dir, projectsDir);
  changeToTargetDir(dir); // change into the target git repo directory
  const contributors = getContributors(projectsDir);
  const contribsPerUser = getContributionFrequency(contributors);
  const multiContribCount = getMultiContribCount(contribsPerUser);
  updateReadMe(multiContribCount);
}

/**
 * validate the following preconditions and fail fast (print message and exit proces) if any is not met.
 * 1. dir is absolute path
 * 2. dir exists
 * 3. dir is a git repo
 * 4. projects directory exists
 * @param dir string
 * @param projectsDir string
 */
export function validatePreConditions(dir: string, projectsDir: string) {
  if (!isAbsolute(dir)) {
    throw new Error(`${dir} is not absolute path`);
  }

  if (!shell.test('-e', dir)) {
    throw new Error(`${dir} does not exist`);
  }

  if (shell.exec(`git -C ${dir} rev-parse`).code !== 0) {
    throw new Error(`${dir} is not a git repository`);
  }

  const projectsPath = join(dir, projectsDir);
  if (!shell.test('-e', projectsPath)) {
    throw new Error(
      `${projectsPath} does not exist. please use -p flag to provide packages directory`,
    );
  }
}

/**
 * change into the target repo directory.
 * After this point, process.cwd() will be the target repo directory.
 * @param dir string
 */
export function changeToTargetDir(dir: string) {
  shell.config.silent = true; // silence stdout
  shell.cd(join(dir));
}

/**
 * get the projects, get the contributors of each project and return an array of project contributor arrays
 * @param projectsDir string
 * @returns contributors Array<Record<string, number>> Array of contribution objects per project.
 *          Example: [{ 'Isaac Mann': 1 }, { Bob: 1, 'Isaac Mann': 1 }, { Aliyah: 1, Bob: 1 }]
 */
export function getContributors(projectsDir: string) {
  const contributors = [];
  for (const project of getProjectsCmd(projectsDir)) {
    const outputStr = getCommittersCmd(project);
    const contributorsForProject = outputStr.split('\n');
    const freqObj = countBy(contributorsForProject);
    contributors.push(freqObj);
  }

  return contributors;
}

/**
 * separate function to execute external command to get projects under the project directory
 * * @param projectsDir string
 * @returns Array strings representing projects under projects directory
 */
export function getProjectsCmd(projectsDir: string) {
  return shell.ls('-d', `${projectsDir}/*/`);
}

/**
 * separate function to execute external command to get committers list for a project
 * @param project name of the project directory
 * @returns string in format 'Bob\nIsaac Mann' representing the committers list for the project
 */
export function getCommittersCmd(project: string) {
  // %cn is the committer names: https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History
  return shell.exec(`git log --pretty=format:"%cn" ${project}`);
}

/**
 * find the frequency of contributions of contributors
 * @param contributors [Record<string, int>]
 * @returns Record<string, number> Object with committer name as key and number of contributions as value.
 *          Example: {user1: 3, user2: 2, user3: 2, user4: 3}
 */
export function getContributionFrequency(
  contributors: Array<Record<string, number>>,
) {
  const contribSummary: Record<string, number> = {};
  mergeWith(
    contribSummary,
    ...contributors,
    (objValue: number, srcValue: number) => {
      const val = objValue ? objValue + srcValue : srcValue;
      return val;
    },
  );
  return contribSummary;
}

/**
 * return the count of numtiple contributions
 * @param contribsPerUser Record<string, number>
 */
export function getMultiContribCount(contribsPerUser: Record<string, number>) {
  let count = 0;
  for (const val of values(contribsPerUser)) {
    if (val > 1) {
      count++;
    }
  }

  return count;
}

export function updateReadMe(count: number) {
  console.log(`Updating the readme with count = ${count}`);
  // reminder: process.cwd() is the target repo directory at this point
  const markdownPath = join(process.cwd(), 'README.md');
  markdownMagic(markdownPath, {
    transforms: {
      inline: () => `
Number of committers with multiple contributions: **${count}**
      `,
    },
  });
}
