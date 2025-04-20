import { useTranslation } from "react-i18next";

import { Menu } from "@mui/material";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { SecondaryButton } from "../../../Common/StyledComponents.tsx";
import Add from "../../../Icons/Add.tsx";
import { CascadingSubmenu } from "../../ContextMenu/CascadingMenu.tsx";
import { DenseDivider, SquareMenuItem } from "../../ContextMenu/ContextMenu.tsx";
import { ColumType, ColumTypeProps, getColumnTypeDefaults, ListViewColumnSetting } from "./Column.tsx";

export interface AddColumnProps {
  onColumnAdded: (column: ListViewColumnSetting) => void;
}

const options: ColumType[] = [
  ColumType.name,
  ColumType.size,
  ColumType.date_modified,
  ColumType.date_created,
  ColumType.parent,
];

const recycleOptions: ColumType[] = [ColumType.recycle_restore_parent, ColumType.recycle_expire];

// null => divider
const mediaInfoOptions: (ColumType | null)[] = [
  ColumType.aperture,
  ColumType.exposure,
  ColumType.iso,
  ColumType.focal_length,
  ColumType.exposure_bias,
  ColumType.flash,
  null,
  ColumType.camera_make,
  ColumType.camera_model,
  ColumType.lens_make,
  ColumType.lens_model,
  null,
  ColumType.software,
  ColumType.taken_at,
  ColumType.image_size,
  null,
  ColumType.title,
  ColumType.artist,
  ColumType.album,
  ColumType.duration,
];

const AddColumn = (props: AddColumnProps) => {
  const { t } = useTranslation();
  const conditionPopupState = usePopupState({
    variant: "popover",
    popupId: "columns",
  });
  const { onClose, ...menuProps } = bindMenu(conditionPopupState);
  const onConditionAdd = (type: ColumType, p?: ColumTypeProps) => {
    props.onColumnAdded({ type, props: p });
    onClose();
  };
  return (
    <>
      <SecondaryButton {...bindTrigger(conditionPopupState)} startIcon={<Add />} sx={{ px: "15px" }}>
        {t("fileManager.addColumn")}
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
          <SquareMenuItem dense key={index} onClick={() => onConditionAdd(option)}>
            {t(getColumnTypeDefaults({ type: option }).title)}
          </SquareMenuItem>
        ))}
        <CascadingSubmenu popupId={"mediaInfo"} title={t("application:navbar.trash")}>
          {recycleOptions.map((option, index) => (
            <SquareMenuItem dense key={index} onClick={() => onConditionAdd(option)}>
              {t(getColumnTypeDefaults({ type: option }).title)}
            </SquareMenuItem>
          ))}
        </CascadingSubmenu>
        <CascadingSubmenu popupId={"mediaInfo"} title={t("application:fileManager.mediaInfo")}>
          {mediaInfoOptions.map((option, index) =>
            option ? (
              <SquareMenuItem dense key={index} onClick={() => onConditionAdd(option)}>
                {t(getColumnTypeDefaults({ type: option }).title)}
              </SquareMenuItem>
            ) : (
              <DenseDivider />
            ),
          )}
        </CascadingSubmenu>
      </Menu>
    </>
  );
};

export default AddColumn;
