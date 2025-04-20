import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import React from "react";
import DismissCircleFilled from "../Icons/DismissCircleFilled.tsx";

const NoMatch = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 7,
        pb: 9,
      }}
    >
      <DismissCircleFilled fontSize={"large"} color={"action"} />
      <Typography
        variant={"h6"}
        sx={{
          color: (theme) => theme.palette.action.active,
          mt: 1,
        }}
      >
        {t("common:pageNotFound")}
      </Typography>
    </Box>
  );
};

export default NoMatch;
