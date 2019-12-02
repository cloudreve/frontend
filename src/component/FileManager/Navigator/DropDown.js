import React,{useEffect} from "react";
import { makeStyles } from "@material-ui/core";
import ShareIcon from '@material-ui/icons/Share'
import NewFolderIcon from '@material-ui/icons/CreateNewFolder'
import RefreshIcon from '@material-ui/icons/Refresh'
import {
    Divider,
    MenuItem,
    ListItemIcon,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
}));


export default function DropDown(props){
    const classes = useStyles();
    return (
        <>
        <MenuItem onClick={()=>props.performAction("refresh")}>
        <ListItemIcon><RefreshIcon/></ListItemIcon>
            刷新
        </MenuItem>
        {(props.keywords===null&&window.isHomePage)&&
            <div>
                <Divider/>
                <MenuItem onClick={()=>props.performAction("share")}>
                    <ListItemIcon><ShareIcon/></ListItemIcon>
                    分享
                </MenuItem>

                <MenuItem onClick={()=>props.performAction("newfolder")}>
                    <ListItemIcon><NewFolderIcon/></ListItemIcon>
                    创建文件夹
                </MenuItem>
                
            </div>
        }
        </>
    );
}