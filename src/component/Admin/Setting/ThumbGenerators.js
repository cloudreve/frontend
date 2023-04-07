import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../redux/explorer";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { Button, TextField } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import API from "../../../middleware/Api";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    column: {
        flexBasis: "33.33%",
    },
    details: {
        display: "block",
    },
}));

const generators = [
    {
        name: "policyBuiltin",
        des: "policyBuiltinDes",
        readOnly: true,
    },
    {
        name: "libreOffice",
        des: "libreOfficeDes",
        enableFlag: "thumb_libreoffice_enabled",
        executableSetting: "thumb_libreoffice_path",
        inputs: [
            {
                name: "thumb_libreoffice_exts",
                label: "generatorExts",
                des: "generatorExtsDes",
            },
        ],
    },
    {
        name: "vips",
        des: "vipsDes",
        enableFlag: "thumb_vips_enabled",
        executableSetting: "thumb_vips_path",
        inputs: [
            {
                name: "thumb_vips_exts",
                label: "generatorExts",
                des: "generatorExtsDes",
            },
        ],
    },
    {
        name: "ffmpeg",
        des: "ffmpegDes",
        enableFlag: "thumb_ffmpeg_enabled",
        executableSetting: "thumb_ffmpeg_path",
        inputs: [
            {
                name: "thumb_ffmpeg_exts",
                label: "generatorExts",
                des: "generatorExtsDes",
            },
            {
                name: "thumb_ffmpeg_seek",
                label: "ffmpegSeek",
                des: "ffmpegSeekDes",
                required: true,
            },
        ],
    },
    {
        name: "cloudreveBuiltin",
        des: "cloudreveBuiltinDes",
        enableFlag: "thumb_builtin_enabled",
    },
];

export default function ThumbGenerators({ options, setOptions }) {
    const classes = useStyles();
    const { t } = useTranslation("dashboard", { keyPrefix: "settings" });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
        });
    };

    const testExecutable = (name, executable) => {
        setLoading(true);
        API.post("/admin/test/thumb", {
            name,
            executable,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    t("executableTestSuccess", { version: response.data }),
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

    const handleEnableChange = (name) => (event) => {
        const newOpts = {
            ...options,
            [name]: event.target.checked ? "1" : "0",
        };
        setOptions(newOpts);

        if (
            newOpts["thumb_libreoffice_enabled"] === "1" &&
            newOpts["thumb_builtin_enabled"] === "0" &&
            newOpts["thumb_vips_enabled"] === "0"
        ) {
            ToggleSnackbar(
                "top",
                "center",
                t("thumbDependencyWarning"),
                "warning"
            );
        }
    };

    return (
        <div className={classes.root}>
            {generators.map((generator) => (
                <Accordion key={generator.name}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-label="Expand"
                        aria-controls="additional-actions1-content"
                        id="additional-actions1-header"
                    >
                        <FormControlLabel
                            aria-label="Acknowledge"
                            onClick={(event) => event.stopPropagation()}
                            onFocus={(event) => event.stopPropagation()}
                            control={
                                <Checkbox
                                    checked={
                                        generator.readOnly ||
                                        options[generator.enableFlag] === "1"
                                    }
                                    onChange={handleEnableChange(
                                        generator.enableFlag
                                    )}
                                />
                            }
                            label={t(generator.name)}
                            disabled={generator.readOnly}
                        />
                    </AccordionSummary>
                    <AccordionDetails className={classes.details}>
                        <Typography color="textSecondary">
                            {t(generator.des)}
                        </Typography>
                        {generator.executableSetting && (
                            <FormControl margin="normal" fullWidth>
                                <TextField
                                    label={t("executable")}
                                    variant="outlined"
                                    value={options[generator.executableSetting]}
                                    onChange={handleChange(
                                        generator.executableSetting
                                    )}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button
                                                    disabled={loading}
                                                    onClick={() =>
                                                        testExecutable(
                                                            generator.name,
                                                            options[
                                                                generator
                                                                    .executableSetting
                                                            ]
                                                        )
                                                    }
                                                    color="primary"
                                                >
                                                    {t("executableTest")}
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    {t("executableDes")}
                                </FormHelperText>
                            </FormControl>
                        )}
                        {generator.inputs &&
                            generator.inputs.map((input) => (
                                <FormControl
                                    key={input.name}
                                    margin="normal"
                                    fullWidth
                                >
                                    <TextField
                                        label={t(input.label)}
                                        variant="outlined"
                                        value={options[input.name]}
                                        onChange={handleChange(input.name)}
                                        required={!!input.required}
                                    />
                                    <FormHelperText id="component-helper-text">
                                        {t(input.des)}
                                    </FormHelperText>
                                </FormControl>
                            ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
}
