import App from "next/app";
import Header from "@/components/globalUI/header";
import { jwtVerify } from "jose";
import { AuthProvider } from "@/contexts/authContext";

const JWT_SECRET = process.env.JWT_SECRET;
const secret = new TextEncoder().encode(JWT_SECRET);

s4shadowplay.getInitialProps = async (appContext) => {
    const appProps = await App.getInitialProps(appContext);
    const { req } = appContext.ctx;
    let isAuthenticated = false;

    if (req) {
        const token = req.cookies?.authToken;
        if (token) {
            try {
                await jwtVerify(token, secret);
                isAuthenticated = true;
            } catch (error) {
                console.error('Invalid or expired token:', error);
            }
        }
    }

    return {
        ...appProps,
        pageProps: {
            ...appProps.pageProps,
            isAuthenticated,
        },
    };
};

export default function s4shadowplay({ Component, pageProps }) {

    const { isAuthenticated } = pageProps;

    return (

        <AuthProvider initialAuthState={isAuthenticated}>
            <Header />
            <Component {...pageProps} />
        </AuthProvider>
    )
}
