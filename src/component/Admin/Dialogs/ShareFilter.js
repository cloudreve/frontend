import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import React, { useState } from "react";

export default function ShareFilter({ setFilter, setSearch, open, onClose }) {
    const [input, setInput] = useState({
        is_dir: "all",
        user_id: "",
    });
    const [keywords, setKeywords] = useState("");
    const { t } = useTranslation();

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
          <DialogTitle id="alert-dialog-title">{t('Filter Conditions')}</DialogTitle>
          <DialogContent>
              <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    {t('Source File Type')}
                  </InputLabel>
                  <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={input.is_dir}
                      onChange={handleChange("is_dir")}
                  >
                      <MenuItem value={"all"}>{t('all')}</MenuItem>
                      <MenuItem value={"1"}>{t('contents')}</MenuItem>
                      <MenuItem value={"0"}>{t('document')}</MenuItem>
                  </Select>
              </FormControl>
              <FormControl fullWidth style={{ marginTop: 16 }}>
                  <TextField
                      value={input.user_id}
                      onChange={handleChange("user_id")}
                      id="standard-basic"
                      label={t('Uploader ID')}
                  />
              </FormControl>
              <FormControl fullWidth style={{ marginTop: 16 }}>
                  <TextField
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      id="standard-basic"
                      label={t('Search file name')}
                  />
              </FormControl>
          </DialogContent>
          <DialogActions>
              <Button onClick={onClose} color="default">
                {t('Cancel')}
              </Button>
              <Button onClick={submit} color="primary">
                {t('application')}
              </Button>
          </DialogActions>
      </Dialog>
    );
}
