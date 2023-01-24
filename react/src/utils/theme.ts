import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
  primary: {
    700: "light-blue",
    500: "blue",
  },
};

export const theme = extendTheme({
  colors,
  components: {
    Button: {
      defaultProps: {
        borderRadius: "0",
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
