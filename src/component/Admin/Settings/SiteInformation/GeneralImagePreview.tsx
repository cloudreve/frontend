import { Box } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export interface GeneralImagePreviewProps {
  src: string;
}

const GeneralImagePreview = ({ src }: GeneralImagePreviewProps) => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mt: isMobile ? 0 : 3 }}>
      <Box
        sx={{
          border: (t) => `1px solid ${t.palette.divider}`,
          p: 1,
          display: "inline-block",
          borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        }}
      >
        <Box
          component={"img"}
          src={src}
          sx={{
            display: "block",
            maxWidth: "100%",
          }}
        />
      </Box>
    </Box>
  );
};

export default GeneralImagePreview;
