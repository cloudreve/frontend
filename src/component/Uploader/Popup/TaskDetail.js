import React, { useCallback, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { formatLocalTime } from "../../../utils/datetime";
import { sizeToString } from "../../../utils";
import Link from "@material-ui/core/Link";
import TimeAgo from "timeago-react";
import { Status } from "../core/uploader/base";

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
    const classes = useStyles();
    const items = [
        {
            name: "文件名",
            value: uploader.task.name,
        },
        {
            name: "文件大小",
            value: `${sizeToString(uploader.task.size)} ${
                uploader.task.session && uploader.task.session.chunkSize > 0
                    ? `(${
                          uploader.task.chunkProgress.length
                      } 个分片, 每个分片 ${sizeToString(
                          uploader.task.session.chunkSize
                      )})`
                    : "(无分片)"
            }`,
        },
        {
            name: "存储策略",
            value: uploader.task.policy.name,
        },
        {
            name: "目的路径",
            value: (
                <Link
                    href={"javascript:void"}
                    onClick={() => navigateToDst(uploader.task.dst)}
                >
                    {uploader.task.dst === "/" ? "根目录" : uploader.task.dst}
                </Link>
            ),
        },
        uploader.task.session
            ? {
                  name: "上传会话",
                  value: (
                      <>
                          <TimeAgo
                              datetime={
                                  uploader.task.session
                                      ? uploader.task.session.expires * 1000
                                      : 0
                              }
                              locale="zh_CN"
                          />
                          {"过期"}
                      </>
                  ),
              }
            : null,
        uploader.status === Status.error
            ? {
                  name: "错误信息",
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
                                {i.name}：
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
