/*
 * // Copyright 2020 Google LLC
 * //
 * // Licensed under the Apache License, Version 2.0 (the "License");
 * // you may not use this file except in compliance with the License.
 * // You may obtain a copy of the License at
 * //
 * //     https://www.apache.org/licenses/LICENSE-2.0
 * //
 * // Unless required by applicable law or agreed to in writing, software
 * // distributed under the License is distributed on an "AS IS" BASIS,
 * // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * // See the License for the specific language governing permissions and
 * // limitations under the License.
 * //
 * //Modifications made by Joaquin Santana on 19/11/24, 11:00
 */

const PULL_REQUEST_HEAD_REF = /^refs\/pull\/\d+\/head$/;

/**
 * Find the name of a pull request's head branch. Once the head branch has
 * been deleted, Gitea reports the head ref as `refs/pull/{number}/head`,
 * which is not a release branch name, so no release can be built from the
 * pull request. The name of the deleted branch is still reported as the
 * head's label.
 *
 * @param {object} head The `head` of a pull request from the REST API
 * @returns {string} The name of the head branch
 */
export function headBranchName(head: {ref: string; label?: string}): string {
  if (head.label && PULL_REQUEST_HEAD_REF.test(head.ref)) {
    return head.label;
  }
  return head.ref;
}

const API_PATH = '/api/v1';

/**
 * Point a link returned by the API at the URL the API was configured with.
 * Gitea builds the pagination links in the `Link` header from its ROOT_URL
 * setting, not from the address the request arrived at. When the API is
 * reached at another address, such as an internal one, the next page would
 * be requested from a host that may be unreachable or answer with a login
 * page.
 *
 * @param {string} url The URL about to be requested
 * @param {string} apiUrl The configured base URL of the API
 * @returns {string} The same resource under `apiUrl` when `url` is an
 *   absolute link to the Gitea API, and `url` otherwise
 */
export function withApiUrl(url: string, apiUrl: string): string {
  const baseUrl = apiUrl.replace(/\/+$/, '');
  // route templates, like /repos/{owner}/{repo}/pulls, are already relative
  if (!baseUrl.endsWith(API_PATH) || !/^https?:\/\//i.test(url)) {
    return url;
  }
  const {pathname, search} = new URL(url);
  // ROOT_URL may have a path of its own in front of the API's
  const index = pathname.indexOf(`${API_PATH}/`);
  if (index === -1) {
    return url;
  }
  return `${baseUrl}${pathname.slice(index + API_PATH.length)}${search}`;
}

export interface PullRequestGitea {
  additions: number;
  allow_maintainer_edit: boolean;
  assignee: Assignee;
  assignees: Assignee[];
  base: Base;
  body: 'string';
  changed_files: number;
  closed_at: Date;
  comments: number;
  created_at: Date;
  deletions: number;
  diff_url: 'string';
  draft: boolean;
  due_date: Date;
  head: Base;
  html_url: 'string';
  id: number;
  is_locked: boolean;
  labels: Label[];
  merge_base: 'string';
  merge_commit_sha: 'string';
  mergeable: boolean;
  merged: boolean;
  merged_at: Date;
  merged_by: Assignee;
  milestone: Milestone;
  number: number;
  patch_url: 'string';
  pin_order: number;
  requested_reviewers: Assignee[];
  requested_reviewers_teams: Team[];
  review_comments: number;
  state: 'string';
  title: 'string';
  updated_at: Date;
  url: 'string';
  user: Assignee;
}

export interface Assignee {
  active: boolean;
  avatar_url: 'string';
  created: Date;
  description: 'string';
  email: 'user@example.com';
  followers_count: number;
  following_count: number;
  full_name: 'string';
  html_url: 'string';
  id: number;
  is_admin: boolean;
  language: 'string';
  last_login: Date;
  location: 'string';
  login: 'string';
  login_name: 'empty';
  prohibit_login: boolean;
  restricted: boolean;
  source_id: number;
  starred_repos_count: number;
  visibility: 'string';
  website: 'string';
}

