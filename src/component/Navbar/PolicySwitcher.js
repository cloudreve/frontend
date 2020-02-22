import React, { useCallback } from "react";
import {Avatar, IconButton, ListItem, ListItemAvatar, ListItemText, makeStyles} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {
    Nas
} from "mdi-material-ui";
import Popover from "@material-ui/core/Popover";
import API from "../../middleware/Api";
import {useDispatch} from "react-redux";
import {toggleSnackbar} from "../../actions";
import {Check} from "@material-ui/icons";
import Backup from "@material-ui/icons/Backup";
import {blue, green} from "@material-ui/core/colors";
import List from "@material-ui/core/List";

const useStyles = makeStyles(theme => ({
    uploadFromFile: {
        backgroundColor: blue[100],
        color: blue[600]
    },
    policySelected: {
        backgroundColor: green[100],
        color: green[800]
    },
}));

const PolicySwitcher = (props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [policies, setPolicies] = React.useState({
        current:{id:"",name:""},
        options:[],
    });

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const handleClick = event => {
        if(policies.current.id === ""){
            API.get("/user/setting/policies", {})
                .then(response => {
                    setPolicies(response.data);
                })
                .catch(error => {
                    ToggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const switchTo = id =>{
        if(id === policies.current.id){
            handleClose();
            return;
        }
        API
            .patch("/user/setting/policy", {
                id: id
            })
            .then(response => {
                window.location.reload();
            })
            .catch(error => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: ""
                });
            });
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const classes = useStyles();
    return (
        <>
        <Tooltip
            title={"存储策略"}
            placement="bottom"
        >
            <IconButton
                onClick={handleClick}
                 color="inherit">
                <Nas/>
            </IconButton>
        </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <List>
                    {policies.options.map(
                        (value, index) => (
                            <ListItem
                                button
                                component="label"
                                key={index}
                                onClick={()=>switchTo(value.id)}
                            >
                                <ListItemAvatar>
                                    {value.id === policies.current.id &&
                                    <Avatar className={classes.policySelected}>
                                        <Check />
                                    </Avatar>
                                    }
                                    {value.id !== policies.current.id &&
                                    <Avatar className={classes.uploadFromFile}>
                                        <Backup />
                                    </Avatar>
                                    }

                                </ListItemAvatar>
                                <ListItemText primary={value.name} />
                            </ListItem>
                        )
                    )}
                </List>
            </Popover>
        </>
    );
};

export default PolicySwitcher;
