import React, { useState } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Slide from "@mui/material/Slide";
import { forwardRef } from "react";

const Transition = forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const MapPage = ({ setFormData }) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [tempPoints, setTempPoints] = useState([]);
	const [nameInput, setNameInput] = useState("");

	const handleCreated = (event) => {
		const { layerType, layer } = event;

		if (layerType === "rectangle" || layerType === "polygon") {
			const coordinates = layer.getLatLngs();
			const points = coordinates[0].map(
				(latlng) => `${latlng.lat},${latlng.lng}`
			);

			setTempPoints(points); // 先存點位
			setDialogOpen(true); // 打開 Dialog
		}
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setNameInput(""); // 清空輸入
		setTempPoints([]); // 清空暫存
	};

	const handleConfirm = () => {
		if (nameInput.trim()) {
			setFormData((prev) => ({
				...prev,
				location: {
					...prev.location,
					[nameInput]: {
						name: nameInput,
						points: tempPoints,
					},
				},
			}));
			handleDialogClose();
		}
	};

	return (
		<>
			<MapContainer
				center={[23.975, 120.973]}
				zoom={6}
				style={{ width: 800, height: 400 }}
			>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				/>
				<FeatureGroup>
					<EditControl
						position="topright"
						onCreated={handleCreated}
						draw={{
							rectangle: true,
							polygon: true,
							polyline: false,
							circle: false,
							marker: false,
							circlemarker: false,
						}}
					/>
				</FeatureGroup>
			</MapContainer>
			<Dialog
				open={dialogOpen}
				TransitionComponent={Transition}
				keepMounted
				onClose={handleDialogClose}
				aria-describedby="alert-dialog-slide-description"
			>
				<DialogTitle>{"輸入廠區名稱"}</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-slide-description">
						請為您框選的範圍輸入一個名稱。
					</DialogContentText>
					<TextField
						fullWidth
						variant="outlined"
						value={nameInput}
						onChange={(e) => setNameInput(e.target.value)}
						label="廠區名稱"
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDialogClose} color="secondary">
						取消
					</Button>
					<Button onClick={handleConfirm} color="secondary" variant="contained">
						確認
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default MapPage;
