import React, { useCallback, useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    makeStyles,
    Paper,
    Typography,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import { Add, Fingerprint, HighlightOff } from "@material-ui/icons";
import API from "../../middleware/Api";
import { bufferDecode, bufferEncode } from "../../utils";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    sectionTitle: {
        paddingBottom: "10px",
        paddingTop: "30px",
    },
    rightIcon: {
        marginTop: "4px",
        marginRight: "10px",
        color: theme.palette.text.secondary,
    },
    desenList: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    iconFix: {
        marginRight: "11px",
        marginLeft: "7px",
        minWidth: 40,
    },
    flexContainer: {
        display: "flex",
    },
}));

export default function Authn(props) {
    const { t } = useTranslation();
    const [selected, setSelected] = useState("");
    const [confirm, setConfirm] = useState(false);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const deleteCredential = (id) => {
        API.patch("/user/setting/authn", {
            id: id,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("setting.authenticatorRemoved"),
                    "success"
                );
                props.remove(id);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setConfirm(false);
            });
    };

    const classes = useStyles();

    const addCredential = () => {
        if (!navigator.credentials) {
            ToggleSnackbar(
                "top",
                "right",
                t("setting.browserNotSupported"),
                "warning"
            );

            return;
        }
        API.put("/user/authn", {})
            .then((response) => {
                const credentialCreationOptions = response.data;
                credentialCreationOptions.publicKey.challenge = bufferDecode(
                    credentialCreationOptions.publicKey.challenge
                );
                credentialCreationOptions.publicKey.user.id = bufferDecode(
                    credentialCreationOptions.publicKey.user.id
                );
                if (credentialCreationOptions.publicKey.excludeCredentials) {
                    for (
                        let i = 0;
                        i <
                        credentialCreationOptions.publicKey.excludeCredentials
                            .length;
                        i++
                    ) {
                        credentialCreationOptions.publicKey.excludeCredentials[
                            i
                        ].id = bufferDecode(
                            credentialCreationOptions.publicKey
                                .excludeCredentials[i].id
                        );
                    }
                }

                return navigator.credentials.create({
                    publicKey: credentialCreationOptions.publicKey,
                });
            })
            .then((credential) => {
                const attestationObject = credential.response.attestationObject;
                const clientDataJSON = credential.response.clientDataJSON;
                const rawId = credential.rawId;
                return API.put(
                    "/user/authn/finish",
                    JSON.stringify({
                        id: credential.id,
                        rawId: bufferEncode(rawId),
                        type: credential.type,
                        response: {
                            attestationObject: bufferEncode(attestationObject),
                            clientDataJSON: bufferEncode(clientDataJSON),
                        },
                    })
                );
            })
            .then((response) => {
                props.add(response.data);
                ToggleSnackbar(
                    "top",
                    "right",
                    t("setting.authenticatorAdded"),
                    "success"
                );
                return;
            })
            .catch((error) => {
                console.log(error);
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    return (
        <div>
            <Dialog open={confirm} onClose={() => setConfirm(false)}>
                <DialogTitle>{t("setting.removedAuthenticator")}</DialogTitle>
                <DialogContent>
                    {t("setting.removedAuthenticatorConfirm")}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirm(false)} color="default">
                        {t("cancel", { ns: "common" })}
                    </Button>
                    <Button
                        onClick={() => deleteCredential(selected)}
                        color="primary"
                    >
                        {t("ok", { ns: "common" })}
                    </Button>
                </DialogActions>
            </Dialog>

            <Typography className={classes.sectionTitle} variant="subtitle2">
                {t("setting.hardwareAuthenticator")}
            </Typography>
            <Paper>
                <List className={classes.desenList}>
                    {props.list.map((v) => (
                        <>
                            <ListItem
                                button
                                style={{
                                    paddingRight: 60,
                                }}
                                onClick={() => {
                                    setConfirm(true);
                                    setSelected(v.id);
                                }}
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <Fingerprint />
                                </ListItemIcon>
                                <ListItemText primary={v.fingerprint} />

                                <ListItemSecondaryAction
                                    onClick={() => deleteCredential(v.id)}
                                    className={classes.flexContainer}
                                >
                                    <HighlightOff
                                        className={classes.rightIcon}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                        </>
                    ))}
                    <ListItem button onClick={() => addCredential()}>
                        <ListItemIcon className={classes.iconFix}>
                            <Add />
                        </ListItemIcon>
                        <ListItemText
                            primary={t("setting.addNewAuthenticator")}
                        />

                        <ListItemSecondaryAction
                            className={classes.flexContainer}
                        >
                            <RightIcon className={classes.rightIcon} />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>
        </div>
    );
}
