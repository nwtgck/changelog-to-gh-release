# changelog-to-gh-release
![Node CI](https://github.com/nwtgck/changelog-to-gh-release/workflows/Node%20CI/badge.svg)

Fill GitHub Releases with your CHANGELOG.md

## Usage

Use the commands as follows to update releases on `nwtgck/actions-netlify` repository.

```bash
git clone https://github.com/nwtgck/changelog-to-gh-release.git
cd changelog-to-gh-release
npm ci
export GITHUB_TOKEN="your github token here"
npm start -- --owner=nwtgck --repo=actions-netlify
```

This usage will be improved to be easy to use in the future.
