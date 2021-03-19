jest.createMockFromModule("octocat")

/**
 * TODO: this file needs to be cleaned up to be somewhat readable / a helper function that
 * allows version numbers / id / release tags / size to be injected in a manner that makes
 * the tests readable and editable
 */

module.exports = class OctoCat {
  constructor() {}
  repo() {
    return {
      releases: () =>
        new Promise((rRes) => {
          rRes({
            all: () =>
              new Promise((res) => {
                res([
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034966",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034966/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034966/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/0.9.1-beta.1",
                    id: 40034966,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0OTY2",
                    tag_name: "0.9.1-beta.1",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: true,
                    created_at: "2021-03-18T22:31:12Z",
                    published_at: "2021-03-18T22:35:49Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669473",
                        id: 33669473,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5NDcz",
                        name: "test-osx.dmg",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/x-diskcopy",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:35:46Z",
                        updated_at: "2021-03-18T22:35:47Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.1-beta.1/test-osx.dmg",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669474",
                        id: 33669474,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5NDc0",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:35:47Z",
                        updated_at: "2021-03-18T22:35:47Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.1-beta.1/test-osx.zip",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669472",
                        id: 33669472,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5NDcy",
                        name: "test.exe",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/octet-stream",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:35:45Z",
                        updated_at: "2021-03-18T22:35:46Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.1-beta.1/test.exe",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/0.9.1-beta.1",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/0.9.1-beta.1",
                    body: "",
                  },
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034724",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034724/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034724/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/v0.9.2-alpha.1",
                    id: 40034724,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0NzI0",
                    tag_name: "v0.9.2-alpha.1",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: true,
                    created_at: "2021-03-18T22:31:12Z",
                    published_at: "2021-03-18T22:28:37Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669275",
                        id: 33669275,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5Mjc1",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:28:30Z",
                        updated_at: "2021-03-18T22:28:31Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v0.9.2-alpha.1/test-osx.zip",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/v0.9.2-alpha.1",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/v0.9.2-alpha.1",
                    body: "",
                  },
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034693",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034693/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034693/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/v1.1.0-alpha.0",
                    id: 40034693,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0Njkz",
                    tag_name: "v1.1.0-alpha.0",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: true,
                    created_at: "2021-03-18T22:31:12Z",
                    published_at: "2021-03-18T22:27:44Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669251",
                        id: 33669251,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MjUx",
                        name: "test-osx.dmg",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/x-diskcopy",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:27:40Z",
                        updated_at: "2021-03-18T22:27:40Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.1.0-alpha.0/test-osx.dmg",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669252",
                        id: 33669252,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MjUy",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:27:40Z",
                        updated_at: "2021-03-18T22:27:40Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.1.0-alpha.0/test-osx.zip",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669250",
                        id: 33669250,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MjUw",
                        name: "test.exe",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/octet-stream",
                        state: "uploaded",
                        size: 22,
                        download_count: 7,
                        created_at: "2021-03-18T22:27:39Z",
                        updated_at: "2021-03-18T22:27:40Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.1.0-alpha.0/test.exe",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/v1.1.0-alpha.0",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/v1.1.0-alpha.0",
                    body: "",
                  },
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034687",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034687/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034687/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/v1.0.1-beta.0",
                    id: 40034687,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0Njg3",
                    tag_name: "v1.0.1-beta.0",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: true,
                    created_at: "2021-03-18T22:31:12Z",
                    published_at: "2021-03-18T22:27:27Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669243",
                        id: 33669243,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MjQz",
                        name: "test-osx.dmg",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/x-diskcopy",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:27:24Z",
                        updated_at: "2021-03-18T22:27:24Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.0.1-beta.0/test-osx.dmg",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669245",
                        id: 33669245,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MjQ1",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:27:24Z",
                        updated_at: "2021-03-18T22:27:25Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.0.1-beta.0/test-osx.zip",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669241",
                        id: 33669241,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MjQx",
                        name: "test.exe",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/octet-stream",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:27:23Z",
                        updated_at: "2021-03-18T22:27:24Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.0.1-beta.0/test.exe",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/v1.0.1-beta.0",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/v1.0.1-beta.0",
                    body: "",
                  },
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034638",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034638/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034638/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/v1.0.0",
                    id: 40034638,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0NjM4",
                    tag_name: "v1.0.0",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: false,
                    created_at: "2021-03-18T22:31:12Z",
                    published_at: "2021-03-18T22:27:02Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669106",
                        id: 33669106,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MTA2",
                        name: "test-osx.dmg",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/x-diskcopy",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:26:16Z",
                        updated_at: "2021-03-18T22:26:17Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.0.0/test-osx.dmg",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669108",
                        id: 33669108,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MTA4",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:26:17Z",
                        updated_at: "2021-03-18T22:26:17Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.0.0/test-osx.zip",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669103",
                        id: 33669103,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MTAz",
                        name: "test.exe",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/octet-stream",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:26:16Z",
                        updated_at: "2021-03-18T22:26:16Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/v1.0.0/test.exe",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/v1.0.0",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/v1.0.0",
                    body: "",
                  },
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034624",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034624/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034624/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/0.9.1-beta",
                    id: 40034624,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0NjI0",
                    tag_name: "0.9.1-beta",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: true,
                    created_at: "2021-03-18T22:22:09Z",
                    published_at: "2021-03-18T22:25:58Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669033",
                        id: 33669033,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MDMz",
                        name: "test-osx.dmg",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/x-diskcopy",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:25:52Z",
                        updated_at: "2021-03-18T22:25:52Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.1-beta/test-osx.dmg",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669034",
                        id: 33669034,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MDM0",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:25:52Z",
                        updated_at: "2021-03-18T22:25:53Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.1-beta/test-osx.zip",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33669029",
                        id: 33669029,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY5MDI5",
                        name: "test.exe",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/octet-stream",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:25:51Z",
                        updated_at: "2021-03-18T22:25:52Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.1-beta/test.exe",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/0.9.1-beta",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/0.9.1-beta",
                    body: "",
                  },
                  {
                    url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034571",
                    assets_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/releases/40034571/assets",
                    upload_url:
                      "https://uploads.github.com/repos/biw/nuts-testing-repo/releases/40034571/assets{?name,label}",
                    html_url:
                      "https://github.com/biw/nuts-testing-repo/releases/tag/0.9.0",
                    id: 40034571,
                    author: {
                      login: "biw",
                      id: 6139501,
                      node_id: "MDQ6VXNlcjYxMzk1MDE=",
                      avatar_url:
                        "https://avatars.githubusercontent.com/u/6139501?v=4",
                      gravatar_id: "",
                      url: "https://api.github.com/users/biw",
                      html_url: "https://github.com/biw",
                      followers_url:
                        "https://api.github.com/users/biw/followers",
                      following_url:
                        "https://api.github.com/users/biw/following{/other_user}",
                      gists_url:
                        "https://api.github.com/users/biw/gists{/gist_id}",
                      starred_url:
                        "https://api.github.com/users/biw/starred{/owner}{/repo}",
                      subscriptions_url:
                        "https://api.github.com/users/biw/subscriptions",
                      organizations_url:
                        "https://api.github.com/users/biw/orgs",
                      repos_url: "https://api.github.com/users/biw/repos",
                      events_url:
                        "https://api.github.com/users/biw/events{/privacy}",
                      received_events_url:
                        "https://api.github.com/users/biw/received_events",
                      type: "User",
                      site_admin: false,
                    },
                    node_id: "MDc6UmVsZWFzZTQwMDM0NTcx",
                    tag_name: "0.9.0",
                    target_commitish: "main",
                    name: "",
                    draft: false,
                    prerelease: false,
                    created_at: "2021-03-18T22:22:09Z",
                    published_at: "2021-03-18T22:24:56Z",
                    assets: [
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33668954",
                        id: 33668954,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY4OTU0",
                        name: "test-osx.dmg",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/x-diskcopy",
                        state: "uploaded",
                        size: 22,
                        download_count: 0,
                        created_at: "2021-03-18T22:24:36Z",
                        updated_at: "2021-03-18T22:24:37Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.0/test-osx.dmg",
                      },
                      {
                        url:
                          "https://api.github.com/repos/biw/nuts-testing-repo/releases/assets/33668959",
                        id: 33668959,
                        node_id: "MDEyOlJlbGVhc2VBc3NldDMzNjY4OTU5",
                        name: "test-osx.zip",
                        label: null,
                        uploader: {
                          login: "biw",
                          id: 6139501,
                          node_id: "MDQ6VXNlcjYxMzk1MDE=",
                          avatar_url:
                            "https://avatars.githubusercontent.com/u/6139501?v=4",
                          gravatar_id: "",
                          url: "https://api.github.com/users/biw",
                          html_url: "https://github.com/biw",
                          followers_url:
                            "https://api.github.com/users/biw/followers",
                          following_url:
                            "https://api.github.com/users/biw/following{/other_user}",
                          gists_url:
                            "https://api.github.com/users/biw/gists{/gist_id}",
                          starred_url:
                            "https://api.github.com/users/biw/starred{/owner}{/repo}",
                          subscriptions_url:
                            "https://api.github.com/users/biw/subscriptions",
                          organizations_url:
                            "https://api.github.com/users/biw/orgs",
                          repos_url: "https://api.github.com/users/biw/repos",
                          events_url:
                            "https://api.github.com/users/biw/events{/privacy}",
                          received_events_url:
                            "https://api.github.com/users/biw/received_events",
                          type: "User",
                          site_admin: false,
                        },
                        content_type: "application/zip",
                        state: "uploaded",
                        size: 26,
                        download_count: 0,
                        created_at: "2021-03-18T22:24:50Z",
                        updated_at: "2021-03-18T22:24:50Z",
                        browser_download_url:
                          "https://github.com/biw/nuts-testing-repo/releases/download/0.9.0/test-osx.zip",
                      },
                    ],
                    tarball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/tarball/0.9.0",
                    zipball_url:
                      "https://api.github.com/repos/biw/nuts-testing-repo/zipball/0.9.0",
                    body: "",
                  },
                ])
              }),
          })
        }),
    }
  }
}
