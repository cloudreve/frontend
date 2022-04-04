import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PackageVariant } from "mdi-material-ui";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    emptyContainer: {
        bottom: "0",

        color: theme.palette.text.disabled,
        textAlign: "center",
        paddingTop: "20px",
    },
    emptyInfoBig: {
        fontSize: "25px",
        color: theme.palette.text.disabled,
    },
    emptyInfoSmall: {
        color: theme.palette.text.hint,
    },
}));

export default function Nothing({ primary, secondary, top = 20, size = 1 }) {
    const classes = useStyles();
    return (
        <div
            style={{
                margin: `${50 * size}px auto`,
                paddingTop: top,
            }}
            className={classes.emptyContainer}
        >
            <PackageVariant
                style={{
                    fontSize: 160 * size,
                }}
            />
            <div
                style={{
                    fontSize: 25 * size,
                }}
                className={classes.emptyInfoBig}
            >
                {primary}
            </div>
            {secondary !== "" && (
                <div className={classes.emptyInfoSmall}>{secondary}</div>
            )}
        </div>
    );
}
