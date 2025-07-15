import { Box, Container, Grid, Paper } from "@mui/material";
import { Outlet, useNavigation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import AutoHeight from "../Common/AutoHeight.tsx";
import CircularProgress from "../Common/CircularProgress.tsx";
import Logo from "../Common/Logo.tsx";
import PoweredBy from "./PoweredBy.tsx";

const Loading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        pt: 7,
        pb: 9,
      }}
    >
      <CircularProgress />
    </Box>
  );
};

const HeadlessFrame = () => {
  const loading = useAppSelector((state) => state.globalState.loading.headlessFrame);
  const { headless_footer, headless_bottom, sidebar_bottom } = useAppSelector(
    (state) => state.siteConfig.basic?.config?.custom_html ?? {},
  );
  const dispatch = useAppDispatch();
  let navigation = useNavigation();

  return (
    <Box
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[900],
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
      }}
    >
      <Container maxWidth={"xs"}>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "100vh" }}
        >
          <Box sx={{ width: "100%", py: 2 }}>
            <Paper
              sx={{
                padding: (theme) => `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(3)}`,
              }}
            >
              <Logo
                sx={{
                  maxWidth: "40%",
                  maxHeight: "40px",
                  mb: 2,
                }}
              />
              <AutoHeight>
                <div>
                  <Box
                    sx={{
                      display: loading || navigation.state !== "idle" ? "none" : "block",
                    }}
                  >
                    <Outlet />
                    {headless_bottom && (
                      <Box sx={{ width: "100%" }}>
                        <div dangerouslySetInnerHTML={{ __html: headless_bottom }} />
                      </Box>
                    )}
                  </Box>
                  {(loading || navigation.state !== "idle") && <Loading />}
                </div>
              </AutoHeight>
            </Paper>
          </Box>
          <PoweredBy />
          {headless_footer && (
            <Box sx={{ width: "100%", mb: 2 }}>
              <div dangerouslySetInnerHTML={{ __html: headless_footer }} />
            </Box>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default HeadlessFrame;
