# ADR: Replacing ZXing library for QR Code reading

Trello-card: [Link to Task](https://trello.com/c/Zv00dw2j/1864-20-fe-replace-zxing-qr-reading-package?filter=member%3Amomorazor)

Decision Deadline: N/A

Author: Maurovic Cachia

## Status

Proposed

## Context or Problem Statement

The current library used by the frontend to parse QR Codes has been in maintenance mode for the past 2 years. It would be ideal to move the QR Code reading to library that is still actively worked on, so as not to run into issues as devices continue to change and older software gets more and more out of date.

## Decision Drivers

Maintaining QR Code reader functionality, increasing longevity and fixing some rare issues that already occure on certain devices.

## Considered Options

There are a couple of possible replacements that I have found up till now:

- [zxing-wasm](https://www.npmjs.com/package/zxing-wasm) - This is another zxing based package that is however, kept up to date (last upload was 9 days ago as of writing). The package will probably be the easier replacements as the API will be the closest to the current implementation (due to it also working with zxing under the hood). The package is fairly popular with a 100k weekly downloads and an upwards trend.

- [qrcode](https://www.npmjs.com/package/qrcode) - This is the most popular QR Code reader in the NodeJS ecosystem. Having almost 4M weekly downloads, this package is the basic standard of QR Code readers. Unfortunately, it has not been updated for the past year, suggesting that the package might be running out of maintainers, with little activity reported within the github to suggest maintainer handover under way.

Personally, while `qrcode` seems to be the more popular option, it feels like it is on the way out in terms of maintenance, and therefore I would suggest using `zxing-wasm` which has showed very recent signs of activity up to this point.

## Decision

The proposed change is to replace the current library with either of the options above. This will require significant changes in the QRCode reader components of the boxtribute app specifically.

## Consequences

Pros:

- Intermittant issues with the QRCode reader should decrease or be removed completely.
- If issues arrise due to lack of support, easier paths to support will be open (due to an active community on the packages)
- A MUCH smaller bundle size, as the current zxing library embed more parts of the zxing engine then required by more modern browsers

Cons:

- A small window of testing will be required to ensure the new implementation working properly
- (Potential) As newer packages are installed, peer dependency issues may always arrise with older parts of the codebase. This can only be confirm onces the process is begun however.
