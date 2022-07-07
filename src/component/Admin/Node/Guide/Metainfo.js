import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import { toggleSnackbar } from "../../../../redux/explorer";
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

export default function Metainfo(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "node" });
    const { t: tDashboard } = useTranslation("dashboard");
    const classes = useStyles();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    return (
        <form
            className={classes.stepContent}
            onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit(e);
            }}
        >
            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>1</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>{t("nameNode")}</Typography>
                    <div className={classes.form}>
                        <FormControl fullWidth>
                            <Input
                                required
                                value={props.node.Name}
                                onChange={props.handleTextChange("Name")}
                            />
                        </FormControl>
                    </div>
                </div>
            </div>

            <div className={classes.subStepContainer}>
                <div className={classes.stepNumberContainer}>
                    <div className={classes.stepNumber}>2</div>
                </div>
                <div className={classes.subStepContent}>
                    <Typography variant={"body2"}>
                        {t("loadBalancerRankDes")}
                    </Typography>
                    <div className={classes.form}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="component-helper">
                                {t("loadBalancerRank")}
                            </InputLabel>
                            <Input
                                type={"number"}
                                required
                                inputProps={{
                                    step: 1,
                                    min: 0,
                                }}
                                value={props.node.Rank}
                                onChange={props.handleTextChange("Rank")}
                            />
                        </FormControl>
                    </div>
                </div>
            </div>

            <div className={classes.stepFooter}>
                <Button
                    disabled={loading || props.loading}
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                >
                    {tDashboard("policy.next")}
                </Button>
            </div>
        </form>
    );
}
