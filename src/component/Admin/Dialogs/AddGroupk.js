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
import { makeStyles } from "@material-ui/core/styles";
import API from "../../../middleware/Api";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(() => ({
    formContainer: {
        margin: "8px 0 8px 0",
    },
}));

const defaultGroup = {
    name: "",
    group_id: 2,
    time: "",
    price: "",
    score: "",
    des: "",
    highlight: false,
};

const groupEditToForm = (target) => {
    return {
        ...target,
        time: (target.time / 86400).toString(),
        price: (target.price / 100).toString(),
        score: target.score.toString(),
        des: target.des.join("\n"),
    };
};

export default function AddGroup({ open, onClose, onSubmit, groupEdit }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tCommon } = useTranslation("common");
    const classes = useStyles();
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState(defaultGroup);

    useEffect(() => {
        if (groupEdit) {
            setGroup(groupEditToForm(groupEdit));
        } else {
            setGroup(defaultGroup);
        }
    }, [groupEdit]);

    useEffect(() => {
        if (open && groups.length === 0) {
            API.get("/admin/groups")
                .then((response) => {
                    setGroups(response.data);
                })
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                .catch(() => {});
        }
        // eslint-disable-next-line
    }, [open]);

    const handleChange = (name) => (event) => {
        setGroup({
            ...group,
            [name]: event.target.value,
        });
    };

    const handleCheckChange = (name) => (event) => {
        setGroup({
            ...group,
            [name]: event.target.checked,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const groupCopy = { ...group };
        groupCopy.time = parseInt(groupCopy.time) * 86400;
        groupCopy.price = parseInt(groupCopy.price) * 100;
        groupCopy.score = parseInt(groupCopy.score);
        groupCopy.id = groupEdit ? groupEdit.id : new Date().valueOf();
        groupCopy.des = groupCopy.des.split("\n");
        onSubmit(groupCopy, groupEdit !== null);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={"xs"}
            scroll={"paper"}
        >
            <form onSubmit={submit}>
                <DialogTitle id="alert-dialog-title">
                    {groupEdit ? t("editMembership") : t("addMembership")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("name")}
                                </InputLabel>
                                <Input
                                    value={group.name}
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
                                <InputLabel htmlFor="component-helper">
                                    {t("group")}
                                </InputLabel>
                                <Select
                                    value={group.group_id}
                                    onChange={handleChange("group_id")}
                                    required
                                >
                                    {groups.map((v) => {
                                        if (v.ID !== 3) {
                                            return (
                                                <MenuItem value={v.ID}>
                                                    {v.Name}
                                                </MenuItem>
                                            );
                                        }
                                        return null;
                                    })}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    {t("groupDes")}
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
                                    value={group.time}
                                    onChange={handleChange("time")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("durationGroupDes")}
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
                                    value={group.price}
                                    onChange={handleChange("price")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("groupPriceDes")}
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
                                    value={group.score}
                                    onChange={handleChange("score")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("priceCreditsDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    {t("productDescription")}
                                </InputLabel>
                                <Input
                                    value={group.des}
                                    onChange={handleChange("des")}
                                    multiline
                                    rowsMax={10}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("productDescriptionDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.formContainer}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={group.highlight}
                                            onChange={handleCheckChange(
                                                "highlight"
                                            )}
                                        />
                                    }
                                    label={t("highlight")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("highlightDes")}
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
