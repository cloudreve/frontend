import { FormControl, FormControlLabel, Link, Switch, Typography } from "@mui/material";
import { useCallback, useContext, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { StoragePolicy } from "../../../../../api/dashboard";
import { PolicyType } from "../../../../../api/explorer";
import SizeInput from "../../../../Common/SizeInput";
import { DenseFilledTextField } from "../../../../Common/StyledComponents";
import SettingForm from "../../../../Pages/Setting/SettingForm";
import MagicVarDialog from "../../../Common/MagicVarDialog";
import { NoMarginHelperText, SettingSection, SettingSectionContent } from "../../../Settings/Settings";
import { PolicyPropsMap } from "../../StoragePolicySetting";
import { TrafficDiagram } from "../../TrafficDiagram";
import { StoragePolicySettingContext } from "../StoragePolicySettingWrapper";
import { fileMagicVars, pathMagicVars } from "./magicVars";

const StorageAndUploadSection = () => {
  const { t } = useTranslation("dashboard");
  const { values, setPolicy } = useContext(StoragePolicySettingContext);
  const [magicVarDialogOpen, setMagicVarDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"path" | "file">("path");

  const policyProps = useMemo(() => {
    return PolicyPropsMap[values.type];
  }, [values.type]);

  const showPreallocate = useMemo(() => {
    return values.type === PolicyType.local || values.type === PolicyType.remote;
  }, [values.type]);

  const onDirNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPolicy((p: StoragePolicy) => ({ ...p, dir_name_rule: e.target.value }));
    },
    [setPolicy],
  );

  const onFileNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPolicy((p: StoragePolicy) => ({ ...p, file_name_rule: e.target.value }));
    },
    [setPolicy],
  );

  const handlePathMagicVarClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDialogType("path");
    setMagicVarDialogOpen(true);
  }, []);

  const handleFileMagicVarClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDialogType("file");
    setMagicVarDialogOpen(true);
  }, []);

  const onMaxSizeChange = useCallback(
    (e: number) => {
      setPolicy((p: StoragePolicy) => ({ ...p, max_size: e ? e : undefined }));
    },
    [setPolicy],
  );

  const fileExts = useMemo(() => {
    return values.settings?.file_type?.join() ?? "";
  }, [values.settings?.file_type]);

  const onFileExtsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPolicy((p: StoragePolicy) => ({
        ...p,
        settings: {
          ...(p.settings ?? {}),
          file_type: e.target.value === "" ? undefined : e.target.value.split(",").map((ext) => ext.trim()),
        },
      }));
    },
    [setPolicy],
  );

  const onChunkSizeChange = useCallback(
    (size: number) => {
      setPolicy((p: StoragePolicy) => ({
        ...p,
        settings: { ...p.settings, chunk_size: size === 0 ? undefined : size },
      }));
    },
    [setPolicy],
  );

  const onPreallocateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPolicy((p: StoragePolicy) => ({
        ...p,
        settings: { ...p.settings, pre_allocate: e.target.checked ? true : undefined },
      }));
    },
    [setPolicy],
  );

  const onUploadRelayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPolicy((p: StoragePolicy) => ({
        ...p,
        settings: { ...p.settings, relay: e.target.checked ? true : undefined },
      }));
    },
    [setPolicy],
  );

  const onAcceleratedDomainUploadChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPolicy((p: StoragePolicy) => ({
        ...p,
        settings: { ...p.settings, qiniu_upload_cdn: e.target.checked ? true : undefined },
      }));
    },
    [setPolicy],
  );

  return (
    <SettingSection>
      <Typography variant="h6" gutterBottom>
        {t("policy.storageAndUpload")}
      </Typography>
      <SettingSectionContent>
        <SettingForm title={t("policy.blobFolderNaming")} lgWidth={5}>
          <FormControl fullWidth>
            <DenseFilledTextField required value={values.dir_name_rule} onChange={onDirNameChange} />
            <NoMarginHelperText>
              <Trans
                i18nKey="policy.blobFolderNamingDes"
                ns="dashboard"
                components={[<Link href="#" onClick={handlePathMagicVarClick} />]}
              />
              {t("policy.nameRuleImmutable")}
            </NoMarginHelperText>
          </FormControl>
        </SettingForm>
        <SettingForm title={t("policy.blobName")} lgWidth={5}>
          <FormControl fullWidth>
            <DenseFilledTextField
              required
              value={values.file_name_rule}
              slotProps={{
                htmlInput: {
                  pattern: `.*?(\\{randomkey8\\}|\\{randomkey16\\}|\\{uuid\\}).*?`,
                  title: t("policy.uniqueVarRequired"),
                },
              }}
              onChange={onFileNameChange}
            />
            <NoMarginHelperText>
              <Trans
                i18nKey="policy.blobNameDes"
                ns="dashboard"
                components={[<Link href="#" onClick={handleFileMagicVarClick} />]}
              />
              {t("policy.nameRuleImmutable")}
            </NoMarginHelperText>
          </FormControl>
        </SettingForm>
        <SettingForm title={t("policy.maxSizeOfSingleFile")} lgWidth={5}>
          <FormControl fullWidth>
            <SizeInput variant={"outlined"} required value={values.max_size ?? 0} onChange={onMaxSizeChange} />
            <NoMarginHelperText>{t("policy.maxSizeOfSingleFileDes")}</NoMarginHelperText>
          </FormControl>
        </SettingForm>
        <SettingForm title={t("policy.extList")} lgWidth={5}>
          <FormControl fullWidth>
            <DenseFilledTextField multiline maxRows={4} value={fileExts} onChange={onFileExtsChange} />
            <NoMarginHelperText>{t("policy.enterFileExt")}</NoMarginHelperText>
          </FormControl>
        </SettingForm>
        {values.type !== PolicyType.upyun && (
          <SettingForm title={t("policy.chunkSize")} lgWidth={5}>
            <FormControl fullWidth>
              <SizeInput
                min={policyProps.chunkSizeMin ?? 0}
                max={policyProps.chunkSizeMax ?? 0}
                allowZero={!policyProps.chunkSizeMin}
                variant={"outlined"}
                value={values.settings?.chunk_size ?? 0}
                onChange={onChunkSizeChange}
              />
              <NoMarginHelperText>
                {t("policy.chunkSizeDesSuffix", {
                  prefix: t(policyProps.chunkSizeDes ?? ""),
                })}
              </NoMarginHelperText>
            </FormControl>
          </SettingForm>
        )}
        {showPreallocate && (
          <SettingForm lgWidth={5}>
            <FormControl fullWidth>
              <FormControlLabel
                control={<Switch checked={values.settings?.pre_allocate ?? false} onChange={onPreallocateChange} />}
                label={t("policy.preallocate")}
              />
              <NoMarginHelperText>{t("policy.preallocateDes")}</NoMarginHelperText>
            </FormControl>
          </SettingForm>
        )}
        {values.type === PolicyType.qiniu && (
          <SettingForm lgWidth={5}>
            <FormControl fullWidth>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.settings?.qiniu_upload_cdn ?? false}
                    onChange={onAcceleratedDomainUploadChange}
                  />
                }
                label={t("policy.acceleratedDomainUpload")}
              />
              <NoMarginHelperText>
                <Trans
                  i18nKey="policy.acceleratedDomainUploadDes"
                  ns="dashboard"
                  components={[
                    <Link target="_blank" href="https://developer.qiniu.com/kodo/12656/transfer-acceleration" />,
                  ]}
                />
              </NoMarginHelperText>
            </FormControl>
          </SettingForm>
        )}
        {values.type !== PolicyType.local && (
          <>
            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={<Switch checked={values.settings?.relay ?? false} onChange={onUploadRelayChange} />}
                  label={t("policy.uploadRelay")}
                />
                <NoMarginHelperText>{t("policy.uploadRelayDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("policy.uploadTrafficDiagram")} lgWidth={5}>
              <TrafficDiagram
                internalEndpoint={!!values.settings?.server_side_endpoint}
                variant="upload"
                storageNodeTitle={t("policy.node")}
                proxyed={values.settings?.relay}
              />
            </SettingForm>
          </>
        )}
      </SettingSectionContent>
      <MagicVarDialog
        open={magicVarDialogOpen}
        onClose={() => setMagicVarDialogOpen(false)}
        vars={dialogType === "path" ? pathMagicVars : fileMagicVars}
      />
    </SettingSection>
  );
};

export default StorageAndUploadSection;
