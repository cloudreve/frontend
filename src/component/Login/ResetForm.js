import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Avatar,
    Button,
    Divider,
    FormControl,
    Link,
    makeStyles,
    Paper,
    TextField,
    Typography,
} from "@material-ui/core";
import { Link as RouterLink, useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import { useLocation } from "react-router";
import KeyIcon from "@material-ui/icons/VpnKeyOutlined";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";
import InputAdornment from "@material-ui/core/InputAdornment";
import { VpnKeyOutlined } from "@material-ui/icons";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
    layout: {
        width: "auto",
        marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up("sm")]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto",
        },
        marginBottom: 110,
    },
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px`,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    link: {
        marginTop: "20px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResetForm() {
    const { t } = useTranslation();
    const query = useQuery();
    const [input, setInput] = useState({
        password: "",
        password_repeat: "",
    });
    const [loading, setLoading] = useState(false);
    const registerEnabled = useSelector(
        (state) => state.siteConfig.registerEnabled
    );
    const handleInputChange = (name) => (e) => {
        setInput({
            ...input,
            [name]: e.target.value,
        });
    };
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const history = useHistory();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const submit = (e) => {
        e.preventDefault();
        if (input.password !== input.password_repeat) {
            ToggleSnackbar(
                "top",
                "right",
                t("login.passwordNotMatch"),
                "warning"
            );
            return;
        }
        setLoading(true);
        API.patch("/user/reset", {
            secret: query.get("sign"),
            id: query.get("id"),
            Password: input.password,
        })
            .then(() => {
                setLoading(false);
                history.push("/login");
                ToggleSnackbar(
                    "top",
                    "right",
                    t("login.passwordReset"),
                    "success"
                );
            })
            .catch((error) => {
                setLoading(false);
                ToggleSnackbar("top", "right", error.message, "warning");
            });
    };

    const classes = useStyles();

    return (
        <div className={classes.layout}>
            <Paper className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <KeyIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {t("login.findMyPassword")}
                </Typography>
                <form className={classes.form} onSubmit={submit}>
                    <FormControl margin="normal" required fullWidth>
                        <TextField
                            variant={"outlined"}
                            label={t("login.newPassword")}
                            inputProps={{
                                type: "password",
                                id: "pwd",
                                name: "pwd",
                            }}
                            InputProps={{
                                startAdornment: !isMobile && (
                                    <InputAdornment position="start">
                                        <VpnKeyOutlined />
                                    </InputAdornment>
                                ),
                            }}
                            onChange={handleInputChange("password")}
                            autoComplete
                            value={input.password}
                            autoFocus
                        />
                    </FormControl>
                    <FormControl margin="normal" required fullWidth>
                        <TextField
                            variant={"outlined"}
                            label={t("login.repeatNewPassword")}
                            inputProps={{
                                type: "password",
                                id: "pwdRepeat",
                                name: "pwdRepeat",
                            }}
                            InputProps={{
                                startAdornment: !isMobile && (
                                    <InputAdornment position="start">
                                        <VpnKeyOutlined />
                                    </InputAdornment>
                                ),
                            }}
                            onChange={handleInputChange("password_repeat")}
                            autoComplete
                            value={input.password_repeat}
                            autoFocus
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        className={classes.submit}
                    >
                        {t("login.resetPassword")}
                    </Button>{" "}
                </form>{" "}
                <Divider />
                <div className={classes.link}>
                    <div>
                        <Link component={RouterLink} to={"/login"}>
                            {t("login.backToSingIn")}
                        </Link>
                    </div>
                    <div>
                        {registerEnabled && (
                            <Link component={RouterLink} to={"/signup"}>
                                {t("login.signUpAccount")}
                            </Link>
                        )}
                    </div>
                </div>
            </Paper>
        </div>
    );
}

export default ResetForm;
