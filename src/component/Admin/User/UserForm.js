import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Chip from "@material-ui/core/Chip";
import SizeInput from "../Common/SizeInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Collapse from "@material-ui/core/Collapse";
import { useHistory } from "react-router";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100
        },
        marginBottom: 40
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px"
        }
    }
}));
export default function UserForm(props) {
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
                  Score: "0" // 转换类型
              }
    );
    const [groups, setGroups] = useState([]);

    const theme = useTheme();
    let history = useHistory();

    useEffect(() => {
        API.get("/admin/groups")
            .then(response => {
                setGroups(response.data);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const handleChange = name => event => {
        setUser({
            ...user,
            [name]: event.target.value
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const submit = e => {
        e.preventDefault();
        let userCopy = {...user};

        // 整型转换
        ["Status", "GroupID","Score"].forEach(v => {
            userCopy[v] = parseInt(userCopy[v]);
        });

        setLoading(true);
        API.post("/admin/user", {
            user: userCopy,
            password:userCopy.Password,
        })
            .then(response => {
                history.push("/admin/user");
                ToggleSnackbar("top", "right", "用户已"+ (props.user ? "保存" : "添加"), "success");
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {user.ID === 0 && "创建用户"}
                        {user.ID !== 0 && "编辑 " + user.Nick}
                    </Typography>

                    <div className={classes.formContainer}>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    邮箱
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
                                    昵称
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
                                    密码
                                </InputLabel>
                                <Input
                                    type={"password"}
                                    value={user.Password}
                                    onChange={handleChange("Password")}
                                    required={user.ID === 0}
                                />
                                <FormHelperText id="component-helper-text">
                                    {user.ID !== 0 && "留空表示不修改"}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    用户组
                                </InputLabel>
                                <Select
                                    value={user.GroupID}
                                    onChange={handleChange(
                                        "GroupID"
                                    )}
                                    required
                                >
                                    {groups.map(v => {
                                        if (v.ID === 3) {
                                            return null;
                                        }
                                        return (
                                            <MenuItem
                                                key={v.ID}
                                                value={v.ID.toString()}
                                            >
                                                {v.Name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    用户所属用户组
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    状态
                                </InputLabel>
                                <Select
                                    value={user.Status}
                                    onChange={handleChange(
                                        "Status"
                                    )}
                                    required
                                >
                                    <MenuItem value={"0"}>正常</MenuItem>
                                    <MenuItem value={"1"}>未激活</MenuItem>
                                    <MenuItem value={"2"}>被封禁</MenuItem>
                                    <MenuItem value={"3"}>超额使用被封禁</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    积分
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min:0,
                                        step:1,
                                    }}
                                    value={user.Score}
                                    onChange={handleChange("Score")}
                                    required
                                />
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
                        保存
                    </Button>
                </div>
            </form>
        </div>
    );
}
