import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Avatar, Typography} from "@material-ui/core";

const useStyles = makeStyles(theme=>({
    boxHeader: {
        textAlign: "center",
        padding: 24
    },
    avatar: {
        backgroundColor: theme.palette.secondary.main,
        margin: "0 auto",
        width: 50,
        height: 50
    },
    shareDes: {
        marginTop: 12
    },
    shareInfo: {
        color: theme.palette.text.disabled,
        fontSize: 14
    },
}));

export default function Creator(props) {
    const classes = useStyles();

    const getSecondDes = () => {
        if (props.share.expire > 0) {
            if (props.share.expire >= 24 * 3600) {
                return (
                    Math.round(props.share.expire / (24 * 3600)) +
                    " 天后到期"
                );
            }
            return Math.round(props.share.expire / 3600) + " 小时后到期";
        }
        return props.share.create_date;
    };

    return (
        <div className={classes.boxHeader}>
            <Avatar
                className={classes.avatar}
                alt={props.share.creator.nick}
                src={
                    "/api/v3/user/avatar/"+props.share.creator.key + "/l"
                }
            />
            <Typography
                variant="h6"
                className={classes.shareDes}
            >
                {props.isFolder&&<>此分享由 {props.share.creator.nick} 创建</>}
                {!props.isFolder&&<> {props.share.creator.nick} 向您分享了 1 个文件</>}
            </Typography>
            <Typography className={classes.shareInfo}>
                {props.share.views} 次浏览 •{" "}
                {props.share.downloads} 次下载 •{" "}
                {getSecondDes()}
            </Typography>
        </div>
    )
}