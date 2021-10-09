import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import API from "../../../middleware/Api";
import SizeInput from "../Common/SizeInput";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
}));

export default function ImageSetting() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        gravatar_server: "",
        avatar_path: "",
        avatar_size: "",
        avatar_size_l: "",
        avatar_size_m: "",
        avatar_size_s: "",
        thumb_width: "",
        thumb_height: "",
    });

    const { t } = useTranslation();

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/setting", {
            keys: Object.keys(options),
        })
            .then((response) => {
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        const option = [];
        Object.keys(options).forEach((k) => {
            option.push({
                key: k,
                value: options[k],
            });
        });
        API.patch("/admin/setting", {
            options: option,
        })
            .then(() => {
                ToggleSnackbar("top", "right", t('Settings have been changed'), "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    return (
      <div>
          <form onSubmit={submit}>
              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Avatar')}
                  </Typography>
                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Gravatar Server')}
                              </InputLabel>
                              <Input
                                  type={"url"}
                                  value={options.gravatar_server}
                                  onChange={handleChange("gravatar_server")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Gravatar server address, you can choose to use domestic mirror')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <InputLabel htmlFor="component-helper">
                                {t('Portrait storage path')}
                              </InputLabel>
                              <Input
                                  value={options.avatar_path}
                                  onChange={handleChange("avatar_path")}
                                  required
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The storage path of the user uploaded custom avatar')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <SizeInput
                                  value={options.avatar_size}
                                  onChange={handleChange("avatar_size")}
                                  required
                                  min={0}
                                  max={2147483647}
                                  label={t('Picture file size limit')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('The maximum size of the avatar file that the user can upload')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Small avatar size')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.avatar_size_s}
                                  onChange={handleChange("avatar_size_s")}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Medium avatar size')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.avatar_size_m}
                                  onChange={handleChange("avatar_size_m")}
                                  required
                              />
                          </FormControl>
                      </div>

                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('Large Avatar Size')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.avatar_size_l}
                                  onChange={handleChange("avatar_size_l")}
                                  required
                              />
                          </FormControl>
                      </div>
                  </div>
              </div>

              <div className={classes.root}>
                  <Typography variant="h6" gutterBottom>
                    {t('Thumbnail')}
                  </Typography>

                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('width')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.thumb_width}
                                  onChange={handleChange("thumb_width")}
                                  required
                              />
                          </FormControl>
                      </div>
                  </div>

                  <div className={classes.formContainer}>
                      <div className={classes.form}>
                          <FormControl>
                              <InputLabel htmlFor="component-helper">
                                {t('high')}
                              </InputLabel>
                              <Input
                                  type={"number"}
                                  inputProps={{
                                      min: 1,
                                      step: 1,
                                  }}
                                  value={options.thumb_height}
                                  onChange={handleChange("thumb_height")}
                                  required
                              />
                          </FormControl>
                      </div>
                  </div>
              </div>

              <div className={classes.root}>
                  <Button
                      disabled={loading}
                      type={"submit"}
                      variant={"contained"}
                      color={"primary"}
                  >
                    {t('save')}
                  </Button>
              </div>
          </form>
      </div>
    );
}
