import { useTranslation } from "react-i18next";
import React, { useCallback, useState, useEffect } from "react";
import { makeStyles, Badge } from "@material-ui/core";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import PublishIcon from "@material-ui/icons/Publish";
import {
    openCreateFileDialog,
    openCreateFolderDialog,
    toggleSnackbar,
} from "../../actions";
import { useDispatch } from "react-redux";
import AutoHidden from "./AutoHidden";
import statusHelper from "../../utils/page";
import Backdrop from "@material-ui/core/Backdrop";
import { FolderUpload, FilePlus } from "mdi-material-ui";

const useStyles = makeStyles(() => ({
    fab: {
        margin: 0,
        top: "auto",
        right: 20,
        bottom: 20,
        left: "auto",
        zIndex: 5,
        position: "fixed",
    },
    badge: {
        position: "absolute",
        bottom: 26,
        top: "auto",
        zIndex: 9999,
        right: 7,
    },
    "@global": {
        ".MuiSpeedDialAction-staticTooltipLabel": {
            width: 100,
        },
    },
}));

export default function UploadButton(props) {
    const [open, setOpen] = useState(false);
    const [queued, setQueued] = useState(5);
    const classes = useStyles();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const OpenNewFolderDialog = useCallback(
        () => dispatch(openCreateFolderDialog()),
        [dispatch]
    );
    const OpenNewFileDialog = useCallback(
        () => dispatch(openCreateFileDialog()),
        [dispatch]
    );

    useEffect(() => {
        setQueued(props.Queued);
    }, [props.Queued]);

    const { t } = useTranslation();

    const openUpload = (id) => {
        const uploadButton = document.getElementsByClassName(id)[0];
        if (document.body.contains(uploadButton)) {
            uploadButton.click();
        } else {
            ToggleSnackbar("top", "right", t('The upload component has not been loaded yet'), "warning");
        }
    };
    const uploadClicked = () => {
        if (open) {
            if (queued !== 0) {
                props.openFileList();
            } else {
                openUpload("uploadFileForm");
            }
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
      <AutoHidden enable>
          <Badge
              badgeContent={queued}
              classes={{
                  badge: classes.badge, // class name, e.g. `root-x`
              }}
              className={classes.fab}
              invisible={queued === 0}
              color="primary"
          >
              <Backdrop open={open && statusHelper.isMobile()} />
              <SpeedDial
                  ariaLabel="SpeedDial openIcon example"
                  hidden={false}
                  tooltipTitle={t('upload files')}
                  icon={
                      <SpeedDialIcon
                          openIcon={
                              !statusHelper.isMobile() && <PublishIcon />
                          }
                      />
                  }
                  onClose={handleClose}
                  FabProps={{
                      onClick: () =>
                          !statusHelper.isMobile() && uploadClicked(),
                      color: "secondary",
                  }}
                  onOpen={handleOpen}
                  open={open}
              >
                  {statusHelper.isMobile() && (
                      <SpeedDialAction
                          key="UploadFile"
                          icon={<PublishIcon />}
                          tooltipOpen
                          tooltipTitle={t('upload files')}
                          onClick={() => uploadClicked()}
                          title={t('upload files')}
                      />
                  )}
                  {!statusHelper.isMobile() && (
                      <SpeedDialAction
                          key="UploadFolder"
                          icon={<FolderUpload />}
                          tooltipOpen
                          tooltipTitle={t('Upload directory')}
                          onClick={() => openUpload("uploadFolderForm")}
                          title={t('Upload directory')}
                      />
                  )}
                  <SpeedDialAction
                      key="NewFolder"
                      icon={<CreateNewFolderIcon />}
                      tooltipOpen
                      tooltipTitle={t('New Directory')}
                      onClick={() => OpenNewFolderDialog()}
                      title={t('New Directory')}
                  />
                  <SpeedDialAction
                      key="NewFile"
                      icon={<FilePlus />}
                      tooltipOpen
                      tooltipTitle={t('New file')}
                      onClick={() => OpenNewFileDialog()}
                      title={t('New file')}
                  />
              </SpeedDial>
          </Badge>
      </AutoHidden>
    );
}
