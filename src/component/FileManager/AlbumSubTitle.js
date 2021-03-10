import React from "react";
import {makeStyles} from "@material-ui/core";

const useStyles = makeStyles(() => ({
    container: {
        padding: "7px"
    },
    fixFlex: {
        minWidth: 0
    },
    dragging: {
        opacity: 0.4
    },
    dateSubTitle: {
        fontSize:"16px",
        padding:"16px 0 16px 6px"
    },
    dateSubTitleDate: {
        color:'#000'
    },
    dateSubTitleLocation: {
        color:"#6b6b6b"
    }
}));

export default function AlbumSubTitle(props) {
    const dateText = props.date;
    const locationText = props.location
    const classes = useStyles();

    return (
        <div className={classes.dateSubTitle} >
            <div className={classes.dateSubTitleDate}>{dateText}  <small className={classes.dateSubTitleLocation}>{locationText}</small></div>
        </div>
    );
}
