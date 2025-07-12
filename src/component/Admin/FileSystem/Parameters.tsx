import { DeleteOutline } from "@mui/icons-material";
import {
  Box,
  Collapse,
  FormControl,
  FormControlLabel,
  Link,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import * as React from "react";
import { useCallback, useContext, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { sendClearBlobUrlCache } from "../../../api/api.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { isTrueVal } from "../../../session/utils.ts";
import SizeInput from "../../Common/SizeInput.tsx";
import { DefaultCloseAction } from "../../Common/Snackbar/snackbar.tsx";
import { DenseFilledTextField, DenseSelect, SecondaryButton } from "../../Common/StyledComponents.tsx";
import { SquareMenuItem } from "../../FileManager/ContextMenu/ContextMenu.tsx";
import SettingForm from "../../Pages/Setting/SettingForm.tsx";
import { NoMarginHelperText, SettingSection, SettingSectionContent } from "../Settings/Settings.tsx";
import { SettingContext } from "../Settings/SettingWrapper.tsx";

const Parameters = () => {
  const { t } = useTranslation("dashboard");
  const { formRef, setSettings, values } = useContext(SettingContext);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const clearBlobUrlCache = () => {
    setLoading(true);
    dispatch(sendClearBlobUrlCache())
      .then(() => {
        setLoading(false);
        enqueueSnackbar(t("settings.cacheCleared"), { variant: "success", action: DefaultCloseAction });
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const onMimeMappingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      mime_mapping: e.target.value,
    });
  }, []);

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Stack spacing={5}>
        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("nav.fileSystem")}
          </Typography>
          <SettingSectionContent>
            <SettingForm title={t("settings.textEditMaxSize")} lgWidth={5}>
              <FormControl>
                <SizeInput
                  variant={"outlined"}
                  required
                  allowZero={false}
                  value={parseInt(values.maxEditSize) ?? 0}
                  onChange={(e) =>
                    setSettings({
                      maxEditSize: e.toString(),
                    })
                  }
                />
                <NoMarginHelperText>{t("settings.textEditMaxSizeDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.trashBinInterval")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={values.cron_trash_bin_collect}
                  onChange={(e) =>
                    setSettings({
                      cron_trash_bin_collect: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey="settings.cronDes"
                    values={{
                      des: t("settings.trashBinIntervalDes"),
                    }}
                    ns={"dashboard"}
                    components={[<Link href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" />]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.entityCollectInterval")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={values.cron_entity_collect}
                  onChange={(e) =>
                    setSettings({
                      cron_entity_collect: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey="settings.cronDes"
                    ns={"dashboard"}
                    values={{
                      des: t("settings.entityCollectIntervalDes"),
                    }}
                    components={[<Link href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" />]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.publicResourceMaxAge")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  type="number"
                  inputProps={{ min: 0, setp: 1 }}
                  value={values.public_resource_maxage}
                  onChange={(e) =>
                    setSettings({
                      public_resource_maxage: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.publicResourceMaxAgeDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.defaultPagination")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseSelect
                  renderValue={(v) => (
                    <ListItemText
                      slotProps={{
                        primary: { variant: "body2" },
                      }}
                    >
                      {v == "0" ? t("settings.offsetPagination") : t("settings.cursorPagination")}
                    </ListItemText>
                  )}
                  onChange={(e) =>
                    setSettings({
                      use_cursor_pagination: e.target.value as string,
                    })
                  }
                  MenuProps={{
                    PaperProps: { sx: { maxWidth: 230 } },
                    MenuListProps: {
                      sx: {
                        "& .MuiMenuItem-root": {
                          whiteSpace: "normal",
                        },
                      },
                    },
                  }}
                  value={values.use_cursor_pagination}
                >
                  <SquareMenuItem value={"0"}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant={"body2"} fontWeight={600}>
                        {t("settings.offsetPagination")}
                      </Typography>
                      <Typography variant={"body2"} color={"textSecondary"}>
                        {t("settings.offsetPaginationDes")}
                      </Typography>
                    </Box>
                  </SquareMenuItem>
                  <SquareMenuItem value={"1"}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant={"body2"} fontWeight={600}>
                        {t("settings.cursorPagination")}
                      </Typography>
                      <Typography variant={"body2"} color={"textSecondary"}>
                        {t("settings.cursorPaginationDes")}
                      </Typography>
                    </Box>
                  </SquareMenuItem>
                </DenseSelect>
                <NoMarginHelperText>{t("settings.defaultPaginationDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.maxPageSize")} lgWidth={5}>
              <FormControl>
                <DenseFilledTextField
                  type="number"
                  inputProps={{ min: 0, setp: 1 }}
                  value={values.max_page_size}
                  onChange={(e) =>
                    setSettings({
                      max_page_size: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.maxPageSizeDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.maxBatchSize")} lgWidth={5}>
              <FormControl>
                <DenseFilledTextField
                  type="number"
                  inputProps={{ min: 0, setp: 1 }}
                  value={values.max_batched_file}
                  onChange={(e) =>
                    setSettings({
                      max_batched_file: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.maxBatchSizeDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.maxRecursiveSearch")} lgWidth={5}>
              <FormControl>
                <DenseFilledTextField
                  type="number"
                  inputProps={{ min: 0, setp: 1 }}
                  value={values.max_recursive_searched_folder}
                  onChange={(e) =>
                    setSettings({
                      max_recursive_searched_folder: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.maxRecursiveSearchDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.mapProvider")} lgWidth={5}>
              <FormControl>
                <DenseSelect
                  onChange={(e) =>
                    setSettings({
                      map_provider: e.target.value as string,
                    })
                  }
                  value={values.map_provider}
                >
                  <SquareMenuItem value={"google"}>
                    <ListItemText
                      slotProps={{
                        primary: { variant: "body2" },
                      }}
                    >
                      {t("settings.mapGoogle")}
                    </ListItemText>
                  </SquareMenuItem>
                  <SquareMenuItem value={"openstreetmap"}>
                    <ListItemText
                      slotProps={{
                        primary: { variant: "body2" },
                      }}
                    >
                      {t("settings.mapOpenStreetMap")}
                    </ListItemText>
                  </SquareMenuItem>
                </DenseSelect>
                <NoMarginHelperText>{t("settings.mapProviderDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <Collapse in={values.map_provider === "google"} unmountOnExit>
              <SettingForm title={t("settings.tileType")} lgWidth={5}>
                <FormControl>
                  <DenseSelect
                    onChange={(e) =>
                      setSettings({
                        map_google_tile_type: e.target.value as string,
                      })
                    }
                    value={values.map_google_tile_type}
                  >
                    <SquareMenuItem value={"terrain"}>
                      <ListItemText
                        slotProps={{
                          primary: { variant: "body2" },
                        }}
                      >
                        {t("settings.tileTypeTerrain")}
                      </ListItemText>
                    </SquareMenuItem>
                    <SquareMenuItem value={"satellite"}>
                      <ListItemText
                        slotProps={{
                          primary: { variant: "body2" },
                        }}
                      >
                        {t("settings.tileTypeSatellite")}
                      </ListItemText>
                    </SquareMenuItem>
                    <SquareMenuItem value={"regular"}>
                      <ListItemText
                        slotProps={{
                          primary: { variant: "body2" },
                        }}
                      >
                        {t("settings.tileTypeGeneral")}
                      </ListItemText>
                    </SquareMenuItem>
                  </DenseSelect>
                  <NoMarginHelperText>{t("settings.tileTypeDes")}</NoMarginHelperText>
                </FormControl>
              </SettingForm>
            </Collapse>
            <SettingForm title={t("settings.mimeMapping")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  multiline
                  rows={6}
                  value={values.mime_mapping}
                  onChange={onMimeMappingChange}
                  required
                />
                <NoMarginHelperText>{t("settings.mimeMappingDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </SettingSectionContent>
        </SettingSection>
        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("settings.searchQuery")}
          </Typography>
          <SettingSectionContent>
            <SettingForm title={t("application:navbar.photos")}>
              <DenseFilledTextField
                fullWidth
                value={values.explorer_category_image_query}
                onChange={(e) =>
                  setSettings({
                    explorer_category_image_query: e.target.value,
                  })
                }
                required
              />
            </SettingForm>
            <SettingForm title={t("application:navbar.videos")}>
              <DenseFilledTextField
                fullWidth
                value={values.explorer_category_video_query}
                onChange={(e) =>
                  setSettings({
                    explorer_category_video_query: e.target.value,
                  })
                }
                required
              />
            </SettingForm>
            <SettingForm title={t("application:navbar.music")}>
              <DenseFilledTextField
                fullWidth
                value={values.explorer_category_audio_query}
                onChange={(e) =>
                  setSettings({
                    explorer_category_audio_query: e.target.value,
                  })
                }
                required
              />
            </SettingForm>
            <SettingForm title={t("application:navbar.documents")}>
              <DenseFilledTextField
                fullWidth
                value={values.explorer_category_document_query}
                onChange={(e) =>
                  setSettings({
                    explorer_category_document_query: e.target.value,
                  })
                }
                required
              />
            </SettingForm>
          </SettingSectionContent>
        </SettingSection>
        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("settings.advanceOptions")}
          </Typography>
          <SettingSectionContent>
            <SettingForm title={t("settings.archiveTimeout")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.archive_timeout}
                onChange={(e) =>
                  setSettings({
                    archive_timeout: e.target.value,
                  })
                }
                required
              />
            </SettingForm>
            <SettingForm title={t("settings.uploadSessionTimeout")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.upload_session_timeout}
                onChange={(e) =>
                  setSettings({
                    upload_session_timeout: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.uploadSessionDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.slaveAPIExpiration")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.slave_api_timeout}
                onChange={(e) =>
                  setSettings({
                    slave_api_timeout: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.slaveAPIExpirationDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.folderPropsTimeout")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.folder_props_timeout}
                onChange={(e) =>
                  setSettings({
                    folder_props_timeout: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.folderPropsTimeoutDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.failedChunkRetry")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 0, setp: 1 }}
                value={values.chunk_retries}
                onChange={(e) =>
                  setSettings({
                    chunk_retries: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.failedChunkRetryDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTrueVal(values.use_temp_chunk_buffer)}
                      onChange={(e) =>
                        setSettings({
                          use_temp_chunk_buffer: e.target.checked ? "1" : "0",
                        })
                      }
                    />
                  }
                  label={t("settings.cacheChunks")}
                />
                <NoMarginHelperText>{t("settings.cacheChunksDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm title={t("settings.transitParallelNum")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.max_parallel_transfer}
                onChange={(e) =>
                  setSettings({
                    max_parallel_transfer: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.transitParallelNumDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.oauthRefresh")} lgWidth={5}>
              <DenseFilledTextField
                fullWidth
                required
                value={values.cron_oauth_cred_refresh}
                onChange={(e) =>
                  setSettings({
                    cron_oauth_cred_refresh: e.target.value,
                  })
                }
              />
              <NoMarginHelperText>
                <Trans
                  i18nKey="settings.cronDes"
                  values={{
                    des: t("settings.oauthRefreshDes"),
                  }}
                  ns={"dashboard"}
                  components={[<Link href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" />]}
                />
              </NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.wopiSessionTimeout")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.viewer_session_timeout}
                onChange={(e) =>
                  setSettings({
                    viewer_session_timeout: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.wopiSessionTimeoutDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.fileBlobTimeout")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.entity_url_default_ttl}
                onChange={(e) =>
                  setSettings({
                    entity_url_default_ttl: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.fileBlobTimeoutDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.fileBlobMargin")} lgWidth={5}>
              <DenseFilledTextField
                type="number"
                inputProps={{ min: 1, setp: 1 }}
                value={values.entity_url_cache_margin}
                onChange={(e) =>
                  setSettings({
                    entity_url_cache_margin: e.target.value,
                  })
                }
                required
              />
              <NoMarginHelperText>{t("settings.fileBlobMarginDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm title={t("settings.blobUrlCache")} lgWidth={5} anchorId="clearBlobUrlCache">
              <FormControl fullWidth>
                <Box>
                  <SecondaryButton
                    startIcon={<DeleteOutline />}
                    variant="contained"
                    loading={loading}
                    color="primary"
                    onClick={clearBlobUrlCache}
                  >
                    {t("settings.clearBlobUrlCache")}
                  </SecondaryButton>
                </Box>
                <NoMarginHelperText>{t("settings.clearBlobUrlCacheDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </SettingSectionContent>
        </SettingSection>
      </Stack>
    </Box>
  );
};

export default Parameters;
