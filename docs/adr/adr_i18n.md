# ADR: Adapt boxtribute for internationalization

[Trello-card](https://trello.com/c/jkdpDyyX/761-check-localization-and-language-options-implementation-in-new-old-app-database?search_id=7c64905c-bda4-4164-9703-9e6a6a933e28)

Decision Deadline: Dec 1st 2024

Author: [Philipp](https://github.com/orgs/boxwise/people/pylipp)

## Status

Proposed.

## Context / Problem Statement

Internationalization (i18n) is the process of designing and developing software so it can be adapted for users of different cultures and languages.

Currently, the boxtribute web app is not capable of providing i18n support. This hinders e.g. the adaption by users in non-English speaking communities.

## Decision Drivers

1. Reliability (are the selected tools popular and maintained?)
1. Integration (are the selected tools straightforward to integrate into the our existing tools and services?)
1. Simplicity (are the selected tools easy to use?)
1. Code readability (is the produced code easy to understand?)
1. Standardisation (do the selected tools adhere to available standards?)
1. Financial cost (are the selected tools inexpensive to use?)

It needs to be distinguished between changes of dropapp, v2, and/or external services such as Auth0.

### dropapp

In dropapp translation of text has been adopted in some cases inside a table for translation. The issue with this approach is that for every translation a query is required to get the text.

Translations exist for French and Dutch, along with the default English.

Using a browser-translation tool would remove the need to perform any implementation efforts on this end.

User settings are currently configured via dropapp, hence we'd have to consider an extension such that users can set their preferred language.

### Auth0

We most likely want to store user preference for a language in the user management system.

### v2

Due to the client-server architecture of the v2 web application, translatable text is defined in the front-end. Most of the rest of this document focuses on finding a suitable tool to integrate into the v2 React front-end.

### Translation management system (TMS)

A TMS supports in managing translations in software, and facilitates cooperation between devs, designers, and translators. Popular open-source solutions are e.g.
- Tolgee (1k texts for free, then €25/mo): https://tolgee.io/apps-integrations/react
- Weblate (free plan for libre projects): https://weblate.org/en/hosting/
- Locize (special offer for open-source projects): https://locize.com/open-source.html

## Considered Options

The two most popular i18n tools for React:

### `react-intl`

- 1.6M weekly downloads from npm
- Uses ICU standard
- Requires custom solution for translation file loading and locale detection
- support for complex plurals, date formatting, and number formatting
- CLI for message extraction and and Translation Management System (TMS) support
- bundled size of 18kB (gzipped and minified)
- supports IE11 & 2 most recent versions of Edge, Chrome, Firefox & Safari
- using react-intl in React Native, make sure your runtime has built-in Intl support

### `react-i18next`

- 3.8M weekly downloads from npm
- built-in locale switcher
- ICU standard and message extraction through addons
- Plugins for async translation file loading and locale detection
- support for complex plurals, date formatting, and number formatting
- Fairly large bundled size of 23kB (gzipped and minified)
- react-i18next is optimally suited for server-side rendering (does not apply to the FE!?)

### Comparison of the APIs

**react-intl**

```javascript
import {FormattedMessage} from 'react-intl';

<FormattedMessage
 description="Name introduction" // Description should be a string literal
 defaultMessage="My name is {name}" // Message should be a string literal
 values={
   {
     name: userName,
   } // Values should be an object literal, but not necessarily every value inside
 }
/>
```

**react-i18next**

```javascript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  // not passing any namespace will use the defaultNS (by default set to 'translation')
  const { t, i18n } = useTranslation();
  return <p>{t('my translated text')}</p>
}
```

## Decision

The presented react-packages are on a par with each other in terms of the decision criteria above.

The resulting code style of each solution is probably subject to individual taste however `react-i18next` is decoupled from React in terms of testability and ease of building tools on top of it.

For `react-intl`, an experimental integration into v2 can be found [here](https://github.com/boxwise/boxtribute/pull/1753).

For `react-i18next`, an experimental integration into v2 can be found [here](https://github.com/boxwise/boxtribute/compare/experiment-with-react-i18next).

Using a TMS might not be worth the additional cost and maintenance effort, given that boxtribute (v2) is a fairly small application.

## Consequences / effort estimation

### Initial steps

- Find all text components in FE code, and wrap them such that they can be extracted and replaced
- Install i18n package
- Extract messages and actually translate them (into the desired languages)
- Set up workflow such that newly added text is auto-extracted (warn about missing translation)
- Ensure that translation files are shipped with the deployed FE bundle

### Development cycle

- Devs have to remember to wrap new text components to make them translatable
- Translations are best provided during the design phase already
- Translations are entered into the translation storage
- Effective translation updates require a production deploy
- The app should be reviewed in different languages to catch e.g. alignment or overflow glitches

## Open questions

- [Caveat for react-intl compatibility with React-native](https://formatjs.github.io/docs/guides/runtime-requirements#react-native)
- consider localization for displayed numbers (amount, price, date, time, ...)?

## References

https://phrase.com/blog/posts/react-i18n-best-libraries/

https://formatjs.github.io/docs/getting-started/installation#minimal-application
https://github.com/PhraseApp-Blog/react-i18n-libraries-2022/tree/react-intl
https://phrase.com/blog/posts/localizing-react-apps-with-i18next

https://react.i18next.com/guides/quick-start
https://react.i18next.com/guides/the-drawbacks-of-other-i18n-solutions#the-drawbacks
https://react.i18next.com/misc/using-with-icu-format#extend-the-i18n-instance-with-icu-module
https://github.com/i18next/react-i18next/tree/master/example/react
https://www.i18next.com/
