import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
    Avatar,
    Button,
    makeStyles,
    Paper,
    Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import EmailIcon from "@material-ui/icons/EmailOutlined";
import { useLocation } from "react-router";
import { toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

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
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Activation() {
    const { t } = useTranslation();
    const query = useQuery();
    const location = useLocation();

    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const history = useHistory();

    const classes = useStyles();

    useEffect(() => {
        API.get(
            "/user/activate/" + query.get("id") + "?sign=" + query.get("sign")
        )
            .then((response) => {
                setEmail(response.data);
                setSuccess(true);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "warning");
                history.push("/login");
            });
        // eslint-disable-next-line
    }, [location]);

    return (
        <div className={classes.layout}>
            {success && (
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <EmailIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        {t("login.activateSuccess")}
                    </Typography>
                    <Typography style={{ marginTop: "20px" }}>
                        {t("login.accountActivated")}
                    </Typography>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={() => history.push("/login?username=" + email)}
                    >
                        {t("login.backToSingIn")}
                    </Button>
                </Paper>
            )}
        </div>
    );
}

export default Activation;
