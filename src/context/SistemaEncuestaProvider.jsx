import { createContext } from "react"
//creamos el canal de comunicacion
const  SistemaEncuestaContext = createContext();

const SistemaEncuestaProvider = ({children}) => {
    
    
    return(
        <SistemaEncuestaContext.Provider
            value={{

            }}
        >{children}</SistemaEncuestaContext.Provider>
    )
}
export {
    SistemaEncuestaProvider
}
export default SistemaEncuestaContext