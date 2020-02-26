import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {sizeToString} from "../../../untils";
import TableBody from "@material-ui/core/TableBody";
import {policyTypeMap} from "../../../config";
import TablePagination from "@material-ui/core/TablePagination";
import AddPolicy from "../Dialogs/AddPolicy";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100
        },
        marginBottom: 40
    },
    content: {
        padding: theme.spacing(2)
    },
    container:{
        overflowX:"auto",
    },
    tableContainer:{
        marginTop:16,
    },

}));

const columns = [
    { id: '#', label: '#', minWidth: 50 },
    { id: 'name', label: '名称', minWidth: 170 },
    { id: 'type', label: '类型', minWidth: 170 },
    {
        id: 'count',
        label: '下属文件数',
        minWidth: 50,
        align: 'right',
    },
    {
        id: 'size',
        label: '数据量',
        minWidth: 100,
        align: 'right',
    },
    {
        id: 'action',
        label: '操作',
        minWidth: 170,
        align: 'center',
    },
];

export default function Policy() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [tab,setTab] = useState(0);
    const [policies,setPolicies] = useState([]);
    const [statics,setStatics] = useState([]);
    const [page,setPage] = useState(1);
    const [pageSize,setPageSize] = useState(10);
    const [total,setTotal] = useState(0);
    const [addDialog,setAddDialog] = useState(false);

    useEffect(()=>{
        API.post("/admin/policy/list", {
            page: page,
            page_size: pageSize,
            order_by:"id desc",
        })
            .then(response => {
                setPolicies(response.data.items);
                setStatics(response.data.statics);
                setTotal(response.data.total);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    },[page,pageSize]);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    return (
        <div>
            <AddPolicy open={addDialog} onClose={()=>setAddDialog(false)}/>
            <Button color={"primary"} onClick={()=>setAddDialog(true)} variant={"contained"}>添加存储策略</Button>

            <Paper square className={classes.tableContainer}>
                <TableContainer className={classes.container}>
                    <Table aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map(column => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {policies.map(row=>(
                                <TableRow hover key={row.ID}>
                                    <TableCell>
                                        {row.ID}
                                    </TableCell>
                                    <TableCell>
                                        {row.Name}
                                    </TableCell>
                                    <TableCell>
                                        {policyTypeMap[row.Type] !== undefined && policyTypeMap[row.Type]}
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        {statics[row.ID] !== undefined && statics[row.ID][0].toLocaleString()}
                                    </TableCell>
                                    <TableCell align={"right"}>
                                        {statics[row.ID] !== undefined && sizeToString(statics[row.ID][1])}
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={pageSize}
                    page={page-1}
                    onChangePage={(e,p)=>setPage(p+1)}
                    onChangeRowsPerPage={e=>{
                        setPageSize(e.target.value);
                        setPage(1);
                    }}
                />
            </Paper>
        </div>
    );
}
