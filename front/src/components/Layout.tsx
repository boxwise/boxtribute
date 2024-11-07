import { Box, Container, Flex, useMediaQuery } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import HeaderMenuContainer from "./HeaderMenu/HeaderMenuContainer";
import { DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY } from "./HeaderMenu/consts";

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
  const [isLargeScreen] = useMediaQuery(DESKTOP_OR_TABLET_SCREEN_MEDIA_QUERY);

  return (
    <Container maxWidth="container.xl">
      <Flex direction={isLargeScreen ? "row" : "column"} height="100vh">
        <Box flex="none">
          <HeaderMenuContainer />
        </Box>
        <Box flex={1} minHeight="0" mt={isLargeScreen ? 8 : "inherit"}>
          <Outlet />
        </Box>
      </Flex>
    </Container>
  );
}

export default Layout;
