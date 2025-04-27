import React, { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

import useAuthContext from "../../hooks/use-auth-context";

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const LandingPage = () => {
	const navigate = useNavigate();
	const { isSignIn } = useAuthContext();
	const [dialogOpen, setDialogOpen] = useState(false);

	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	const handleClick = () => {
		if (isSignIn) {
			// 登入時轉跳到功能頁面
			navigate("/step-page");
		} else {
			// 未登入時彈出提醒視窗
			setDialogOpen(true);
		}
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
				本工具依循GRI與TNFD國際框架設計，協助企業系統性完成自然相關議題的資料盤點、風險評估與管理規劃。透過本工具，企業可有效：
				<br />
				- 建立自然資源治理架構，清楚界定董事會、管理層及各委員會的責任與角色。
				<br /> -
				調查主要業務活動、供應鏈流程與地理分布，辨識潛在的生態敏感區域影響。
				<br /> - 系統性蒐集並整合生物多樣性資料，支援後續評估與策略制定。
				<br /> - 識別並管理主要利害關係人，確保回饋意見納入自然議題考量。
				<br /> -
				分析企業在自然資本上的依賴、影響、風險與機會，建立全面風險地圖。
				<br /> -
				規劃並追蹤減緩生物多樣性影響的行動方案，涵蓋避免、減少、修復、抵銷及轉型性作為。
				<br />
				-建立量化指標，持續追蹤成效與改善成果，提升透明度與國際對標能力。
				<br />
				本工具整合資訊整理、分析與決策支援功能，致力於協助企業高效應對自然資本轉型趨勢，展現永續經營的領導力與競爭優勢。
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
					borderRadius: 1,
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
			<Dialog
				open={dialogOpen}
				TransitionComponent={Transition}
				keepMounted
				onClose={handleDialogClose}
				aria-describedby="alert-dialog-slide-description"
			>
				<DialogTitle>{"提醒"}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-slide-description">
						您尚未登入，請點擊右上角的「登入」按鈕進行登入。如尚未註冊，請於登入頁面點選「申請帳號」完成註冊後即可登入使用。
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button variant="text" color="secondary" onClick={handleDialogClose}>
						關閉
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default LandingPage;
