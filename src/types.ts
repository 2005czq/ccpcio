export type TimeMode = 'countdown' | 'elapsed';

export interface ProblemInfo {
  thColIndex: number;
  problemIdx: number;
  problem: string;
  solves: number;
}
