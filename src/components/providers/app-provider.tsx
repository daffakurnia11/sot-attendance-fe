"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import idID from "antd/locale/id_ID";

import { I18nProvider, useI18n } from "@/i18n";

export function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AntdRegistry>
      <I18nProvider>
        <LocalizedConfigProvider>{children}</LocalizedConfigProvider>
      </I18nProvider>
    </AntdRegistry>
  );
}

function LocalizedConfigProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = useI18n();

  return (
    <ConfigProvider
      locale={locale === "id" ? idID : enUS}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#f2b63d",
          colorInfo: "#f2b63d",
          colorBgBase: "#090806",
          colorTextBase: "#fff7db",
          colorBorder: "#5f4722",
          borderRadius: 8,
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontSizeSM: 12,
        },
        components: {
          Button: {
            controlHeightLG: 56,
            fontSizeLG: 16,
            fontWeight: 800,
            primaryShadow: "0 14px 36px rgba(242, 182, 61, 0.2)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
