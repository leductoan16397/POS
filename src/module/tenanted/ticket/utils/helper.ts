import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { ItemVariantOption } from '../../item/entity/item.variant.entity';

export const generateVariantName = (options: ItemVariantOption): string => {
  return Object.keys(options).reduce((result, key) => {
    if (result === '') {
      result += `${key}: ` + options[key];
    } else {
      result += `,${key}: ` + options[key];
    }

    return result;
  }, '');
};

export const formatPrice = (number: number | undefined, config: CompanyConfig): string => {
  if (typeof number !== 'number' || Number.isNaN(number)) {
    return '';
  }

  const { separator, decimalSymbol } = config;

  // Convert number to string
  const numberString = number.toFixed(config.decimalPlaces);

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = numberString.split('.');

  // Add thousand separators to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  // Combine the formatted integer and decimal parts with the custom decimal symbol
  return `${formattedInteger}${decimalSymbol}${decimalPart}`;
};

export const formatCurrency = (number: number | undefined, config: CompanyConfig) => {
  const result = formatPrice(number, config);
  if (!result) {
    return '';
  }

  const { currencySymbolOnLeft, currencySymbol } = config;

  if (currencySymbolOnLeft) {
    return currencySymbol + ' ' + result;
  } else {
    return result + ' ' + currencySymbol;
  }
};
