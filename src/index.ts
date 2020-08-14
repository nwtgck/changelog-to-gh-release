import parseChangelog from 'changelog-parser';
import { Octokit } from '@octokit/rest';
import * as yargs from "yargs";

// Create option parser
const args = yargs
  .option("owner", {
    describe: "owner",
    type: "string",
    demandOption: true,
  })
  .option("repo", {
    describe: "repository name",
    type: "string",
    demandOption: true,
  })
  .option("github-changelog-path", {
    describe: "CHANGELOG.md path in GitHub repository",
    default: 'CHANGELOG.md'
  })
  .argv;

const owner = args.owner;
const repo = args.repo;
const changelogPath = args["github-changelog-path"];

const githubToken: string | undefined = process.env["GITHUB_TOKEN"];
if(githubToken === undefined) {
  console.error("Environment variable $GITHUB_TOKEN is defined.");
  process.exit(1);
}
const octokit = new Octokit({
  auth: githubToken,
});

(async () => {
  const contentResponse = await octokit.repos.getContent({
    owner,
    repo,
    path: changelogPath,
  });
  const changelogBase64: string = contentResponse.data.content;
  const changelog = Buffer.from(changelogBase64, 'base64').toString();

  const releasesResponse = await octokit.repos.listReleases({
    owner,
    repo,
  });
  const releases = releasesResponse.data;

  const parsedChangelog = await parseChangelog({text: changelog});
  for(const {version, body} of parsedChangelog.versions) {
    const release = releases.find(r => r.tag_name === `v${version}`);

    if(release === undefined) {
      console.error(`version: ${version} is not found`);
      continue;
    }

    await octokit.repos.updateRelease({
      owner,
      repo,
      release_id: release.id,
      body,
    });
    console.log(`CHANGELOG for version ${version} is updated!`);
  }
})();
