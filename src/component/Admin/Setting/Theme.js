import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import { Delete } from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import CreateTheme from "../Dialogs/CreateTheme";
import Alert from "@material-ui/lab/Alert";
import Link from "@material-ui/core/Link";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import { toggleSnackbar } from "../../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    form: {
        maxWidth: 500,
        marginTop: 20,
        marginBottom: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
    colorContainer: {
        display: "flex",
    },
    colorDot: {
        width: 20,
        height: 20,
        borderRadius: "50%",
        marginLeft: 6,
    },
}));

export default function Theme() {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const { t: tApp } = useTranslation();
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState({});
    const [options, setOptions] = useState({
        themes: "{}",
        defaultTheme: "",
        home_view_method: "icon",
        share_view_method: "list",
    });
    const [themeConfig, setThemeConfig] = useState({});
    const [themeConfigError, setThemeConfigError] = useState({});
    const [create, setCreate] = useState(false);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const deleteTheme = (color) => {
        if (color === options.defaultTheme) {
            ToggleSnackbar(
                "top",
                "right",
                t("cannotDeleteDefaultTheme"),
                "warning"
            );
            return;
        }
        if (Object.keys(theme).length <= 1) {
            ToggleSnackbar("top", "right", t("keepAtLeastOneTheme"), "warning");
            return;
        }
        const themeCopy = { ...theme };
        delete themeCopy[color];
        const resStr = JSON.stringify(themeCopy);
        setOptions({
            ...options,
            themes: resStr,
        });
    };

    const addTheme = (newTheme) => {
        setCreate(false);
        if (theme[newTheme.palette.primary.main] !== undefined) {
            ToggleSnackbar(
                "top",
                "right",
                t("duplicatedThemePrimaryColor"),
                "warning"
            );
            return;
        }
        const res = {
            ...theme,
            [newTheme.palette.primary.main]: newTheme,
        };
        const resStr = JSON.stringify(res);
        setOptions({
            ...options,
            themes: resStr,
        });
    };

    useEffect(() => {
        const res = JSON.parse(options.themes);
        const themeString = {};

        Object.keys(res).map((k) => {
            themeString[k] = JSON.stringify(res[k]);
        });

        setTheme(res);
        setThemeConfig(themeString);
    }, [options.themes]);

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
        });
    };

    useEffect(() => {
        API.post("/admin/setting", {
            keys: Object.keys(options),
        })
            .then((response) => {
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        const option = [];
        Object.keys(options).forEach((k) => {
            option.push({
                key: k,
                value: options[k],
            });
        });
        API.patch("/admin/setting", {
            options: option,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t("saved"), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("themes")}
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t("colors")}</TableCell>
                                        <TableCell>
                                            {t("themeConfig")}
                                        </TableCell>
                                        <TableCell>{t("actions")}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(theme).map((k) => (
                                        <TableRow key={k}>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                <div
                                                    className={
                                                        classes.colorContainer
                                                    }
                                                >
                                                    <div
                                                        style={{
                                                            backgroundColor:
                                                                theme[k].palette
                                                                    .primary
                                                                    .main,
                                                        }}
                                                        className={
                                                            classes.colorDot
                                                        }
                                                    />
                                                    <div
                                                        style={{
                                                            backgroundColor:
                                                                theme[k].palette
                                                                    .secondary
                                                                    .main,
                                                        }}
                                                        className={
                                                            classes.colorDot
                                                        }
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    error={themeConfigError[k]}
                                                    helperText={
                                                        themeConfigError[k] &&
                                                        t("wrongFormat")
                                                    }
                                                    fullWidth
                                                    multiline
                                                    onChange={(e) => {
                                                        setThemeConfig({
                                                            ...themeConfig,
                                                            [k]: e.target.value,
                                                        });
                                                    }}
                                                    onBlur={(e) => {
                                                        try {
                                                            const res = JSON.parse(
                                                                e.target.value
                                                            );
                                                            if (
                                                                !(
                                                                    "palette" in
                                                                    res
                                                                ) ||
                                                                !(
                                                                    "primary" in
                                                                    res.palette
                                                                ) ||
                                                                !(
                                                                    "main" in
                                                                    res.palette
                                                                        .primary
                                                                ) ||
                                                                !(
                                                                    "secondary" in
                                                                    res.palette
                                                                ) ||
                                                                !(
                                                                    "main" in
                                                                    res.palette
                                                                        .secondary
                                                                )
                                                            ) {
                                                                throw "error";
                                                            }
                                                            setTheme({
                                                                ...theme,
                                                                [k]: res,
                                                            });
                                                        } catch (e) {
                                                            setThemeConfigError(
                                                                {
                                                                    ...themeConfigError,
                                                                    [k]: true,
                                                                }
                                                            );
                                                            return;
                                                        }
                                                        setThemeConfigError({
                                                            ...themeConfigError,
                                                            [k]: false,
                                                        });
                                                    }}
                                                    value={themeConfig[k]}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() =>
                                                        deleteTheme(k)
                                                    }
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    style={{ marginTop: 8 }}
                                    onClick={() => setCreate(true)}
                                >
                                    {t("createNewTheme")}
                                </Button>
                            </div>
                            <Alert severity="info" style={{ marginTop: 8 }}>
                                <Typography variant="body2">
                                    <Trans
                                        i18nKey={"settings.themeConfigDes"}
                                        ns={"dashboard"}
                                        components={[
                                            <Link
                                                key={0}
                                                href={t("themeConfigDoc")}
                                                target={"_blank"}
                                            />,
                                        ]}
                                    />
                                </Typography>
                            </Alert>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("defaultTheme")}
                                </InputLabel>
                                <Select
                                    value={options.defaultTheme}
                                    onChange={handleChange("defaultTheme")}
                                >
                                    {Object.keys(theme).map((k) => (
                                        <MenuItem key={k} value={k}>
                                            <div
                                                className={
                                                    classes.colorContainer
                                                }
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            theme[k].palette
                                                                .primary.main,
                                                    }}
                                                    className={classes.colorDot}
                                                />
                                                <div
                                                    style={{
                                                        backgroundColor:
                                                            theme[k].palette
                                                                .secondary.main,
                                                    }}
                                                    className={classes.colorDot}
                                                />
                                            </div>
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("defaultThemeDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {t("appearance")}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("personalFileListView")}
                                </InputLabel>
                                <Select
                                    value={options.home_view_method}
                                    onChange={handleChange("home_view_method")}
                                    required
                                >
                                    <MenuItem value={"icon"}>
                                        {tApp("fileManager.gridViewLarge")}
                                    </MenuItem>
                                    <MenuItem value={"smallIcon"}>
                                        {tApp("fileManager.gridViewSmall")}
                                    </MenuItem>
                                    <MenuItem value={"list"}>
                                        {tApp("fileManager.listView")}
                                    </MenuItem>
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("personalFileListViewDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    {t("sharedFileListView")}
                                </InputLabel>
                                <Select
                                    value={options.share_view_method}
                                    onChange={handleChange("share_view_method")}
                                    required
                                >
                                    <MenuItem value={"icon"}>
                                        {tApp("fileManager.gridViewLarge")}
                                    </MenuItem>
                                    <MenuItem value={"smallIcon"}>
                                        {tApp("fileManager.gridViewSmall")}
                                    </MenuItem>
                                    <MenuItem value={"list"}>
                                        {tApp("fileManager.listView")}
                                    </MenuItem>
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("sharedFileListViewDes")}
                                </FormHelperText>
                            </FormControl>
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
                        {t("save")}
                    </Button>
                </div>
            </form>

            <CreateTheme
                onSubmit={addTheme}
                open={create}
                onClose={() => setCreate(false)}
            />
        </div>
    );
}
