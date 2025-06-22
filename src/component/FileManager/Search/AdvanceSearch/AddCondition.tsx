import { useTranslation } from "react-i18next";

import { SecondaryButton } from "../../../Common/StyledComponents.tsx";
import Add from "../../../Icons/Add.tsx";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { ListItemIcon, ListItemText, Menu } from "@mui/material";
import { Condition, ConditionType } from "./ConditionBox.tsx";
import React from "react";
import TextCaseTitle from "../../../Icons/TextCaseTitle.tsx";
import FolderOutlined from "../../../Icons/FolderOutlined.tsx";
import { SquareMenuItem } from "../../ContextMenu/ContextMenu.tsx";
import { FileType, Metadata } from "../../../../api/explorer.ts";
import Numbers from "../../../Icons/Numbers.tsx";
import Tag from "../../../Icons/Tag.tsx";
import { CascadingSubmenu } from "../../ContextMenu/CascadingMenu.tsx";
import Info from "../../../Icons/Info.tsx";
import HardDriveOutlined from "../../../Icons/HardDriveOutlined.tsx";
import dayjs from "dayjs";
import CalendarClock from "../../../Icons/CalendarClock.tsx";

export interface AddConditionProps {
  onConditionAdd: (condition: Condition) => void;
}

interface ConditionOption {
  name: string;
  icon?: JSX.Element;
  condition: Condition;
}

const options: ConditionOption[] = [
  {
    name: "application:modals.fileName",
    icon: <TextCaseTitle fontSize={"small"} />,
    condition: { type: ConditionType.name, case_folding: true },
  },
  {
    name: "application:navbar.fileType",
    icon: <FolderOutlined fontSize={"small"} />,
    condition: { type: ConditionType.type, file_type: FileType.file },
  },
  {
    name: "application:fileManager.tags",
    icon: <Tag fontSize={"small"} />,
    condition: { type: ConditionType.tag },
  },
  {
    name: "application:fileManager.metadata",
    icon: <Numbers fontSize={"small"} />,
    condition: { type: ConditionType.metadata },
  },
  {
    name: "application:navbar.fileSize",
    icon: <HardDriveOutlined fontSize={"small"} />,
    condition: { type: ConditionType.size, size_lte: 0, size_gte: 0 },
  },
  {
    name: "application:fileManager.createDate",
    icon: <CalendarClock fontSize={"small"} />,
    condition: {
      type: ConditionType.created,
      created_gte: dayjs().subtract(7, "d").unix(),
      created_lte: dayjs().unix(),
    },
  },
  {
    name: "application:fileManager.updatedDate",
    icon: <CalendarClock fontSize={"small"} />,
    condition: {
      type: ConditionType.modified,
      updated_gte: dayjs().subtract(7, "d").unix(),
      updated_lte: dayjs().unix(),
    },
  },
];

const mediaMetaOptions: ConditionOption[] = [
  {
    name: "application:fileManager.title",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.music_title,
      id: Metadata.music_title,
    },
  },
  {
    name: "application:fileManager.artist",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.music_artist,
      id: Metadata.music_artist,
    },
  },
  {
    name: "application:fileManager.album",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.music_album,
      id: Metadata.music_album,
    },
  },
  {
    name: "application:fileManager.cameraMake",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.camera_make,
      id: Metadata.camera_make,
    },
  },
  {
    name: "application:fileManager.cameraModel",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.camera_model,
      id: Metadata.camera_model,
    },
  },
  {
    name: "application:fileManager.lensMake",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.lens_make,
      id: Metadata.lens_make,
    },
  },
  {
    name: "application:fileManager.lensModel",
    condition: {
      type: ConditionType.metadata,
      metadata_key_readonly: true,
      metadata_key: Metadata.lens_model,
      id: Metadata.lens_model,
    },
  },
];

const AddCondition = (props: AddConditionProps) => {
  const { t } = useTranslation();
  const conditionPopupState = usePopupState({
    variant: "popover",
    popupId: "conditions",
  });
  const { onClose, ...menuProps } = bindMenu(conditionPopupState);
  const onConditionAdd = (condition: Condition) => {
    props.onConditionAdd({
      ...condition,
      id: condition.type == ConditionType.metadata && !condition.id ? Math.random().toString() : condition.id,
    });
    onClose();
  };
  return (
    <>
      <SecondaryButton {...bindTrigger(conditionPopupState)} startIcon={<Add />} sx={{ px: "15px" }}>
        {t("navbar.addCondition")}
      </SecondaryButton>
      <Menu
        onClose={onClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        {...menuProps}
      >
        {options.map((option, index) => (
          <SquareMenuItem dense key={index} onClick={() => onConditionAdd(option.condition)}>
            <ListItemIcon>{option.icon}</ListItemIcon>
            {t(option.name)}
          </SquareMenuItem>
        ))}
        <CascadingSubmenu
          icon={<Info fontSize="small" />}
          popupId={"mediaInfo"}
          title={t("application:fileManager.mediaInfo")}
        >
          {mediaMetaOptions.map((option, index) => (
            <SquareMenuItem key={index} dense onClick={() => onConditionAdd(option.condition)}>
              <ListItemText
                slotProps={{
                  primary: { variant: "body2" },
                }}
              >
                {t(option.name)}
              </ListItemText>
            </SquareMenuItem>
          ))}
        </CascadingSubmenu>
      </Menu>
    </>
  );
};

export default AddCondition;
