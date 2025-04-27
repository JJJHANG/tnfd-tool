import { useContext } from "react";
import AuthContext from "../context/auth";

function useAuthContext() {
	return useContext(AuthContext);
}

export default useAuthContext;
