import { useTranslation } from "react-i18next";
import React, { useState } from "react";
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

const useStyles = makeStyles(() => ({
    formContainer: {
        margin: "8px 0 8px 0",
    },
}));

export default function AddPack({ open, onClose, onSubmit }) {
    const classes = useStyles();
    const [pack, setPack] = useState({
        name: "",
        size: "1073741824",
        time: "",
        price: "",
        score: "",
    });
    const { t } = useTranslation();

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
        packCopy.id = new Date().valueOf();
        onSubmit(packCopy);
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
              <DialogTitle id="alert-dialog-title">{t('Add Capacity Pack')}</DialogTitle>
              <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                      <div className={classes.formContainer}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Name')}
                              </InputLabel>
                              <Input
                                  value={pack.name}
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
                              <SizeInput
                                  value={pack.size}
                                  onChange={handleChange("size")}
                                  min={1}
                                  label={t('Size')}
                                  max={9223372036854775807}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The size of the capacity package')}
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
                                  value={pack.time}
                                  onChange={handleChange("time")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The validity period of each capacity package')}
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
                                  value={pack.price}
                                  onChange={handleChange("price")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Unit price of capacity package')}
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
                                  value={pack.score}
                                  onChange={handleChange("score")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The price when using points to purchase, fill in as 0\nmeans that you cannot use points to buy')}
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
