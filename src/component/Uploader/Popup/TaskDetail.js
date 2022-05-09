import React from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { sizeToString } from "../../../utils";
import Link from "@material-ui/core/Link";
import TimeAgo from "timeago-react";
import { Status } from "../core/uploader/base";
import { Trans, useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    infoTitle: {
        fontWeight: 700,
    },
    infoValue: {
        color: theme.palette.text.secondary,
        wordBreak: "break-all",
    },
}));

export default function TaskDetail({ uploader, navigateToDst, error }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const items = [
        {
            name: t("uploader.fileName"),
            value: uploader.task.name,
        },
        {
            name: t("uploader.fileSize"),
            value: `${sizeToString(uploader.task.size)} ${
                uploader.task.session && uploader.task.session.chunkSize > 0
                    ? t("uploader.chunkDescription", {
                          total: uploader.task.chunkProgress.length,
                          size: sizeToString(uploader.task.session.chunkSize),
                      })
                    : t("uploader.noChunks")
            }`,
        },
        {
            name: t("fileManager.storagePolicy"),
            value: uploader.task.policy.name,
        },
        {
            name: t("uploader.destination"),
            value: (
                <Link
                    href={"javascript:void"}
                    onClick={() => navigateToDst(uploader.task.dst)}
                >
                    {uploader.task.dst === "/"
                        ? t("uploader.rootFolder")
                        : uploader.task.dst}
                </Link>
            ),
        },
        uploader.task.session
            ? {
                  name: t("uploader.uploadSession"),
                  value: (
                      <>
                          <Trans
                              i18nKey="uploader.sessionExpiredIn"
                              components={[
                                  <TimeAgo
                                      key={0}
                                      datetime={
                                          uploader.task.session
                                              ? uploader.task.session.expires *
                                                1000
                                              : 0
                                      }
                                      locale={t("timeAgoLocaleCode", {
                                          ns: "common",
                                      })}
                                  />,
                              ]}
                          />
                      </>
                  ),
              }
            : null,
        uploader.status === Status.error
            ? {
                  name: t("uploader.errorDetails"),
                  value: error,
              }
            : null,
    ];
    return (
        <Grid container>
            {items.map((i) => (
                <>
                    {i && (
                        <Grid key={i.name} container xs={12}>
                            <Grid item xs={3} className={classes.infoTitle}>
                                {i.name}
                            </Grid>
                            <Grid item xs={9} className={classes.infoValue}>
                                {i.value}
                            </Grid>
                        </Grid>
                    )}
                </>
            ))}
        </Grid>
    );
}
