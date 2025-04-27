import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

function AuthProvider({ children }) {
	const [isSignIn, setIsSignIn] = useState(() => {
		// 初始時從 sessionStorage 讀取
		const storedSignIn = sessionStorage.getItem("isSignIn");

		if (storedSignIn === null) {
			// sessionStorage 沒東西時，預設為未登入
			return false;
		}
		return storedSignIn === "true"; // 有記錄才轉成 true/false
	});

	useEffect(() => {
		// 登入狀態改變時，寫回 sessionStorage
		sessionStorage.setItem("isSignIn", isSignIn);
	}, [isSignIn]);

	const shareContent = { isSignIn, setIsSignIn };

	return (
		<AuthContext.Provider value={shareContent}>{children}</AuthContext.Provider>
	);
}

export { AuthProvider };
export default AuthContext;
