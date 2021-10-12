import { withTranslation } from "react-i18next";
import React, { Component } from "react";
import { connect } from "react-redux";
import KeyIcon from "@material-ui/icons/VpnKeyOutlined";
import { toggleSnackbar } from "../../actions/index";
import axios from "axios";

import {
    withStyles,
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

const styles = (theme) => ({
    layout: {
        width: "auto",
        marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 400,
            marginLeft: "auto",
            marginRight: "auto",
        },
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
    form: {
        width: "100%", // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        marginTop: theme.spacing(3),
    },
    link: {
        marginTop: "10px",
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
    },
    captchaContainer: {
        display: "flex",
        marginTop: "10px",
        [theme.breakpoints.down("sm")]: {
            display: "block",
        },
    },
});
const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
    };
};

class ResetPwdFormCompoment extends Component {
    state = {
        pwd: "",
        pwdRepeat: "",
        loading: false,
    };

    login = (e) => {
        e.preventDefault();
        if (this.state.pwdRepeat !== this.state.pwd) {
            this.props.toggleSnackbar(
                "top",
                "right",
                this.props.t('The two password entries are inconsistent'),
                "warning"
            );
            return;
        }
        this.setState({
            loading: true,
        });
        axios
            .post("/Member/Reset", {
                pwd: this.state.pwd,
                key: window.resetKey,
            })
            .then((response) => {
                if (response.data.code !== "200") {
                    this.setState({
                        loading: false,
                    });
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.message,
                        "warning"
                    );
                } else {
                    this.setState({
                        loading: false,
                        pwd: "",
                        pwdRepeat: "",
                    });
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        this.props.t('Password reset successfully'),
                        "success"
                    );
                }
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                });
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    };

    render() {
        const { classes } = this.props;

        return (
          <div className={classes.layout}>
              <Paper className={classes.paper}>
                  <Avatar className={classes.avatar}>
                      <KeyIcon />
                  </Avatar>
                  <Typography component="h1" variant="h5">
                    {this.props.t('Retrieve Password')}
                  </Typography>
                  <form className={classes.form} onSubmit={this.login}>
                      <FormControl margin="normal" required fullWidth>
                          <InputLabel htmlFor="email">{this.props.t('New password')}</InputLabel>
                          <Input
                              id="pwd"
                              type="password"
                              name="pwd"
                              onChange={this.handleChange("pwd")}
                              autoComplete
                              value={this.state.pwd}
                              autoFocus
                          />
                      </FormControl>
                      <FormControl margin="normal" required fullWidth>
                          <InputLabel htmlFor="email">{this.props.t('Repeat new password')}</InputLabel>
                          <Input
                              id="pwdRepeat"
                              type="password"
                              name="pwdRepeat"
                              onChange={this.handleChange("pwdRepeat")}
                              autoComplete
                              value={this.state.pwdRepeat}
                              autoFocus
                          />
                      </FormControl>
                      <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          disabled={this.state.loading}
                          className={classes.submit}
                      >
                        {this.props.t('reset Password')}
                      </Button>{" "}
                  </form>{" "}
                  <Divider />
                  <div className={classes.link}>
                      <div>
                          <Link href={"/Login"}>{this.props.t('Return to login')}</Link>
                      </div>
                      <div>
                          <Link href={"/SignUp"}>{this.props.t('Create an account')}</Link>
                      </div>
                  </div>
              </Paper>
          </div>
        );
    }
}

const ResetPwdForm = connect(
    mapStateToProps,
    mapDispatchToProps
)(withTranslation()(withStyles(styles)(ResetPwdFormCompoment)));

export default ResetPwdForm;
