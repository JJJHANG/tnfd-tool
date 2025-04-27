import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import LinearStepper from "../Steps/LinearStepper";
import useAuthContext from "../../hooks/use-auth-context";

const StepPage = () => {
	const navigate = useNavigate();
	const { isSignIn } = useAuthContext();

	useEffect(() => {
		if (!isSignIn) {
			navigate("/");
		}
	}, [isSignIn, navigate]);

	return (
		<Container>
			<LinearStepper />
		</Container>
	);
};

export default StepPage;
