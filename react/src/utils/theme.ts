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
  brandGreen: "#60a561"
};

export const theme = extendTheme({
  colors,
  components: {
    Button: {
      baseStyle: {
        borderRadius: 0,
      },
      // TODO: we need to define our brand color palette and apply a whole colorScheme to config chakra UI properly.
      variants: {
        "blue": {
          bg: "brandBlue.300",
          color: "white",
          borderRadius: 0,
        },
        "green": {
          bg: "brandGreen",
          color: "white",
          borderRadius: 0,
        },
        "gray": {
          bg: "brandGray",
          color: "white",
          borderRadius: 0,
        }
      },
    },
    Link: {
      // baseStyle: {
      //   color: "blue",
      //   textDecoration: "underline",
      // },
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
      defaultProps: {
        focusBorderColor: "transparent",
        borderRadius: "0",
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
