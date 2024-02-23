import React, { Component } from "react";
import { connect } from "react-redux";
import PhotoIcon from "@material-ui/icons/InsertPhoto";
import GroupIcon from "@material-ui/icons/Group";
import DateIcon from "@material-ui/icons/DateRange";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import LinkIcon from "@material-ui/icons/Phonelink";
import AlarmOff from "@material-ui/icons/AlarmOff";
import InputIcon from "@material-ui/icons/Input";
import SecurityIcon from "@material-ui/icons/Security";
import NickIcon from "@material-ui/icons/PermContactCalendar";
import LockIcon from "@material-ui/icons/Lock";
import VerifyIcon from "@material-ui/icons/VpnKey";
import ColorIcon from "@material-ui/icons/Palette";
import axios from "axios";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Switch,
    TextField,
    Tooltip,
    Typography,
    withStyles,
} from "@material-ui/core";
import SettingsInputHdmi from "@material-ui/icons/SettingsInputHdmi";
import { blue, green, yellow } from "@material-ui/core/colors";
import API from "../../middleware/Api";
import Auth from "../../middleware/Auth";
import { withRouter } from "react-router";
import TimeAgo from "timeago-react";
import { QRCodeSVG } from "qrcode.react";
import {
    Brightness3,
    ConfirmationNumber,
    ListAlt,
    PermContactCalendar,
    Schedule,
    Translate,
} from "@material-ui/icons";
import Authn from "./Authn";
import { formatLocalTime, timeZone } from "../../utils/datetime";
import TimeZoneDialog from "../Modals/TimeZone";
import BindPhone from "../Modals/BindPhone";
import {
    applyThemes,
    changeViewMethod,
    toggleDaylightMode,
    toggleSnackbar,
} from "../../redux/explorer";
import { Trans, withTranslation } from "react-i18next";
import { selectLanguage } from "../../redux/viewUpdate/action";
import OptionSelector from "../Modals/OptionSelector";

const styles = (theme) => ({
    layout: {
        width: "auto",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 700,
            marginLeft: "auto",
            marginRight: "auto",
        },
    },
    sectionTitle: {
        paddingBottom: "10px",
        paddingTop: "30px",
    },
    rightIcon: {
        marginTop: "4px",
        marginRight: "10px",
        color: theme.palette.text.secondary,
    },
    uploadFromFile: {
        backgroundColor: blue[100],
        color: blue[600],
    },
    userGravatar: {
        backgroundColor: yellow[100],
        color: yellow[800],
    },
    policySelected: {
        backgroundColor: green[100],
        color: green[800],
    },
    infoText: {
        marginRight: "17px",
        [theme.breakpoints.down("xs")]: {
            maxWidth: 100,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
        },
    },
    infoTextWithIcon: {
        marginRight: "17px",
        marginTop: "1px",
        [theme.breakpoints.down("xs")]: {
            maxWidth: 100,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
        },
    },
    rightIconWithText: {
        marginTop: "0px",
        marginRight: "10px",
        color: theme.palette.text.secondary,
    },
    iconFix: {
        marginRight: "11px",
        marginLeft: "7px",
        minWidth: 40,
    },
    flexContainer: {
        display: "flex",
    },
    desenList: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    flexContainerResponse: {
        display: "flex",
        [theme.breakpoints.down("sm")]: {
            display: "initial",
        },
    },
    desText: {
        marginTop: "10px",
    },
    secondColor: {
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.secondary.main,
        borderRadius: "50%",
        marginRight: "17px",
    },
    firstColor: {
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "50%",
        marginRight: "6px",
    },
    themeBlock: {
        height: "20px",
        width: "20px",
    },
    paddingBottom: {
        marginBottom: "30px",
    },
    paddingText: {
        paddingRight: theme.spacing(2),
    },
    qrcode: {
        width: 128,
        marginTop: 16,
        marginRight: 16,
    },
});

