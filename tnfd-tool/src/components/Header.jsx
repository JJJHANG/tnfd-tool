import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import LogoDevIcon from "@mui/icons-material/LogoDev";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import useAuthContext from "../hooks/use-auth-context";

const Header = () => {
	const { isSignIn, setIsSignIn } = useAuthContext();
	const navigate = useNavigate();
	const [anchorElUser, setAnchorElUser] = useState(null); // 控制 Menu 開關

	const handleClick = () => {
		navigate("/");
	};

	const handleSignInClick = (event) => {
		if (!isSignIn) {
			navigate("/sign-in");
		} else {
			// 已登入，打開 Menu
			setAnchorElUser(event.currentTarget);
		}
	};

	const handleContactUsClick = () => {
		navigate("/contact-us");
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const settings = ["個人資料", "設定", "登出"];

	return (
		<AppBar position="static">
			<Container maxWidth="xl" sx={{ bgcolor: "#DBDBDB" }}>
				<Toolbar disableGutters>
					<LogoDevIcon
						sx={{
							mr: 1,
							mt: 3,
							mb: 3,
							fontSize: 40,
							color: "#707070",
							"&:hover": {
								cursor: "pointer",
							},
						}}
						onClick={handleClick}
					/>
					<Typography variant="h6" color="#707070" sx={{ fontWeight: 600 }}>
						永續報告書小工具
					</Typography>
					<Box sx={{ flexGrow: 1 }}></Box>
					<Box sx={{ display: "flex", gap: 2 }}>
						<Button
							variant="text"
							color="secondary"
							sx={{
								bgcolor: "transparent",
								"&:hover": {
									bgcolor: "transparent",
									color: (theme) => theme.palette.secondary.main,
								},
							}}
							onClick={handleContactUsClick}
						>
							聯絡我們
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							sx={{ bgcolor: "#FAFAFA" }}
							size="large"
							onClick={handleSignInClick}
						>
							{isSignIn ? "思路飛" : "登入"}
						</Button>
						<Menu
							sx={{ mt: "45px" }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							{settings.map((setting) => (
								<MenuItem
									key={setting}
									onClick={() => {
										handleCloseUserMenu();
										if (setting === "登出") {
											setIsSignIn(false);
											navigate("/");
										}
									}}
								>
									<Typography variant="button" sx={{ textAlign: "center" }}>
										{setting}
									</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
