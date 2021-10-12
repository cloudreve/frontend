import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import { connect } from "react-redux";
import PhotoIcon from "@material-ui/icons/InsertPhoto";
import GroupIcon from "@material-ui/icons/Group";
import DateIcon from "@material-ui/icons/DateRange";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import LinkIcon from "@material-ui/icons/Phonelink";
import InputIcon from "@material-ui/icons/Input";
import SecurityIcon from "@material-ui/icons/Security";
import NickIcon from "@material-ui/icons/PermContactCalendar";
import LockIcon from "@material-ui/icons/Lock";
import VerifyIcon from "@material-ui/icons/VpnKey";
import ColorIcon from "@material-ui/icons/Palette";
import {
    applyThemes,
    changeViewMethod,
    toggleDaylightMode,
    toggleSnackbar,
} from "../../actions";
import axios from "axios";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import {
    ListItemIcon,
    withStyles,
    Button,
    Divider,
    TextField,
    Avatar,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    ListItemAvatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Switch,
} from "@material-ui/core";
import { blue, green, yellow } from "@material-ui/core/colors";
import API from "../../middleware/Api";
import Auth from "../../middleware/Auth";
import { withRouter } from "react-router";
import QRCode from "qrcode-react";
import { Brightness3, ListAlt, PermContactCalendar,Schedule } from "@material-ui/icons";
import { transformTime } from "../../utils";
import Authn from "./Authn";
import { formatLocalTime, timeZone } from "../../utils/datetime";
import TimeZoneDialog from "../Modals/TimeZone";

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
    },
    infoTextWithIcon: {
        marginRight: "17px",
        marginTop: "1px",
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
        changePolicy: false,
        changeTimeZone: false,
        settings: {
            uid: 0,
            group_expires: 0,
            policy: {
                current: {
                    name: "-",
                    id: "",
                },
                options: [],
            },
            qq: "",
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
            changePolicy: false,
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

    useGravatar = () => {
        this.setState({
            loading: "gravatar",
        });
        API.put("/user/setting/avatar")
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    this.props.t('The avatar has been updated and will take effect after refreshing'),
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
                    this.props.t('The nickname has been changed and will take effect after refreshing'),
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
                    this.props.t('The avatar has been updated and will take effect after refreshing'),
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
                    this.props.t('Settings have been saved'),
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
                this.props.t('The two password entries are inconsistent'),
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
                    this.props.t('Password has been updated'),
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
                    this.props.t('The theme color has been changed'),
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
                    this.props.t('Settings saved'),
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
        if (current !== null) {
            this.props.toggleDaylightMode();
            Auth.SetPreference("theme_mode", null);
        }
    };

    render() {
        const { classes } = this.props;
        const user = Auth.GetUser();
        const dark = Auth.GetPreference("theme_mode");

        return (
          <div>
              <div className={classes.layout}>
                  <Typography
                      className={classes.sectionTitle}
                      variant="subtitle2"
                  >
                    {this.props.t('personal information')}
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
                              <ListItemText primary={this.props.t('Avatar')} />
                              <ListItemSecondaryAction>
                                  <RightIcon className={classes.rightIcon} />
                              </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                          <ListItem button>
                              <ListItemIcon className={classes.iconFix}>
                                  <PermContactCalendar />
                              </ListItemIcon>
                              <ListItemText primary="UID" />

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
                              <ListItemText primary={this.props.t('Nickname')} />

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
                              <ListItemText primary="Email" />

                              <ListItemSecondaryAction>
                                  <Typography
                                      className={classes.infoText}
                                      color="textSecondary"
                                  >
                                      {user.user_name}
                                  </Typography>
                              </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                          <ListItem button>
                              <ListItemIcon className={classes.iconFix}>
                                  <GroupIcon />
                              </ListItemIcon>
                              <ListItemText primary={this.props.t('User group')} />

                              <ListItemSecondaryAction>
                                  <Typography
                                      className={classes.infoText}
                                      color="textSecondary"
                                  >
                                      {user.group.name}
                                  </Typography>
                              </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                          <ListItem button>
                              <ListItemIcon className={classes.iconFix}>
                                  <DateIcon />
                              </ListItemIcon>
                              <ListItemText primary={this.props.t('Registration time')} />

                              <ListItemSecondaryAction>
                                  <Typography
                                      className={classes.infoText}
                                      color="textSecondary"
                                  >
                                      {formatLocalTime(
                                          user.created_at,
                                          "YYYY-MM-DD H:mm:ss"
                                      )}
                                  </Typography>
                              </ListItemSecondaryAction>
                          </ListItem>
                      </List>
                  </Paper>
                  <Typography
                      className={classes.sectionTitle}
                      variant="subtitle2"
                  >
                    {this.props.t('Security and Privacy')}
                  </Typography>
                  <Paper>
                      <List className={classes.desenList}>
                          <ListItem button>
                              <ListItemIcon className={classes.iconFix}>
                                  <HomeIcon />
                              </ListItemIcon>
                              <ListItemText primary={this.props.t('Homepage')} />

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
                              <ListItemText primary={this.props.t('Login Password')} />

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
                              <ListItemText primary={this.props.t('Two-step verification')} />

                              <ListItemSecondaryAction
                                  className={classes.flexContainer}
                              >
                                  <Typography
                                      className={classes.infoTextWithIcon}
                                      color="textSecondary"
                                  >
                                      {!this.state.settings.two_factor
                                          ? this.props.t('Not configured')
                                          : this.props.t('activated')}
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
                    {this.props.t('Personalise')}
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
                              <ListItemText primary={this.props.t('Theme Colors')} />

                              <ListItemSecondaryAction
                                  className={classes.flexContainer}
                              >
                                  <div className={classes.firstColor}></div>
                                  <div className={classes.secondColor}></div>
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
                              <ListItemText primary={this.props.t('Dark Mode')} />

                              <ListItemSecondaryAction
                                  className={classes.flexContainer}
                              >
                                  <Typography
                                      className={classes.infoTextWithIcon}
                                      color="textSecondary"
                                  >
                                      {dark &&
                                          (dark === "dark"
                                              ? this.props.t('Preferences on')
                                              : this.props.t('Preferences off'))}
                                      {dark === null && this.props.t('Follow the system')}
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
                              <ListItemText primary={this.props.t('Document tiles')} />

                              <ListItemSecondaryAction
                                  className={classes.flexContainer}
                              >
                                  <Typography
                                      className={classes.infoTextWithIcon}
                                      color="textSecondary"
                                  >
                                      {this.props.viewMethod === "icon" &&
                                          this.props.t('Large Icon')}
                                      {this.props.viewMethod === "list" &&
                                          this.props.t('List')}
                                      {this.props.viewMethod ===
                                          "smallIcon" && this.props.t('Small Icon')}
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
                              <ListItemText primary={this.props.t('Time zone')} />

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
                                      <ListItemText primary={this.props.t('Connect Address')} />

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
                                      <ListItemText primary={this.props.t('Username')} />

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
                                          this.props.history.push("/webdav?")
                                      }
                                  >
                                      <ListItemIcon
                                          className={classes.iconFix}
                                      >
                                          <SecurityIcon />
                                      </ListItemIcon>
                                      <ListItemText primary={this.props.t('Account Management')} />

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
                  <div className={classes.paddingBottom}></div>
              </div>
              <TimeZoneDialog
                  onClose={() => this.setState({ changeTimeZone: false })}
                  open={this.state.changeTimeZone}
              />
              <Dialog
                  open={this.state.avatarModal}
                  onClose={this.handleClose}
              >
                  <DialogTitle>{this.props.t('Modify avatar')}</DialogTitle>
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
                          <ListItemText primary={this.props.t('Upload from file')} />
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
                              primary={this.props.t('Use Gravatar Avatar ')}
                          />
                      </ListItem>
                  </List>
                  <DialogActions>
                      <Button onClick={this.handleClose} color="primary">
                        {this.props.t('Cancel')}
                      </Button>
                  </DialogActions>
              </Dialog>
              <Dialog open={this.state.nickModal} onClose={this.handleClose}>
                  <DialogTitle>{this.props.t('Change username')}</DialogTitle>
                  <DialogContent>
                      <TextField
                          id="standard-name"
                          label={this.props.t('Nickname')}
                          className={classes.textField}
                          value={this.state.nick}
                          onChange={this.handleChange("nick")}
                          margin="normal"
                          autoFocus
                      />
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={this.handleClose} color="default">
                        {this.props.t('Cancel')}
                      </Button>
                      <Button
                          onClick={this.changeNick}
                          color="primary"
                          disabled={
                              this.state.loading === "nick" ||
                              this.state.nick === ""
                          }
                      >
                        {this.props.t('save')}
                      </Button>
                  </DialogActions>
              </Dialog>
              <Dialog
                  open={this.state.changePassword}
                  onClose={this.handleClose}
              >
                  <DialogTitle>{this.props.t('Change password')}</DialogTitle>
                  <DialogContent>
                      <div>
                          <TextField
                              id="standard-name"
                              label={this.props.t('Old password')}
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
                              label={this.props.t('New password')}
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
                              label={this.props.t('Confirm password')}
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
                        {this.props.t('Cancel')}
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
                        {this.props.t('save')}
                      </Button>
                  </DialogActions>
              </Dialog>
              <Dialog open={this.state.twoFactor} onClose={this.handleClose}>
                  <DialogTitle>
                    {this.state.settings.two_factor ? this.props.t('Close') : this.props.t('Enable')}
                    { }
                    {this.props.t('Two-step verification')}
                  </DialogTitle>
                  <DialogContent>
                      <div className={classes.flexContainerResponse}>
                          {!this.state.settings.two_factor && (
                              <div className={classes.qrcode}>
                                  <QRCode
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
                                  (<Typography>
                                    {this.props.t('Please use any two-step verification APP or password management software that supports two-step verification to scan the QR code on the left to add this site. After scanning, please fill in the 6-digit verification code given by the two-step verification APP to enable the two-step verification. ')}
                                  </Typography>)
                              )}
                              {this.state.settings.two_factor && (
                                  (<Typography>
                                    {this.props.t('Please verify the current two-step verification code.')}
                                  </Typography>)
                              )}
                              <TextField
                                  id="standard-name"
                                  label={this.props.t('6-digit verification code')}
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
                        {this.props.t('Cancel')}
                      </Button>
                      <Button
                          onClick={this.twoFactor}
                          color="primary"
                          disabled={
                              this.state.loading === "twoFactor" ||
                              this.state.authCode === ""
                          }
                      >
                        {this.state.settings.two_factor ? this.props.t('Close') : this.props.t('Enable')}
                        {this.props.t('Two-step verification')}
                      </Button>
                  </DialogActions>
              </Dialog>
              <Dialog
                  open={this.state.changeTheme}
                  onClose={this.handleClose}
              >
                  <DialogTitle>{this.props.t('Change theme color')}</DialogTitle>
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
                        {this.props.t('Cancel')}
                      </Button>
                      <Button
                          onClick={this.changeTheme}
                          color="primary"
                          disabled={
                              this.state.loading === "changeTheme" ||
                              this.state.chosenTheme === null
                          }
                      >
                        {this.props.t('save')}
                      </Button>
                  </DialogActions>
              </Dialog>
              <Dialog
                  open={this.state.showWebDavUrl}
                  onClose={this.handleClose}
              >
                  <DialogTitle>{this.props.t('WebDAV connection address')}</DialogTitle>
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
                        {this.props.t('Close')}
                      </Button>
                  </DialogActions>
              </Dialog>
              <Dialog
                  open={this.state.showWebDavUserName}
                  onClose={this.handleClose}
              >
                  <DialogTitle>{this.props.t('WebDAV username')}</DialogTitle>
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
                        {this.props.t('Close')}
                      </Button>
                  </DialogActions>
              </Dialog>
          </div>
        );
    }
}

const UserSetting = connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(withStyles(styles)(withRouter(UserSettingCompoment))));

export default UserSetting;
