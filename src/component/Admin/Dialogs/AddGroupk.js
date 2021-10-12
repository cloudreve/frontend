import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import React, { useEffect, useState } from "react";
import API from "../../../middleware/Api";

const useStyles = makeStyles(() => ({
    formContainer: {
        margin: "8px 0 8px 0",
    },
}));

export default function AddGroup({ open, onClose, onSubmit }) {
    const classes = useStyles();
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState({
        name: "",
        group_id: 2,
        time: "",
        price: "",
        score: "",
        des: "",
        highlight: false,
    });
    const { t } = useTranslation();

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
        groupCopy.id = new Date().valueOf();
        groupCopy.des = groupCopy.des.split("\n");
        onSubmit(groupCopy);
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
                {t('Add Purchasable User Group')}
              </DialogTitle>
              <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Name')}
                              </InputLabel>
                              <Input
                                  value={group.name}
                                  onChange={handleChange("name")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Product display name')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('User group')}
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
                                {t('User group upgraded after purchase')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Validity period (days)')}
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
                                {t('Valid period of unit purchase time')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Unit price (yuan)')}
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
                                {t('Unit price of user group')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Unit price (points)')}
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
                                {t('The price when using points to purchase, fill in as 0\nmeans that you cannot use points to buy')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Product description (one per line)')}
                              </InputLabel>
                              <Input
                                  value={group.des}
                                  onChange={handleChange("des")}
                                  multiline
                                  rowsMax={10}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Product description displayed on the purchase page')}
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
                                  label={t('Highlights')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('When enabled, it will be highlighted on the product selection page')}
                              </FormHelperText>
                          </FormControl>
                      </div>
                  </DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button onClick={onClose} color="default">
                    {t('Cancel')}
                  </Button>
                  <Button type={"submit"} color="primary">
                    {t('Ok')}
                  </Button>
              </DialogActions>
          </form>
      </Dialog>
    );
}
