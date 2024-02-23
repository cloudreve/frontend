import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Paper, useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useLocation, useParams, useRouteMatch } from "react-router";
import API from "../../middleware/Api";
import { useDispatch } from "react-redux";
import pathHelper from "../../utils/page";
import SaveButton from "../Dial/Save";
import { codePreviewSuffix } from "../../config";
import TextLoading from "../Placeholder/TextLoading";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { toggleSnackbar } from "../../redux/explorer";
import UseFileSubTitle from "../../hooks/fileSubtitle";
import { useTranslation } from "react-i18next";

const MonacoEditor = React.lazy(() =>
    import(/* webpackChunkName: "codeEditor" */ "react-monaco-editor")
);

const useStyles = makeStyles((theme) => ({
    layout: {
        width: "auto",
        marginTop: "30px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto",
        },
        marginBottom: 40,
    },
    editor: {
        borderRadius: theme.shape.borderRadius,
    },
    "@global": {
        ".overflow-guard": {
            borderRadius: "0 0 12px 12px!important",
        },
    },
    formControl: {
        margin: "8px 16px 8px 16px",
    },
    toobar: {
        textAlign: "right",
    },
}));

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function CodeViewer() {
    const { t } = useTranslation();
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [suffix, setSuffix] = useState("javascript");
    const [wordWrap, setWordWrap] = useState("off");

    const math = useRouteMatch();
    const location = useLocation();
    const query = useQuery();
    const { id } = useParams();
    const theme = useTheme();
    const { title } = UseFileSubTitle(query, math, location);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        const extension = title.split(".");
        setSuffix(codePreviewSuffix[extension.pop()]);
        // eslint-disable-next-line
    }, [title]);

    useEffect(() => {
        let requestURL = "/file/content/" + query.get("id");
        if (pathHelper.isSharePage(location.pathname)) {
            requestURL = "/share/content/" + id;
            if (query.get("share_path") !== "") {
                requestURL +=
                    "?path=" + encodeURIComponent(query.get("share_path"));
            }
        }

        setLoading(true);
        API.get(requestURL, { responseType: "arraybuffer" })
            .then((response) => {
                const buffer = new Buffer(response.rawData, "binary");
                const textdata = buffer.toString(); // for string
                setContent(textdata);
            })
            .catch((error) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("fileManager.errorReadFileContent", {
                        msg: error.message,
                    }),
                    "error"
                );
            })
            .then(() => {
                setLoading(false);
            });
        // eslint-disable-next-line
    }, [math.params[0]]);

    const save = () => {
        setStatus("loading");
        API.put("/file/update/" + query.get("id"), content)
            .then(() => {
                setStatus("success");
                setTimeout(() => setStatus(""), 2000);
            })
            .catch((error) => {
                setStatus("");
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const classes = useStyles();
    const isSharePage = pathHelper.isSharePage(location.pathname);
    return (
        <div className={classes.layout}>
            <Paper className={classes.root} elevation={1}>
                <div className={classes.toobar}>
                    <FormControl className={classes.formControl}>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={(e) =>
                                        setWordWrap(
                                            e.target.checked ? "on" : "off"
                                        )
                                    }
                                />
                            }
                            label={t("fileManager.wordWrap")}
                        />
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={suffix}
                            onChange={(e) => setSuffix(e.target.value)}
                        >
                            {Array.from(
                                new Set(
                                    Object.keys(codePreviewSuffix).map((k) => {
                                        return codePreviewSuffix[k];
                                    })
                                )
                            ).map((extension, index) => (
                                // eslint-disable-next-line react/jsx-key
                                <MenuItem value={extension} key={index}>
                                    {extension}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <Divider />
                {loading && <TextLoading />}
                {!loading && (
                    <Suspense fallback={<TextLoading />}>
                        <MonacoEditor
                            height="calc(100vh - 198px)"
                            language={suffix}
                            theme={
                                theme.palette.type === "dark" ? "vs-dark" : "vs"
                            }
                            value={content}
                            options={{
                                readOnly: isSharePage,
                                extraEditorClassName: classes.editor,
                                wordWrap: wordWrap,
                            }}
                            onChange={(value) => setContent(value)}
                        />
                    </Suspense>
                )}
            </Paper>
            {!isSharePage && <SaveButton onClick={save} status={status} />}
        </div>
    );
}
