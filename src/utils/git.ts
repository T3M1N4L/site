import { execSync } from "child_process";

export interface GitInfo {
  commitHash: string;
  commitBranch: string;
  commitMessage: string;
  commitDate: string;
}

export const getGitInfo = (): GitInfo => {
  try {
    const exec = (cmd: string) => execSync(cmd).toString().trim();
    return {
      commitHash: exec(`git rev-parse HEAD`),
      commitBranch: exec(`git rev-parse --abbrev-ref HEAD`),
      commitMessage: exec(`git log -1 --pretty=%B`),
      commitDate: exec(`git log -1 --pretty=%cd`),
    };
  } catch (error) {
    console.error("Error getting Git info:", error);
    return {
      commitHash: "",
      commitMessage: "",
      commitBranch: "",
      commitDate: "",
    };
  }
};

export const getGitHashShort = (): string => {
  return getGitInfo().commitHash.slice(0, 7);
};

export const getCommitDate = (): string => {
  const info = getGitInfo();
  return info.commitDate ? new Date(info.commitDate).toUTCString() : "";
};