export interface Base {
  label: 'string';
  ref: 'string';
  repo: Repo;
  repo_id: number;
  sha: 'string';
}

export interface Repo {
  allow_fast_forward_only_merge: boolean;
  allow_merge_commits: boolean;
  allow_rebase: boolean;
  allow_rebase_explicit: boolean;
  allow_rebase_update: boolean;
  allow_squash_merge: boolean;
  archived: boolean;
  archived_at: Date;
  avatar_url: 'string';
  clone_url: 'string';
  created_at: Date;
  default_allow_maintainer_edit: boolean;
  default_branch: 'string';
  default_delete_branch_after_merge: boolean;
  default_merge_style: 'string';
  description: 'string';
  empty: boolean;
  external_tracker: ExternalTracker;
  external_wiki: ExternalWiki;
  fork: boolean;
  forks_count: number;
  full_name: 'string';
  has_actions: boolean;
  has_issues: boolean;
  has_packages: boolean;
  has_projects: boolean;
  has_pull_requests: boolean;
  has_releases: boolean;
  has_wiki: boolean;
  html_url: 'string';
  id: number;
  ignore_whitespace_conflicts: boolean;
  internal: boolean;
  internal_tracker: InternalTracker;
  language: 'string';
  languages_url: 'string';
  licenses: 'string'[];
  link: 'string';
  mirror: boolean;
  mirror_interval: 'string';
  mirror_updated: Date;
  name: 'string';
  object_format_name: string;
  open_issues_count: number;
  open_pr_counter: number;
  original_url: 'string';
  owner: Assignee;
  parent: 'string';
  permissions: Permissions;
  private: boolean;
  projects_mode: 'string';
  release_counter: number;
  repo_transfer: RepoTransfer;
  size: number;
  ssh_url: 'string';
  stars_count: number;
  template: boolean;
  topics: 'string'[];
  updated_at: Date;
  url: 'string';
  watchers_count: number;
  website: 'string';
}

export interface ExternalTracker {
  external_tracker_format: 'string';
  external_tracker_regexp_pattern: 'string';
  external_tracker_style: 'string';
  external_tracker_url: 'string';
}

export interface ExternalWiki {
  external_wiki_url: 'string';
}

export interface InternalTracker {
  allow_only_contributors_to_track_time: boolean;
  enable_issue_dependencies: boolean;
  enable_time_tracker: boolean;
}

export interface Permissions {
  admin: boolean;
  pull: boolean;
  push: boolean;
}

export interface RepoTransfer {
  doer: Assignee;
  recipient: Assignee;
  teams: Team[];
}

export interface Team {
  can_create_org_repo: boolean;
  description: 'string';
  id: number;
  includes_all_repositories: boolean;
  name: 'string';
  organization: Organization;
  permission: string;
  units: string[];
  units_map: UnitsMap;
}

export interface Organization {
  avatar_url: 'string';
  description: 'string';
  email: 'string';
  full_name: 'string';
  id: number;
  location: 'string';
  name: 'string';
  repo_admin_change_team_access: boolean;
  username: 'string';
  visibility: 'string';
  website: 'string';
}

export interface UnitsMap {
  'repo.code': string;
  'repo.ext_issues': string;
  'repo.ext_wiki': string;
  'repo.issues': string;
  'repo.projects': string;
  'repo.pulls': string;
  'repo.releases': string;
  'repo.wiki': string;
}

export interface Label {
  color: string;
  description: 'string';
  exclusive: boolean;
  id: number;
  is_archived: boolean;
  name: 'string';
  url: 'string';
}

export interface Milestone {
  closed_at: Date;
  closed_issues: number;
  created_at: Date;
  description: 'string';
  due_on: Date;
  id: number;
  open_issues: number;
  state: 'string';
  title: 'string';
  updated_at: Date;
}