const mapStateToProps = (state) => {
    return {
        title: state.siteConfig.title,
        authn: state.siteConfig.authn,
        viewMethod: state.viewUpdate.explorerViewMethod,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        applyThemes: (color) => {
            dispatch(applyThemes(color));
        },
        toggleDaylightMode: () => {
            dispatch(toggleDaylightMode());
        },
        changeView: (method) => {
            dispatch(changeViewMethod(method));
        },
        selectLanguage: () => {
            dispatch(selectLanguage());
        },
    };
};

class UserSettingCompoment extends Component {
    constructor(props) {
        super(props);
        this.fileInput = React.createRef();
    }

    state = {
        avatarModal: false,
        nickModal: false,
        changePassword: false,
        loading: "",
        oldPwd: "",
        newPwd: "",
        webdavPwd: "",
        newPwdRepeat: "",
        twoFactor: false,
        authCode: "",
        changeTheme: false,
        chosenTheme: null,
        showWebDavUrl: false,
        showWebDavUserName: false,
        changeWebDavPwd: false,
        groupBackModal: false,
        changeTimeZone: false,
        bindPhone: false,
        settings: {
            uid: 0,
            group_expires: 0,
            qq: "",
            phone: "",
            homepage: true,
            two_factor: "",
            two_fa_secret: "",
            prefer_theme: "",
            themes: {},
            authn: [],
        },
    };

    handleClose = () => {
        this.setState({
            avatarModal: false,
            nickModal: false,
            changePassword: false,
            loading: "",
            twoFactor: false,
            changeTheme: false,
            showWebDavUrl: false,
            showWebDavUserName: false,
            changeWebDavPwd: false,
            groupBackModal: false,
            bindPhone: false,
        });
    };

    componentDidMount() {
        this.loadSetting();
    }

    toggleViewMethod = () => {
        const newMethod =
            this.props.viewMethod === "icon"
                ? "list"
                : this.props.viewMethod === "list"
                ? "smallIcon"
                : "icon";
        Auth.SetPreference("view_method", newMethod);
        this.props.changeView(newMethod);
    };

