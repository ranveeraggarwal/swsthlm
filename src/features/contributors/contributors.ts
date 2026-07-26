// Everyone who has contributed to Stockholm Swing. Shown on the About page's
// collapsed "Contributors" wall — a name, and a GitHub link for those who have
// one. Add new names here, not in the component.

export interface Contributor {
  name: string;
  githubUrl?: string;
}

export const CONTRIBUTORS: Contributor[] = [
  { name: 'Ranveer Aggarwal', githubUrl: 'https://github.com/ranveeraggarwal' },
  { name: 'Hanna Bjarre', githubUrl: 'https://github.com/hbjarre' },
  { name: 'Leonardo Hansson' },
  { name: 'Michael Belfrage', githubUrl: 'https://github.com/mikez' },
  { name: 'Stefan Andersson', githubUrl: 'https://github.com/ste-andersson' },
  { name: 'Kerstin Alquist' },
];
