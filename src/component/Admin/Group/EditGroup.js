import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import GroupForm from "./GroupForm";
import { toggleSnackbar } from "../../../redux/explorer";
import { useTranslation } from "react-i18next";

export default function EditGroupPreload() {
    const { t } = useTranslation("dashboard", { keyPrefix: "group" });
    const [group, setGroup] = useState({});

    const { id } = useParams();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        setGroup({});
        API.get("/admin/group/" + id)
            .then((response) => {
                // 布尔值转换
                ["ShareEnabled", "WebDAVEnabled"].forEach((v) => {
                    response.data[v] = response.data[v] ? "true" : "false";
                });
                [
                    "archive_download",
                    "archive_task",
                    "relocate",
                    "one_time_download",
                    "share_download",
                    "webdav_proxy",
                    "share_free",
                    "aria2",
                    "redirected_source",
                    "advance_delete",
                    "select_node",
                ].forEach((v) => {
                    if (response.data.OptionsSerialized[v] !== undefined) {
                        response.data.OptionsSerialized[v] = response.data
                            .OptionsSerialized[v]
                            ? "true"
                            : "false";
                    }
                });

                // 整型转换
                ["MaxStorage", "SpeedLimit"].forEach((v) => {
                    response.data[v] = response.data[v].toString();
                });
                [
                    "compress_size",
                    "decompress_size",
                    "source_batch",
                    "aria2_batch",
                ].forEach((v) => {
                    if (response.data.OptionsSerialized[v] !== undefined) {
                        response.data.OptionsSerialized[v] =
                            response.data.OptionsSerialized[v].toString();
                    }
                });
                response.data.PolicyList = response.data.PolicyList.map((v) => {
                    return v.toString();
                });

                response.data.OptionsSerialized.available_nodes = response.data
                    .OptionsSerialized.available_nodes
                    ? response.data.OptionsSerialized.available_nodes.map(
                          (v) => {
                              return v.toString();
                          }
                      )
                    : [];

                // JSON转换
                if (
                    response.data.OptionsSerialized.aria2_options === undefined
                ) {
                    response.data.OptionsSerialized.aria2_options = "{}";
                } else {
                    try {
                        response.data.OptionsSerialized.aria2_options =
                            JSON.stringify(
                                response.data.OptionsSerialized.aria2_options
                            );
                    } catch (e) {
                        ToggleSnackbar(
                            "top",
                            "right",
                            t("aria2FormatError"),
                            "warning"
                        );
                        return;
                    }
                }
                setGroup(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, [id]);

    return <div>{group.ID !== undefined && <GroupForm group={group} />}</div>;
}
