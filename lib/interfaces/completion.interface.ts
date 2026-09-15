export interface Completion {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}
