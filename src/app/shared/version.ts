export interface Version {
  name: string;
  displayname: string;
  description: string;
  version: string;
  copyright: string;
  author: string;
  license: string;
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
  build: number | null;
  versions: string[]; // Versionen von Subsystemen etc.
}
