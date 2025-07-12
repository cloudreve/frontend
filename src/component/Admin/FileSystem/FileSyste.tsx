import { Box, Container } from "@mui/material";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ResponsiveTabs, { Tab } from "../../Common/ResponsiveTabs.tsx";
import TextBulletListSquareEdit from "../../Icons/TextBulletListSquareEdit.tsx";
import PageContainer from "../../Pages/PageContainer.tsx";
import PageHeader, { PageTabQuery } from "../../Pages/PageHeader.tsx";
import SettingsWrapper from "../Settings/SettingWrapper.tsx";
import CustomPropsSetting from "./CustomProps/CustomPropsSetting.tsx";

export enum SettingsPageTab {
  Parameters = "parameters",
  CustomProps = "customProps",
  Icon = "icon",
  FileApp = "fileApp",
}

const FileSystem = () => {
  const { t } = useTranslation("dashboard");
  const [tab, setTab] = useQueryState(PageTabQuery);

  const tabs: Tab<SettingsPageTab>[] = useMemo(() => {
    const res = [];
    res.push(
      ...[
        {
          label: t("nav.customProps"),
          value: SettingsPageTab.CustomProps,
          icon: <TextBulletListSquareEdit />,
        },
      ],
    );
    return res;
  }, [t]);

  return (
    <PageContainer>
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.fileSystem")} />
        <ResponsiveTabs
          value={tab ?? SettingsPageTab.Parameters}
          onChange={(_e, newValue) => setTab(newValue)}
          tabs={tabs}
        />
        <SwitchTransition>
          <CSSTransition
            addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
            classNames="fade"
            key={`${tab}`}
          >
            <Box>
              {(!tab || tab === SettingsPageTab.Parameters) && <div></div>}
              {tab === SettingsPageTab.CustomProps && (
                <SettingsWrapper settings={["custom_props"]}>
                  <CustomPropsSetting />
                </SettingsWrapper>
              )}
            </Box>
          </CSSTransition>
        </SwitchTransition>
      </Container>
    </PageContainer>
  );
};

export default FileSystem;
