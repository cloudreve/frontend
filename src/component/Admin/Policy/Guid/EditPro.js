import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Input from "@material-ui/core/Input";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
import API from "../../../../middleware/Api";

export default function EditPro(props) {
    const [, setLoading] = useState(false);
    const [policy, setPolicy] = useState(props.policy);

    const { t } = useTranslation();

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

        const policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        // 类型转换
        policyCopy.AutoRename = policyCopy.AutoRename === "true";
        policyCopy.IsPrivate = policyCopy.IsPrivate === "true";
        policyCopy.IsOriginLinkEnable =
            policyCopy.IsOriginLinkEnable === "true";
        policyCopy.MaxSize = parseInt(policyCopy.MaxSize);
        policyCopy.OptionsSerialized.file_type = policyCopy.OptionsSerialized.file_type.split(
            ","
        );
        if (
            policyCopy.OptionsSerialized.file_type.length === 1 &&
            policyCopy.OptionsSerialized.file_type[0] === ""
        ) {
            policyCopy.OptionsSerialized.file_type = [];
        }

        API.post("/admin/policy", {
            policy: policyCopy,
        })
            .then(() => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t('Storage Policy Already') + (props.policy ? t('save') : t('Add to')),
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
          <Typography variant={"h6"}>{t('Edit Storage Policy')}</Typography>
          <TableContainer>
              <form onSubmit={submitPolicy}>
                  <Table aria-label="simple table">
                      <TableHead>
                          <TableRow>
                              <TableCell>{t('Settings')}</TableCell>
                              <TableCell>{t('value')}</TableCell>
                              <TableCell>{t('describe')}</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  ID
                              </TableCell>
                              <TableCell>{policy.ID}</TableCell>
                              <TableCell>{t('Storage Policy Number')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Type')}
                              </TableCell>
                              <TableCell>{policy.Type}</TableCell>
                              <TableCell>{t('Storage Strategy Type')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Name')}
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
                              <TableCell>{t('Storage Policy Name')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  Server
                              </TableCell>
                              <TableCell>
                                  <FormControl>
                                      <Input
                                          value={policy.Server}
                                          onChange={handleChange("Server")}
                                      />
                                  </FormControl>
                              </TableCell>
                              <TableCell>{t('Storage Endpoint')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  BucketName
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
                              <TableCell>{t('Bucket ID')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Private Space')}
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
                                              label={t('Yes')}
                                          />
                                          <FormControlLabel
                                              value={"false"}
                                              control={
                                                  <Radio color={"primary"} />
                                              }
                                              label={t('no')}
                                          />
                                      </RadioGroup>
                                  </FormControl>
                              </TableCell>
                              <TableCell>{t('Whether it is a private space')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('File resource root URL')}
                              </TableCell>
                              <TableCell>
                                  <FormControl>
                                      <Input
                                          value={policy.BaseURL}
                                          onChange={handleChange("BaseURL")}
                                      />
                                  </FormControl>
                              </TableCell>
                              <TableCell>
                                {t('The prefix of the URL generated when previewing/fetching the external link of the file')}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  AccessKey
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
                              <TableCell>{t('AccessKey / Refresh Token')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  SecretKey
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
                              <TableCell>SecretKey</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Maximum single file size (Bytes)')}
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
                              <TableCell>
                                {t('The maximum file size that can be uploaded, fill in 0 means no limit')}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Automatically rename')}
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
                                              label={t('Yes')}
                                          />
                                          <FormControlLabel
                                              value={"false"}
                                              control={
                                                  <Radio color={"primary"} />
                                              }
                                              label={t('no')}
                                          />
                                      </RadioGroup>
                                  </FormControl>
                              </TableCell>
                              <TableCell>
                                {t('Whether to rename the uploaded physical file according to the rules')}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Storage path')}
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
                              <TableCell>{t('File physical storage path')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Storage file name')}
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
                              <TableCell>{t('File physical storage file name')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Allow access to external links')}
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
                                              label={t('Yes')}
                                          />
                                          <FormControlLabel
                                              value={"false"}
                                              control={
                                                  <Radio color={"primary"} />
                                              }
                                              label={t('no')}
                                          />
                                      </RadioGroup>
                                  </FormControl>
                              </TableCell>
                              <TableCell>
                                {t('Whether it is allowed to obtain external links. Note that some storage policy types are not supported. Even if it is turned on here, the obtained external links cannot be used.')}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Again to take the cloud anti-leech Token')}
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
                              <TableCell>{t('Only valid for another cloud storage strategy')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Allow file extensions')}
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
                              <TableCell>{t('Leave blank means unlimited')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Allowed MimeType')}
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
                              <TableCell>{t('Only valid for Qiniu storage strategy')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('OneDrive redirect address')}
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
                              <TableCell>{t('No need to modify after generally added')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('OneDrive anti-generation server address')}
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
                              <TableCell>
                                {t('Only valid for OneDrive storage policies')}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('OneDrive/SharePoint Drive Resource Identification')}
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
                              <TableCell>
                                {t(
                                  'Only valid for OneDrive\nstorage policy, leave it blank to use the user\'s default OneDrive\ndrive'
                                )}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                  Amazon S3 Region
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
                              <TableCell>
                                {t('Only valid for Amazon S3 storage policies')}
                              </TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell component="th" scope="row">
                                {t('Intranet EndPoint')}
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
                              <TableCell>{t('Only valid for OSS storage policies')}</TableCell>
                          </TableRow>
                      </TableBody>
                  </Table>
                  <Button
                      type={"submit"}
                      color={"primary"}
                      variant={"contained"}
                      style={{ margin: 8 }}
                  >
                    {t('save Changes')}
                  </Button>
              </form>
          </TableContainer>
      </div>
    );
}
