// To access the defaultTheme you can import theme here
import { extendTheme } from "@chakra-ui/react";

const colors = {
  brandRed: {
    300: "#ef404a",
    200: "#f37167",
    100: "#f8aa9e",
  },
  brandBlue: {
    300: "#29335f",
    200: "#315c88",
    100: "#aacfe3",
  },
  brandYellow: {
    300: "#d89016",
    200: "#e4aa4f",
    100: "#f4e6a0",
  },
  brandGray: "#848689",
  // this was additional generated on https://coolors.co/ to have a fitting green
  brandGreen: "#60a561",
};

// see https://chakra-ui.com/docs/styled-system/customize-theme#customizing-single-components
export const theme = extendTheme({
  colors,
  fonts: {
    heading: `'Open Sans', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  styles: {
    global: {
      body: {
        color: "black",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "none",
      },
      // TODO: we need to define our brand color palette and apply a whole colorScheme to config chakra UI properly.
      variants: {
        blue: {
          bg: "brandBlue.300",
          color: "white",
          borderRadius: "none",
        },
        green: {
          bg: "brandGreen",
          color: "white",
          borderRadius: "none",
        },
        gray: {
          bg: "brandGray",
          color: "white",
          borderRadius: "none",
        },
      },
    },
    Link: {
      variants: {
        "inline-link": {
          color: "blue",
          textDecoration: "underline",
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: "bold",
      },
    },
    // This is fix for https://github.com/chakra-ui/chakra-ui/issues/2925
    Radio: {
      baseStyle: {
        label: {
          pointerEvents: "none",
        },
      },
    },
    Checkbox: {
      baseStyle: {
        label: {
          pointerEvents: "none",
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          focusBorderColor: "transparent",
          borderRadius: "none",
        },
      },
      shadows: "none",
      sizes: {
        lg: {
          field: {
            borderRadius: "none",
          },
        },
      },
    },
  },
});
