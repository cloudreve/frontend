import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core";
import { toggleSnackbar } from "../../actions/index";
import { useHistory } from "react-router-dom";
import API from "../../middleware/Api";
import {
    Button,
    FormControl,
    Divider,
    Link,
    Input,
    InputLabel,
    Paper,
    Avatar,
    Typography,
} from "@material-ui/core";
import { useLocation } from "react-router";
import KeyIcon from "@material-ui/icons/VpnKeyOutlined";
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
    const query = useQuery();
    const [input, setInput] = useState({
        password: "",
        password_repeat: "",
    });
    const [loading, setLoading] = useState(false);
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

    const { t } = useTranslation();

    const submit = (e) => {
        e.preventDefault();
        if (input.password !== input.password_repeat) {
            ToggleSnackbar("top", "right", t('The two password entries are inconsistent'), "warning");
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
                ToggleSnackbar("top", "right", t('Password has been reset'), "success");
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
                {t('Retrieve Password')}
              </Typography>
              <form className={classes.form} onSubmit={submit}>
                  <FormControl margin="normal" required fullWidth>
                      <InputLabel htmlFor="email">{t('New password')}</InputLabel>
                      <Input
                          id="pwd"
                          type="password"
                          name="pwd"
                          onChange={handleInputChange("password")}
                          autoComplete
                          value={input.password}
                          autoFocus
                      />
                  </FormControl>
                  <FormControl margin="normal" required fullWidth>
                      <InputLabel htmlFor="email">{t('Repeat new password')}</InputLabel>
                      <Input
                          id="pwdRepeat"
                          type="password"
                          name="pwdRepeat"
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
                    {t('reset Password')}
                  </Button>{" "}
              </form>{" "}
              <Divider />
              <div className={classes.link}>
                  <div>
                      <Link href={"/#/login"}>{t('Return to login')}</Link>
                  </div>
                  <div>
                      <Link href={"/#/signup"}>{t('Create an account')}</Link>
                  </div>
              </div>
          </Paper>
      </div>
    );
}

export default ResetForm;
