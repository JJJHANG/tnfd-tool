import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

const Footer = () => {
	return (
		<Box
			component="footer"
			sx={{
				bgcolor: "#DBDBDB",
				py: 4,
				mt: "auto",
			}}
		>
			<Container maxWidth="xl">
				<Typography
					variant="body2"
					align="center"
					sx={{ color: "#707070", fontWeight: 400 }}
				>
					Copyright © {new Date().getFullYear()} 永續報告書小工具
				</Typography>
			</Container>
		</Box>
	);
};

export default Footer;
