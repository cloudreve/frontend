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

export default function UserFilter({ setFilter, setSearch, open, onClose }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "user" });
    const { t: tCommon } = useTranslation("common");
    const [input, setInput] = useState({
        group_id: "all",
        status: "all",
    });
    const [groups, setGroups] = useState([]);
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
        API.get("/admin/groups")
            .then((response) => {
                setGroups(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const submit = () => {
        const res = {};
        Object.keys(input).forEach((v) => {
            if (input[v] !== "all") {
                res[v] = input[v];
            }
        });
        setFilter(res);
        if (keywords !== "") {
            setSearch({
                nick: keywords,
                email: keywords,
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
                {t("filterCondition")}
            </DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                        {t("group")}
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={input.group_id}
                        onChange={handleChange("group_id")}
                    >
                        <MenuItem value={"all"}>{t("all")}</MenuItem>
                        {groups.map((v) => {
                            if (v.ID === 3) {
                                return null;
                            }
                            return (
                                <MenuItem key={v.ID} value={v.ID.toString()}>
                                    {v.Name}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <InputLabel id="demo-simple-select-label">
                        {t("userStatus")}
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={input.status}
                        onChange={handleChange("status")}
                    >
                        <MenuItem value={"all"}>{t("all")}</MenuItem>
                        <MenuItem value={"0"}>{t("active")}</MenuItem>
                        <MenuItem value={"1"}>{t("notActivated")}</MenuItem>
                        <MenuItem value={"2"}>{t("banned")}</MenuItem>
                        <MenuItem value={"3"}>{t("bannedBySys")}</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        id="standard-basic"
                        label={t("searchNickUserName")}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    {tCommon("cancel")}
                </Button>
                <Button onClick={submit} color="primary">
                    {t("apply")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
