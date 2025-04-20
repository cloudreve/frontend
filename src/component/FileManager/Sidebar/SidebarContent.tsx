import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FileResponse } from "../../../api/explorer.ts";
import Details from "./Details.tsx";
import Header from "./Header.tsx";

export interface SidebarContentProps {
  target: FileResponse | undefined | null;
  inPhotoViewer?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: 2, py: 1 }}>{children}</Box>}
    </div>
  );
}

const SidebarContent = ({ target, inPhotoViewer }: SidebarContentProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header target={target} />
      {target != null && (
        <>
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
            }}
          ></Box>
          <Box sx={{ overflow: "auto" }}>
            <TabPanel value={0} index={0}>
              <Details inPhotoViewer={inPhotoViewer} target={target} />
            </TabPanel>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SidebarContent;
