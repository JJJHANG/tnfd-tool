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
	const [user, setUser] = useState(() => {
		const storedUser = sessionStorage.getItem("user");
		if (!storedUser) {
			return null;
		}

		try {
			return JSON.parse(storedUser);
		} catch {
			return null;
		}
	});

	useEffect(() => {
		// 登入狀態改變時，寫回 sessionStorage
		sessionStorage.setItem("isSignIn", isSignIn);
	}, [isSignIn]);

	useEffect(() => {
		if (user) {
			sessionStorage.setItem("user", JSON.stringify(user));
		} else {
			sessionStorage.removeItem("user");
		}
	}, [user]);

	const signIn = (nextUser) => {
		setUser(nextUser);
		setIsSignIn(true);
	};

	const signOut = () => {
		setUser(null);
		setIsSignIn(false);
	};

	const decrementToken = () => {
		setUser((currentUser) => {
			if (!currentUser || currentUser.is_staff || currentUser.is_superuser) {
				return currentUser;
			}

			return {
				...currentUser,
				total_tokens: Number(currentUser.total_tokens || 0) - 1,
			};
		});
	};

	const shareContent = {
		isSignIn,
		setIsSignIn,
		user,
		setUser,
		signIn,
		signOut,
		decrementToken,
	};

	return (
		<AuthContext.Provider value={shareContent}>{children}</AuthContext.Provider>
	);
}

export { AuthProvider };
export default AuthContext;
