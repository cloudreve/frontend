import React from "react";
import ContentLoader from "react-content-loader";

const MyLoader = () => (
    <ContentLoader
        height={48}
        width={192}
        speed={2}
        primaryColor="#f3f3f3"
        secondaryColor="#e4e4e4"
    >
        <rect x="0" y="0" rx="3" ry="3" width="100%" height="100%" />
    </ContentLoader>
);

function captchaPlacholder() {
    return <MyLoader />;
}

export default captchaPlacholder;
