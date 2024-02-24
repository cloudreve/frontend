import React, { useState } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import { useTranslation } from "react-i18next";

export default function ShareFilter({ setFilter, setSearch, open, onClose }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "share" });
    const { t: tDashboard } = useTranslation("dashboard");
    const { t: tCommon } = useTranslation("common");
    const [input, setInput] = useState({
        is_dir: "all",
        user_id: "",
    });
    const [keywords, setKeywords] = useState("");

    const handleChange = (name) => (event) => {
        setInput({ ...input, [name]: event.target.value });
    };

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
                source_name: keywords,
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
                        {t("srcType")}
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={input.is_dir}
                        onChange={handleChange("is_dir")}
                    >
                        <MenuItem value={"all"}>
                            {tDashboard("user.all")}
                        </MenuItem>
                        <MenuItem value={"1"}>{t("folder")}</MenuItem>
                        <MenuItem value={"0"}>{t("file")}</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={input.user_id}
                        onChange={handleChange("user_id")}
                        id="standard-basic"
                        label={tDashboard("file.uploaderID")}
                    />
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        id="standard-basic"
                        label={tDashboard("file.searchFileName")}
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    {tCommon("cancel")}
                </Button>
                <Button onClick={submit} color="primary">
                    {tCommon("ok")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
