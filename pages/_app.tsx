import "@/styles/antd.generated.css";

import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import React from "react";
import { SWRConfig } from "swr";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "styled-components";
import axios from "axios";
import { darkTheme } from "@/styles/theme";

const MyApp = ({
      Component,
      pageProps,
    }: AppProps): JSX.Element => (
  <ThemeProvider theme={darkTheme}>
    <SessionProvider session={pageProps.session}>
      <SWRConfig
        value={{
          fetcher: (url: string) => axios.get(url).then((res) => res.data),
        }}
      >
          <
              // noinspection JSUnusedGlobalSymbols,ES6UnusedImports
          NextNProgress
            color={"#52e3c2"}
          />
          <Component {...pageProps} />
      </SWRConfig>
    </SessionProvider>
  </ThemeProvider>
);
// noinspection JSUnusedGlobalSymbols
export default MyApp;
