import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import TableBody from "@material-ui/core/TableBody";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { useTranslation } from "react-i18next";

const magicVars = [
    {
        value: "{randomkey16}",
        des: "16digitsRandomString",
        example: "N6IimT5XZP324ACK",
        fileOnly: false,
    },
    {
        value: "{randomkey8}",
        des: "8digitsRandomString",
        example: "gWz78q30",
        fileOnly: false,
    },
    {
        value: "{timestamp}",
        des: "secondTimestamp",
        example: "1582692933",
        fileOnly: false,
    },
    {
        value: "{timestamp_nano}",
        des: "nanoTimestamp",
        example: "1582692933231834600",
        fileOnly: false,
    },
    {
        value: "{uid}",
        des: "uid",
        example: "1",
        fileOnly: false,
    },
    {
        value: "{originname}",
        des: "originalFileName",
        example: "MyPico.mp4",
        fileOnly: true,
    },
    {
        value: "{originname_without_ext}",
        des: "originFileNameNoext",
        example: "MyPico",
        fileOnly: true,
    },
    {
        value: "{ext}",
        des: "extension",
        example: ".jpg",
        fileOnly: true,
    },
    {
        value: "{uuid}",
        des: "uuidV4",
        example: "31f0a770-659d-45bf-a5a9-166c06f33281",
        fileOnly: true,
    },
    {
        value: "{date}",
        des: "date",
        example: "20060102",
        fileOnly: false,
    },
    {
        value: "{datetime}",
        des: "dateAndTime",
        example: "20060102150405",
        fileOnly: false,
    },
    {
        value: "{year}",
        des: "year",
        example: "2006",
        fileOnly: false,
    },
    {
        value: "{month}",
        des: "month",
        example: "01",
        fileOnly: false,
    },
    {
        value: "{day}",
        des: "day",
        example: "02",
        fileOnly: false,
    },
    {
        value: "{hour}",
        des: "hour",
        example: "15",
        fileOnly: false,
    },
    {
        value: "{minute}",
        des: "minute",
        example: "04",
        fileOnly: false,
    },
    {
        value: "{second}",
        des: "second",
        example: "05",
        fileOnly: false,
    },
];

export default function MagicVar({ isFile, open, onClose, isSlave }) {
    const { t } = useTranslation("dashboard", { keyPrefix: "policy.magicVar" });
    const { t: tCommon } = useTranslation("common");
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {isFile ? t("fileNameMagicVar") : t("pathMagicVar")}
            </DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("variable")}</TableCell>
                                <TableCell>{t("description")}</TableCell>
                                <TableCell>{t("example")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {magicVars.map((m) => {
                                if (!m.fileOnly || isFile) {
                                    return (
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {m.value}
                                            </TableCell>
                                            <TableCell>{t(m.des)}</TableCell>
                                            <TableCell>{m.example}</TableCell>
                                        </TableRow>
                                    );
                                }
                            })}
                            {!isFile && (
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        {"{path}"}
                                    </TableCell>
                                    <TableCell>{t("userUploadPath")}</TableCell>
                                    <TableCell>/MyFile/Documents/</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {tCommon("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
