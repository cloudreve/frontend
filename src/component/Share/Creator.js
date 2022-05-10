import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import { useHistory } from "react-router";
import Link from "@material-ui/core/Link";
import { formatLocalTime } from "../../utils/datetime";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    boxHeader: {
        textAlign: "center",
        padding: 24,
    },
    avatar: {
        backgroundColor: theme.palette.secondary.main,
        margin: "0 auto",
        width: 50,
        height: 50,
        cursor: "pointer",
    },
    shareDes: {
        marginTop: 12,
    },
    shareInfo: {
        color: theme.palette.text.disabled,
        fontSize: 14,
    },
}));

export default function Creator(props) {
    const { t } = useTranslation("application", { keyPrefix: "share" });
    const classes = useStyles();
    const history = useHistory();

    const getSecondDes = () => {
        if (props.share.expire > 0) {
            if (props.share.expire >= 24 * 3600) {
                return t("expireInXDays", {
                    num: Math.round(props.share.expire / (24 * 3600)),
                });
            }

            return t("expireInXHours", {
                num: Math.round(props.share.expire / 3600),
            });
        }
        return formatLocalTime(props.share.create_date);
    };

    const userProfile = () => {
        history.push("/profile/" + props.share.creator.key);
        props.onClose && props.onClose();
    };

    return (
        <div className={classes.boxHeader}>
            <Avatar
                className={classes.avatar}
                alt={props.share.creator.nick}
                src={"/api/v3/user/avatar/" + props.share.creator.key + "/l"}
                onClick={() => userProfile()}
            />
            <Typography variant="h6" className={classes.shareDes}>
                {props.isFolder && (
                    <Trans
                        i18nKey="share.createdBy"
                        values={{
                            nick: props.share.creator.nick,
                        }}
                        components={[
                            <Link
                                key={0}
                                onClick={() => userProfile()}
                                href={"javascript:void(0)"}
                                color="inherit"
                            />,
                        ]}
                    />
                )}
                {!props.isFolder && (
                    <Trans
                        i18nKey="share.sharedBy"
                        values={{
                            num: 1,
                            nick: props.share.creator.nick,
                        }}
                        components={[
                            <Link
                                key={0}
                                onClick={() => userProfile()}
                                href={"javascript:void(0)"}
                                color="inherit"
                            />,
                        ]}
                    />
                )}
            </Typography>
            <Typography className={classes.shareInfo}>
                {t("statistics", {
                    views: props.share.views,
                    downloads: props.share.downloads,
                    time: getSecondDes(),
                })}
            </Typography>
        </div>
    );
}
