import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import React from "react";

const magicVars = [
    {
        value: "{randomkey16}",
        des: "16位随机字符",
        example: "N6IimT5XZP324ACK",
        fileOnly: false,
    },
    {
        value: "{randomkey8}",
        des: "8位随机字符",
        example: "gWz78q30",
        fileOnly: false,
    },
    {
        value: "{timestamp}",
        des: "秒级时间戳",
        example: "1582692933",
        fileOnly: false,
    },
    {
        value: "{timestamp_nano}",
        des: "纳秒级时间戳",
        example: "1582692933231834600",
        fileOnly: false,
    },
    {
        value: "{uid}",
        des: "用户ID",
        example: "1",
        fileOnly: false,
    },
    {
        value: "{originname}",
        des: "原始文件名",
        example: "MyPico.mp4",
        fileOnly: true,
    },
    {
        value: "{ext}",
        des: "文件扩展名",
        example: ".jpg",
        fileOnly: true,
    },
    {
        value: "{uuid}",
        des: "UUID V4",
        example: "31f0a770-659d-45bf-a5a9-166c06f33281",
        fileOnly: true,
    },
    {
        value: "{date}",
        des: "日期",
        example: "20060102",
        fileOnly: false,
    },
    {
        value: "{datetime}",
        des: "日期时间",
        example: "20060102150405",
        fileOnly: false,
    },
    {
        value: "{year}",
        des: "年份",
        example: "2006",
        fileOnly: false,
    },
    {
        value: "{month}",
        des: "月份",
        example: "01",
        fileOnly: false,
    },
    {
        value: "{day}",
        des: "日",
        example: "02",
        fileOnly: false,
    },
    {
        value: "{hour}",
        des: "小时",
        example: "15",
        fileOnly: false,
    },
    {
        value: "{minute}",
        des: "分钟",
        example: "04",
        fileOnly: false,
    },
    {
        value: "{second}",
        des: "秒",
        example: "05",
        fileOnly: false,
    },
];

export default function MagicVar({ isFile, open, onClose, isSlave }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {isFile ? "文件名魔法变量" : "路径魔法变量"}
            </DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table size="small" aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell>魔法变量</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell>示例</TableCell>
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
                                            <TableCell>{m.des}</TableCell>
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
                                    <TableCell>用户上传路径</TableCell>
                                    <TableCell>/我的文件/学习资料/</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
    );
}
