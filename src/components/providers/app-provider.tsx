"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";

export function AppProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AntdRegistry>
      <ConfigProvider
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
          },
          components: {
            Button: {
              controlHeightLG: 56,
              fontSizeLG: 15,
              fontWeight: 800,
              primaryShadow: "0 14px 36px rgba(242, 182, 61, 0.2)",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
