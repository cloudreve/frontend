import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
import Link from "@material-ui/core/Link";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import API from "../../../../middleware/Api";
import MagicVar from "../../Dialogs/MagicVar";
import DomainInput from "../../Common/DomainInput";
import SizeInput from "../../Common/SizeInput";
import { useHistory } from "react-router";
import { getNumber, randomStr } from "../../../../utils";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Alert from "@material-ui/lab/Alert";

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
    },
}));

export default function Communication(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
    const [node, setNode] = useState(
        props.node
            ? props.node
            : {
                  Status: 1,
                  Type: 0,
                  Aria2Enabled: false,
                  Server: "https://example.com:5212",
                  SlaveKey: randomStr(64),
                  MasterKey: randomStr(64),
                  Aria2Options: {},
              }
    );

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const dispatch = useDispatch();
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
            <Alert severity="info" style={{ marginBottom: 10 }}>
                从机存储策略允许你使用同样运行了 Cloudreve 的服务器作为存储端，
                用户上传下载流量通过 HTTP 直传。
            </Alert>

            <div className={classes.stepFooter}>
                <Button
                    disabled={props.loading}
                    type={"submit"}
                    variant={"contained"}
                    color={"primary"}
                >
                    下一步
                </Button>
            </div>
        </form>
    );
}
