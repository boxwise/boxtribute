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

  if (isLargeScreen)
    return (
      <Container m="inherit" p="inherit" maxWidth="inherit">
        <Flex direction="row" height="100vh" overflowY="scroll">
          <HeaderMenuContainer />
          <Box flex={1} mt={8} mx={4} overflowX="auto">
            <Outlet />
          </Box>
        </Flex>
      </Container>
    );

  return (
    <Container maxWidth="container.xl">
      <Flex direction="column" height="100vh">
        <HeaderMenuContainer />
        <Box flex={1} minHeight="0">
          <Outlet />
        </Box>
      </Flex>
    </Container>
  );
}

export default Layout;
