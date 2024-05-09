import { randomBytes } from 'crypto';
import * as lodash from 'lodash';
import * as xlsx from 'xlsx';

export const generateSalt = () => {
  return randomBytes(10).toString('hex');
};

export const genPin = () => {
  const randomInt = getRndInteger(0, 1000);

  if (randomInt < 10) {
    return '000' + randomInt;
  }

  if (randomInt < 100) {
    return '00' + randomInt;
  }
  if (randomInt < 1000) {
    return '0' + randomInt;
  }

  return randomInt + '';
};

export const getRndInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const parseXlsx = (
  buffer: Buffer,
): {
  name: string;
  data: any[];
}[] => {
  const xlsxData = xlsx.read(buffer, { type: 'buffer' });

  return Object.keys(xlsxData.Sheets).map((name) => {
    return {
      name,
      data: xlsx.utils.sheet_to_json(xlsxData.Sheets[name], {
        skipHidden: false,
        defval: null,
      }),
    };
  });
};

export const convertNumberToFloat = (value: string | number, precision: number = 2) => {
  if (!lodash.isNumber(+value)) {
    return NaN;
  }

  const float = lodash.round(+value, precision);
  return float;
};

export function randomString(len: number, charSet?: string) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}
