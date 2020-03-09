import React, {useCallback, useEffect, useState} from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import API from "../../../middleware/Api";
import {useDispatch} from "react-redux";
import {toggleSnackbar} from "../../../actions";
import TextField from "@material-ui/core/TextField";

export default function FileFilter({setFilter,setSearch,open, onClose }) {
    const [input,setInput] = useState({
        policy_id:"all",
        user_id:"",
    });
    const [policies,setPolicies] = useState([]);
    const [keywords,setKeywords] = useState("");

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleChange = name => event => {
        setInput({...input,[name]:event.target.value})
    }

    useEffect(()=>{
        API.post("/admin/policy/list", {
            page: 1,
            page_size: 10000,
            order_by: "id asc",
            conditions: {}
        })
            .then(response => {
                setPolicies(response.data.items);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    },[])

    const submit = e => {
        let res = {};
        Object.keys(input).forEach(v=>{
            if(input[v] !== "all" && input[v] !== ""){
                res[v] = input[v];
            }
        })
        setFilter(res);
        if (keywords !== ""){
            setSearch({
                name:keywords,
            });
        }else{
            setSearch({});
        }
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth={"xs"}
        >
            <DialogTitle id="alert-dialog-title">
                过滤条件
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">存储策略</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={input.policy_id}
                        onChange={handleChange("policy_id")}
                    >
                        <MenuItem value={"all"}>全部</MenuItem>
                        {policies.map(v => {
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
                </FormControl>
                <FormControl fullWidth style={{marginTop:16}}>
                    <TextField value={input.user_id} onChange={handleChange("user_id")} id="standard-basic" label="上传者ID" />
                </FormControl>
                <FormControl fullWidth style={{marginTop:16}}>
                    <TextField value={keywords} onChange={e=>setKeywords(e.target.value)} id="standard-basic" label="搜索 文件名" />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    取消
                </Button>
                <Button onClick={submit} color="primary">
                    应用
                </Button>
            </DialogActions>
        </Dialog>
    );
}
