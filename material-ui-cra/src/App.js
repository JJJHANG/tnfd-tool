import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import StepPage from "./components/StepPage";

export default function App() {
	return (
		<Router>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
				}}
			>
				<Header />

				<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route path="/step-page" element={<StepPage />} />
					</Routes>
				</Box>

				<Footer />
			</Box>
		</Router>
	);
}
