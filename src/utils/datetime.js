import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Auth from "../middleware/Auth";
import i18next from "../i18n";

dayjs.extend(utc);
dayjs.extend(timezone);

let userTimezone = "";
try {
    userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
} catch (e) {
    console.log(e);
}

if (!userTimezone || userTimezone=="Etc/Unknown") {
    userTimezone = "Asia/Shanghai";
}

const preferTimeZone = Auth.GetPreference("timeZone");
export let timeZone = preferTimeZone ? preferTimeZone : userTimezone;

export function refreshTimeZone() {
    timeZone = Auth.GetPreference("timeZone");
    timeZone = timeZone ? timeZone : userTimezone;
}

export function formatLocalTime(time) {
    return i18next.t("intlDateTime", {
        ns: "common",
        val: dayjs(time).tz(timeZone).toDate(),
        formatParams: {
            val: {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            },
        },
    });
}

export function validateTimeZone(name) {
    try {
        dayjs().tz(name).format();
    } catch (e) {
        return false;
    }
    return true;
}
