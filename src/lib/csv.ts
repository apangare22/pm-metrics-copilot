import Papa from 'papaparse';

export interface CSVParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const fatalError = results.errors.find((e) => e.type === 'Delimiter' || e.type === 'Quotes');
          if (fatalError) {
            reject(new Error(`CSV parse error: ${fatalError.message}`));
            return;
          }
        }

        const headers = results.meta.fields ?? [];
        if (headers.length === 0) {
          reject(new Error('CSV file has no headers'));
          return;
        }

        const rows = results.data as Record<string, string>[];
        resolve({ headers, rows });
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}
