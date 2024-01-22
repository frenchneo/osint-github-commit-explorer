import axios, { AxiosError } from "axios";
import { CommitInfo, GitApiCommitInfo } from "../types/global";

/**
 * Fetches all commits for the given GitHub username, groups commits by email,
 * and prints commit details for each email.
 *
 * Calls GitHub API to get list of repos and commits for user.
 * Filters commits to only those authored by the given username.
 * Deduplicates emails and prints commits grouped by email.
 *
 * @param username - GitHub username to get commits for
 */
export async function getCommits(username: string) {
  try {
    const repositoriesResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );
    const repositories = repositoriesResponse.data.map(
      (repo: any) => repo.name
    );

    const allCommits: CommitInfo[] = [];

    for (const repo of repositories) {
      try {
        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${username}/${repo}/commits`
        );

        const repoCommits: CommitInfo[] = commitsResponse.data.map(
          (commit: GitApiCommitInfo) => {
            const commitAuthorUsername =
              commit.author && commit.author.login
                ? commit.author.login
                : commit.commit.author.name;
            if (commitAuthorUsername === username) {
              return {
                email: commit.commit.author.email,
                commit: {
                  message: commit.commit.message,
                  url: commit.html_url,
                },
              };
            } else {
              return null;
            }
          }
        );

        const filteredCommits = repoCommits.filter(
          (commit) => commit !== null
        ) as CommitInfo[];

        allCommits.push(...filteredCommits);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError: AxiosError = error;
          if (
            axiosError.response?.status === 409 &&
            (axiosError.response?.data as any)?.message ===
              "Git Repository is empty."
          ) {
            console.log(`\x1b[1;33mIgnoring empty repository: ${repo}\x1b[0m`);
          }
          else if (
            axiosError.response?.status === 403 &&
            (axiosError.response?.data as any)?.message ===
              "Repository access blocked"
          ) {
            console.log(
              `\x1b[1;33mIgnoring blocked repository: ${repo}\x1b[0m`
            );
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    const uniqueEmails = Array.from(
      new Set(allCommits.map((info: CommitInfo) => info.email))
    );

    uniqueEmails.forEach((email: string) => {
      const commitsForEmail = allCommits.filter((info) => info.email === email);

      console.log(
        `\x1b[1;34mCommits associated with the email: ${email}\x1b[0m`
      );

      commitsForEmail.forEach((info) => {
        console.log(`\x1b[1;32m- Message: ${info.commit.message}\x1b[0m`);
        console.log(`\x1b[1;36m  URL: ${info.commit.url}\x1b[0m`);
      });

      console.log("\n");
    });
  } catch (error: unknown) {
    console.error("\x1b[1;31mAn error occurred:\x1b[0m", error);
  }
}
