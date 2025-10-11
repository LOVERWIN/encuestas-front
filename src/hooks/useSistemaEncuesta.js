import { useContext } from "react";
import SistemaEncuestaContext from "../context/SistemaEncuestaProvider";

const useSistemaEncuesta = () => {
    return useContext(SistemaEncuestaContext)
}

export default useSistemaEncuesta