import * as RNFS from 'react-native-fs';
import Share from 'react-native-share';

export interface CSVRow {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export const generateCSV = (data: CSVRow[], headers: string[]): string => {
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row =>
    headers
      .map(header => {
        const value = row[header];

        if (value === null || value === undefined) return '';

        if (value instanceof Date) return `"${value.toLocaleString('pt-BR')}"`;

        if (typeof value === 'string') {
          const escaped = value.replace(/"/g, '""');
          return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
            ? `"${escaped}"`
            : escaped;
        }

        return String(value);
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};

export const downloadCSV = async (csv: string, filename: string): Promise<void> => {
  try {
    const BOM = '\uFEFF';
    const path = RNFS.DocumentDirectoryPath + '/' + filename;

    await RNFS.writeFile(path, BOM + csv, 'utf8');

    await Share.open({
      url: 'file://' + path,
      type: 'text/csv',
      filename,
    });
  } catch (error) {
    console.error('Erro ao gerar CSV:', error);
  }
};
