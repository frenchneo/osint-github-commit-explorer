import * as readlineSync from "readline-sync";
import { getCommits } from "./functions/getCommits";

console.log("\x1b[1m\x1b[35mWelcome to GitHub Commit Explorer!\x1b[0m");

const username: string = readlineSync.question(
  "\x1b[1m\x1b[36mEnter the GitHub username:\x1b[0m "
);

console.log("\n\x1b[1m\x1b[35mFetching GitHub commits...\x1b[0m\n");

getCommits(username)
  .then(() => {
    console.log("\x1b[1m\x1b[32mFetching complete.\x1b[0m\n");
    console.log("\x1b[1m\x1b[35m--- Credits ---\x1b[0m");
    console.log(
      "\x1b[1mGitHub:\x1b[0m \x1b[1;34mhttps://github.com/frenchneo\x1b[0m"
    );
    console.log("\x1b[1mStudent in Cybersecurity\x1b[0m\n");
  })
  .catch((error) => {
    console.error("\x1b[1;31mAn error occurred:\x1b[0m", error);
  });
