import { Box, Drawer, Popover, PopoverProps, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import DrawerHeader from "./DrawerHeader.tsx";
import TreeNavigation from "../../FileManager/TreeView/TreeNavigation.tsx";
import PageNavigation, { AdminPageNavigation } from "./PageNavigation.tsx";
import StorageSummary from "./StorageSummary.tsx";
import { useContext, useRef } from "react";
import SessionManager from "../../../session";
import { PageVariant, PageVariantContext } from "../NavBarFrame.tsx";

const DrawerContent = () => {
  const scrollRef = useRef<any>();
  const user = SessionManager.currentLoginOrNull();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pageVariant = useContext(PageVariantContext);
  const isDashboard = pageVariant === PageVariant.dashboard;
  return (
    <>
      <DrawerHeader />
      <Stack
        direction={"column"}
        spacing={2}
        ref={scrollRef}
        sx={{
          px: 1,
          pb: 1,
          flexGrow: 1,
          mx: 1,
          overflow: "auto",
        }}
      >
        {!isDashboard && (
          <>
            <TreeNavigation scrollRef={scrollRef} hideWithDrawer={!isMobile} />
            <PageNavigation />
            {user && <StorageSummary />}
          </>
        )}
        {isDashboard && <AdminPageNavigation />}
      </Stack>
    </>
  );
};

export const DrawerPopover = (props: PopoverProps) => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.globalState.drawerOpen);
  const drawerWidth = useAppSelector((state) => state.globalState.drawerWidth);
  return (
    <Popover {...props}>
      <Box sx={{ width: "70vw" }}>
        <DrawerContent />
      </Box>
    </Popover>
  );
};

const AppDrawer = () => {
  const theme = useTheme();
  const open = useAppSelector((state) => state.globalState.drawerOpen);
  const drawerWidth = useAppSelector((state) => state.globalState.drawerWidth);
  const appBarBg = theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: "flex",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: appBarBg,
          borderRight: "initial",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerContent />
    </Drawer>
  );
};

export default AppDrawer;
