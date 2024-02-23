import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import { makeStyles } from "@material-ui/core/styles";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme) => ({
    cardContainer: {
        display: "flex",
    },
    cover: {
        width: 100,
        height: 60,
    },
    card: {},
    content: {
        flex: "1 0 auto",
    },
    bg: {
        backgroundColor: theme.palette.background.default,
        padding: "24px 24px",
    },
    dialogFooter: {
        justifyContent: "space-between",
    },
}));

const policies = [
    {
        name: "local",
        img: "local.png",
        path: "/admin/policy/add/local",
    },
    {
        name: "remote",
        img: "remote.png",
        path: "/admin/policy/add/remote",
    },
    {
        name: "qiniu",
        img: "qiniu.png",
        path: "/admin/policy/add/qiniu",
    },
    {
        name: "oss",
        img: "oss.png",
        path: "/admin/policy/add/oss",
    },
    {
        name: "upyun",
        img: "upyun.png",
        path: "/admin/policy/add/upyun",
    },
    {
        name: "cos",
        img: "cos.png",
        path: "/admin/policy/add/cos",
    },
    {
        name: "onedrive",
        img: "onedrive.png",
        path: "/admin/policy/add/onedrive",
    },
    {
        name: "s3",
        img: "s3.png",
        path: "/admin/policy/add/s3",
    },
];

export default function AddPolicy({ open, onClose }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "policy" });
    const { t: tCommon } = useTranslation("common");
    const classes = useStyles();

    const location = useHistory();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={"sm"}
            fullWidth
        >
            <DialogTitle id="alert-dialog-title">
                {t("selectAStorageProvider")}
            </DialogTitle>
            <DialogContent dividers className={classes.bg}>
                <Grid container spacing={2}>
                    {policies.map((v, index) => (
                        <Grid key={index} item sm={12} md={6}>
                            <Card className={classes.card}>
                                <CardActionArea
                                    onClick={() => {
                                        location.push(v.path);
                                        onClose();
                                    }}
                                    className={classes.cardContainer}
                                >
                                    <CardMedia
                                        className={classes.cover}
                                        image={"/static/img/" + v.img}
                                    />
                                    <CardContent className={classes.content}>
                                        <Typography
                                            variant="subtitle1"
                                            color="textSecondary"
                                        >
                                            {t(v.name)}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions className={classes.dialogFooter}>
                <Button
                    onClick={() =>
                        window.open(t("comparesStoragePoliciesLink"))
                    }
                    color="primary"
                >
                    {t("comparesStoragePolicies")}
                </Button>
                <Button onClick={onClose} color="primary">
                    {tCommon("cancel")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