    loadSetting = () => {
        API.get("/user/setting")
            .then((response) => {
                const theme = JSON.parse(response.data.themes);
                response.data.themes = theme;
                this.setState({
                    settings: response.data,
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    doChangeGroup = () => {
        API.patch("/user/setting/vip", {})
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("vas.cancelSubscription"),
                    "success"
                );
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    useGravatar = () => {
        this.setState({
            loading: "gravatar",
        });
        API.put("/user/setting/avatar")
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("setting.avatarUpdated"),
                    "success"
                );
                this.setState({
                    loading: "",
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changeNick = () => {
        this.setState({
            loading: "nick",
        });
        API.patch("/user/setting/nick", {
            nick: this.state.nick,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("setting.nickChanged"),
                    "success"
                );
                this.setState({
                    loading: "",
                });
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    bindQQ = () => {
        this.setState({
            loading: "nick",
        });
        API.patch("/user/setting/qq", {})
            .then((response) => {
                if (response.data === "") {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        this.props.t("vas.qqUnlinked"),
                        "success"
                    );
                    this.setState({
                        settings: {
                            ...this.state.settings,
                            qq: false,
                        },
                    });
                } else {
                    window.location.href = response.data;
                }
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            })
            .then(() => {
                this.setState({
                    loading: "",
                });
            });
    };

    uploadAvatar = () => {
        this.setState({
            loading: "avatar",
        });
        const formData = new FormData();
        formData.append("avatar", this.fileInput.current.files[0]);
        API.post("/user/setting/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("setting.avatarUpdated"),
                    "success"
                );
                this.setState({
                    loading: "",
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    handleToggle = () => {
        API.patch("/user/setting/homepage", {
            status: !this.state.settings.homepage,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("setting.settingSaved"),
                    "success"
                );
                this.setState({
                    settings: {
                        ...this.state.settings,
                        homepage: !this.state.settings.homepage,
                    },
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    changhePwd = () => {
        if (this.state.newPwd !== this.state.newPwdRepeat) {
            this.props.toggleSnackbar(
                "top",
                "right",
                this.props.t("login.passwordNotMatch"),
                "warning"
            );
            return;
        }
        this.setState({
            loading: "changePassword",
        });
        API.patch("/user/setting/password", {
            old: this.state.oldPwd,
            new: this.state.newPwd,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("login.passwordReset"),
                    "success"
                );
                this.setState({
                    loading: "",
                });
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changeTheme = () => {
        this.setState({
            loading: "changeTheme",
        });
        API.patch("/user/setting/theme", {
            theme: this.state.chosenTheme,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("setting.themeColorChanged"),
                    "success"
                );
                this.props.applyThemes(this.state.chosenTheme);
                this.setState({
                    loading: "",
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changheWebdavPwd = () => {
        this.setState({
            loading: "changheWebdavPwd",
        });
        axios
            .post("/Member/setWebdavPwd", {
                pwd: this.state.webdavPwd,
            })
            .then((response) => {
                if (response.data.error === "1") {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.msg,
                        "error"
                    );
                    this.setState({
                        loading: "",
                    });
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.msg,
                        "success"
                    );
                    this.setState({
                        loading: "",
                        changeWebDavPwd: false,
                    });
                }
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    init2FA = () => {
        if (this.state.settings.two_factor) {
            this.setState({ twoFactor: true });
            return;
        }
        API.get("/user/setting/2fa")
            .then((response) => {
                this.setState({
                    two_fa_secret: response.data,
                    twoFactor: true,
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    twoFactor = () => {
        this.setState({
            loading: "twoFactor",
        });
        API.patch("/user/setting/2fa", {
            code: this.state.authCode,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t("setting.settingSaved"),
                    "success"
                );
                this.setState({
                    loading: "",
                    settings: {
                        ...this.state.settings,
                        two_factor: !this.state.settings.two_factor,
                    },
                });
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    };

    handleAlignment = (event, chosenTheme) => this.setState({ chosenTheme });

    toggleThemeMode = (current) => {
        const newMode =
            current === null ? "light" : current === "light" ? "dark" : null;
        this.props.toggleDaylightMode();
        Auth.SetPreference("theme_mode", newMode);
    };

    bindPhone = () => {
        this.setState({ bindPhone: true });
    };

    render() {
        const { classes, t } = this.props;
        const user = Auth.GetUser();
        const dark = Auth.GetPreference("theme_mode");

        return (
            <div>
                <div className={classes.layout}>
                    <Typography
                        className={classes.sectionTitle}
                        variant="subtitle2"
                    >
                        {t("setting.profile")}
                    </Typography>
                    <Paper>
                        <List className={classes.desenList}>
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ avatarModal: true })
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={
                                            "/api/v3/user/avatar/" +
                                            user.id +
                                            "/l"
                                        }
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={t("setting.avatar")} />
                                <ListItemSecondaryAction>
                                    <RightIcon className={classes.rightIcon} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <PermContactCalendar />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.uid")} />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {this.state.settings.uid}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ nickModal: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <NickIcon />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.nickname")} />

                                <ListItemSecondaryAction
                                    onClick={() =>
                                        this.setState({ nickModal: true })
                                    }
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {user.nickname}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <EmailIcon />
                                </ListItemIcon>
                                <ListItemText primary={t("login.email")} />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {user.user_name}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            {/*<Divider />*/}
                            {/*<ListItem button onClick={() => this.bindPhone()}>*/}
                            {/*    <ListItemIcon className={classes.iconFix}>*/}
                            {/*        <SettingsInputHdmi />*/}
                            {/*    </ListItemIcon>*/}
                            {/*    <ListItemText primary="手机号" />*/}

                            {/*    <ListItemSecondaryAction*/}
                            {/*        className={classes.flexContainer}*/}
                            {/*    >*/}
                            {/*        <Typography*/}
                            {/*            className={classes.infoTextWithIcon}*/}
                            {/*            color="textSecondary"*/}
                            {/*        >*/}
                            {/*            {this.state.settings.phone*/}
                            {/*                ? this.state.settings.phone*/}
                            {/*                : "绑定"}*/}
                            {/*        </Typography>*/}
                            {/*        <RightIcon*/}
                            {/*            className={classes.rightIconWithText}*/}
                            {/*        />*/}
                            {/*    </ListItemSecondaryAction>*/}
                            {/*</ListItem>*/}
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.props.history.push("/buy?tab=1")
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <GroupIcon />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.group")} />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {user.group.name}
                                        {this.state.settings.group_expires && (
                                            <span>
                                                <Tooltip
                                                    key={0}
                                                    title={formatLocalTime(
                                                        this.state.settings
                                                            .group_expires
                                                    )}
                                                >
                                                    <Trans
                                                        i18nKey="vas.groupExpire"
                                                        components={[
                                                            <TimeAgo
                                                                key={0}
                                                                datetime={
                                                                    this.state
                                                                        .settings
                                                                        .group_expires
                                                                }
                                                                locale={t(
                                                                    "timeAgoLocaleCode",
                                                                    {
                                                                        ns: "common",
                                                                    }
                                                                )}
                                                            />,
                                                        ]}
                                                    />
                                                </Tooltip>
                                            </span>
                                        )}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            {this.state.settings.group_expires && (
                                <div>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.setState({
                                                groupBackModal: true,
                                            })
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <AlarmOff />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t(
                                                "vas.manuallyCancelSubscription"
                                            )}
                                        />

                                        <ListItemSecondaryAction>
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </div>
                            )}
                            <Divider />
                            <ListItem button onClick={() => this.bindQQ()}>
                                <ListItemIcon className={classes.iconFix}>
                                    <SettingsInputHdmi />
                                </ListItemIcon>
                                <ListItemText primary={t("vas.qqAccount")} />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {this.state.settings.qq
                                            ? t("vas.unlink")
                                            : t("vas.connect")}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <ConfirmationNumber />
                                </ListItemIcon>
                                <ListItemText primary={t("vas.credits")} />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {user.score}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <DateIcon />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.regTime")} />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {formatLocalTime(user.created_at)}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                    <Typography
                        className={classes.sectionTitle}
                        variant="subtitle2"
                    >
                        {t("setting.privacyAndSecurity")}
                    </Typography>
                    <Paper>
                        <List className={classes.desenList}>
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t("setting.profilePage")}
                                />

                                <ListItemSecondaryAction>
                                    <Switch
                                        onChange={this.handleToggle}
                                        checked={this.state.settings.homepage}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ changePassword: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <LockIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t("setting.accountPassword")}
                                />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <RightIcon className={classes.rightIcon} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button onClick={() => this.init2FA()}>
                                <ListItemIcon className={classes.iconFix}>
                                    <VerifyIcon />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.2fa")} />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {!this.state.settings.two_factor
                                            ? t("setting.disabled")
                                            : t("setting.enabled")}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>

                    <Authn
                        list={this.state.settings.authn}
                        add={(credential) => {
                            this.setState({
                                settings: {
                                    ...this.state.settings,
                                    authn: [
                                        ...this.state.settings.authn,
                                        credential,
                                    ],
                                },
                            });
                        }}
                        remove={(id) => {
                            let credentials = [...this.state.settings.authn];
                            credentials = credentials.filter((v) => {
                                return v.id !== id;
                            });
                            this.setState({
                                settings: {
                                    ...this.state.settings,
                                    authn: credentials,
                                },
                            });
                        }}
                    />

                    <Typography
                        className={classes.sectionTitle}
                        variant="subtitle2"
                    >
                        {t("setting.appearance")}
                    </Typography>
                    <Paper>
                        <List className={classes.desenList}>
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ changeTheme: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <ColorIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t("setting.themeColor")}
                                />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <div className={classes.firstColor} />
                                    <div className={classes.secondColor} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => this.toggleThemeMode(dark)}
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <Brightness3 />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.darkMode")} />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {dark &&
                                            (dark === "dark"
                                                ? t("setting.enabled")
                                                : t("setting.disabled"))}
                                        {dark === null &&
                                            t("setting.syncWithSystem")}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => this.toggleViewMethod()}
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <ListAlt />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.fileList")} />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {this.props.viewMethod === "icon" &&
                                            t("fileManager.gridViewLarge")}
                                        {this.props.viewMethod === "list" &&
                                            t("fileManager.listView")}
                                        {this.props.viewMethod ===
                                            "smallIcon" &&
                                            t("fileManager.gridViewSmall")}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                onClick={() =>
                                    this.setState({ changeTimeZone: true })
                                }
                                button
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <Schedule />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.timeZone")} />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {timeZone}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                onClick={() => this.props.selectLanguage()}
                                button
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <Translate />
                                </ListItemIcon>
                                <ListItemText primary={t("setting.language")} />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                    {user.group.webdav && (
                        <div>
                            <Typography
                                className={classes.sectionTitle}
                                variant="subtitle2"
                            >
                                WebDAV
                            </Typography>
                            <Paper>
                                <List className={classes.desenList}>
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.setState({
                                                showWebDavUrl: true,
                                            })
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <LinkIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t("setting.webdavServer")}
                                        />

                                        <ListItemSecondaryAction
                                            className={classes.flexContainer}
                                        >
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.setState({
                                                showWebDavUserName: true,
                                            })
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <InputIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t("setting.userName")}
                                        />

                                        <ListItemSecondaryAction
                                            className={classes.flexContainer}
                                        >
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.props.history.push("/connect?")
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <SecurityIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={t("setting.manageAccount")}
                                        />

                                        <ListItemSecondaryAction
                                            className={classes.flexContainer}
                                        >
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            </Paper>
                        </div>
                    )}
                    <div className={classes.paddingBottom} />
                </div>
                <BindPhone
                    phone={this.state.settings.phone}
                    onClose={this.handleClose}
                    open={this.state.bindPhone}
                />
                <TimeZoneDialog
                    onClose={() => this.setState({ changeTimeZone: false })}
                    open={this.state.changeTimeZone}
                />
                <Dialog
                    open={this.state.avatarModal}
                    onClose={this.handleClose}
                >
                    <DialogTitle>{t("setting.avatar")}</DialogTitle>
                    <List>
                        <ListItem
                            button
                            component="label"
                            disabled={this.state.loading === "avatar"}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                ref={this.fileInput}
                                onChange={this.uploadAvatar}
                            />
                            <ListItemAvatar>
                                <Avatar className={classes.uploadFromFile}>
                                    <PhotoIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={t("setting.uploadImage")} />
                        </ListItem>
                        <ListItem
                            button
                            onClick={this.useGravatar}
                            disabled={this.state.loading === "gravatar"}
                        >
                            <ListItemAvatar>
                                <Avatar className={classes.userGravatar}>
                                    <FingerprintIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                className={classes.paddingText}
                                primary={t("setting.useGravatar")}
                            />
                        </ListItem>
                    </List>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            {t("cancel", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.nickModal} onClose={this.handleClose}>
                    <DialogTitle>{t("setting.changeNick")}</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            label={t("setting.nickname")}
                            className={classes.textField}
                            value={this.state.nick}
                            onChange={this.handleChange("nick")}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            onClick={this.changeNick}
                            color="primary"
                            disabled={
                                this.state.loading === "nick" ||
                                this.state.nick === ""
                            }
                        >
                            {t("ok", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.groupBackModal}
                    onClose={this.handleClose}
                >
                    <DialogTitle>
                        {t("vas.cancelSubscriptionTitle")}
                    </DialogTitle>
                    <DialogContent>
                        {t("vas.cancelSubscriptionWarning")}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button onClick={this.doChangeGroup} color="primary">
                            {t("ok", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.changePassword}
                    onClose={this.handleClose}
                >
                    <DialogTitle>{t("login.resetPassword")}</DialogTitle>
                    <DialogContent>
                        <div>
                            <TextField
                                id="standard-name"
                                label={t("setting.originalPassword")}
                                type="password"
                                className={classes.textField}
                                value={this.state.oldPwd}
                                onChange={this.handleChange("oldPwd")}
                                margin="normal"
                                autoFocus
                            />
                        </div>
                        <div>
                            <TextField
                                id="standard-name"
                                label={t("login.newPassword")}
                                type="password"
                                className={classes.textField}
                                value={this.state.newPwd}
                                onChange={this.handleChange("newPwd")}
                                margin="normal"
                            />
                        </div>
                        <div>
                            <TextField
                                id="standard-name"
                                label={t("login.repeatNewPassword")}
                                type="password"
                                className={classes.textField}
                                value={this.state.newPwdRepeat}
                                onChange={this.handleChange("newPwdRepeat")}
                                margin="normal"
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            onClick={this.changhePwd}
                            color="primary"
                            disabled={
                                this.state.loading === "changePassword" ||
                                this.state.oldPwd === "" ||
                                this.state.newPwdRepeat === "" ||
                                this.state.newPwd === ""
                            }
                        >
                            {t("ok", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.twoFactor} onClose={this.handleClose}>
                    <DialogTitle>
                        {this.state.settings.two_factor
                            ? t("setting.disable2FA")
                            : t("setting.enable2FA")}
                    </DialogTitle>
                    <DialogContent>
                        <div className={classes.flexContainerResponse}>
                            {!this.state.settings.two_factor && (
                                <div className={classes.qrcode}>
                                    <QRCodeSVG
                                        value={
                                            "otpauth://totp/" +
                                            this.props.title +
                                            "?secret=" +
                                            this.state.two_fa_secret
                                        }
                                    />
                                </div>
                            )}

                            <div className={classes.desText}>
                                {!this.state.settings.two_factor && (
                                    <Typography>
                                        {t("setting.2faDescription")}
                                    </Typography>
                                )}
                                {this.state.settings.two_factor && (
                                    <Typography>
                                        {t("setting.inputCurrent2FACode")}
                                    </Typography>
                                )}
                                <TextField
                                    id="standard-name"
                                    label={t("login.input2FACode")}
                                    type="number"
                                    className={classes.textField}
                                    value={this.state.authCode}
                                    onChange={this.handleChange("authCode")}
                                    margin="normal"
                                    autoFocus
                                    fullWidth
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            onClick={this.twoFactor}
                            color="primary"
                            disabled={
                                this.state.loading === "twoFactor" ||
                                this.state.authCode === ""
                            }
                        >
                            {this.state.settings.two_factor
                                ? t("setting.disable2FA")
                                : t("setting.enable2FA")}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.changeTheme}
                    onClose={this.handleClose}
                >
                    <DialogTitle>{t("setting.themeColor")}</DialogTitle>
                    <DialogContent>
                        <ToggleButtonGroup
                            value={this.state.chosenTheme}
                            exclusive
                            onChange={this.handleAlignment}
                        >
                            {Object.keys(this.state.settings.themes).map(
                                (value, key) => (
                                    <ToggleButton value={value} key={key}>
                                        <div
                                            className={classes.themeBlock}
                                            style={{ backgroundColor: value }}
                                        />
                                    </ToggleButton>
                                )
                            )}
                        </ToggleButtonGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("cancel", { ns: "common" })}
                        </Button>
                        <Button
                            onClick={this.changeTheme}
                            color="primary"
                            disabled={
                                this.state.loading === "changeTheme" ||
                                this.state.chosenTheme === null
                            }
                        >
                            {t("ok", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.showWebDavUrl}
                    onClose={this.handleClose}
                >
                    <DialogTitle>{t("setting.webdavServer")}</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            className={classes.textField}
                            value={window.location.origin + "/dav"}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("close", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.showWebDavUserName}
                    onClose={this.handleClose}
                >
                    <DialogTitle>{t("setting.userName")}</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            className={classes.textField}
                            value={user.user_name}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            {t("close", { ns: "common" })}
                        </Button>
                    </DialogActions>
                </Dialog>
                <OptionSelector />
            </div>
        );
    }
}

const UserSetting = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(withTranslation()(UserSettingCompoment))));

export default UserSetting;
