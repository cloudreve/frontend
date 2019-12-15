import React, { useCallback, useEffect, useState } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRouteMatch } from "react-router";
import API from "../../middleware/Api";
import { useDispatch } from "react-redux";
import { changeSubTitle, toggleSnackbar } from "../../actions";
import Editor from 'for-editor'
import SaveButton from "../Dial/Save";
const useStyles = makeStyles(theme => ({
    layout: {
        width: "auto",
        marginTop: "30px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        },
        marginBottom: 50
    },
    player: {
        borderRadius: "4px"
    },
    root:{
        backgroundColor:"white",
        borderRadius: "8px",
    },
}));

export default function TextViewer(props) {
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("");
    const math = useRouteMatch();
    let $vm = React.createRef();

    const dispatch = useDispatch();
    const SetSubTitle = useCallback(title => dispatch(changeSubTitle(title)), [
        dispatch
    ]);
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        let path = math.params[0].split("/");
        SetSubTitle(path[path.length - 1]);
    }, [math.params[0]]);

    useEffect(() => {
        API.get("/file/preview/" + math.params[0])
            .then(response => {
                setContent(response.rawData)
            })
            .catch(error => {
                ToggleSnackbar(
                    "top",
                    "right",
                    "无法读取文件内容，" + error.message,
                    "error"
                )
            });
    }, [math.params[0]]);

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const save = ()=>{
        setStatus("loading");
        API.put("/file/update/" + math.params[0],content)
            .then(response => {
                setStatus("success");
                setTimeout(()=>setStatus(""),2000);
            })
            .catch(error => {
                setStatus("");
                ToggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                )
            });
    };

    const addImg = async ($file) => {
        $vm.current.$img2Url($file.name, await toBase64($file));
        console.log($file)
    };

    const classes = useStyles();
    return (
        <div className={classes.layout}>
            <Paper className={classes.root} elevation={1}>
                <Editor
                    ref={$vm}
                    value={content}
                    onSave = {()=>save()}
                    addImg={($file) => addImg($file)}
                    onChange={value => setContent(value)}
                    toolbar = {{
                        h1: true, // h1
                        h2: true, // h2
                        h3: true, // h3
                        h4: true, // h4
                        img: true, // 图片
                        link: true, // 链接
                        code: true, // 代码块
                        preview: true, // 预览
                        expand: true, // 全屏
                        /* v0.0.9 */
                        undo: true, // 撤销
                        redo: true, // 重做
                        save: false, // 保存
                        /* v0.2.3 */
                        subfield: true, // 单双栏模式
                    }}
                />
            </Paper>
            <SaveButton onClick={save} status={status}/>
        </div>
    );
}
