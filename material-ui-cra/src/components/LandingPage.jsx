import React from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import { Button } from "@mui/material";

const LandingPage = () => {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/step-page");
	};

	return (
		<Container
			maxWidth="md"
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				mt: 4,
			}}
		>
			<Typography variant="h4" color="secondary">
				撰寫流程
			</Typography>
			<Typography
				paragraph
				color="secondary"
				align="center"
				sx={{
					mt: 4,
				}}
			>
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet id ad
				quae quas magnam culpa, animi dignissimos iure provident perferendis!
				Tempore nostrum, harum nesciunt quod minus eos blanditiis! Soluta, sit?
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet id ad
				quae quas magnam culpa, animi dignissimos iure provident perferendis!
				Tempore nostrum, harum nesciunt quod minus eos blanditiis! Soluta, sit?
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet id ad
				quae quas magnam culpa, animi dignissimos iure provident perferendis!
				Tempore nostrum, harum nesciunt quod minus eos blanditiis! Soluta, sit?
				Lorem ipsum dolor, sit amet consectetur adipisicing elit. Amet id ad
				quae quas magnam culpa, animi dignissimos iure provident perferendis!
				Tempore nostrum, harum nesciunt quod minus eos blanditiis! Soluta, sit?
			</Typography>
			<Box
				sx={{
					bgcolor: "#DBDBDB",
					p: 2,
					minWidth: 200,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center ",
					gap: 2,
					mt: 4,
				}}
			>
				<Typography color="secondary" sx={{ fontWeight: 600 }}>
					產出簡易報告
				</Typography>
				<Button
					variant="outlined"
					color="secondary"
					sx={{ bgcolor: "#FAFAFA" }}
					size="large"
					onClick={handleClick}
				>
					使用！
				</Button>
			</Box>
		</Container>
	);
};

export default LandingPage;
