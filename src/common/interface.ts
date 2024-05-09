import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

export interface I18N {
  i18n: I18nContext<I18nTranslations>;
}

export interface AnyObject {
  [key: string]: any;
}

export interface StringObject {
  [key: string]: string;
}
