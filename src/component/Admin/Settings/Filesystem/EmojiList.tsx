import { Box, IconButton, Stack, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DenseFilledTextField,
  NoWrapCell,
  NoWrapTableCell,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";
import Add from "../../../Icons/Add.tsx";
import Dismiss from "../../../Icons/Dismiss.tsx";

export interface EmojiListProps {
  config: string;
  onChange: (value: string) => void;
}

const EmojiList = memo(({ config, onChange }: EmojiListProps) => {
  const { t } = useTranslation("dashboard");
  const [render, setRender] = useState(false);
  const configParsed = useMemo((): { [key: string]: string[] } => JSON.parse(config), [config]);
  const [inputCache, setInputCache] = useState<{
    [key: number]: string | undefined;
  }>({});
  return (
    <Stack spacing={1}>
      <Box>
        {!render && (
          <SecondaryButton variant={"contained"} onClick={() => setRender(!render)}>
            {t("settings.showSettings")}
          </SecondaryButton>
        )}
        {render && Object.keys(configParsed ?? {}).length > 0 && (
          <TableContainer sx={{ mt: 1, maxHeight: 440 }} component={StyledTableContainerPaper}>
            <Table stickyHeader sx={{ width: "100%", tableLayout: "fixed" }} size="small">
              <TableHead>
                <TableRow>
                  <NoWrapTableCell width={64}>{t("settings.category")}</NoWrapTableCell>
                  <NoWrapTableCell width={200}>{t("settings.emojiOptions")}</NoWrapTableCell>
                  <NoWrapTableCell width={64}></NoWrapTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(configParsed ?? {}).map((r, i) => (
                  <TableRow key={i} sx={{ "&:last-child td, &:last-child th": { border: 0 } }} hover>
                    <NoWrapCell>
                      <DenseFilledTextField
                        fullWidth
                        required
                        value={r}
                        onChange={(e) => {
                          const newConfig = {
                            ...configParsed,
                            [e.target.value]: configParsed[r],
                          };
                          delete newConfig[r];
                          onChange(JSON.stringify(newConfig));
                        }}
                      />
                    </NoWrapCell>
                    <NoWrapCell>
                      <DenseFilledTextField
                        fullWidth
                        multiline
                        required
                        value={inputCache[i] ?? configParsed[r].join()}
                        onBlur={() => {
                          onChange(
                            JSON.stringify({
                              ...configParsed,
                              [r]: inputCache[i]?.split(",") ?? configParsed[r],
                            }),
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
                      <IconButton
                        onClick={() => {
                          const newConfig = {
                            ...configParsed,
                          };

                          delete newConfig[r];
                          onChange(JSON.stringify(newConfig));
                        }}
                        size={"small"}
                      >
                        <Dismiss fontSize={"small"} />
                      </IconButton>
                    </NoWrapCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {render && (
        <Box>
          <SecondaryButton
            variant={"contained"}
            startIcon={<Add />}
            onClick={() =>
              onChange(
                JSON.stringify({
                  ...configParsed,
                  [""]: [],
                }),
              )
            }
          >
            {t("settings.addCategorize")}
          </SecondaryButton>
        </Box>
      )}
    </Stack>
  );
});

export default EmojiList;
