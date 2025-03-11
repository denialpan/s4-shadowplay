import React, { createContext, useState, useContext } from "react";

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
    const [refreshCounter, setRefreshCounter] = useState(0); // Use a counter

    const triggerRefresh = () => {
        setRefreshCounter((prev) => prev + 1);
    };

    return (
        <RefreshContext.Provider value={{ refreshCounter, triggerRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
};

// custom refresh hook
export const useRefresh = () => useContext(RefreshContext);
