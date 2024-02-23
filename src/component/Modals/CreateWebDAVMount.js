import React, { useCallback, useEffect, useState } from "react";
import { Dialog, makeStyles } from "@material-ui/core";
import API from "../../middleware/Api";
import { useDispatch } from "react-redux";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import { FolderOpenOutlined, Storage } from "@material-ui/icons";
import PathSelector from "../FileManager/PathSelector";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    formGroup: {
        display: "flex",
        marginTop: theme.spacing(1),
    },
    formIcon: {
        marginTop: 21,
        marginRight: 19,
        color: theme.palette.text.secondary,
    },
    input: {
        width: 250,
    },
    dialogContent: {
        paddingTop: 24,
        paddingRight: 24,
        paddingBottom: 8,
        paddingLeft: 24,
    },
    button: {
        marginTop: 8,
    },
}));

export default function CreateWebDAVMount(props) {
    const { t } = useTranslation();
    const [value, setValue] = useState({
        policy: "",
        path: "/",
    });
    const [policies, setPolicies] = useState([]);
    const [pathSelectDialog, setPathSelectDialog] = React.useState(false);
    const [selectedPath, setSelectedPath] = useState("");
    // eslint-disable-next-line
    const [selectedPathName, setSelectedPathName] = useState("");

    const classes = useStyles();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const setMoveTarget = (folder) => {
        const path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        setSelectedPath(path);
        setSelectedPathName(folder.name);
    };

    const handleInputChange = (name) => (e) => {
        setValue({
            ...value,
            [name]: e.target.value,
        });
    };

    const selectPath = () => {
        setValue({
            ...value,
            path: selectedPath === "//" ? "/" : selectedPath,
        });
        setPathSelectDialog(false);
    };

    useEffect(() => {
        API.get("/user/setting/policies")
            .then((response) => {
                setPolicies(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <Dialog
                open={pathSelectDialog}
                onClose={() => setPathSelectDialog(false)}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {t("navbar.addTagDialog.selectFolder")}
                </DialogTitle>
                <PathSelector
                    presentPath="/"
                    selected={[]}
                    onSelect={setMoveTarget}
                />

                <DialogActions>
                    <Button onClick={() => setPathSelectDialog(false)}>
                        {t("cancel", { ns: "common" })}
                    </Button>
                    <Button
                        onClick={selectPath}
                        color="primary"
                        disabled={selectedPath === ""}
                    >
                        {t("ok", { ns: "common" })}
                    </Button>
                </DialogActions>
            </Dialog>
            <div className={classes.dialogContent}>
                <div className={classes.formContainer}>
                    <div className={classes.formGroup}>
                        <div className={classes.formIcon}>
                            <Storage />
                        </div>
                        <FormControl className={classes.formControl}>
                            <InputLabel id="demo-simple-select-label">
                                {t("fileManager.storagePolicy")}
                            </InputLabel>
                            <Select
                                className={classes.input}
                                labelId="demo-simple-select-label"
                                value={value.policy}
                                onChange={handleInputChange("policy")}
                            >
                                {policies.map((v, k) => (
                                    <MenuItem key={k} value={v.id}>
                                        {v.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className={classes.formGroup}>
                        <div className={classes.formIcon}>
                            <FolderOpenOutlined />
                        </div>
                        <div>
                            <TextField
                                value={value.path}
                                onChange={handleInputChange("path")}
                                className={classes.input}
                                label={t("setting.rootFolder")}
                            />
                            <br />
                            <Button
                                className={classes.button}
                                color="primary"
                                onClick={() => setPathSelectDialog(true)}
                            >
                                {t("navbar.addTagDialog.selectFolder")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <DialogActions>
                <Button onClick={props.onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <Button
                    disabled={value.path === "" || value.policy === ""}
                    color="primary"
                    onClick={() => props.callback(value)}
                >
                    {t("ok", { ns: "common" })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
