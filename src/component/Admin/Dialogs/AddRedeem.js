import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";

const useStyles = makeStyles(() => ({
    formContainer: {
        margin: "8px 0 8px 0",
    },
}));

export default function AddRedeem({ open, onClose, products, onSuccess }) {
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

    const { t } = useTranslation();

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
              <DialogTitle id="alert-dialog-title">{t('Generate redemption code')}</DialogTitle>
              <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Generate quantity')}
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
                                {t('The number of activation codes generated in batches')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Corresponding product')}
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
                                  <MenuItem value={0}>{t('integral')}</MenuItem>
                              </Select>
                          </FormControl>
                      </div>

                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('amount of goods')}
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
                                {t('For point products, here is the number of points, and other products are multiples of duration')}
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
                    {t('Cancel')}
                  </Button>
                  <Button disabled={loading} type={"submit"} color="primary">
                    {t('Ok')}
                  </Button>
              </DialogActions>
          </form>
      </Dialog>
    );
}
