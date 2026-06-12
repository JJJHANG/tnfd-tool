import React, { useMemo, useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import { Circle, MapContainer, TileLayer, useMap } from "react-leaflet";

const RecenterMap = ({ center, targetLocation }) => {
    const map = useMap();
    const getZoomByRadiusKm = (radiusKm) => {
        const zoom = Math.floor(13 - Math.log2(radiusKm));
        return Math.max(3, Math.min(17, zoom));
    };

    useEffect(() => {
        const lat = Number(targetLocation?.lat);
        const lng = Number(targetLocation?.lng);
        const radiusKm = Number(targetLocation?.radiusKm);

        if (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            Number.isFinite(radiusKm) &&
            radiusKm > 0
        ) {
            map.setView([lat, lng], getZoomByRadiusKm(radiusKm), {
                animate: true,
            });
            return;
        }

        if (
            center &&
            Number.isFinite(center[0]) &&
            Number.isFinite(center[1])
        ) {
            map.setView(center, map.getZoom());
        }
    }, [center, map, targetLocation]);

    return null;
};

const BusinessLocationStep = ({ formData, setFormData }) => {
    const [siteName, setSiteName] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [radiusKm, setRadiusKm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleDeleteLocation = (name) => {
        setFormData((prev) => {
            const newLocation = { ...prev.location };
            delete newLocation[name];
            return {
                ...prev,
                location: newLocation,
            };
        });
    };

    const handleAddLocation = () => {
        const trimmedName = siteName.trim();
        const lat = Number(latitude);
        const lng = Number(longitude);
        const radius = Number(radiusKm);

        if (!trimmedName) {
            setErrorMessage("請輸入廠區名稱。");
            return;
        }
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
            setErrorMessage("緯度需為 -90 到 90 之間的數值。");
            return;
        }
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
            setErrorMessage("經度需為 -180 到 180 之間的數值。");
            return;
        }
        if (!Number.isFinite(radius) || radius <= 0) {
            setErrorMessage("半徑需為大於 0 的數值（公里）。");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                [trimmedName]: {
                    name: trimmedName,
                    shapeType: "circle",
                    lat,
                    lng,
                    radiusKm: radius,
                    points: [`${lat},${lng}`],
                },
            },
        }));

        setErrorMessage("");
        setSiteName("");
        setLatitude("");
        setLongitude("");
        setRadiusKm("");
    };

    const locationList = Object.values(formData.location || {});
    const mapCenter = useMemo(() => {
        const latestLocation = locationList[locationList.length - 1];
        if (
            latestLocation &&
            Number.isFinite(Number(latestLocation.lat)) &&
            Number.isFinite(Number(latestLocation.lng))
        ) {
            return [Number(latestLocation.lat), Number(latestLocation.lng)];
        }
        return [23.975, 120.973];
    }, [locationList]);

    return (
        <Box>
            <Typography variant="h4" color="secondary">
                確認企業主要業務的地理位置
            </Typography>
            <Stack sx={{ mt: 3 }}>
                <Typography color="secondary">
                    - 輸入廠區的經緯度與影響半徑（公里），確認後在地圖上顯示範圍
                </Typography>
            </Stack>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mt: 2 }}
            >
                <TextField
                    label="廠區名稱"
                    color="secondary"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                />
                <TextField
                    label="緯度"
                    color="secondary"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                />
                <TextField
                    label="經度"
                    color="secondary"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                />
                <TextField
                    label="半徑（公里）"
                    color="secondary"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAddLocation}
                >
                    確定
                </Button>
            </Stack>
            {errorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage}
                </Alert>
            )}
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    mt: 1,
                    justifyContent: "space-between",
                }}
            >
                <Box>
                    <TableContainer
                        component={Paper}
                        sx={{
                            maxHeight: 400,
                            maxWidth: 350,
                            overflowY: "auto",
                        }}
                    >
                        <Table
                            stickyHeader
                            sx={{ minWidth: 350 }}
                            aria-label="simple table"
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{ minWidth: 100, width: "35%" }}
                                    >
                                        廠區名稱
                                    </TableCell>
                                    <TableCell sx={{ width: "45%" }}>
                                        中心點 / 半徑
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{ width: "20%" }}
                                    >
                                        操作
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {locationList.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            sx={{ width: "35%" }}
                                        >
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                            >
                                                <span>{row.name}</span>
                                                <Tooltip
                                                    title={`緯度: ${row.lat}, 經度: ${row.lng}, 半徑: ${row.radiusKm} 公里`}
                                                    arrow
                                                    placement="top"
                                                    color="primary"
                                                >
                                                    <IconButton size="small">
                                                        <InfoIcon
                                                            fontSize="small"
                                                            color="primary"
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ width: "45%" }}>
                                            {`${row.lat}, ${row.lng} / ${row.radiusKm} 公里`}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ width: "20%" }}
                                        >
                                            <Tooltip
                                                title="刪除此廠區"
                                                arrow
                                                placement="top"
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleDeleteLocation(
                                                            row.name,
                                                        )
                                                    }
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <MapContainer
                    center={mapCenter}
                    zoom={7}
                    style={{ width: 800, height: 400 }}
                >
                    <RecenterMap
                        center={mapCenter}
                        targetLocation={locationList[locationList.length - 1]}
                    />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {locationList.map((location) => (
                        <Circle
                            key={location.name}
                            center={[
                                Number(location.lat),
                                Number(location.lng),
                            ]}
                            radius={Number(location.radiusKm) * 1000}
                            pathOptions={{ color: "#556b2f", fillOpacity: 0.2 }}
                        />
                    ))}
                </MapContainer>
            </Stack>
        </Box>
    );
};

export default BusinessLocationStep;
