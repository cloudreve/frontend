import React, { useEffect, useState } from "react";
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
import SizeInput from "../Common/SizeInput";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
    formContainer: {
        margin: "8px 0 8px 0",
    },
}));

const packEditToForm = (target) => {
    return {
        ...target,
        size: target.size.toString(),
        time: (target.time / 86400).toString(),
        price: (target.price / 100).toString(),
        score: target.score.toString(),
    };
};

const defaultPack = {
    name: "",
    size: "1073741824",
    time: "",
    price: "",
    score: "",
};

export default function AddPack({ open, onClose, onSubmit, packEdit }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tCommon } = useTranslation("common");
    const classes = useStyles();
    const [pack, setPack] = useState(defaultPack);

    useEffect(() => {
        if (packEdit) {
            setPack(packEditToForm(packEdit));
        } else {
            setPack(defaultPack);
        }
    }, [packEdit]);

    const handleChange = (name) => (event) => {
        setPack({
            ...pack,
            [name]: event.target.value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const packCopy = { ...pack };
        packCopy.size = parseInt(packCopy.size);
        packCopy.time = parseInt(packCopy.time) * 86400;
        packCopy.price = parseInt(packCopy.price) * 100;
        packCopy.score = parseInt(packCopy.score);
        packCopy.id = packEdit ? packEdit.id : new Date().valueOf();
        onSubmit(packCopy, packEdit !== null);
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
                    {packEdit ? t("editStoragePack") : t("addStoragePack")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("name")}
                                </InputLabel>
                                <Input
                                    value={pack.name}
                                    onChange={handleChange("name")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("productNameDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <SizeInput
                                    value={pack.size}
                                    onChange={handleChange("size")}
                                    min={1}
                                    label={t("size")}
                                    max={9223372036854775807}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("packSizeDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("durationDay")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 1,
                                        step: 1,
                                    }}
                                    value={pack.time}
                                    onChange={handleChange("time")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("durationDayDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("priceYuan")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 0.01,
                                        step: 0.01,
                                    }}
                                    value={pack.price}
                                    onChange={handleChange("price")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("packPriceDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("priceCredits")}
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 0,
                                        step: 1,
                                    }}
                                    value={pack.score}
                                    onChange={handleChange("score")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("priceCreditsDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="default">
                        {tCommon("cancel")}
                    </Button>
                    <Button type={"submit"} color="primary">
                        {tCommon("ok")}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
