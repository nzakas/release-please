// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {headBranchName, withApiUrl} from '../../src/util/gitea';
import {BranchName} from '../../src/util/branch-name';

describe('headBranchName', () => {
  it('uses the ref while the head branch exists', () => {
    const name = headBranchName({
      ref: 'release-please--branches--main',
      label: 'release-please--branches--main',
    });
    expect(name).to.eql('release-please--branches--main');
  });
  it('uses the label once the head branch is deleted', () => {
    const name = headBranchName({
      ref: 'refs/pull/24/head',
      label: 'release-please--branches--main--components--storage',
    });
    expect(name).to.eql('release-please--branches--main--components--storage');
    const branchName = BranchName.parse(name);
    expect(branchName?.getTargetBranch()).to.eql('main');
    expect(branchName?.getComponent()).to.eql('storage');
  });
  it('keeps the ref when there is no label', () => {
    // pull requests pushed to refs/for/* have an empty label
    expect(headBranchName({ref: 'refs/pull/24/head', label: ''})).to.eql(
      'refs/pull/24/head'
    );
    expect(headBranchName({ref: 'refs/pull/24/head'})).to.eql(
      'refs/pull/24/head'
    );
  });
  it('keeps the ref of a branch that only looks like a pull request', () => {
    const name = headBranchName({
      ref: 'refs/pull/24/head-fix',
      label: 'someone:refs/pull/24/head-fix',
    });
    expect(name).to.eql('refs/pull/24/head-fix');
  });
});

describe('withApiUrl', () => {
  const apiUrl = 'http://192.168.1.10:3000/api/v1';

  it('moves a link from another host to the API URL', () => {
    const url = withApiUrl(
      'https://gitea.example.com/api/v1/repos/fake/fake/pulls?state=closed&page=2',
      apiUrl
    );
    expect(url).to.eql(
      'http://192.168.1.10:3000/api/v1/repos/fake/fake/pulls?state=closed&page=2'
    );
  });
  it('leaves a link that is already under the API URL unchanged', () => {
    const url = `${apiUrl}/repos/fake/fake/tags?page=2`;
    expect(withApiUrl(url, apiUrl)).to.eql(url);
  });
  it('drops the path that ROOT_URL adds in front of the API', () => {
    const url = withApiUrl(
      'https://example.com/gitea/api/v1/repos/fake/fake/tags?page=2',
      apiUrl
    );
    expect(url).to.eql(
      'http://192.168.1.10:3000/api/v1/repos/fake/fake/tags?page=2'
    );
  });
  it('keeps the path of the API URL', () => {
    const url = withApiUrl(
      'https://gitea.example.com/api/v1/repos/fake/fake/tags?page=2',
      'http://192.168.1.10/gitea/api/v1/'
    );
    expect(url).to.eql(
      'http://192.168.1.10/gitea/api/v1/repos/fake/fake/tags?page=2'
    );
  });
  it('leaves an escaped path as it is', () => {
    const url = withApiUrl(
      'https://gitea.example.com/api/v1/repos/fake/fake/contents/a%20b%2Fc?ref=main',
      apiUrl
    );
    expect(url).to.eql(
      'http://192.168.1.10:3000/api/v1/repos/fake/fake/contents/a%20b%2Fc?ref=main'
    );
  });
  it('leaves a route template unchanged', () => {
    const url = '/repos/{owner}/{repo}/pulls';
    expect(withApiUrl(url, apiUrl)).to.eql(url);
  });
  it('leaves a link outside the API unchanged', () => {
    const url = 'https://gitea.example.com/fake/fake/releases/download/v1/a';
    expect(withApiUrl(url, apiUrl)).to.eql(url);
  });
  it('leaves every link unchanged when the API is not Gitea', () => {
    // a repository named api/v1 has the Gitea API path in its links
    const url = 'https://uploads.github.com/repos/api/v1/releases?page=2';
    expect(withApiUrl(url, 'https://api.github.com')).to.eql(url);
  });
});
