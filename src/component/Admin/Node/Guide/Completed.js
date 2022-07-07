import { lighten, makeStyles } from "@material-ui/core/styles";
import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    stepContent: {
        padding: "16px 32px 16px 32px",
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
    subStepContainer: {
        display: "flex",
        marginBottom: 20,
        padding: 10,
        transition: theme.transitions.create("background-color", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        "&:focus-within": {
            backgroundColor: theme.palette.background.default,
        },
    },
    stepNumber: {
        width: 20,
        height: 20,
        backgroundColor: lighten(theme.palette.secondary.light, 0.2),
        color: theme.palette.secondary.contrastText,
        textAlign: "center",
        borderRadius: " 50%",
    },
    stepNumberContainer: {
        marginRight: 10,
    },
    stepFooter: {
        marginTop: 32,
    },
    button: {
        marginRight: theme.spacing(1),
    },
    viewButtonLabel: { textTransform: "none" },
    "@global": {
        code: {
            color: "rgba(0, 0, 0, 0.87)",
            display: "inline-block",
            padding: "2px 6px",
            fontFamily:
                ' Consolas, "Liberation Mono", Menlo, Courier, monospace',
            borderRadius: "2px",
            backgroundColor: "rgba(255,229,100,0.1)",
        },
        pre: {
            margin: "24px 0",
            padding: "12px 18px",
            overflow: "auto",
            direction: "ltr",
            borderRadius: "4px",
            backgroundColor: "#272c34",
            color: "#fff",
            fontFamily:
                ' Consolas, "Liberation Mono", Menlo, Courier, monospace',
        },
    },
}));

export default function Completed(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "node" });
    const classes = useStyles();
    const history = useHistory();

    return (
        <form className={classes.stepContent}>
            <Typography>{t("nodeSaved")}</Typography>
            <Typography variant={"body2"} color={"textSecondary"}>
                {t("nodeSavedFutureAction")}
            </Typography>

            <div className={classes.stepFooter}>
                <Button
                    color={"primary"}
                    className={classes.button}
                    onClick={() => history.push("/admin/node")}
                >
                    {t("backToNodeList")}
                </Button>
            </div>
        </form>
    );
}
