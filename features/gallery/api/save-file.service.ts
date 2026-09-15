export interface SaveFileOptions {
  readonly bytes: BlobPart;
  readonly filename: string;
  readonly contentType: string;
}

export function saveFile({ bytes, filename, contentType }: SaveFileOptions): void {
  const url = URL.createObjectURL(new Blob([bytes], { type: contentType }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
