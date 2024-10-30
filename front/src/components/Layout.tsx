import { Box, Container, Flex, useMediaQuery } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import HeaderMenuContainer from "./HeaderMenu/HeaderMenuContainer";

/**
 * Renders the layout which is sitting in the routing at /bases/:baseId.
 * The <Flex> is to ensure that the component imported through the <Outlet>
 * takes the maximum space of the screen after the fixed height
 * <HeaderMenuContainer> with flex = {none}.
 * This way you then can decide in the component where  e.g. a vertical
 * scrollbar is shown. (see <Boxes> for an example)
 * @returns The rendered layout component.
 */
function Layout() {
  const [isDesktopScreen] = useMediaQuery("(min-width: 1280px)");
  const [isTabletScreen] = useMediaQuery("(min-width: 1024px)");

  // Account spacing for tablets and small desktop sizes.
  const isMidScreen = isTabletScreen && !isDesktopScreen;

  return (
    <Container maxWidth="container.xl">
      <Flex direction={isMidScreen ? "row" : "column"} height="100vh">
        <Box flex="none" ml={isMidScreen ? -4 : "inherit"}>
          <HeaderMenuContainer />
        </Box>
        <Box flex={1} minHeight="0" mt={isMidScreen ? 16 : "inherit"}>
          <Outlet />
        </Box>
      </Flex>
    </Container>
  );
}

export default Layout;
