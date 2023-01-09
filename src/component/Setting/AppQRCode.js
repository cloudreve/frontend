import React, { useCallback, useEffect, useState } from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useTheme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { QRCodeSVG } from "qrcode.react";
import { randomStr } from "../../utils";
import classNames from "classnames";
import API from "../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../redux/explorer";

const useStyles = makeStyles((theme) => ({
    blur: {
        filter: "blur(8px)",
    },
    container: {
        position: "relative",
        width: 128,
    },
    progress: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -12,
        marginTop: -12,
        zIndex: 1,
    },
    qrcode: {
        transition: "all .3s ease-in",
    },
}));

export default function AppQRCode() {
    const [content, setContent] = useState(randomStr(32));
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation("application", { keyPrefix: "setting" });
    const theme = useTheme();
    const classes = useStyles();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const refresh = () => {
        setLoading(true);
        API.get("/user/session")
            .then((response) => {
                setContent(response.data);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        refresh();
        const interval = window.setInterval(refresh, 1000 * 45);
        return () => {
            window.clearInterval(interval);
        };
    }, []);

    return (
        <Box className={classes.container}>
            {loading && (
                <CircularProgress size={24} className={classes.progress} />
            )}
            <QRCodeSVG
                className={classNames(classes.qrcode, {
                    [classes.blur]: loading,
                })}
                value={content}
            />
        </Box>
    );
}
