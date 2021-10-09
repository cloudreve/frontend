import { useTranslation } from "react-i18next";
import React, { useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress,
} from "@material-ui/core";
import { toggleSnackbar, setModalsLoading } from "../../actions/index";
import PathSelector from "../FileManager/PathSelector";
import { useDispatch } from "react-redux";
import API from "../../middleware/Api";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
    contentFix: {
        padding: "10px 24px 0px 24px",
        backgroundColor: theme.palette.background.default,
    },
    wrapper: {
        margin: theme.spacing(1),
        position: "relative",
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));

export default function CompressDialog(props) {
    const [selectedPath, setSelectedPath] = useState("");
    const [fileName, setFileName] = useState("");
    // eslint-disable-next-line
    const [selectedPathName, setSelectedPathName] = useState("");

    const dispatch = useDispatch();

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const SetModalsLoading = useCallback(
        (status) => {
            dispatch(setModalsLoading(status));
        },
        [dispatch]
    );

    const { t } = useTranslation();

    const setMoveTarget = (folder) => {
        const path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        setSelectedPath(path);
        setSelectedPathName(folder.name);
    };

    const submitMove = (e) => {
        if (e != null) {
            e.preventDefault();
        }
        SetModalsLoading(true);

        const dirs = [],
            items = [];
        // eslint-disable-next-line
        props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });

        API.post("/file/compress", {
            src: {
                dirs: dirs,
                items: items,
            },
            name: fileName,
            dst: selectedPath === "//" ? "/" : selectedPath,
        })
            .then(() => {
                props.onClose();
                ToggleSnackbar("top", "right", t('Compression task has been created'), "success");
                SetModalsLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                SetModalsLoading(false);
            });
    };

    const classes = useStyles();

    return (
      <Dialog
          open={props.open}
          onClose={props.onClose}
          aria-labelledby="form-dialog-title"
      >
          <DialogTitle id="form-dialog-title">{t('Save to')}</DialogTitle>
          <PathSelector
              presentPath={props.presentPath}
              selected={props.selected}
              onSelect={setMoveTarget}
          />

          {selectedPath !== "" && (
              <DialogContent className={classes.contentFix}>
                  <DialogContentText>
                      <TextField
                          onChange={(e) => setFileName(e.target.value)}
                          value={fileName}
                          fullWidth
                          autoFocus
                          id="standard-basic"
                          label={t('Compressed file name')}
                      />
                  </DialogContentText>
              </DialogContent>
          )}
          <DialogActions>
              <Button onClick={props.onClose}>{t('Cancel')}</Button>
              <div className={classes.wrapper}>
                  <Button
                      onClick={submitMove}
                      color="primary"
                      disabled={
                          selectedPath === "" ||
                          fileName === "" ||
                          props.modalsLoading
                      }
                  >
                    {t('Ok')}
                    {props.modalsLoading && (
                        <CircularProgress
                            size={24}
                            className={classes.buttonProgress}
                        />
                    )}
                  </Button>
              </div>
          </DialogActions>
      </Dialog>
    );
}
