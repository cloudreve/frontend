import { Box, IconButton, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DenseFilledTextField,
  NoWrapCell,
  NoWrapTableCell,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";
import { builtInIcons, FileTypeIconSetting } from "../../../FileManager/Explorer/FileTypeIcon.tsx";
import Add from "../../../Icons/Add.tsx";
import Dismiss from "../../../Icons/Dismiss.tsx";
import HexColorInput from "../HexColorInput.tsx";

export interface FileIconListProps {
  config: string;
  onChange: (value: string) => void;
}

const IconPreview = ({ icon }: { icon: FileTypeIconSetting }) => {
  const theme = useTheme();
  const IconComponent = useMemo(() => {
    if (icon.icon) {
      return builtInIcons[icon.icon];
    }
  }, [icon.icon]);

  const iconColor = useMemo(() => {
    if (theme.palette.mode == "dark") {
      return icon.color_dark ?? icon.color ?? theme.palette.action.active;
    } else {
      return icon.color ?? theme.palette.action.active;
    }
  }, [icon.color, icon.color_dark, theme]);

  if (IconComponent) {
    return (
      <IconComponent
        sx={{
          color: iconColor,
          fontSize: 32,
        }}
      />
    );
  }
  return (
    <Box
      component={icon.img ? "img" : "div"}
      sx={{
        width: "32px",
        height: "32px",
      }}
      src={icon.img}
    />
  );
};

const FileIconList = memo(({ config, onChange }: FileIconListProps) => {
  const { t } = useTranslation("dashboard");
  const configParsed = useMemo((): FileTypeIconSetting[] => JSON.parse(config), [config]);
  const [inputCache, setInputCache] = useState<{
    [key: number]: string | undefined;
  }>({});
  return (
    <Box>
      {configParsed?.length > 0 && (
        <TableContainer sx={{ mt: 1, maxHeight: 440 }} component={StyledTableContainerPaper}>
          <Table stickyHeader sx={{ width: "100%", tableLayout: "fixed" }} size="small">
            <TableHead>
              <TableRow>
                <NoWrapTableCell width={64}>{t("settings.icon")}</NoWrapTableCell>
                <NoWrapTableCell width={200}>{t("settings.iconUrl")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("settings.iconColor")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("settings.iconColorDark")}</NoWrapTableCell>
                <NoWrapTableCell width={250}>{t("settings.exts")}</NoWrapTableCell>
                <NoWrapTableCell width={64}></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configParsed.map((r, i) => (
                <TableRow key={i} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} hover>
                  <NoWrapCell>
                    <IconPreview icon={r} />
                  </NoWrapCell>
                  <NoWrapCell>
                    {!r.icon ? (
                      <DenseFilledTextField
                        fullWidth
                        required
                        value={r.img}
                        onChange={(e) =>
                          onChange(
                            JSON.stringify([
                              ...configParsed.slice(0, i),
                              { ...r, img: e.target.value as string },
                              ...configParsed.slice(i + 1),
                            ]),
                          )
                        }
                      />
                    ) : (
                      t("settings.builtinIcon")
                    )}
                  </NoWrapCell>
                  <NoWrapCell>
                    {!r.icon ? (
                      "-"
                    ) : (
                      <HexColorInput
                        currentColor={r.color ?? ""}
                        onColorChange={(color) =>
                          onChange(
                            JSON.stringify([
                              ...configParsed.slice(0, i),
                              {
                                ...r,
                                color: color,
                              },
                              ...configParsed.slice(i + 1),
                            ]),
                          )
                        }
                      />
                    )}
                  </NoWrapCell>
                  <NoWrapCell>
                    {!r.icon ? (
                      "-"
                    ) : (
                      <HexColorInput
                        currentColor={r.color_dark ?? ""}
                        onColorChange={(color) =>
                          onChange(
                            JSON.stringify([
                              ...configParsed.slice(0, i),
                              {
                                ...r,
                                color_dark: color,
                              },
                              ...configParsed.slice(i + 1),
                            ]),
                          )
                        }
                      />
                    )}
                  </NoWrapCell>
                  <NoWrapCell>
                    <DenseFilledTextField
                      fullWidth
                      multiline
                      required
                      value={inputCache[i] ?? r.exts.join()}
                      onBlur={() => {
                        onChange(
                          JSON.stringify([
                            ...configParsed.slice(0, i),
                            {
                              ...r,
                              exts: inputCache[i]?.split(",") ?? r.exts,
                            },
                            ...configParsed.slice(i + 1),
                          ]),
                        );
                        setInputCache({
                          ...inputCache,
                          [i]: undefined,
                        });
                      }}
                      onChange={(e) =>
                        setInputCache({
                          ...inputCache,
                          [i]: e.target.value,
                        })
                      }
                    />
                  </NoWrapCell>
                  <NoWrapCell>
                    {!r.icon && (
                      <IconButton
                        onClick={() => onChange(JSON.stringify(configParsed.filter((_, index) => index !== i)))}
                        size={"small"}
                      >
                        <Dismiss fontSize={"small"} />
                      </IconButton>
                    )}
                  </NoWrapCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <SecondaryButton
        variant={"contained"}
        startIcon={<Add />}
        sx={{ mt: 1 }}
        onClick={() =>
          onChange(
            JSON.stringify([
              ...configParsed,
              {
                img: "",
                exts: [],
              },
            ]),
          )
        }
      >
        {t("settings.addIcon")}
      </SecondaryButton>
    </Box>
  );
});

export default FileIconList;
