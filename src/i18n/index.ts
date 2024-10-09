import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import data from './languages.json'
import Introduction from '@/app/components/Introduction';

interface Language {
  value: string;
  name: string;
  prompt_name: string;
  example: string;
  supported: boolean;
}

export const languages: Language[] = data.languages

const loadLangResources = (lang: string) => ({
    common: require(`./${lang}/common`).default,
    layout: require(`./${lang}/layout`).default,
    dintal: require(`./${lang}/dintal`).default,
    introduction: require(`./${lang}/introduction`).default,
    graphViewer:  require(`./${lang}/graphViewer`).default,
    dataview:  require(`./${lang}/dataview`).default,
})

// Automatically generate the resources object
const resources = languages.reduce((acc: any, langObj: Language) => {
  const lang = langObj.value;
  acc[lang] = loadLangResources(lang)
  return acc
}, {})

i18n.use(initReactI18next)
  .init({
    lng: 'zh-Hans',
    fallbackLng: 'zh-Hans',
    ns: ['common', 'layout', 'dintal', 'introduction', 'graphViewer', 'dataview'], // 指定命名空间列表
    defaultNS: 'common', // 设置默认命名空间
    resources,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
