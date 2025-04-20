import { Card, CardActionArea, CardContent, CardMedia, DialogContent, Grid2, styled, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { PolicyType } from "../../../api/explorer";
import DraggableDialog from "../../Dialogs/DraggableDialog";
import { PolicyPropsMap } from "./StoragePolicySetting";

export interface SelectProviderProps {
  open: boolean;
  onClose: () => void;
  onSelect: (provider: PolicyType) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

const SelectProvider = ({ open, onClose, onSelect }: SelectProviderProps) => {
  const { t } = useTranslation("dashboard");
  return (
    <DraggableDialog
      title={t("policy.selectAStorageProvider")}
      dialogProps={{
        open,
        onClose,
        fullWidth: true,
        maxWidth: "sm",
      }}
    >
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 2 }}>
          {Object.values(PolicyType).map((type) => (
            <Grid2 key={type.toString()} size={{ sm: 12, md: 6 }}>
              <StyledCard sx={{ display: "flex" }}>
                <CardActionArea sx={{ display: "flex", justifyContent: "flex-start" }} onClick={() => onSelect(type)}>
                  <CardMedia component="img" image={PolicyPropsMap[type].img} sx={{ width: 100, height: 60 }} />
                  <CardContent>
                    <Typography variant="subtitle1" color="textSecondary">
                      {t(PolicyPropsMap[type].name)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </StyledCard>
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
    </DraggableDialog>
  );
};

export default SelectProvider;
