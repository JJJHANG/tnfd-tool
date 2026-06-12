import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import useAuthContext from "../../hooks/use-auth-context";
import { getApiBaseUrl } from "../../utils/api";

const parseJsonIfString = (value, fallback) => {
    if (typeof value !== "string") {
        return value ?? fallback;
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const getLocations = (inputPayload) => {
    const payload = parseJsonIfString(inputPayload, {});
    const locations = Array.isArray(payload?.locations)
        ? payload.locations
        : [];

    if (locations.length === 0) {
        return [];
    }

    return locations.map((location, index) => ({
        name: location?.name || `地點 ${index + 1}`,
        lat: location?.lat ?? "-",
        lng: location?.lng ?? "-",
        radiusKm: location?.radiusKm ?? "-",
    }));
};

const formatTaipeiDateTime = (value) => {
    if (!value) {
        return { date: "-", time: "" };
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { date: "-", time: "" };
    }

    const dateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const timeText = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Taipei",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(date);

    const getPart = (type) =>
        dateParts.find((part) => part.type === type)?.value || "";

    return {
        date: `${getPart("year")}-${getPart("month")}-${getPart("day")}`,
        time: timeText,
    };
};

const StrategyRunHistoryPage = () => {
    const apiBaseUrl = getApiBaseUrl();
    const navigate = useNavigate();
    const { isSignIn } = useAuthContext();
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isSignIn) {
            navigate("/sign-in");
            return;
        }

        let cancelled = false;
        const loadHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/occurrence/tnfd-strategy-runs/`,
                    { credentials: "include" },
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.error || "無法取得歷史紀錄。");
                }
                if (!cancelled) {
                    setRuns(data.results || []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "無法取得歷史紀錄。");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadHistory();
        return () => {
            cancelled = true;
        };
    }, [apiBaseUrl, isSignIn, navigate]);

    return (
        <Container maxWidth="lg" sx={{ mt: 3 }}>
            <Typography variant="h4" color="secondary" sx={{ mb: 3 }}>
                歷史紀錄
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>建立時間</TableCell>
                            <TableCell>輸入內容</TableCell>
                            <TableCell align="right">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {runs.map((run) => (
                            (() => {
                                const locations = getLocations(
                                    run.input_payload,
                                );
                                const createdAt = formatTaipeiDateTime(
                                    run.created_at,
                                );

                                return (
                                    <TableRow key={run.id}>
                                        <TableCell
                                            sx={{ whiteSpace: "nowrap" }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ lineHeight: 1.8 }}
                                            >
                                                {createdAt.date}
                                            </Typography>
                                            {createdAt.time && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ lineHeight: 1.8 }}
                                                >
                                                    {createdAt.time}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {locations.length === 0 ? (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    未提供地點
                                                </Typography>
                                            ) : (
                                                <Box sx={{ maxWidth: 620 }}>
                                                    {locations.map(
                                                        (location, index) => (
                                                            <Box
                                                                key={`${run.id}-location-${index}`}
                                                                sx={{
                                                                    mb:
                                                                        index ===
                                                                        locations.length -
                                                                            1
                                                                            ? 0
                                                                            : 1.25,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        lineHeight: 1.8,
                                                                    }}
                                                                >
                                                                    {
                                                                        location.name
                                                                    }
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        lineHeight: 1.8,
                                                                    }}
                                                                >
                                                                    {`緯度：${location.lat}，經度：${location.lng}，半徑：${location.radiusKm} km`}
                                                                </Typography>
                                                            </Box>
                                                        ),
                                                    )}
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() =>
                                                    navigate(
                                                        `/strategy-history/${run.id}`,
                                                    )
                                                }
                                            >
                                                檢視
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })()
                        ))}
                        {!loading && runs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <Typography color="text.secondary">
                                        尚無歷史紀錄。
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={3}>
                                    <Typography color="text.secondary">
                                        載入中...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default StrategyRunHistoryPage;
