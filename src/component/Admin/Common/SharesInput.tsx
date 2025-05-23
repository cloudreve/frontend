import { Box, debounce, useTheme } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getShareList } from "../../../api/api.ts";
import { Share } from "../../../api/dashboard.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { DenseAutocomplete, DenseFilledTextField, NoWrapBox, SquareChip } from "../../Common/StyledComponents.tsx";
import FileTypeIcon from "../../FileManager/Explorer/FileTypeIcon.tsx";
import LinkDismiss from "../../Icons/LinkDismiss.tsx";

export interface SharesInputProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const SharesInput = (props: SharesInputProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [options, setOptions] = useState<number[]>([]);
  const [idShareMap, setIdShareMap] = useState<Record<number, Share>>({});
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (props.value.length > 0) {
      fetch({ input: props.value.join(",") });
    }
  }, []);

  const fetch = useMemo(
    () =>
      debounce((request: { input: string }) => {
        setLoading(true);
        dispatch(
          getShareList({
            page: 1,
            page_size: 50,
            order_by: "",
            order_direction: "desc",
            conditions: {
              share_id: request.input,
            },
          }),
        )
          .then((results) => {
            setOptions(results?.shares?.map((share) => share.id) ?? []);
            setIdShareMap((origin) => ({
              ...origin,
              ...results?.shares?.reduce(
                (acc, share) => {
                  acc[share.id] = share;
                  return acc;
                },
                {} as Record<number, Share>,
              ),
            }));
          })
          .finally(() => {
            setLoading(false);
          });
      }, 400),
    [dispatch],
  );

  useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setOptions([]);
      return undefined;
    }

    fetch({ input: inputValue });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  const handleChange = (_event: React.SyntheticEvent, value: number[]) => {
    props.onChange(value);
  };

  return (
    <DenseAutocomplete
      multiple
      value={props.value}
      options={options}
      loading={loading}
      blurOnSelect
      onChange={(_event: any, newValue: unknown) => {
        if (newValue) {
          console.log(newValue);
          props.onChange(newValue as number[]);
        }
      }}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      noOptionsText={t("application:modals.noResults")}
      renderTags={(value: readonly unknown[], getTagProps) =>
        value.map((option: unknown, index: number) => {
          const { key, ...tagProps } = getTagProps({ index });
          const share = idShareMap[option as number];
          return (
            <SquareChip
              icon={
                share ? (
                  <FileTypeIcon name={share?.edges?.file?.name ?? ""} fileType={share?.edges?.file?.type ?? 0} />
                ) : (
                  <LinkDismiss />
                )
              }
              size="small"
              label={share?.edges?.file?.name ?? t("application:share.expiredLink")}
              key={key}
              {...tagProps}
            />
          );
        })
      }
      renderOption={(props, option) => {
        const share = idShareMap[option as number];
        return (
          <li {...props}>
            <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
              {share ? (
                <FileTypeIcon name={share?.edges?.file?.name ?? ""} fileType={share?.edges?.file?.type ?? 0} />
              ) : (
                <LinkDismiss />
              )}
              <NoWrapBox
                sx={{
                  fontSize: (theme) => theme.typography.body2.fontSize,
                  width: "100%",
                  ml: 2,
                }}
              >
                {share?.edges?.file?.name ?? t("application:share.expiredLink")}
              </NoWrapBox>
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <DenseFilledTextField
          {...params}
          sx={{
            "& .MuiInputBase-root": {},
            "& .MuiInputBase-root.MuiOutlinedInput-root": {
              paddingTop: theme.spacing(0.6),
              paddingBottom: theme.spacing(0.6),
            },
            mt: 0,
          }}
          variant="outlined"
          margin="dense"
          placeholder={t("dashboard:settings.searchShare")}
          type="text"
          fullWidth
        />
      )}
    />
  );
};

export default SharesInput;
