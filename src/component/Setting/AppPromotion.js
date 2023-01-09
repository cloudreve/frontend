import React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Trans, useTranslation } from "react-i18next";
import { useTheme, fade } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { useSelector } from "react-redux";
import Link from "@material-ui/core/Link";
import AppQRCode from "./AppQRCode";

const PhoneSkeleton = () => {
    const theme = useTheme();

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x={0}
            y={0}
            enableBackground="new 0 0 444 908"
            viewBox="0 0 444 908"
        >
            <path
                fill={theme.palette.background.paper}
                stroke={theme.palette.divider}
                strokeMiterlimit="10"
                d="M378.8.5H65.6C29.6.5.5 29.6.5 65.6V843c0 35.9 29.1 65.1 65.1 65.1h313.2c35.9 0 65.1-29.1 65.1-65.1V65.6c0-36-29.2-65.1-65.1-65.1zm46.5 838.8c0 28-21.8 50.7-48.8 50.7H67.9c-26.9 0-48.8-22.7-48.8-50.7V74.1c0-28 21.8-50.7 48.8-50.7h35.3c4 0 7.2 3.4 7.2 7.5 0 14.9 11.6 27 26 27h171.5c14.4.1 26-12 26-27 0-4.1 3.2-7.5 7.2-7.5h35.4c26.9 0 48.8 22.7 48.8 50.7v765.2z"
            ></path>
            <path
                fill="none"
                stroke={theme.palette.divider}
                strokeMiterlimit="10"
                strokeWidth="4"
                d="M243.3 37.3h-46.4c-2 0-3.6-1.6-3.6-3.6h0c0-2 1.6-3.6 3.6-3.6h46.4c2 0 3.6 1.6 3.6 3.6h0c0 2-1.6 3.6-3.6 3.6z"
            ></path>
            <circle
                cx="270"
                cy="33.7"
                r="5.5"
                fill="none"
                stroke={theme.palette.divider}
                strokeMiterlimit="10"
                strokeWidth="4"
            ></circle>
        </svg>
    );
};

const useStyles = makeStyles((theme) => ({
    phoneContainer: {
        maxWidth: 450,
        position: "relative",
        marginX: "auto",
        perspective: 1500,
        transformStyle: "preserve-3d",
        perspectiveOrigin: 0,
    },
    phoneFrame: {
        position: "relative",
        borderRadius: "2.75rem",
        boxShadow: 1,
        width: "75% !important",
        marginX: "auto",
        transform: "rotateY(-35deg) rotateX(15deg) translateZ(0)",
    },
    phoneImage: {
        objectFit: "cover",
        borderRadius: "2.5rem",
        filter: theme.palette.type === "dark" ? "brightness(0.7)" : "none",
    },
    highlight: {
        background: `linear-gradient(180deg, transparent 82%, ${fade(
            theme.palette.secondary.main,
            0.3
        )} 0%)`,
    },
    bold: {
        fontWeight: 700,
    },
    frameContainer: {
        verticalAlign: "middle",
    },
    grid: {
        padding: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: theme.spacing(4),
    },
    "@global": {
        ol: {
            paddingInlineStart: 24,
        },
        "li::marker": {
            fontSize: "1.25rem",
        },
        li: {
            marginBottom: theme.spacing(2),
        },
    },
}));

export default function AppPromotion() {
    const { t } = useTranslation("application", { keyPrefix: "setting" });
    const theme = useTheme();
    const title = useSelector((state) => state.siteConfig.title);

    const classes = useStyles();

    return (
        <Grid container className={classes.grid}>
            <Grid item container alignItems={"center"} xs={12} md={7}>
                <Box>
                    <Box marginBottom={2}>
                        <Typography
                            variant="h4"
                            className={classes.bold}
                            color="text.primary"
                        >
                            <Trans
                                i18nKey={"setting.connectByiOS"}
                                values={{ title }}
                                components={[
                                    <Typography
                                        key={0}
                                        color={"primary"}
                                        component={"span"}
                                        variant={"inherit"}
                                        className={classes.highlight}
                                    />,
                                ]}
                            />
                        </Typography>
                    </Box>
                    <Box color="text.secondary">
                        <ol>
                            <li>
                                <Typography variant="h6" component="p">
                                    {t("downloadOurApp")}
                                </Typography>
                                <Box marginTop={1}>
                                    <Box
                                        component={"a"}
                                        href={
                                            "https://apps.apple.com/us/app/cloudreve/id1619480823"
                                        }
                                        target={"_blank"}
                                    >
                                        <Box
                                            component={"img"}
                                            src={"/static/img/appstore.svg"}
                                        />
                                    </Box>
                                </Box>
                            </li>
                            <li>
                                <Typography variant="h6" component="p">
                                    {t("fillInEndpoint")}
                                </Typography>
                                <Box marginTop={1}>
                                    <AppQRCode />
                                </Box>
                            </li>
                            <li>
                                <Typography variant="h6" component="p">
                                    {t("loginApp")}
                                </Typography>
                            </li>
                        </ol>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={5}>
                <Box className={classes.phoneContainer}>
                    <Box className={classes.phoneFrame}>
                        <Box>
                            <Box
                                position={"relative"}
                                zIndex={2}
                                maxWidth={1}
                                height={"auto"}
                                className={classes.frameContainer}
                            >
                                <PhoneSkeleton />
                            </Box>
                            <Box
                                position={"absolute"}
                                top={"2.4%"}
                                left={"4%"}
                                width={"92.4%"}
                                height={"96%"}
                            >
                                <Box
                                    component={"img"}
                                    src={
                                        "https://cloudreve.org/imgs/ios/" +
                                        (theme.palette.type === "light"
                                            ? "main.png"
                                            : "main_dark.jpg")
                                    }
                                    alt="Image Description"
                                    effect="blur"
                                    width={1}
                                    height={1}
                                    className={classes.phoneImage}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}
