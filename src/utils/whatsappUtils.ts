import { Alert } from 'react-native';

export interface WhatsAppNormalizationResult {
  normalized: string;
  formatted: string;
  isValid: boolean;
  variations: string[];
}

export class WhatsAppUtils {
  static normalize(whatsapp: string): string {
    return whatsapp.replace(/\D/g, '');
  }

  static format(whatsapp: string): string {
    const normalized = this.normalize(whatsapp);
    
    if (normalized.length === 11) {
      return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 7)}-${normalized.slice(7)}`;
    } else if (normalized.length === 10) {
      return `(${normalized.slice(0, 2)}) ${normalized.slice(2, 6)}-${normalized.slice(6)}`;
    }
    
    return whatsapp;
  }

  static isValid(whatsapp: string): boolean {
    const normalized = this.normalize(whatsapp);

    if (normalized.length === 11) {
      const areaCode = normalized.slice(0, 2);
      const firstDigit = normalized.charAt(2);
      return parseInt(areaCode) >= 11 && parseInt(areaCode) <= 99 && firstDigit === '9';
    }

    if (normalized.length === 10) {
      const areaCode = normalized.slice(0, 2);
      return parseInt(areaCode) >= 11 && parseInt(areaCode) <= 99;
    }

    return false;
  }

  static generateVariations(whatsapp: string): string[] {
    const normalized = this.normalize(whatsapp);
    const variations: string[] = [normalized];

    if (normalized.length === 11 && normalized.charAt(2) === '9') {
      variations.push(normalized.slice(0, 2) + normalized.slice(3));
    }

    if (normalized.length === 10) {
      variations.push(normalized.slice(0, 2) + '9' + normalized.slice(2));
    }

    variations.push(whatsapp.trim(), this.format(normalized));

    return [...new Set(variations)].filter(v => v.length > 0);
  }

  static normalizeWithVariations(whatsapp: string): WhatsAppNormalizationResult {
    const normalized = this.normalize(whatsapp);
    const formatted = this.format(whatsapp);
    const isValid = this.isValid(whatsapp);
    const variations = this.generateVariations(whatsapp);

    return { normalized, formatted, isValid, variations };
  }

  static createSearchPattern(whatsapp: string): string {
    const normalized = this.normalize(whatsapp);
    return `%${normalized}%`;
  }

  static calculateSimilarity(whatsapp1: string, whatsapp2: string): number {
    const norm1 = this.normalize(whatsapp1);
    const norm2 = this.normalize(whatsapp2);

    if (norm1 === norm2) return 1.0;

    const variations1 = this.generateVariations(whatsapp1);
    const variations2 = this.generateVariations(whatsapp2);

    for (const v1 of variations1) {
      for (const v2 of variations2) {
        if (this.normalize(v1) === this.normalize(v2)) return 0.95;
      }
    }

    const longer = norm1.length > norm2.length ? norm1 : norm2;
    const shorter = norm1.length <= norm2.length ? norm1 : norm2;

    if (longer.includes(shorter) && shorter.length >= 8) return 0.8;

    const maxLength = Math.max(norm1.length, norm2.length);
    if (maxLength === 0) return 0;

    let matches = 0;
    for (let i = 0; i < Math.min(norm1.length, norm2.length); i++) {
      if (norm1[i] === norm2[i]) matches++;
    }

    return matches / maxLength;
  }

  static alertInvalid(whatsapp: string) {
    if (!this.isValid(whatsapp)) {
      Alert.alert('Número inválido', `O número ${whatsapp} não é válido.`);
    }
  }
}
