import React, { useCallback, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import { Pagination } from "@material-ui/lab";
import CustomPaginationItem from "./PaginationItem";
import { setPagination } from "../../redux/viewUpdate/action";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: "16px 8px 16px 8px",
    },
}));

export default function PaginationFooter() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const files = useSelector((state) => state.explorer.fileList);
    const folders = useSelector((state) => state.explorer.dirList);
    const pagination = useSelector((state) => state.viewUpdate.pagination);
    const loading = useSelector((state) => state.viewUpdate.navigatorLoading);

    const SetPagination = useCallback((p) => dispatch(setPagination(p)), [
        dispatch,
    ]);

    const handleChange = (event, value) => {
        SetPagination({ ...pagination, page: value });
    };

    const count = useMemo(
        () => Math.ceil((files.length + folders.length) / pagination.size),
        [files, folders, pagination.size]
    );

    if (count > 1 && !loading) {
        return (
            <div className={classes.root}>
                <Pagination
                    renderItem={(item) => <CustomPaginationItem {...item} />}
                    color="secondary"
                    count={count}
                    page={pagination.page}
                    onChange={handleChange}
                />
            </div>
        );
    }
    return <div></div>;
}
