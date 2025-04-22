import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";

export default function App() {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh", // 頁面最少要填滿螢幕
			}}
		>
			<Header />

			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<LandingPage />
			</Box>

			<Footer />
		</Box>
	);
}
