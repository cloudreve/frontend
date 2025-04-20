import { ExpandMoreRounded } from "@mui/icons-material";
import {
  AccordionDetails,
  Box,
  Link,
  ListItemIcon,
  Menu,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import * as React from "react";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Viewer, ViewerGroup, ViewerType } from "../../../../../api/explorer.ts";
import { uuidv4 } from "../../../../../util";
import { NoWrapTableCell, SecondaryButton } from "../../../../Common/StyledComponents.tsx";
import { SquareMenuItem } from "../../../../FileManager/ContextMenu/ContextMenu.tsx";
import Add from "../../../../Icons/Add.tsx";
import DesktopFlow from "../../../../Icons/DesktopFlow.tsx";
import DocumentDataLink from "../../../../Icons/DocumentDataLink.tsx";
import { AccordionSummary, StyledAccordion } from "../../UserSession/SSOSettings.tsx";
import FileViewerEditDialog from "./FileViewerEditDialog.tsx";
import FileViewerRow from "./FileViewerRow.tsx";
import ImportWopiDialog from "./ImportWopiDialog.tsx";

interface ViewerGroupProps {
  group: ViewerGroup;
  index: number;
  onDelete: (e: React.MouseEvent<HTMLElement>) => void;
  onGroupChange: (g: ViewerGroup) => void;
}

const ViewerGroupRow = memo(({ group, index, onDelete, onGroupChange }: ViewerGroupProps) => {
  const { t } = useTranslation("dashboard");

  const onViewerChange = useMemo(() => {
    return group.viewers.map((_, index) => (vChanged: Viewer) => {
      onGroupChange({
        viewers: group.viewers.map((v, i) => (i == index ? vChanged : v)),
      });
    });
  }, [group.viewers]);

  const onViewerDeleted = useMemo(() => {
    return group.viewers.map((_, index) => (e: React.MouseEvent<HTMLElement>) => {
      onGroupChange({
        viewers: group.viewers.filter((_, i) => i != index),
      });
      e.preventDefault();
      e.stopPropagation();
    });
  }, [group.viewers]);

  return (
    <StyledAccordion
      defaultExpanded={index == 0}
      disableGutters
      slotProps={{
        transition: {
          unmountOnExit: true,
        },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRounded />}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Typography>{t("settings.viewerGroupTitle", { index: index + 1 })}</Typography>
          {index > 0 && (
            <Link href={"#"} onClick={onDelete}>
              {t("policy.delete")}
            </Link>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ display: "block" }}>
        <TableContainer sx={{ mt: 1, maxHeight: 440 }}>
          <Table stickyHeader sx={{ width: "100%", tableLayout: "fixed" }} size="small">
            <TableHead>
              <TableRow>
                <NoWrapTableCell width={64}>{t("settings.icon")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("settings.viewerType")}</NoWrapTableCell>
                <NoWrapTableCell width={200}>{t("settings.displayName")}</NoWrapTableCell>
                <NoWrapTableCell width={250}>{t("settings.exts")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("settings.newFileAction")}</NoWrapTableCell>
                <NoWrapTableCell width={64}>{t("settings.viewerEnabled")}</NoWrapTableCell>
                <NoWrapTableCell width={100}></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.viewers.map((viewer, index) => (
                <FileViewerRow
                  onChange={onViewerChange[index]}
                  onDelete={onViewerDeleted[index]}
                  viewer={viewer}
                  key={viewer.id}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </StyledAccordion>
  );
});

export interface FileViewerListProps {
  config: string;
  onChange: (value: string) => void;
}

const FileViewerList = memo(({ config, onChange }: FileViewerListProps) => {
  const { t } = useTranslation("dashboard");
  const addNewPopupState = usePopupState({
    variant: "popover",
    popupId: "addNewViewer",
  });
  const [createNewOpen, setCreateNewOpen] = useState(false);
  const [newViewer, setNewViewer] = useState<Viewer | undefined>(undefined);
  const [importOpen, setImportOpen] = useState(false);

  const configParsed = useMemo((): ViewerGroup[] => JSON.parse(config), [config]);

  const onNewViewerChange = useCallback(
    (v: Viewer) => {
      setNewViewer(v);
      const newViewerSetting = [...configParsed];
      newViewerSetting[0].viewers.push(v);
      onChange(JSON.stringify(newViewerSetting));
    },
    [configParsed],
  );

  const onGroupDelete = useMemo(() => {
    return configParsed.map((_, index) => (e: React.MouseEvent<HTMLElement>) => {
      onChange(JSON.stringify([...configParsed].filter((_, i) => i != index)));
      e.preventDefault();
      e.stopPropagation();
    });
  }, [configParsed]);

  const onGroupChange = useMemo(() => {
    return configParsed.map((_, index) => (g: ViewerGroup) => {
      onChange(JSON.stringify([...configParsed].map((item, i) => (i == index ? g : item))));
    });
  }, [configParsed]);

  const { onClose, ...menuProps } = bindMenu(addNewPopupState);

  const onCreateNewClosed = useCallback(() => {
    setCreateNewOpen(false);
  }, []);

  const openCreateNew = useCallback(() => {
    setNewViewer({
      id: uuidv4(),
      icon: "",
      type: ViewerType.custom,
      display_name: "",
      exts: [],
    });
    setCreateNewOpen(true);
    onClose();
  }, [onClose, setNewViewer]);

  const openImportNew = useCallback(() => {
    setImportOpen(true);
    onClose();
  }, [onClose, setImportOpen]);

  const onImportedNew = useCallback(
    (v: ViewerGroup) => {
      const newViewerSetting = [...configParsed];
      newViewerSetting.push(v);
      onChange(JSON.stringify(newViewerSetting));
    },
    [configParsed],
  );

  return (
    <Box>
      {configParsed?.length > 0 &&
        configParsed.map((item: ViewerGroup, index) => (
          <ViewerGroupRow
            group={item}
            index={index}
            key={index}
            onDelete={onGroupDelete[index]}
            onGroupChange={onGroupChange[index]}
          />
        ))}
      <SecondaryButton variant={"contained"} {...bindTrigger(addNewPopupState)} startIcon={<Add />} sx={{ mt: 1 }}>
        {t("settings.addViewer")}
      </SecondaryButton>
      <Menu
        onClose={onClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        {...menuProps}
      >
        <SquareMenuItem dense onClick={openCreateNew}>
          <ListItemIcon>
            <DocumentDataLink />
          </ListItemIcon>
          {t("settings.embeddedWebpageViewer")}
        </SquareMenuItem>
        <SquareMenuItem dense onClick={openImportNew}>
          <ListItemIcon>
            <DesktopFlow />
          </ListItemIcon>
          {t("settings.wopiViewer")}
        </SquareMenuItem>
      </Menu>
      {newViewer && (
        <FileViewerEditDialog
          viewer={newViewer}
          onChange={onNewViewerChange}
          open={createNewOpen}
          onClose={onCreateNewClosed}
        />
      )}
      <ImportWopiDialog onImported={onImportedNew} onClose={() => setImportOpen(false)} open={importOpen} />
    </Box>
  );
});

export default FileViewerList;
