import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { setSearchPopup } from "../../../redux/globalStateSlice.ts";
import {
  Box,
  debounce,
  Dialog,
  Divider,
  Grow,
  IconButton,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { OutlineIconTextField } from "../../Common/Form/OutlineIconTextField.tsx";
import { SearchOutlined } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { FileManagerIndex } from "../FileManager.tsx";
import { FileResponse } from "../../../api/explorer.ts";
import Fuse from "fuse.js";
import AutoHeight from "../../Common/AutoHeight.tsx";
import FuzzySearchResult from "./FuzzySearchResult.tsx";
import CrUri, { Filesystem } from "../../../util/uri.ts";
import SessionManager from "../../../session";
import { defaultPath } from "../../../hooks/useNavigation.tsx";
import FullSearchOption from "./FullSearchOptions.tsx";
import { TransitionProps } from "@mui/material/transitions";
import { openAdvancedSearch, quickSearch } from "../../../redux/thunks/filemanager.ts";
import Options from "../../Icons/Options.tsx";

const StyledDialog = styled(Dialog)<{
  expanded?: boolean;
}>(({ theme, expanded }) => ({
  "& .MuiDialog-container": {
    alignItems: "flex-start",
    height: expanded ? "100%" : "initial",
  },
  zIndex: theme.zIndex.modal - 1,
}));

const StyledOutlinedIconTextFiled = styled(OutlineIconTextField)(() => ({
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

export const GrowDialogTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

const SearchPopup = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [keywords, setKeywords] = useState("");
  const [searchedKeyword, setSearchedKeyword] = useState("");
  const [treeSearchResults, setTreeSearchResults] = useState<FileResponse[]>([]);

  const onClose = () => {
    dispatch(setSearchPopup(false));
    setKeywords("");
    setSearchedKeyword("");
  };

  const open = useAppSelector((state) => state.globalState.searchPopupOpen);
  const tree = useAppSelector((state) => state.fileManager[FileManagerIndex.main]?.tree);
  const path = useAppSelector((state) => state.fileManager[FileManagerIndex.main]?.path);
  const single_file_view = useAppSelector((state) => state.fileManager[FileManagerIndex.main]?.list?.single_file_view);

  const searchTree = useMemo(
    () =>
      debounce((request: { input: string }, callback: (results?: FileResponse[]) => void) => {
        const options = {
          includeScore: true,
          // Search in `author` and in `tags` array
          keys: ["file.name"],
        };
        const fuse = new Fuse(Object.values(tree), options);
        const result = fuse.search(
          request.input
            .split(" ")
            .filter((k) => k != "")
            .join(" "),
          { limit: 50 },
        );
        const res: FileResponse[] = [];
        result
          .filter((r) => r.item.file != undefined)
          .forEach((r) => {
            if (r.item.file) {
              res.push(r.item.file);
            }
          });
        callback(res);
      }, 400),
    [tree],
  );

  useEffect(() => {
    let active = true;

    if (keywords === "" || keywords.length < 2) {
      setTreeSearchResults([]);
      setSearchedKeyword("");
      return undefined;
    }

    searchTree({ input: keywords }, (results?: FileResponse[]) => {
      if (active) {
        setTreeSearchResults(results ?? []);
        setSearchedKeyword(keywords);
      }
    });
    return () => {
      active = false;
    };
  }, [keywords, setSearchedKeyword, searchTree]);

  const fullSearchOptions = useMemo(() => {
    if (!open || !keywords) {
      return [];
    }

    const res: string[] = [];
    const current = new CrUri(path ?? defaultPath);
    // current folder - not currently in root
    if (!current.is_root()) {
      res.push(current.toString());
    }
    // current root - not in single file view
    if (!single_file_view) {
      res.push(current.base());
    }
    // my files - user login and not my fs
    if (SessionManager.currentLoginOrNull() && !(current.fs() == Filesystem.my)) {
      res.push(defaultPath);
    }
    return res;
  }, [open, path, single_file_view, keywords]);

  const onEnter = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.stopPropagation();
        e.preventDefault();
        if (fullSearchOptions.length > 0) {
          dispatch(quickSearch(FileManagerIndex.main, fullSearchOptions[0], keywords));
        }
      }
    },
    [fullSearchOptions, keywords],
  );

  return (
    <StyledDialog
      TransitionComponent={GrowDialogTransition}
      fullWidth
      expanded={!!keywords}
      maxWidth={"md"}
      open={!!open}
      onClose={onClose}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <StyledOutlinedIconTextFiled
          icon={<SearchOutlined />}
          variant="outlined"
          autoFocus
          onKeyDown={onEnter}
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder={t("navbar.searchFiles")}
          fullWidth
        />
        <Tooltip title={t("application:navbar.advancedSearch")}>
          <IconButton
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
            }}
            onClick={() => dispatch(openAdvancedSearch(FileManagerIndex.main, keywords))}
          >
            <Options />
          </IconButton>
        </Tooltip>
      </Box>

      {keywords && <Divider />}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <AutoHeight>
          {fullSearchOptions.length > 0 && (
            <>
              <Typography
                variant={"body2"}
                color={"textSecondary"}
                sx={{
                  px: 3,
                  pt: 1.5,
                  fontWeight: 600,
                }}
              >
                {t("navbar.searchFilesTitle")}
              </Typography>
              <FullSearchOption keyword={keywords} options={fullSearchOptions} />
              {treeSearchResults.length > 0 && <Divider />}
            </>
          )}
          {treeSearchResults.length > 0 && (
            <>
              <Typography
                variant={"body2"}
                color={"textSecondary"}
                sx={{
                  px: 3,
                  pt: 1.5,
                  fontWeight: 600,
                }}
              >
                {t("navbar.recentlyViewed")}
              </Typography>
              <FuzzySearchResult keyword={searchedKeyword} files={treeSearchResults} />
            </>
          )}
        </AutoHeight>
      </Box>
    </StyledDialog>
  );
};

export default SearchPopup;
