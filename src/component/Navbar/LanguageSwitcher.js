import { useTranslation } from "react-i18next";
import React from "react";
import { Select, MenuItem } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import i18next from "i18next";

const availableLanguages = ["en-US", "zh-CN"];

const LanguageSwitcher = () => {
    const toggleLanguage = ({ target }) => {
        i18next.changeLanguage(target.value);
    };
    const { t } = useTranslation();
    
    return (
      <Tooltip
          title={t('Change language')}
          placement="bottom"
      >
          <Select
              onChange={toggleLanguage}
              color="inherit"
              value={i18next.language}
          >
            {availableLanguages.map((l, i) => (
              <MenuItem key={`${l}_${i}`} value={l}>{t(l)}</MenuItem>
            ))}
          </Select>
      </Tooltip>
    );
};

export default LanguageSwitcher;
