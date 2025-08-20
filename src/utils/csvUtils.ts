import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface CSVRow {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export const generateCSV = (data: CSVRow[], headers: string[]): string => {
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];

      if (value === null || value === undefined) {
        return '';
      }

      if (value instanceof Date) {
        return `"${value.toLocaleString('pt-BR')}"`;
      }

      if (typeof value === 'string') {
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') 
          ? `"${escaped}"` 
          : escaped;
      }

      return String(value);
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

export const downloadCSV = async (csv: string, filename: string): Promise<void> => {
  try {
    const BOM = '\uFEFF'; // Para UTF-8 correto no Excel
    const fileUri = FileSystem.documentDirectory + filename;

    // Salva o arquivo
    await FileSystem.writeAsStringAsync(fileUri, BOM + csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Abre o menu de compartilhamento (WhatsApp, e-mail, Drive etc.)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      console.log('Compartilhamento não disponível neste dispositivo');
    }
  } catch (error) {
    console.error('Erro ao gerar CSV:', error);
  }
};
