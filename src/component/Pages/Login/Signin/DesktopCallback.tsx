import { Box } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setDesktopMountSetupDialog, setHeadlessFrameLoading } from "../../../../redux/globalStateSlice.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { openDesktopCallback } from "../../../../redux/thunks/session.ts";
import { useQuery } from "../../../../util/index.ts";

const DesktopCallback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    dispatch(setHeadlessFrameLoading(true));
    const code = query.get("code");
    const state = query.get("state");
    const error = query.get("error");
    navigate("/home");
    if (error) {
      const search = new URLSearchParams({ error, state: state ?? "" });
      window.location.href = `cloudreve://mount?${search.toString()}`;
      return;
    }
    if (code) {
      if (state && state.startsWith("reauthorize:")) {
        dispatch(openDesktopCallback(code, state));
      } else {
        dispatch(setDesktopMountSetupDialog({ open: true, state: { code, state: state ?? "" } }));
      }
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 7,
        pb: 9,
      }}
    ></Box>
  );
};

export default DesktopCallback;
