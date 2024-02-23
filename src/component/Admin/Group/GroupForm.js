import React, { useCallback, useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Chip from "@material-ui/core/Chip";
import SizeInput from "../Common/SizeInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Collapse from "@material-ui/core/Collapse";
import { useHistory } from "react-router";
import { toggleSnackbar } from "../../../redux/explorer";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "@material-ui/core";
import { getSelectItemStyles } from "../../../utils";
import NodeSelector from "./NodeSelector";

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

export default function GroupForm(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "group" });
    const { t: tVas } = useTranslation("dashboard", { keyPrefix: "vas" });
    const { t: tDashboard } = useTranslation("dashboard");
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
                  PolicyList: ["1"], // 转换类型,至少选择一个
                  OptionsSerialized: {
                      // 批量转换类型
                      share_download: "true",
                      aria2_options: "{}", // json decode
                      compress_size: "0",
                      decompress_size: "0",
                      source_batch: "0",
                      aria2_batch: "1",
                      available_nodes: [],
                  },
              }
    );
    const [policies, setPolicies] = useState({});

    const theme = useTheme();
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
            "relocate",
            "one_time_download",
            "share_download",
            "webdav_proxy",
            "share_free",
            "aria2",
            "redirected_source",
            "advance_delete",
            "select_node",
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
        [
            "compress_size",
            "decompress_size",
            "source_batch",
            "aria2_batch",
        ].forEach((v) => {
            if (groupCopy.OptionsSerialized[v] !== undefined) {
                groupCopy.OptionsSerialized[v] = parseInt(
                    groupCopy.OptionsSerialized[v]
                );
            }
        });

        groupCopy.PolicyList = groupCopy.PolicyList.map((v) => {
            return parseInt(v);
        });

        groupCopy.OptionsSerialized.available_nodes =
            groupCopy.OptionsSerialized.available_nodes.map((v) => {
                return parseInt(v);
            });

        if (groupCopy.PolicyList.length < 1 && groupCopy.ID !== 3) {
            ToggleSnackbar("top", "right", t("atLeastOnePolicy"), "warning");
            return;
        }

        // JSON转换
        try {
            groupCopy.OptionsSerialized.aria2_options = JSON.parse(
                groupCopy.OptionsSerialized.aria2_options
            );
        } catch (e) {
            ToggleSnackbar("top", "right", t("aria2FormatError"), "warning");
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
                    props.group ? t("saved") : t("added"),
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
                        {group.ID === 0 && t("new")}
                        {group.ID !== 0 &&
                            t("editGroup", { group: group.Name })}
                    </Typography>

                    <div className={classes.formContainer}>
                        {group.ID !== 3 && (
                            <>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("nameOfGroup")}
                                        </InputLabel>
                                        <Input
                                            value={group.Name}
                                            onChange={handleChange("Name")}
                                            required
                                        />
                                        <FormHelperText id="component-helper-text">
                                            {t("nameOfGroupDes")}
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            {t("availablePolicies")}
                                        </InputLabel>
                                        <Select
                                            labelId="demo-mutiple-chip-label"
                                            id="demo-mutiple-chip"
                                            multiple
                                            value={group.PolicyList}
                                            onChange={handleChange(
                                                "PolicyList"
                                            )}
                                            input={
                                                <Input id="select-multiple-chip" />
                                            }
                                            renderValue={(selected) => (
                                                <div>
                                                    {selected.map((value) => (
                                                        <Chip
                                                            style={{
                                                                margin: 2,
                                                            }}
                                                            key={value}
                                                            size={"small"}
                                                            label={
                                                                policies[value]
                                                            }
                                                            className={
                                                                classes.chip
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        >
                                            {Object.keys(policies).map(
                                                (pid) => (
                                                    <MenuItem
                                                        key={pid}
                                                        value={pid}
                                                        style={getSelectItemStyles(
                                                            pid,
                                                            group.PolicyList,
                                                            theme
                                                        )}
                                                    >
                                                        {policies[pid]}
                                                    </MenuItem>
                                                )
                                            )}
                                        </Select>
                                        <FormHelperText id="component-helper-text">
                                            {t("availablePoliciesDes")}
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
                                            label={t("initialStorageQuota")}
                                            required
                                        />
                                    </FormControl>
                                    <FormHelperText id="component-helper-text">
                                        {t("initialStorageQuotaDes")}
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
                                    label={t("downloadSpeedLimit")}
                                    suffix={"/s"}
                                    required
                                />
                            </FormControl>
                            <FormHelperText id="component-helper-text">
                                {t("downloadSpeedLimitDes")}
                            </FormHelperText>
                        </div>

                        {group.ID !== 3 && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("bathSourceLinkLimit")}
                                    </InputLabel>
                                    <Input
                                        multiline
                                        type={"number"}
                                        inputProps={{
                                            min: 1,
                                            step: 1,
                                        }}
                                        value={
                                            group.OptionsSerialized.source_batch
                                        }
                                        onChange={handleOptionChange(
                                            "source_batch"
                                        )}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("bathSourceLinkLimitDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}

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
                                        label={t("allowCreateShareLink")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("allowCreateShareLinkDes")}
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
                                    label={t("allowDownloadShare")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("allowDownloadShareDes")}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                group.OptionsSerialized
                                                    .share_free === "true"
                                            }
                                            onChange={handleOptionCheckChange(
                                                "share_free"
                                            )}
                                        />
                                    }
                                    label={tVas("freeDownload")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {tVas("freeDownloadDes")}
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
                                        label={t("allowWabDAV")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("allowWabDAVDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}

                        {group.ID !== 3 && group.WebDAVEnabled === "true" && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    group.OptionsSerialized.webdav_proxy ===
                                                    "true"
                                                }
                                                onChange={handleOptionCheckChange(
                                                    "webdav_proxy"
                                                )}
                                            />
                                        }
                                        label={t("allowWabDAVProxy")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("allowWabDAVProxyDes")}
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
                                    label={t("disableMultipleDownload")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("disableMultipleDownloadDes")}
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
                                        label={t("allowRemoteDownload")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("allowRemoteDownloadDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}

                        <Collapse in={group.OptionsSerialized.aria2 === "true"}>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("aria2Options")}
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
                                        {t("aria2OptionsDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("aria2BatchSize")}
                                    </InputLabel>
                                    <Input
                                        multiline
                                        type={"number"}
                                        inputProps={{
                                            min: 0,
                                            step: 1,
                                        }}
                                        value={
                                            group.OptionsSerialized.aria2_batch
                                        }
                                        onChange={handleOptionChange(
                                            "aria2_batch"
                                        )}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("aria2BatchSizeDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        {t("availableNodes")}
                                    </InputLabel>
                                    <NodeSelector
                                        selected={
                                            group.OptionsSerialized
                                                .available_nodes
                                        }
                                        handleChange={handleOptionChange(
                                            "available_nodes"
                                        )}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("availableNodesDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    group.OptionsSerialized
                                                        .select_node === "true"
                                                }
                                                onChange={handleOptionCheckChange(
                                                    "select_node"
                                                )}
                                            />
                                        }
                                        label={t("allowSelectNode")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("allowSelectNodeDes")}
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
                                    label={t("serverSideBatchDownload")}
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("serverSideBatchDownloadDes")}
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
                                        label={t("compressTask")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("compressTaskDes")}
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
                                        label={t("compressSize")}
                                    />
                                </FormControl>
                                <FormHelperText id="component-helper-text">
                                    {t("compressSizeDes")}
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
                                        label={t("decompressSize")}
                                    />
                                </FormControl>
                                <FormHelperText id="component-helper-text">
                                    {t("decompressSizeDes")}
                                </FormHelperText>
                            </div>
                        </Collapse>

                        {group.ID !== 3 && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    group.OptionsSerialized
                                                        .relocate === "true"
                                                }
                                                onChange={handleOptionCheckChange(
                                                    "relocate"
                                                )}
                                            />
                                        }
                                        label={t("migratePolicy")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("migratePolicyDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}

                        {group.ID !== 3 && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    group.OptionsSerialized
                                                        .redirected_source ===
                                                    "true"
                                                }
                                                onChange={handleOptionCheckChange(
                                                    "redirected_source"
                                                )}
                                            />
                                        }
                                        label={t("redirectedSource")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        <Trans
                                            ns={"dashboard"}
                                            i18nKey={
                                                "group.redirectedSourceDes"
                                            }
                                            components={[
                                                <Link
                                                    href={tDashboard(
                                                        "policy.comparesStoragePoliciesLink"
                                                    )}
                                                    key={0}
                                                    target={"_blank"}
                                                />,
                                            ]}
                                        />
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}

                        {group.ID !== 3 && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    group.OptionsSerialized
                                                        .advance_delete ===
                                                    "true"
                                                }
                                                onChange={handleOptionCheckChange(
                                                    "advance_delete"
                                                )}
                                            />
                                        }
                                        label={t("advanceDelete")}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t("advanceDeleteDes")}
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}
                    </div>
                </div>
                <div className={classes.root}>
                    <Button
                        disabled={loading}
                        type={"submit"}
                        variant={"contained"}
                        color={"primary"}
                    >
                        {tDashboard("settings.save")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
