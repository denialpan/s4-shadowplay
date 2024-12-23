import "@/styles/globals.css"

import App from "next/app";
import Header from "@/components/globalUI/header";
import { jwtVerify } from "jose";
import { AuthProvider } from "@/contexts/authContext";

import { ThemeProvider } from "@/components/theme-provider";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

s4shadowplay.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext);
    const { req } = appContext.ctx;

    let authData = {
        isAuthenticated: false,
        username: null,
    }

    if (req) {
        const token = req.cookies?.authToken;
        if (token) {
            try {
                const { payload } = await jwtVerify(token, secret);
                authData = {
                    isAuthenticated: true,
                    username: payload.username,
                }
            } catch (error) {
                console.error('Invalid or expired token:', error);
            }
        }
    }

    return {
        ...appProps,
        pageProps: {
            ...appProps.pageProps,
            authData,
        },
    };
};

export default function s4shadowplay({ Component, pageProps }) {

    const { authData } = pageProps;

    return (

        <AuthProvider initialAuthData={authData}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <Header />
                <Component {...pageProps} />
            </ThemeProvider>

        </AuthProvider>
    )
}
