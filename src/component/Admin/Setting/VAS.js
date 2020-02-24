import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Link from "@material-ui/core/Link";
import Alert from "@material-ui/lab/Alert";
import AddPack from "../Dialogs/AddPack";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import { Delete } from "@material-ui/icons";
import { sizeToString } from "../../../untils";
import AddGroup from "../Dialogs/AddGroupk";
import AddRedeem from "../Dialogs/AddRedeem";
import AlertDialog from "../Dialogs/Alert";
import Box from "@material-ui/core/Box";
import Pagination from "@material-ui/lab/Pagination";

const useStyles = makeStyles(theme => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100
        },
        marginBottom: 40
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px"
        }
    },
    tabForm: {
        marginTop: 20
    },
    content: {
        padding: theme.spacing(2)
    },
    tableContainer: {
        overflowX: "auto",
        marginTop: theme.spacing(2)
    },
    navigator:{
        marginTop:10,
    }
}));

let product = {};

export default function VAS() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);
    const [options, setOptions] = useState({
        alipay_enabled: "0",
        payjs_enabled: "0",
        payjs_id: "",
        appid: "",
        appkey: "",
        shopid: "",
        payjs_secret: "",
        score_enabled: "0",
        share_score_rate: "0",
        score_price: "0",
        ban_time: "0",
        group_sell_data: "[]",
        pack_data: "[]"
    });
    const [groups, setGroups] = useState([]);
    const [packs, setPacks] = useState([]);
    const [addPack, setAddPack] = useState(false);
    const [addGroup, setAddGroup] = useState(false);
    const [addRedeem, setAddRedeem] = useState(false);
    const [redeems, setRedeems] = useState([]);
    const [redeemsRes, setRedeemsRes] = useState([]);
    const [redeemsResOpen, setRedeemsResOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let res = JSON.parse(options.group_sell_data);
        res.forEach(k => {
            product[k.id] = k.name;
        });
        setGroups(res);
    }, [options.group_sell_data]);

    useEffect(() => {
        let res = JSON.parse(options.pack_data);
        res.forEach(k => {
            product[k.id] = k.name;
        });
        setPacks(res);
    }, [options.pack_data]);

    useEffect(() => {
        if (tab === 3) {
            loadRedeemList()
        }
    }, [tab,page,pageSize]);

    const loadRedeemList = ()=>{
        API.post("/admin/redeem/list", {
            page: page,
            page_size: pageSize,
            order_by:"id desc",
        })
            .then(response => {
                setRedeems(response.data.items);
                setTotal(response.data.total);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }

    const deleteRedeem = id =>{
        API.delete("/admin/redeem/"+id)
            .then(response => {
                loadRedeemList();
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }

    const redeemGenerated = codes => {
        setRedeemsRes(codes);
        setRedeemsResOpen(true);
        loadRedeemList();
    }

    const handleChange = name => event => {
        setOptions({
            ...options,
            [name]: event.target.value
        });
    };

    const handleCheckChange = name => event => {
        let value = event.target.value;
        if (event.target.checked !== undefined) {
            value = event.target.checked ? "1" : "0";
        }
        setOptions({
            ...options,
            [name]: value
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/setting", {
            keys: Object.keys(options)
        })
            .then(response => {
                setOptions(response.data);
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = e => {
        e.preventDefault();
        setLoading(true);
        updateOption();
    };

    const updateOption = () => {
        let option = [];
        Object.keys(options).forEach(k => {
            option.push({
                key: k,
                value: options[k]
            });
        });
        API.patch("/admin/setting", {
            options: option
        })
            .then(response => {
                ToggleSnackbar("top", "right", "设置已更改", "success");
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleAddPack = pack => {
        setAddPack(false);
        let newPacks = [...packs, pack];
        setPacks(newPacks);
        let newPackData = JSON.stringify(newPacks);
        setOptions({ ...options, pack_data: newPackData });
        updatePackOption("pack_data", newPackData);
    };

    const handleAddGroup = group => {
        setAddGroup(false);
        let newGroup = [...groups, group];
        setGroups(newGroup);
        let newGroupData = JSON.stringify(newGroup);
        setOptions({ ...options, group_sell_data: newGroupData });
        updatePackOption("group_sell_data", newGroupData);
    };

    const updatePackOption = (name, pack) => {
        let option = [];
        Object.keys(options).forEach(k => {
            option.push({
                key: k,
                value: k === name ? pack : options[k]
            });
        });
        API.patch("/admin/setting", {
            options: option
        })
            .then(response => {
                ToggleSnackbar("top", "right", "设置已保存", "success");
            })
            .catch(error => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const deletePack = id => {
        let newPacks = [...packs];
        newPacks = newPacks.filter(v => {
            return v.id !== id;
        });
        setPacks(newPacks);
        let newPackData = JSON.stringify(newPacks);
        setOptions({ ...options, pack_data: newPackData });
        updatePackOption("pack_data", newPackData);
    };

    const deleteGroup = id => {
        let newGroups = [...groups];
        newGroups = newGroups.filter(v => {
            return v.id !== id;
        });
        setGroups(newGroups);
        let newPackData = JSON.stringify(newGroups);
        setOptions({ ...options, group_sell_data: newPackData });
        updatePackOption("group_sell_data", newPackData);
    };

    return (
        <div>
            <Paper square>
                <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, v) => setTab(v)}
                    scrollButtons="auto"
                >
                    <Tab label="支付/杂项设置" />
                    <Tab label="容量包" />
                    <Tab label="可购用户组" />
                    <Tab label="兑换码" />
                </Tabs>
                <div className={classes.content}>
                    {tab === 0 && (
                        <form onSubmit={submit} className={classes.tabForm}>
                            <div className={classes.root}>
                                <Typography variant="h6" gutterBottom>
                                    支付宝当面付
                                </Typography>
                                <div className={classes.formContainer}>
                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={
                                                            options.alipay_enabled ===
                                                            "1"
                                                        }
                                                        onChange={handleCheckChange(
                                                            "alipay_enabled"
                                                        )}
                                                    />
                                                }
                                                label="开启"
                                            />
                                        </FormControl>
                                    </div>

                                    {options.alipay_enabled === "1" && (
                                        <>
                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        App- ID
                                                    </InputLabel>
                                                    <Input
                                                        value={options.appid}
                                                        onChange={handleChange(
                                                            "appid"
                                                        )}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        当面付应用的 APPID
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>

                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        RSA 应用私钥
                                                    </InputLabel>
                                                    <Input
                                                        value={options.appkey}
                                                        onChange={handleChange(
                                                            "appkey"
                                                        )}
                                                        multiline
                                                        rowsMax={10}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        当面付应用的 RSA2
                                                        (SHA256)
                                                        私钥，一般是由您自己生成。
                                                        详情参考
                                                        <Link
                                                            target={"_blank"}
                                                            href={
                                                                "https://docs.open.alipay.com/291/105971"
                                                            }
                                                        >
                                                            生成 RSA 密钥
                                                        </Link>
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>

                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        支付宝公钥
                                                    </InputLabel>
                                                    <Input
                                                        value={options.shopid}
                                                        onChange={handleChange(
                                                            "shopid"
                                                        )}
                                                        multiline
                                                        rowsMax={10}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        由支付宝提供，可在
                                                        应用管理 - 应用信息 -
                                                        接口加签方式 中获取
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={classes.root}>
                                <Typography variant="h6" gutterBottom>
                                    PAYJS 微信支付
                                </Typography>

                                <div className={classes.formContainer}>
                                    <div className={classes.form}>
                                        <Alert severity="info">
                                            <Typography variant="body2">
                                                此服务由第三方平台{" "}
                                                <Link
                                                    href={"https://payjs.cn/"}
                                                    target={"_blank"}
                                                >
                                                    PAYJS
                                                </Link>{" "}
                                                提供， 产生的任何纠纷与
                                                Cloudreve 开发者无关。
                                            </Typography>
                                        </Alert>
                                    </div>
                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={
                                                            options.payjs_enabled ===
                                                            "1"
                                                        }
                                                        onChange={handleCheckChange(
                                                            "payjs_enabled"
                                                        )}
                                                    />
                                                }
                                                label="开启"
                                            />
                                        </FormControl>
                                    </div>

                                    {options.payjs_enabled === "1" && (
                                        <>
                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        商户号
                                                    </InputLabel>
                                                    <Input
                                                        value={options.payjs_id}
                                                        onChange={handleChange(
                                                            "payjs_id"
                                                        )}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        可在 PAYJS
                                                        管理面板首页看到
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>

                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        通信密钥
                                                    </InputLabel>
                                                    <Input
                                                        value={
                                                            options.payjs_secret
                                                        }
                                                        onChange={handleChange(
                                                            "payjs_secret"
                                                        )}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        可在 PAYJS
                                                        管理面板首页看到
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={classes.root}>
                                <Typography variant="h6" gutterBottom>
                                    杂项设置
                                </Typography>
                                <div className={classes.formContainer}>
                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor="component-helper">
                                                封禁缓冲期 (秒)
                                            </InputLabel>
                                            <Input
                                                type={"number"}
                                                inputProps={{
                                                    step: 1,
                                                    min: 1
                                                }}
                                                value={options.ban_time}
                                                onChange={handleChange(
                                                    "ban_time"
                                                )}
                                                required
                                            />
                                            <FormHelperText id="component-helper-text">
                                                用户保持容量超额状态的最长时长，超出时长该用户会被系统冻结
                                            </FormHelperText>
                                        </FormControl>
                                    </div>

                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={
                                                            options.score_enabled ===
                                                            "1"
                                                        }
                                                        onChange={handleCheckChange(
                                                            "score_enabled"
                                                        )}
                                                    />
                                                }
                                                label="允许为分享定价"
                                            />
                                            <FormHelperText>
                                                开启后，用户可为分享设定积分价格，下载需要扣除积分
                                            </FormHelperText>
                                        </FormControl>
                                    </div>

                                    {options.score_enabled === "1" && (
                                        <div className={classes.form}>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor="component-helper">
                                                    积分到账比率 (%)
                                                </InputLabel>
                                                <Input
                                                    type={"number"}
                                                    inputProps={{
                                                        step: 1,
                                                        min: 0,
                                                        max: 100
                                                    }}
                                                    value={
                                                        options.share_score_rate
                                                    }
                                                    onChange={handleChange(
                                                        "share_score_rate"
                                                    )}
                                                    required
                                                />
                                                <FormHelperText id="component-helper-text">
                                                    购买下载设定价格的分享，分享者实际到账的积分比率
                                                </FormHelperText>
                                            </FormControl>
                                        </div>
                                    )}

                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor="component-helper">
                                                积分价格 (分)
                                            </InputLabel>
                                            <Input
                                                type={"number"}
                                                inputProps={{
                                                    step: 1,
                                                    min: 1
                                                }}
                                                value={options.score_price}
                                                onChange={handleChange(
                                                    "score_price"
                                                )}
                                                required
                                            />
                                            <FormHelperText id="component-helper-text">
                                                充值积分时的价格
                                            </FormHelperText>
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <div className={classes.root}>
                                <Button
                                    disabled={loading}
                                    type={"submit"}
                                    variant={"contained"}
                                    color={"primary"}
                                >
                                    保存
                                </Button>
                            </div>
                        </form>
                    )}

                    {tab === 1 && (
                        <div>
                            <Button
                                onClick={() => setAddPack(true)}
                                variant={"contained"}
                                color={"secondary"}
                            >
                                添加
                            </Button>
                            <div className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>名称</TableCell>
                                            <TableCell>单价</TableCell>
                                            <TableCell>时长</TableCell>
                                            <TableCell>大小</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {packs.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell>
                                                    ￥{row.price / 100}
                                                    {row.score !== 0 &&
                                                        " 或 " +
                                                            row.score +
                                                            " 积分"}
                                                </TableCell>
                                                <TableCell>
                                                    {Math.ceil(
                                                        row.time / 86400
                                                    )}
                                                    天
                                                </TableCell>
                                                <TableCell>
                                                    {sizeToString(row.size)}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() =>
                                                            deletePack(row.id)
                                                        }
                                                        size={"small"}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {tab === 2 && (
                        <div>
                            <Button
                                onClick={() => setAddGroup(true)}
                                variant={"contained"}
                                color={"secondary"}
                            >
                                添加
                            </Button>
                            <div className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>名称</TableCell>
                                            <TableCell>单价</TableCell>
                                            <TableCell>时长</TableCell>
                                            <TableCell>高亮</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groups.map(row => (
                                            <TableRow key={row.id}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell>
                                                    ￥{row.price / 100}
                                                    {row.score !== 0 &&
                                                        " 或 " +
                                                            row.score +
                                                            " 积分"}
                                                </TableCell>
                                                <TableCell>
                                                    {Math.ceil(
                                                        row.time / 86400
                                                    )}
                                                    天
                                                </TableCell>
                                                <TableCell>
                                                    {row.highlight
                                                        ? "是"
                                                        : "否"}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() =>
                                                            deleteGroup(row.id)
                                                        }
                                                        size={"small"}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {tab === 3 && (
                        <div>
                            <Button
                                onClick={() => setAddRedeem(true)}
                                variant={"contained"}
                                color={"secondary"}
                            >
                                添加
                            </Button>
                            <div className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>商品名</TableCell>
                                            <TableCell>数量</TableCell>
                                            <TableCell>兑换码</TableCell>
                                            <TableCell>状态</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {redeems.map(row => (
                                            <TableRow key={row.ID}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.ID}
                                                </TableCell>
                                                <TableCell>
                                                    {row.ProductID === 0 &&"积分"}
                                                    {product[row.ProductID]!== undefined && <>{product[row.ProductID]}</>}
                                                    {row.ProductID !== 0 && !product[row.ProductID] && "已失效商品"}
                                                </TableCell>
                                                <TableCell>
                                                    {row.Num}
                                                </TableCell>
                                                <TableCell>
                                                    {row.Code}
                                                </TableCell>
                                                <TableCell>
                                                    {!row.Used?
                                                        <Box color="success.main">未使用</Box>:
                                                        <Box color="warning.main">已使用</Box>
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() =>
                                                            deleteRedeem(row.ID)
                                                        }
                                                        size={"small"}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className={classes.navigator}>
                                <Pagination
                                    count={Math.ceil(total / pageSize)}
                                    onChange={(e,v)=>setPage(v)}
                                    color="secondary"
                                />
                            </div>
                        </div>
                    )}

                    <AddPack
                        onSubmit={handleAddPack}
                        open={addPack}
                        onClose={() => setAddPack(false)}
                    />
                    <AddGroup
                        onSubmit={handleAddGroup}
                        open={addGroup}
                        onClose={() => setAddGroup(false)}
                    />
                    <AddRedeem
                        open={addRedeem}
                        onSuccess={redeemGenerated}
                        products = {[...groups,...packs]}
                        onClose={() => setAddRedeem(false)}
                    />
                    <AlertDialog
                        title={"生成结果"}
                        open={redeemsResOpen}
                        msg={redeemsRes.map(v=>(<div>{v}</div>))}
                        onClose={()=>{
                            setRedeemsResOpen(false);
                            setRedeemsRes([]);
                        }}
                    />
                </div>
            </Paper>
        </div>
    );
}
