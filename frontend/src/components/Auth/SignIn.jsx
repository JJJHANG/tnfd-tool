import React from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import useAuthContext from "../../hooks/use-auth-context";

const SignIn = () => {
	const { setIsSignIn } = useAuthContext();
	const navigate = useNavigate();

	const handleSignUpClick = () => {
		navigate("/sign-up");
	};

	const handleSignInClick = () => {
		setIsSignIn(true);
		navigate("/");
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
				<Typography color="secondary" sx={{ mt: 1 }}>
					使用者帳號
				</Typography>
				<TextField variant="outlined" />
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
				<TextField variant="outlined" />
			</Stack>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Button
					color="secondary"
					variant="contained"
					sx={{ mt: 3 }}
					onClick={handleSignInClick}
				>
					登入
				</Button>
			</Box>
		</Container>
	);
};

export default SignIn;
