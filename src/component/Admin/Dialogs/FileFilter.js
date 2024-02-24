import React, { useCallback, useEffect, useState } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import TextField from "@material-ui/core/TextField";
import { toggleSnackbar } from "../../../redux/explorer";
import { useTranslation } from "react-i18next";

export default function FileFilter({ setFilter, setSearch, open, onClose }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "file" });
    const { t: tDashboard } = useTranslation("dashboard");
    const { t: tCommon } = useTranslation("common");
    const [input, setInput] = useState({
        policy_id: "all",
        user_id: "",
    });
    const [policies, setPolicies] = useState([]);
    const [keywords, setKeywords] = useState("");

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleChange = (name) => (event) => {
        setInput({ ...input, [name]: event.target.value });
    };

    useEffect(() => {
        API.post("/admin/policy/list", {
            page: 1,
            page_size: 10000,
            order_by: "id asc",
            conditions: {},
        })
            .then((response) => {
                setPolicies(response.data.items);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const submit = () => {
        const res = {};
        Object.keys(input).forEach((v) => {
            if (input[v] !== "all" && input[v] !== "") {
                res[v] = input[v];
            }
        });
        setFilter(res);
        if (keywords !== "") {
            setSearch({
                name: keywords,
            });
        } else {
            setSearch({});
        }
        onClose();
    };

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
                {tDashboard("user.filterCondition")}
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                        {t("storagePolicy")}
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={input.policy_id}
                        onChange={handleChange("policy_id")}
                    >
                        <MenuItem value={"all"}>
                            {tDashboard("user.all")}
                        </MenuItem>
                        {policies.map((v) => {
                            return (
                                <MenuItem key={v.ID} value={v.ID.toString()}>
                                    {v.Name}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={input.user_id}
                        onChange={handleChange("user_id")}
                        id="standard-basic"
                        label={t("uploaderID")}
                    />
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        id="standard-basic"
                        label={t("searchFileName")}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    {tCommon("cancel")}
                </Button>
                <Button onClick={submit} color="primary">
                    {tDashboard("user.apply")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
