import { useTranslation } from "react-i18next";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Typography } from "@material-ui/core";
import { useHistory } from "react-router";
import Link from "@material-ui/core/Link";
import { formatLocalTime } from "../../utils/datetime";

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
    const classes = useStyles();
    const history = useHistory();

    const { t } = useTranslation();

    const getSecondDes = () => {
        if (props.share.expire > 0) {
            if (props.share.expire >= 24 * 3600) {
                return Math.round(props.share.expire / (24 * 3600)) + t('Expires in days');
            }
            return Math.round(props.share.expire / 3600) + t('Expires in hours');
        }
        return formatLocalTime(props.share.create_date, "YYYY-MM-DD H:mm:ss");
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
                  (<>
                    {t('This is shared by')}{" "}
                    <Link
                        onClick={() => userProfile()}
                        href={"javascript:void(0)"}
                        color="inherit"
                    >
                        {props.share.creator.nick}
                    </Link>{" "}
                    {t('create')}
                  </>)
              )}
              {!props.isFolder && (
                  (<>
                    {" "}
                    <Link
                        onClick={() => userProfile()}
                        href={"javascript:void(0)"}
                        color="inherit"
                    >
                        {props.share.creator.nick}
                    </Link>{" "}
                    {t('Shared a file with you')}
                  </>)
              )}
          </Typography>
          <Typography className={classes.shareInfo}>
            {props.share.views} {t('Views •')} {props.share.downloads} {t('Downloads •')}{" "}
            {getSecondDes()}
          </Typography>
      </div>
    );
}
