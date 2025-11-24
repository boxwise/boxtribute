# ADR: Replacing ZXing library for QR Code reading

Trello-card: [Link to Task](https://trello.com/c/Zv00dw2j/1864-20-fe-replace-zxing-qr-reading-package?filter=member%3Amomorazor)

Decision Deadline: N/A

Author: [Maurovic Cachia](https://github.com/MomoRazor)

Participants: [Philipp Metzner](https://github.com/pylipp), [Hans Peter Gürtner](https://github.com/HaGuesto), [Roanna Kong](https://github.com/aerinsol)

## Status

Proposed

## Context or Problem Statement

QR code generation and scanning is a core part of the user workflows for warehousing and inventory management in Boxtribute. In particular, the in-house QR code scanner has a single component in the project, that is referenced in two separate contexts around the application, once of which is the landing page of mobile users. However, the current library set used by the frontend to parse QR Codes ([@zxing/library](https://www.npmjs.com/package/@zxing/library?activeTab=readme) and [@zxing/browser](https://www.npmjs.com/package/@zxing/browser)) has been in maintenance mode for the past 2 years.

This creates a medium-high risk for both active field workers and the development team that increases with time as devices continue to change and older software becomes less and less compatible.

For active field workers, the risk with increasing incompatiblity is if the QR scanner functionality breaks, their ability to effectively receive and distribute aid is compromised. For the development team, since QR scanning is a core application workflow an emergency fix will most likely be needed, which will impact the backlog and timelines of other active projects.

Apart from this, more modern packages could bring secondary benefits, such as smaller bundle sizing (making load times and network usage decrease), quicker detection, and less battery utilization through lower level optimizations.

## Decision Drivers

1. Reliability

- This will make sure that the mission critical feature of QR Code scanning continues to work optimially and without issues even on newer devices and newer browser versions.

2. Maintainabilty + Bug Fixing:

- It will also make sure that the package remains compatible with ecosystem well, and re-opens the possible of asking for support to an active community, if issues arise related to QR Scanning that might be coming from under the hood.

3. Performance

- Older packages using old code and old practices can affect negatively performance and bundle size. This leads to increase loading times and network bandwidth requirements. More modern implementations will utilize more current practices and stratagies to mitigate these effects.

## Considered Options

There are a couple of possible replacements that I have found up till now:

### zxing-wasm

- [zxing-wasm](https://www.npmjs.com/package/zxing-wasm) - This is another zxing based package that is however, kept up to date (last upload was 9 days ago as of writing). The package will probably be the easier replacements as the API will be the closest to the current implementation (due to it also working with zxing under the hood). The package is fairly popular with a 100k weekly downloads and an upwards trend.

For added context, zxing based here means that both of these packages use the zxing source code underneath. For the current `@zxing/library` and `@zxing/browser`, the zxing engine is ported to javascript and typescript. Unfortunately it is not as maintained and therefore could be using older versions of these languages. `Zxing-wasm` is instead a WebAssembly port. This uses a C++ port called [zxing-cpp](https://github.com/zxing-cpp/zxing-cpp), which is a very well maintained port.

Using a port of the same engine ensure that we will have the same functionality supported as before, written in more modern code, bundled with more tree shaking capabilities. This will result in a smaller final bundle, as will be shown later in this document.

Broad Implementation:

1. The addition of a hidden canvas element within the scanner, from which to capture specific frames of the webcam.
2. Through this canvas, each frame will be fed into the `zxing-wasm` API at specific intervals, to check for a QR Code.
3. Capture return of `readBarcodesFromImageData(imageData, options)`, which is an array, therefore `onResult` needs to only be called when this array is not empty and when there are errors.
4. Clean up requires adding animation frame cancellations as well.

Estimated Time of Implementation: 1.5 hours

Bundle Size (unpacked): 3.41Mb (Note: The maintainer has also provided sizes for importing `zxing-wasm/reader` only, which should only be about 919 KiB)

### @yudiel/react-qr-scanner

- [@yudiel/react-qr-scanner](https://www.npmjs.com/package/@yudiel/react-qr-scanner) - This is another maintained version that is more popular then zxing-wasm. Unlike zxing-wasm however, it is not a headless package, as suggested by its title, which referenced React, suggesting it offers prebuilt React Components, which could result in certain visual customization limitations, when compared with headless packages.

It might also be important to mention that this package depends on a package called [barcode-detector](https://www.npmjs.com/package/barcode-detector) which in turn, depends on [zxing-cpp](https://github.com/zxing-cpp/zxing-cpp), similar to `zxing-wasm`. `barcode-detector` is also a very well maintained bridging package for `zxing-wasm`.

Broad Implementation:
Due to this being a react specific package, and therefore providing a react component, this implementation is significantly quicker, as all it requires is the addition of the `Scanner` component, with some predefined props. What is unknown is if the `ViewFinder` component can function well with this `Scanner` component, and if further visual customization will be possible to do (and possible) to keep within the project's design principles.

Estimated Time of Implementation: 15 mins

Bundle Size (unpacked): 226 kB (Note: In this case, this package depends on `zxing/wasm`, so it would add both sizes, + `barcode-decoder` which is a further 246 kB)

General Note about size: NPM (and other tools like PNPM) implement their own tree shaking, so these sizes are always worst case senarios)

## Decision

In my opinion, due to the relatively big difference in implementation time, it might make sense to first attempt the `react-qr-scanner` package, to see if it satisfies all the project's needs. If issues are found during implementation, a switch can be done to work with `zxing-wasm` instead, which will be more complex, but ensure full UI flexibility and even further bundle optimization.

## Consequences

Pros:

- Intermittant issues with the QRCode reader (such as [this](https://trello.com/c/ocYoFeZ6/1846-20-fe-fix-unknownerror-setphotooptions-failed)) should decrease or be removed completely.
- If issues arrise within QR Code Scanning, it would become possible to ask for support within an active community.
- A MUCH smaller bundle size, as the current zxing package embeds more parts of the zxing engine then required by more modern browsers.

For comparision to the size figures given in the options section, the following are the sizes of the current libraries:

1. `@zxing/library` size (unpacked) - 9.46Mb
2. `@zxing/browser` size (unpacked) - 5.4Mb

Cons:

- A small window of testing will be required to ensure the new implementation working properly. Considering that QR Code scanning is consolidated in one place within the project, this should not be over 1 hour.
- (Potential) As newer packages are installed, peer dependency issues may always arrise with older parts of the codebase. This can only be confirmed onces the process is begun however. An example of this would be the fact that `react-qr-scanner` uses React 19 under the hood, while this project uses React 18. However, the package seems to support React 17 and up, so this should not be an issue.
