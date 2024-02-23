import React, { useCallback, useState } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../redux/explorer";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
    formContainer: {
        margin: "8px 0 8px 0",
    },
}));

export default function AddRedeem({ open, onClose, products, onSuccess }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tCommon } = useTranslation("common");
    const { t: tApp } = useTranslation();
    const classes = useStyles();
    const [input, setInput] = useState({
        num: 1,
        id: 0,
        time: 1,
    });
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleChange = (name) => (event) => {
        setInput({
            ...input,
            [name]: event.target.value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        input.num = parseInt(input.num);
        input.id = parseInt(input.id);
        input.time = parseInt(input.time);
        input.type = 2;
        for (let i = 0; i < products.length; i++) {
            if (products[i].id === input.id) {
                if (products[i].group_id !== undefined) {
                    input.type = 1;
                } else {
                    input.type = 0;
                }
                break;
            }
        }

        API.post("/admin/redeem", input)
            .then((response) => {
                onSuccess(response.data);
                onClose();
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={"xs"}
        >
            <form onSubmit={submit}>
                <DialogTitle id="alert-dialog-title">
                    {t("generateGiftCode")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("numberOfCodes")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                        max: 100,
                                    }}
                                    value={input.num}
                                    onChange={handleChange("num")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("numberOfCodesDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("linkedProduct")}
                                </InputLabel>
                                <Select
                                    value={input.id}
                                    onChange={(e) => {
                                        handleChange("id")(e);
                                    }}
                                >
                                    {products.map((v) => (
                                        <MenuItem
                                            key={v.id}
                                            value={v.id}
                                            data-type={"1"}
                                        >
                                            {v.name}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value={0}>
                                        {tApp("vas.credits")}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("productQyt")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    value={input.time}
                                    onChange={handleChange("time")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("productQytDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={loading}
                        onClick={onClose}
                        color="default"
                    >
                        {tCommon("cancel")}
                    </Button>
                    <Button disabled={loading} type={"submit"} color="primary">
                        {tCommon("ok")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
