import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import API from "../../middleware/Api";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { setModalsLoading, toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
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
    input: {
        width: 250,
    },
}));

export default function RelocateDialog(props) {
    const { t } = useTranslation();
    const [selectedPolicy, setSelectedPolicy] = useState("");
    const [policies, setPolicies] = useState([]);
    const dispatch = useDispatch();
    const policy = useSelector((state) => state.explorer.currentPolicy);
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

    const submitRelocate = (e) => {
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

        API.post("/file/relocate", {
            src: {
                dirs: dirs,
                items: items,
            },
            dst_policy_id: selectedPolicy,
        })
            .then(() => {
                props.onClose();
                ToggleSnackbar(
                    "top",
                    "right",
                    t("modals.taskCreated"),
                    "success"
                );
                SetModalsLoading(false);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
                SetModalsLoading(false);
            });
    };

    useEffect(() => {
        if (props.open) {
            API.get("/user/setting/policies")
                .then((response) => {
                    setPolicies(response.data);
                    setSelectedPolicy(policy.id);
                })
                .catch((error) => {
                    ToggleSnackbar("top", "right", error.message, "error");
                });
        }

        // eslint-disable-next-line
    }, [props.open]);

    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">
                {t("vas.migrateStoragePolicy")}
            </DialogTitle>

            <DialogContent className={classes.contentFix}>
                <Select
                    className={classes.input}
                    labelId="demo-simple-select-label"
                    value={selectedPolicy}
                    onChange={(e) => setSelectedPolicy(e.target.value)}
                >
                    {policies.map((v, k) => (
                        <MenuItem key={k} value={v.id}>
                            {v.name}
                        </MenuItem>
                    ))}
                </Select>
            </DialogContent>

            <DialogActions>
                <Button onClick={props.onClose}>
                    {t("cancel", { ns: "common" })}
                </Button>
                <div className={classes.wrapper}>
                    <Button
                        onClick={submitRelocate}
                        color="primary"
                        disabled={selectedPolicy === "" || props.modalsLoading}
                    >
                        {t("ok", { ns: "common" })}
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
