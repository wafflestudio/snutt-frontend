declare global {
  interface Window {
    git: { sha: string; tag: string };
  }
}

export {};
