import { createContext, useState } from "react";

const SistemaEncuestaContext = createContext();

const SistemaEncuestaProvider = ({children}) => {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    return(
        <SistemaEncuestaContext.Provider
            value={{
                isSidebarOpen,
                setIsSidebarOpen
            }}
        >{children}</SistemaEncuestaContext.Provider>
    )
}
export {
    SistemaEncuestaProvider
}
export default SistemaEncuestaContext