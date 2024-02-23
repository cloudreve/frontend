import React, { useCallback, useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useHistory } from "react-router";
import { toggleSnackbar } from "../../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
}));
export default function UserForm(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "user" });
    const { t: tDashboard } = useTranslation("dashboard");
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(
        props.user
            ? props.user
            : {
                  ID: 0,
                  Email: "",
                  Nick: "",
                  Password: "", // 为空时只读
                  Status: "0", // 转换类型
                  GroupID: "2", // 转换类型
                  Score: "0", // 转换类型
                  TwoFactor: "",
              }
    );
    const [groups, setGroups] = useState([]);

    const history = useHistory();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.get("/admin/groups")
            .then((response) => {
                setGroups(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const handleChange = (name) => (event) => {
        setUser({
            ...user,
            [name]: event.target.value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const userCopy = { ...user };

        // 整型转换
        ["Status", "GroupID", "Score"].forEach((v) => {
            userCopy[v] = parseInt(userCopy[v]);
        });

        setLoading(true);
        API.post("/admin/user", {
            user: userCopy,
            password: userCopy.Password,
        })
            .then(() => {
                history.push("/admin/user");
                ToggleSnackbar(
                    "top",
                    "right",
                    props.user ? t("saved") : t("added"),
                    "success"
                );
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const groupSelections = useMemo(
        () =>
            groups.map((v) => {
                if (v.ID === 3) {
                    return null;
                }
                return (
                    <MenuItem key={v.ID} value={v.ID.toString()}>
                        {v.Name}
                    </MenuItem>
                );
            }),
        [groups]
    );

    return (
        <div>
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {user.ID === 0 && t("new")}
                        {user.ID !== 0 && t("editUser", { nick: user.Nick })}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("email")}
                                </InputLabel>
                                <Input
                                    value={user.Email}
                                    type={"email"}
                                    onChange={handleChange("Email")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("nick")}
                                </InputLabel>
                                <Input
                                    value={user.Nick}
                                    onChange={handleChange("Nick")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("password")}
                                </InputLabel>
                                <Input
                                    type={"password"}
                                    value={user.Password}
                                    onChange={handleChange("Password")}
                                    required={user.ID === 0}
                                />
                                <FormHelperText id="component-helper-text">
                                    {user.ID !== 0 && t("passwordDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("group")}
                                </InputLabel>
                                <Select
                                    value={user.GroupID}
                                    onChange={handleChange("GroupID")}
                                    required
                                >
                                    {groupSelections}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("groupDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("status")}
                                </InputLabel>
                                <Select
                                    value={user.Status}
                                    onChange={handleChange("Status")}
                                    required
                                >
                                    <MenuItem value={"0"}>
                                        {t("active")}
                                    </MenuItem>
                                    <MenuItem value={"1"}>
                                        {t("notActivated")}
                                    </MenuItem>
                                    <MenuItem value={"2"}>
                                        {t("banned")}
                                    </MenuItem>
                                    <MenuItem value={"3"}>
                                        {t("bannedBySys")}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {tDashboard("vas.credits")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 0,
                                        step: 1,
                                    }}
                                    value={user.Score}
                                    onChange={handleChange("Score")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("2FASecret")}
                                </InputLabel>
                                <Input
                                    value={user.TwoFactor}
                                    onChange={handleChange("TwoFactor")}
                                />
                            </FormControl>
                            <FormHelperText id="component-helper-text">
                                {t("2FASecretDes")}
                            </FormHelperText>
                        </div>
                    </div>
                </div>
                <div className={classes.root}>
                    <Button
                        disabled={loading}
                        type={"submit"}
                        variant={"contained"}
                        color={"primary"}
                    >
                        {tDashboard("settings.save")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
