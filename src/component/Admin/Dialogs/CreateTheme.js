import React, { useCallback, useState } from "react";
import DialogContent from "@material-ui/core/DialogContent";
import { CompactPicker } from "react-color";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { Add, Menu } from "@material-ui/icons";
import { ThemeProvider } from "@material-ui/styles";
import Fab from "@material-ui/core/Fab";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    picker: {
        "& div": {
            boxShadow: "none !important",
        },
        marginTop: theme.spacing(1),
    },
    "@global": {
        ".compact-picker:parent ": {
            boxShadow: "none !important",
        },
    },
    statusBar: {
        height: 24,
        width: "100%",
    },
    fab: {
        textAlign: "right",
    },
}));

export default function CreateTheme({ open, onClose, onSubmit }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const { t: tGlobal } = useTranslation("common");
    const classes = useStyles();
    const [theme, setTheme] = useState({
        palette: {
            primary: {
                main: "#3f51b5",
                contrastText: "#fff",
            },
            secondary: {
                main: "#d81b60",
                contrastText: "#fff",
            },
        },
    });

    const subTheme = useCallback(() => {
        try {
            return createMuiTheme(theme);
        } catch (e) {
            return createMuiTheme({});
        }
    }, [theme]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"md"}>
            <DialogContent>
                <Grid container>
                    <Grid spacing={2} md={8} xs={12} container>
                        <Grid md={6} xs={12} item>
                            <Typography variant="h6" gutterBottom>
                                {t("primaryColor")}
                            </Typography>
                            <TextField
                                value={theme.palette.primary.main}
                                onChange={(e) => {
                                    setTheme({
                                        ...theme,
                                        palette: {
                                            ...theme.palette,
                                            primary: {
                                                ...theme.palette.primary,
                                                main: e.target.value,
                                            },
                                        },
                                    });
                                }}
                                fullWidth
                            />
                            <div className={classes.picker}>
                                <CompactPicker
                                    colors={[
                                        "#4D4D4D",
                                        "#999999",
                                        "#FFFFFF",
                                        "#f44336",
                                        "#ff9800",
                                        "#ffeb3b",
                                        "#cddc39",
                                        "#A4DD00",
                                        "#00bcd4",
                                        "#03a9f4",
                                        "#AEA1FF",
                                        "#FDA1FF",
                                        "#333333",
                                        "#808080",
                                        "#cccccc",
                                        "#ff5722",
                                        "#ffc107",
                                        "#FCC400",
                                        "#8bc34a",
                                        "#4caf50",
                                        "#009688",
                                        "#2196f3",
                                        "#3f51b5",
                                        "#e91e63",
                                        "#000000",
                                        "#666666",
                                        "#B3B3B3",
                                        "#9F0500",
                                        "#C45100",
                                        "#FB9E00",
                                        "#808900",
                                        "#194D33",
                                        "#0C797D",
                                        "#0062B1",
                                        "#673ab7",
                                        "#9c27b0",
                                    ]}
                                    color={theme.palette.primary.main}
                                    onChangeComplete={(c) => {
                                        setTheme({
                                            ...theme,
                                            palette: {
                                                ...theme.palette,
                                                primary: {
                                                    ...theme.palette.primary,
                                                    main: c.hex,
                                                },
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid md={6} xs={12} item>
                            <Typography variant="h6" gutterBottom>
                                {t("secondaryColor")}
                            </Typography>
                            <TextField
                                value={theme.palette.secondary.main}
                                onChange={(e) => {
                                    setTheme({
                                        ...theme,
                                        palette: {
                                            ...theme.palette,
                                            secondary: {
                                                ...theme.palette.secondary,
                                                main: e.target.value,
                                            },
                                        },
                                    });
                                }}
                                fullWidth
                            />
                            <div className={classes.picker}>
                                <CompactPicker
                                    colors={[
                                        "#4D4D4D",
                                        "#999999",
                                        "#FFFFFF",
                                        "#ff1744",
                                        "#ff3d00",
                                        "#ffeb3b",
                                        "#cddc39",
                                        "#A4DD00",
                                        "#00bcd4",
                                        "#00e5ff",
                                        "#AEA1FF",
                                        "#FDA1FF",
                                        "#333333",
                                        "#808080",
                                        "#cccccc",
                                        "#ff5722",
                                        "#ffea00",
                                        "#ffc400",
                                        "#c6ff00",
                                        "#00e676",
                                        "#76ff03",
                                        "#00b0ff",
                                        "#2979ff",
                                        "#f50057",
                                        "#000000",
                                        "#666666",
                                        "#B3B3B3",
                                        "#9F0500",
                                        "#C45100",
                                        "#FB9E00",
                                        "#808900",
                                        "#1de9b6",
                                        "#0C797D",
                                        "#3d5afe",
                                        "#651fff",
                                        "#d500f9",
                                    ]}
                                    color={theme.palette.secondary.main}
                                    onChangeComplete={(c) => {
                                        setTheme({
                                            ...theme,
                                            palette: {
                                                ...theme.palette,
                                                secondary: {
                                                    ...theme.palette.secondary,
                                                    main: c.hex,
                                                },
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid md={6} xs={12} item>
                            <Typography variant="h6" gutterBottom>
                                {t("primaryColorText")}
                            </Typography>
                            <TextField
                                value={theme.palette.primary.contrastText}
                                onChange={(e) => {
                                    setTheme({
                                        ...theme,
                                        palette: {
                                            ...theme.palette,
                                            primary: {
                                                ...theme.palette.primary,
                                                contrastText: e.target.value,
                                            },
                                        },
                                    });
                                }}
                                fullWidth
                            />
                            <div className={classes.picker}>
                                <CompactPicker
                                    color={theme.palette.primary.contrastText}
                                    onChangeComplete={(c) => {
                                        setTheme({
                                            ...theme,
                                            palette: {
                                                ...theme.palette,
                                                primary: {
                                                    ...theme.palette.primary,
                                                    contrastText: c.hex,
                                                },
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </Grid>
                        <Grid md={6} xs={12} item>
                            <Typography variant="h6" gutterBottom>
                                {t("secondaryColorText")}
                            </Typography>
                            <TextField
                                value={theme.palette.secondary.contrastText}
                                onChange={(e) => {
                                    setTheme({
                                        ...theme,
                                        palette: {
                                            ...theme.palette,
                                            secondary: {
                                                ...theme.palette.secondary,
                                                contrastText: e.target.value,
                                            },
                                        },
                                    });
                                }}
                                fullWidth
                            />
                            <div className={classes.picker}>
                                <CompactPicker
                                    color={theme.palette.secondary.contrastText}
                                    onChangeComplete={(c) => {
                                        setTheme({
                                            ...theme,
                                            palette: {
                                                ...theme.palette,
                                                secondary: {
                                                    ...theme.palette.secondary,
                                                    contrastText: c.hex,
                                                },
                                            },
                                        });
                                    }}
                                />
                            </div>
                        </Grid>
                    </Grid>
                    <Grid spacing={2} md={4} xs={12}>
                        <ThemeProvider theme={subTheme()}>
                            <div
                                className={classes.statusBar}
                                style={{
                                    backgroundColor: subTheme().palette.primary
                                        .dark,
                                }}
                            />
                            <AppBar position="static">
                                <Toolbar>
                                    <IconButton
                                        edge="start"
                                        className={classes.menuButton}
                                        color="inherit"
                                        aria-label="menu"
                                    >
                                        <Menu />
                                    </IconButton>
                                    <Typography
                                        variant="h6"
                                        className={classes.title}
                                    >
                                        Color
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                            <div style={{ padding: 16 }}>
                                <TextField
                                    fullWidth
                                    color={"secondary"}
                                    label={"Text input"}
                                />
                                <div
                                    className={classes.fab}
                                    style={{ paddingTop: 64 }}
                                >
                                    <Fab color="secondary" aria-label="add">
                                        <Add />
                                    </Fab>
                                </div>
                            </div>
                        </ThemeProvider>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    {tGlobal("cancel")}
                </Button>
                <Button onClick={() => onSubmit(theme)} color="primary">
                    {tGlobal("ok")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
