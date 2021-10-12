import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
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

// function getStyles(name, personName, theme) {
//     return {
//         fontWeight:
//             personName.indexOf(name) === -1
//                 ? theme.typography.fontWeightRegular
//                 : theme.typography.fontWeightMedium
//     };
// }

export default function GroupForm(props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [group, setGroup] = useState(
        props.group
            ? props.group
            : {
                  ID: 0,
                  Name: "",
                  MaxStorage: "1073741824", // 转换类型
                  ShareEnabled: "true", // 转换类型
                  WebDAVEnabled: "true", // 转换类型
                  SpeedLimit: "0", // 转换类型
                  PolicyList: 1, // 转换类型,至少选择一个
                  OptionsSerialized: {
                      // 批量转换类型
                      share_download: "true",
                      aria2_options: "{}", // json decode
                      compress_size: "0",
                      decompress_size: "0",
                  },
              }
    );
    const [policies, setPolicies] = useState({});

    const history = useHistory();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/policy/list", {
            page: 1,
            page_size: 10000,
            order_by: "id asc",
            conditions: {},
        })
            .then((response) => {
                const res = {};
                response.data.items.forEach((v) => {
                    res[v.ID] = v.Name;
                });
                setPolicies(res);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const { t } = useTranslation();

    const handleChange = (name) => (event) => {
        setGroup({
            ...group,
            [name]: event.target.value,
        });
    };

    const handleCheckChange = (name) => (event) => {
        const value = event.target.checked ? "true" : "false";
        setGroup({
            ...group,
            [name]: value,
        });
    };

    const handleOptionCheckChange = (name) => (event) => {
        const value = event.target.checked ? "true" : "false";
        setGroup({
            ...group,
            OptionsSerialized: {
                ...group.OptionsSerialized,
                [name]: value,
            },
        });
    };

    const handleOptionChange = (name) => (event) => {
        setGroup({
            ...group,
            OptionsSerialized: {
                ...group.OptionsSerialized,
                [name]: event.target.value,
            },
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const groupCopy = {
            ...group,
            OptionsSerialized: { ...group.OptionsSerialized },
        };

        // 布尔值转换
        ["ShareEnabled", "WebDAVEnabled"].forEach((v) => {
            groupCopy[v] = groupCopy[v] === "true";
        });
        [
            "archive_download",
            "archive_task",
            "one_time_download",
            "share_download",
            "aria2",
        ].forEach((v) => {
            if (groupCopy.OptionsSerialized[v] !== undefined) {
                groupCopy.OptionsSerialized[v] =
                    groupCopy.OptionsSerialized[v] === "true";
            }
        });

        // 整型转换
        ["MaxStorage", "SpeedLimit"].forEach((v) => {
            groupCopy[v] = parseInt(groupCopy[v]);
        });
        ["compress_size", "decompress_size"].forEach((v) => {
            if (groupCopy.OptionsSerialized[v] !== undefined) {
                groupCopy.OptionsSerialized[v] = parseInt(
                    groupCopy.OptionsSerialized[v]
                );
            }
        });
        groupCopy.PolicyList = [parseInt(groupCopy.PolicyList)];
        // JSON转换
        try {
            groupCopy.OptionsSerialized.aria2_options = JSON.parse(
                groupCopy.OptionsSerialized.aria2_options
            );
        } catch (e) {
            ToggleSnackbar("top", "right", t('Aria2 setting item format error'), "warning");
            return;
        }

        setLoading(true);
        API.post("/admin/group", {
            group: groupCopy,
        })
            .then(() => {
                history.push("/admin/group");
                ToggleSnackbar(
                    "top",
                    "right",
                    t('User Group Already') + (props.group ? t('save') : t('Add to')),
                    "success"
                );
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
                      {group.ID === 0 && t('New User Group')}
                      {group.ID !== 0 && t('edit ') + group.Name}
                  </Typography>

                  <div className={classes.formContainer}>
                      {group.ID !== 3 && (
                          <>
                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <InputLabel htmlFor="component-helper">
                                        {t('User group name')}
                                      </InputLabel>
                                      <Input
                                          value={group.Name}
                                          onChange={handleChange("Name")}
                                          required
                                      />
                                      <FormHelperText id="component-helper-text">
                                        {t('The name of the user group')}
                                      </FormHelperText>
                                  </FormControl>
                              </div>

                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <InputLabel htmlFor="component-helper">
                                        {t('Storage Strategy')}
                                      </InputLabel>
                                      <Select
                                          labelId="demo-mutiple-chip-label"
                                          id="demo-mutiple-chip"
                                          value={group.PolicyList}
                                          onChange={handleChange(
                                              "PolicyList"
                                          )}
                                          input={
                                              <Input id="select-multiple-chip" />
                                          }
                                      >
                                          {Object.keys(policies).map(
                                              (pid) => (
                                                  <MenuItem
                                                      key={pid}
                                                      value={pid}
                                                  >
                                                      {policies[pid]}
                                                  </MenuItem>
                                              )
                                          )}
                                      </Select>
                                      <FormHelperText id="component-helper-text">
                                        {t('Specify the storage policy of the user group.')}
                                      </FormHelperText>
                                  </FormControl>
                              </div>

                              <div className={classes.form}>
                                  <FormControl fullWidth>
                                      <SizeInput
                                          value={group.MaxStorage}
                                          onChange={handleChange(
                                              "MaxStorage"
                                          )}
                                          min={0}
                                          max={9223372036854775807}
                                          label={t('Initial capacity')}
                                          required
                                      />
                                  </FormControl>
                                  <FormHelperText id="component-helper-text">
                                    {t('The initial available maximum capacity of users under the user group')}
                                  </FormHelperText>
                              </div>
                          </>
                      )}

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <SizeInput
                                  value={group.SpeedLimit}
                                  onChange={handleChange("SpeedLimit")}
                                  min={0}
                                  max={9223372036854775807}
                                  label={t('Download speed limit')}
                                  suffix={"/s"}
                                  required
                              />
                          </FormControl>
                          <FormHelperText id="component-helper-text">
                            {t(
                              'Fill in 0 means no limit. When the limit is turned on,\nwhen users under this user group download all files under the storage policy that supports the speed limit, the maximum download speed will be limited.'
                            )}
                          </FormHelperText>
                      </div>

                      {group.ID !== 3 && (
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={
                                                  group.ShareEnabled ===
                                                  "true"
                                              }
                                              onChange={handleCheckChange(
                                                  "ShareEnabled"
                                              )}
                                          />
                                      }
                                      label={t('Allow to create shares')}
                                  />
                                  <FormHelperText id="component-helper-text">
                                    {t('When disabled, users cannot create sharing links')}
                                  </FormHelperText>
                              </FormControl>
                          </div>
                      )}

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <FormControlLabel
                                  control={
                                      <Switch
                                          checked={
                                              group.OptionsSerialized
                                                  .share_download === "true"
                                          }
                                          onChange={handleOptionCheckChange(
                                              "share_download"
                                          )}
                                      />
                                  }
                                  label={t('Allow download and share')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('When disabled, users cannot download files created by others to share')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      {group.ID !== 3 && (
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={
                                                  group.WebDAVEnabled ===
                                                  "true"
                                              }
                                              onChange={handleCheckChange(
                                                  "WebDAVEnabled"
                                              )}
                                          />
                                      }
                                      label="WebDAV"
                                  />
                                  <FormHelperText id="component-helper-text">
                                    {t('When disabled, users cannot connect to the network disk through the WebDAV\nprotocol')}
                                  </FormHelperText>
                              </FormControl>
                          </div>
                      )}

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <FormControlLabel
                                  control={
                                      <Switch
                                          checked={
                                              group.OptionsSerialized
                                                  .one_time_download ===
                                              "true"
                                          }
                                          onChange={handleOptionCheckChange(
                                              "one_time_download"
                                          )}
                                      />
                                  }
                                  label={t('Multiple download requests are prohibited')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Only valid for the native storage strategy. When enabled, users cannot use the multi-threaded download tool.')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      {group.ID !== 3 && (
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={
                                                  group.OptionsSerialized
                                                      .aria2 === "true"
                                              }
                                              onChange={handleOptionCheckChange(
                                                  "aria2"
                                              )}
                                          />
                                      }
                                      label={t('Offline download')}
                                  />
                                  <FormHelperText id="component-helper-text">
                                    {t('Whether users are allowed to create offline download tasks')}
                                  </FormHelperText>
                              </FormControl>
                          </div>
                      )}

                      <Collapse in={group.OptionsSerialized.aria2 === "true"}>
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <InputLabel htmlFor="component-helper">
                                    {t('Aria2 Task Parameters')}
                                  </InputLabel>
                                  <Input
                                      multiline
                                      value={
                                          group.OptionsSerialized
                                              .aria2_options
                                      }
                                      onChange={handleOptionChange(
                                          "aria2_options"
                                      )}
                                  />
                                  <FormHelperText id="component-helper-text">
                                    {t(
                                      'The additional parameters that this user group carries when creating offline download tasks are written in\nJSON\nencoded format. You can also write these settings in the\nAria2 configuration file. For available parameters, please refer to the official Document'
                                    )}
                                  </FormHelperText>
                              </FormControl>
                          </div>
                      </Collapse>

                      <div className={classes.form}>
                          <FormControl fullWidth>
                              <FormControlLabel
                                  control={
                                      <Switch
                                          checked={
                                              group.OptionsSerialized
                                                  .archive_download === "true"
                                          }
                                          onChange={handleOptionCheckChange(
                                              "archive_download"
                                          )}
                                      />
                                  }
                                  label={t('Download package')}
                              />
                              <FormHelperText id="component-helper-text">
                                {t('Whether to allow users to select multiple files to package and download')}
                              </FormHelperText>
                          </FormControl>
                      </div>

                      {group.ID !== 3 && (
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <FormControlLabel
                                      control={
                                          <Switch
                                              checked={
                                                  group.OptionsSerialized
                                                      .archive_task === "true"
                                              }
                                              onChange={handleOptionCheckChange(
                                                  "archive_task"
                                              )}
                                          />
                                      }
                                      label={t('Compress/Decompress Tasks')}
                                  />
                                  <FormHelperText id="component-helper-text">
                                    {t('Whether users create compression/decompression tasks')}
                                  </FormHelperText>
                              </FormControl>
                          </div>
                      )}

                      <Collapse
                          in={group.OptionsSerialized.archive_task === "true"}
                      >
                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <SizeInput
                                      value={
                                          group.OptionsSerialized
                                              .compress_size
                                      }
                                      onChange={handleOptionChange(
                                          "compress_size"
                                      )}
                                      min={0}
                                      max={9223372036854775807}
                                      label={t('Maximum size of files to be compressed')}
                                  />
                              </FormControl>
                              <FormHelperText id="component-helper-text">
                                {t('The maximum total file size of the compression task that can be created by the user, filled in as\n0 means unlimited')}
                              </FormHelperText>
                          </div>

                          <div className={classes.form}>
                              <FormControl fullWidth>
                                  <SizeInput
                                      value={
                                          group.OptionsSerialized
                                              .decompress_size
                                      }
                                      onChange={handleOptionChange(
                                          "decompress_size"
                                      )}
                                      min={0}
                                      max={9223372036854775807}
                                      label={t('Maximum size of the file to be decompressed')}
                                  />
                              </FormControl>
                              <FormHelperText id="component-helper-text">
                                {t('The maximum total file size of the decompression task that can be created by the user, filled in as\n0 means unlimited')}
                              </FormHelperText>
                          </div>
                      </Collapse>
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
