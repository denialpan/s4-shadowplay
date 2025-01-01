import "@/styles/globals.css"

import App from "next/app";
import Header from "@/components/header";
import { jwtVerify } from "jose";
import { AuthProvider } from "@/contexts/authContext";

import { ThemeProvider } from "@/components/theme-provider";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

s4shadowplay.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext);
    const { req } = appContext.ctx;

    let authData = {
        username: null,
    }

    if (req) {
        const token = req.cookies?.authToken;
        if (token) {
            try {
                const { payload } = await jwtVerify(token, secret);
                authData = {
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
            // disableTransitionOnChange
            >
                <SidebarProvider defaultOpen={false}>
                    <AppSidebar />
                    <div className="flex-1 overflow-y-auto">
                        <Header />
                        <Component {...pageProps} />
                    </div>
                </SidebarProvider>
            </ThemeProvider>

        </AuthProvider>
    )
}
