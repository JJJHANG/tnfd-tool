import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import useAuthContext from "../../hooks/use-auth-context";
import {
	clearCsrfToken,
	csrfFetch,
	ensureCsrfToken,
	getApiBaseUrl,
} from "../../utils/api";

const SignIn = () => {
	const apiBaseUrl = getApiBaseUrl();
	const { signIn } = useAuthContext();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignUpClick = () => {
		navigate("/sign-up");
	};

	const handleSignInClick = async () => {
		setError("");
		setLoading(true);
		try {
			const response = await csrfFetch(`${apiBaseUrl}/api/occurrence/login/`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(data.error || "登入失敗，請確認帳號與密碼。");
			}

			clearCsrfToken();
			await ensureCsrfToken(apiBaseUrl, { force: true });
			signIn(data.user);
			navigate("/");
		} catch (err) {
			setError(err.message || "登入失敗，請稍後再試。");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container sx={{ width: "100%", mt: 3 }}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
				}}
			>
				<Typography variant="h4" color="secondary">
					帳號登入
				</Typography>
				<Button
					variant="text"
					color="link"
					sx={{
						bgcolor: "transparent",
						minWidth: "auto",
						padding: 0,
					}}
					onClick={handleSignUpClick}
				>
					申請帳號
				</Button>
			</Box>

			<Stack direction="column" sx={{ mt: 3 }}>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}
				<Typography color="secondary" sx={{ mt: 1 }}>
					電子郵件
				</Typography>
				<TextField
					variant="outlined"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					autoComplete="email"
				/>
				<Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
					<Typography color="secondary">密碼</Typography>
					<Button
						variant="text"
						color="link"
						sx={{
							ml: 1,
							bgcolor: "transparent",
							minWidth: "auto",
							padding: 0,
						}}
					>
						忘記密碼
					</Button>
				</Box>
				<TextField
					variant="outlined"
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					autoComplete="current-password"
				/>
			</Stack>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Button
					color="secondary"
					variant="contained"
					sx={{ mt: 3 }}
					onClick={handleSignInClick}
					disabled={loading}
				>
					{loading ? "登入中" : "登入"}
				</Button>
			</Box>
		</Container>
	);
};

export default SignIn;
