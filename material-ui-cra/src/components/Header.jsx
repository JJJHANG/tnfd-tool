import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import LogoDevIcon from "@mui/icons-material/LogoDev";

const Header = () => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/");
	};

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
						>
							聯絡我們
						</Button>
						<Button variant="outlined" color="secondary" size="large">
							註冊
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							sx={{ bgcolor: "#FAFAFA" }}
							size="large"
						>
							登入
						</Button>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
