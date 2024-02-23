import React, { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Button from "@material-ui/core/Button";
import API from "../../../../middleware/Api";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { toggleSnackbar } from "../../../../redux/explorer";
import { useTranslation } from "react-i18next";
import { transformPolicyRequest } from "../utils";

export default function EditPro(props) {
    const { t } = useTranslation("dashboard", { keyPrefix: "policy" });
    const [, setLoading] = useState(false);
    const [policy, setPolicy] = useState(props.policy);

    const handleChange = (name) => (event) => {
        setPolicy({
            ...policy,
            [name]: event.target.value,
        });
    };

    const handleOptionChange = (name) => (event) => {
        setPolicy({
            ...policy,
            OptionsSerialized: {
                ...policy.OptionsSerialized,
                [name]: event.target.value,
            },
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const submitPolicy = (e) => {
        e.preventDefault();
        setLoading(true);

        let policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        // 类型转换
        policyCopy = transformPolicyRequest(policyCopy);

        API.post("/admin/policy", {
            policy: policyCopy,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    props.policy ? t("policySaved") : t("policyAdded"),
                    "success"
                );
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });

        setLoading(false);
    };

    return (
        <div>
            <Typography variant={"h6"}>{t("editPolicy")}</Typography>
            <TableContainer>
                <form onSubmit={submitPolicy}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("setting")}</TableCell>
                                <TableCell>{t("value")}</TableCell>
                                <TableCell>{t("description")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("id")}
                                </TableCell>
                                <TableCell>{policy.ID}</TableCell>
                                <TableCell>{t("policyID")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("type")}
                                </TableCell>
                                <TableCell>{policy.Type}</TableCell>
                                <TableCell>{t("policyType")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("name")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            required
                                            value={policy.Name}
                                            onChange={handleChange("Name")}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("policyName")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("server")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            value={policy.Server}
                                            onChange={handleChange("Server")}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("policyEndpoint")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("bucketName")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            value={policy.BucketName}
                                            onChange={handleChange(
                                                "BucketName"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("bucketID")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("privateBucket")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <RadioGroup
                                            required
                                            value={policy.IsPrivate}
                                            onChange={handleChange("IsPrivate")}
                                            row
                                        >
                                            <FormControlLabel
                                                value={"true"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("yes")}
                                            />
                                            <FormControlLabel
                                                value={"false"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("no")}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("privateBucketDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("resourceRootURL")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            value={policy.BaseURL}
                                            onChange={handleChange("BaseURL")}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("resourceRootURLDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("accessKey")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            rowsMax={10}
                                            value={policy.AccessKey}
                                            onChange={handleChange("AccessKey")}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("akDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("secretKey")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            rowsMax={10}
                                            value={policy.SecretKey}
                                            onChange={handleChange("SecretKey")}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("secretKey")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("maxSizeBytes")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            type={"number"}
                                            inputProps={{
                                                min: 0,
                                                step: 1,
                                            }}
                                            value={policy.MaxSize}
                                            onChange={handleChange("MaxSize")}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("maxSizeBytesDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("autoRename")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <RadioGroup
                                            required
                                            value={policy.AutoRename}
                                            onChange={handleChange(
                                                "AutoRename"
                                            )}
                                            row
                                        >
                                            <FormControlLabel
                                                value={"true"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("yes")}
                                            />
                                            <FormControlLabel
                                                value={"false"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("no")}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("autoRenameDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("storagePath")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={policy.DirNameRule}
                                            onChange={handleChange(
                                                "DirNameRule"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("storagePathDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("fileName")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={policy.FileNameRule}
                                            onChange={handleChange(
                                                "FileNameRule"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("fileNameDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("allowGetSourceLink")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <RadioGroup
                                            required
                                            value={policy.IsOriginLinkEnable}
                                            onChange={handleChange(
                                                "IsOriginLinkEnable"
                                            )}
                                            row
                                        >
                                            <FormControlLabel
                                                value={"true"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("yes")}
                                            />
                                            <FormControlLabel
                                                value={"false"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("no")}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    {t("allowGetSourceLinkDes")}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("upyunToken")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized.token
                                            }
                                            onChange={handleOptionChange(
                                                "token"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("upyunOnly")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("allowedFileExtension")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .file_type
                                            }
                                            onChange={handleOptionChange(
                                                "file_type"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("emptyIsNoLimit")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("allowedMimetype")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .mimetype
                                            }
                                            onChange={handleOptionChange(
                                                "mimetype"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("qiniuOnly")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("odRedirectURL")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .od_redirect
                                            }
                                            onChange={handleOptionChange(
                                                "od_redirect"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    {t("noModificationNeeded")}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("odReverseProxy")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .od_proxy
                                            }
                                            onChange={handleOptionChange(
                                                "od_proxy"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("odOnly")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("odDriverID")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .od_driver
                                            }
                                            onChange={handleOptionChange(
                                                "od_driver"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("odDriverIDDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("s3Region")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized.region
                                            }
                                            onChange={handleOptionChange(
                                                "region"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("s3Only")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("lanEndpoint")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .server_side_endpoint
                                            }
                                            onChange={handleOptionChange(
                                                "server_side_endpoint"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("ossOnly")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("chunkSizeBytes")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            type={"number"}
                                            inputProps={{
                                                min: 0,
                                                step: 1,
                                            }}
                                            value={
                                                policy.OptionsSerialized
                                                    .chunk_size
                                            }
                                            onChange={handleOptionChange(
                                                "chunk_size"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("chunkSizeBytesDes")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("placeHolderWithSize")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <RadioGroup
                                            required
                                            value={
                                                policy.OptionsSerialized
                                                    .placeholder_with_size
                                            }
                                            onChange={handleOptionChange(
                                                "placeholder_with_size"
                                            )}
                                            row
                                        >
                                            <FormControlLabel
                                                value={"true"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("yes")}
                                            />
                                            <FormControlLabel
                                                value={"false"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("no")}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    {t("placeHolderWithSizeDes")}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("tps")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            type={"number"}
                                            inputProps={{
                                                step: 0.1,
                                            }}
                                            value={
                                                policy.OptionsSerialized
                                                    .tps_limit
                                            }
                                            onChange={handleOptionChange(
                                                "tps_limit"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("odOnly")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("tpsBurst")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            type={"number"}
                                            inputProps={{
                                                step: 1,
                                            }}
                                            value={
                                                policy.OptionsSerialized
                                                    .tps_limit_burst
                                            }
                                            onChange={handleOptionChange(
                                                "tps_limit_burst"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("odOnly")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("usePathEndpoint")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <RadioGroup
                                            required
                                            value={
                                                policy.OptionsSerialized
                                                    .s3_path_style
                                            }
                                            onChange={handleOptionChange(
                                                "s3_path_style"
                                            )}
                                            row
                                        >
                                            <FormControlLabel
                                                value={"true"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("yes")}
                                            />
                                            <FormControlLabel
                                                value={"false"}
                                                control={
                                                    <Radio color={"primary"} />
                                                }
                                                label={t("no")}
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("s3Only")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell component="th" scope="row">
                                    {t("thumbExt")}
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Input
                                            multiline
                                            value={
                                                policy.OptionsSerialized
                                                    .thumb_exts
                                            }
                                            onChange={handleOptionChange(
                                                "thumb_exts"
                                            )}
                                        />
                                    </FormControl>
                                </TableCell>
                                <TableCell>{t("thumbExtDes")}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <Button
                        type={"submit"}
                        color={"primary"}
                        variant={"contained"}
                        style={{ margin: 8 }}
                    >
                        {t("saveChanges")}
                    </Button>
                </form>
            </TableContainer>
        </div>
    );
}
