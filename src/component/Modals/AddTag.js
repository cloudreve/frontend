import React, { useState, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress
} from "@material-ui/core";
import {
    toggleSnackbar,
    setModalsLoading,
    refreshFileList
} from "../../actions/index";
import PathSelector from "../FileManager/PathSelector";
import { useDispatch } from "react-redux";
import API from "../../middleware/Api";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import FormLabel from "@material-ui/core/FormLabel";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import {
    Circle,
    CircleOutline,
    Decagram, FolderHeartOutline,
    Heart,
    HeartOutline,
    Hexagon,
    HexagonOutline,
    Hexagram,
    HexagramOutline, Rhombus, RhombusOutline, Square, SquareOutline, Triangle, TriangleOutline
} from "mdi-material-ui";

const useStyles = makeStyles(theme => ({
    contentFix: {
        padding: "10px 24px 0px 24px"
    },
    wrapper: {
        margin: theme.spacing(1),
        position: "relative"
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12
    },
    content: {
        padding: 0,
        marginTop: 0
    },
    marginTop: {
        marginTop: theme.spacing(2),
        display: "block"
    },
    textField: {
        marginTop: theme.spacing(1)
    }
}));

const icons = {
    Circle: <Circle />,
    CircleOutline: <CircleOutline />,
    Heart: <Heart />,
    HeartOutline: <HeartOutline />,
    Hexagon: <Hexagon />,
    HexagonOutline: <HexagonOutline />,
    Hexagram: <Hexagram />,
    HexagramOutline: <HexagramOutline />,
    Rhombus: <Rhombus />,
    RhombusOutline: <RhombusOutline />,
    Square: <Square />,
    SquareOutline: <SquareOutline />,
    Triangle: <Triangle />,
};

export default function AddTag(props) {
    const [value, setValue] = React.useState(0);
    const [alignment, setAlignment] = React.useState('Circle');
    const [input, setInput] = React.useState({
        filename: ""
    });

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleIconChange = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    const handleInputChange = name => event => {
        setInput({
            ...input,
            [name]: event.target.value
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const classes = useStyles();

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <AppBar position="static">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="文件分类" />
                    <Tab label="目录快捷方式" />
                </Tabs>
            </AppBar>
            {value === 0 && (
                <DialogContent>
                    <FormLabel>匹配规则：</FormLabel>
                    <TextField
                        id="filled-name"
                        label="文件名匹配规则"
                        value={input["filename"]}
                        onChange={handleInputChange("filename")}
                        fullWidth
                        rows="4"
                        multiline
                        variant="filled"
                        className={classes.textField}
                    />
                    <Typography variant="caption" color={"textSecondary"}>
                        你可以使用<code>*</code>作为通配符。比如
                        <code>*.png</code>
                        表示匹配png格式图像。多行规则间会以“或”的关系进行运算。
                    </Typography>
                    <FormLabel className={classes.marginTop}>图标：</FormLabel>
                    <ToggleButtonGroup
                        size="small"
                        value={alignment}
                        exclusive
                        onChange={handleIconChange}
                        className={classes.textField}
                    >
                        {Object.keys(icons).map((key, index)=>(
                            <ToggleButton key={index} value={key}>
                                {icons[key]}
                            </ToggleButton>
                         ))}
                    </ToggleButtonGroup>
                </DialogContent>
            )}
            {value === 1 && <div>1</div>}
            <DialogActions>
                <Button onClick={props.onClose}>取消</Button>
                <div className={classes.wrapper}>
                    <Button color="primary" disabled={props.modalsLoading}>
                        确定
                        {props.modalsLoading && (
                            <CircularProgress
                                size={24}
                                className={classes.buttonProgress}
                            />
                        )}
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
}
