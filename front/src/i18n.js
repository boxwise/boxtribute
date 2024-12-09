import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)  // load translation using http -> see /public/locales
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option
    debug: true,
    fallbackLng: "en",
    saveMissing: true,
    backend: { addPath: 'http://localhost:3000/public/locales/{{lng}}/{{ns}}.missing.json'},
    // backend: { addPath: '/public/locales/{{lng}}/{{ns}}.json'},
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
