import parseChangelog from 'changelog-parser';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
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

async function listAllReleases({octokit, owner, repo}: {octokit: Octokit, owner: string, repo: string}): Promise<RestEndpointMethodTypes["repos"]["listReleases"]["response"]["data"]> {
  const result = [];
  for(let page = 1; ; page++) {
    const res = await octokit.repos.listReleases({
      owner,
      repo,
      per_page: 100,
      page,
    });
    if (res.data.length === 0) break;
    result.push(...res.data);
  }
  return result;
}

(async () => {
  const contentResponse = await octokit.repos.getContent({
    owner,
    repo,
    path: changelogPath,
  });
  const changelogBase64: string = contentResponse.data.content;
  const changelog = Buffer.from(changelogBase64, 'base64').toString();

  const releases = await listAllReleases({octokit, owner, repo});

  const parsedChangelog = await parseChangelog({text: changelog});
  for(const {version, body} of parsedChangelog.versions) {
    if (version === null) continue;
    const tagName = `v${version}`;
    const release = releases.find(r => r.tag_name === tagName);

    if(release === undefined) {
      await octokit.repos.createRelease({
        owner,
        repo,
        body,
        tag_name: tagName
      });
      console.log(`CHANGELOG for version ${version} was created!`);
    } else {
      await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: release.id,
        body,
      });
      console.log(`CHANGELOG for version ${version} was updated!`);
    }
  }
})().catch(console.error);
