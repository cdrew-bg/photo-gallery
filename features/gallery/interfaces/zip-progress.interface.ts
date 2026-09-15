export interface ZipProgress {
  readonly done: number;
  readonly total: number;
  readonly failed: readonly string[];
}
