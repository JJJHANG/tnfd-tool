import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingPage from "./components/Pages/LandingPage";
import StepPage from "./components/Pages/StepPage";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import ContactUs from "./components/ContactUs";

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
						<Route path="/sign-in" element={<SignIn />} />
						<Route path="/sign-up" element={<SignUp />} />
						<Route path="/contact-us" element={<ContactUs />} />
					</Routes>
				</Box>

				<Footer />
			</Box>
		</Router>
	);
}
