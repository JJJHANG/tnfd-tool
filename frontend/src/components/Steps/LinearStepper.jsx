import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import GovernanceStructureStep from "./GovernanceStructureStep";
import BusinessActivitiesStep from "./BusinessActivitiesStep";
import BusinessLocationStep from "./BusinessLocationStep";
import BiodiversityDataCollectionStep from "./BiodiversityDataCollectionStep";
import StakeholderIdentificationStep from "./StakeholderIdentificationStep";
import industryNatureAppendix from "../../data/industryNatureAppendix.json";
import useAuthContext from "../../hooks/use-auth-context";
import { csrfFetch, getApiBaseUrl } from "../../utils/api";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

import { MapContainer, TileLayer, Polygon, Circle } from "react-leaflet";

const steps = [
    "第一步",
    "第二步",
    "第三步",
    "第四步",
    "第五步",
];

const actionCardSx = {
    pl: 1.25,
    py: 0.9,
    borderLeft: "3px solid",
    borderColor: "secondary.light",
    backgroundColor: "rgba(0,0,0,0.015)",
    borderRadius: 0.75,
};

const speciesThreatWeight = {
    EX: 6,
    EW: 6,
    RE: 6,
    CR: 5,
    EN: 4,
    VU: 3,
    NT: 2,
    LC: 1,
    DD: 1,
    NA: 0,
    NE: 0,
};

const redListThreatWeight = {
    EX: 6,
    EW: 6,
    RE: 6,
    NCR: 5,
    NEN: 4,
    NVU: 3,
    NNT: 2,
    NLC: 1,
    DD: 1,
    NA: 0,
    NE: 0,
};

const formatStatusParam = (value) => {
    if (value === null || value === undefined || value === "") {
        return "無";
    }
    if (typeof value === "boolean") {
        return value ? "有" : "無";
    }
    return String(value);
};

const SpeciesRankCaption = () => (
    <Typography
        variant="caption"
        color="text.secondary"
        sx={{
            display: "block",
            mb: 1,
            lineHeight: 1.8,
        }}
    >
        篩選方式 = 先依類群分組，再以 IUCN 國際紅皮書分數 +
        臺灣紅皮書分數作為合計分數排序（IUCN：EX/EW/RE=6、CR=5、EN=4、VU=3、NT=2、LC/DD=1、NA/NE=0；臺灣紅皮書：EX/EW/RE=6、NCR=5、NEN=4、NVU=3、NNT=2、NLC/DD=1、NA/NE=0），同分時依序比較
        sensitive、protected，最後取前三種。sensitive
        代表敏感物種建議模糊層級（無、輕度、重度）；protected
        代表臺灣保育類等級或文資法公告珍貴稀有植物（I、II、III、1）。
    </Typography>
);

const hasStatusValue = (value) => {
    if (value === true) {
        return true;
    }
    if (value === false || value === null || value === undefined) {
        return false;
    }
    return String(value).trim() !== "" && String(value).trim() !== "無";
};

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

const getSpeciesRankRows = (siteEvidenceByName, speciesStrategy) => {
    const siteEvidence = siteEvidenceByName[speciesStrategy.site_name] || {};
    const groupInfo = (siteEvidence.species_group_indicators || []).find(
        (item) => item?.bio_group === speciesStrategy.bio_group,
    );
    const evidenceIndicators = groupInfo?.indicators || [];
    const strategyIndicators = speciesStrategy.indicator_species_list || [];
    const sourceIndicators =
        evidenceIndicators.length > 0 ? evidenceIndicators : strategyIndicators;

    return sourceIndicators.slice(0, 3).map((indicator, index) => {
        const matchedStrategyIndicator = strategyIndicators.find(
            (item) =>
                item?.scientific_name === indicator?.scientific_name ||
                item?.common_name === indicator?.common_name,
        );
        const iucn = (
            indicator?.iucn ||
            matchedStrategyIndicator?.iucn ||
            "NA"
        )
            .trim()
            .toUpperCase();
        const redList = (
            indicator?.red_list ||
            indicator?.redlist ||
            matchedStrategyIndicator?.red_list ||
            matchedStrategyIndicator?.redlist ||
            "NA"
        )
            .trim()
            .toUpperCase();
        const iucnWeight =
            indicator?.iucn_score ?? speciesThreatWeight[iucn] ?? 0;
        const redListWeight =
            indicator?.red_list_score ?? redListThreatWeight[redList] ?? 0;
        return {
            key: `${indicator?.scientific_name || indicator?.common_name || "species"}-${index}`,
            label:
                indicator?.common_name ||
                matchedStrategyIndicator?.common_name ||
                indicator?.scientific_name ||
                matchedStrategyIndicator?.scientific_name ||
                "未命名物種",
            scientificName:
                indicator?.scientific_name ||
                matchedStrategyIndicator?.scientific_name ||
                "",
            iucn,
            iucnWeight,
            redList,
            redListWeight,
            conservationScore:
                indicator?.conservation_score ?? iucnWeight + redListWeight,
            sensitive: formatStatusParam(indicator?.sensitive),
            protected: formatStatusParam(indicator?.protected),
            sensitiveRank: hasStatusValue(indicator?.sensitive) ? 1 : 0,
            protectedRank: hasStatusValue(indicator?.protected) ? 1 : 0,
        };
    });
};

const stripListMarker = (value) => {
    return String(value || "")
        .trim()
        .replace(
            /^([\s\-*•‧・●○▪▫■□◆◇▶▷▸▹]+|[\d０-９]+[.)、．:：]|[([][\d０-９]+[)\]]|[（【][\d０-９]+[）】]|[一二三四五六七八九十]+[、．.])\s*/,
            "",
        )
        .trim();
};

const KpiList = ({ kpis }) => {
    const normalizedKpis = Array.isArray(kpis) ? kpis : [];

    if (normalizedKpis.length === 0) {
        return (
            <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                KPI：-
            </Typography>
        );
    }

    return (
        <Box sx={{ mt: 1.25 }}>
            <Typography
                variant="body2"
                sx={{ fontWeight: 700, lineHeight: 1.65, mb: 1 }}
            >
                KPI：
            </Typography>
            <Stack spacing={1.5}>
                {normalizedKpis.map((kpi, index) => {
                    if (typeof kpi === "string") {
                        return (
                            <Box
                                key={`kpi-${index}`}
                                sx={{
                                    pl: 3,
                                    py: 0.75,
                                    borderLeft: "3px solid",
                                    borderColor: "grey.300",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.9 }}
                                >
                                    {`${index + 1}. ${kpi}`}
                                </Typography>
                            </Box>
                        );
                    }

                    const processSteps = Array.isArray(kpi?.process)
                        ? kpi.process
                        : [];

                    return (
                        <Box
                            key={`kpi-${index}`}
                            sx={{
                                pl: 2,
                                py: 1.25,
                                borderLeft: "3px solid",
                                borderColor: "grey.300",
                                backgroundColor: "rgba(0,0,0,0.012)",
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 700,
                                    lineHeight: 1.6,
                                    mb: 0.6,
                                }}
                            >
                                {`KPI ${index + 1}`}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ lineHeight: 1.9, pl: 1 }}
                            >
                                指標：{kpi?.indicator || "-"}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ lineHeight: 1.9, pl: 1 }}
                            >
                                參與人員或部門：{kpi?.participants || "-"}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ lineHeight: 1.9, pl: 1 }}
                            >
                                執行流程：
                            </Typography>
                            {processSteps.length > 0 ? (
                                <Box
                                    component="ol"
                                    sx={{
                                        mt: 0.4,
                                        mb: 0.8,
                                        pl: 4.25,
                                    }}
                                >
                                    {processSteps.map((step, stepIndex) => (
                                        <Typography
                                            key={`kpi-${index}-process-${stepIndex}`}
                                            component="li"
                                            variant="body2"
                                            sx={{
                                                lineHeight: 1.9,
                                                pl: 0.75,
                                                mb: 0.25,
                                            }}
                                        >
                                            {stripListMarker(step)}
                                        </Typography>
                                    ))}
                                </Box>
                            ) : (
                                <Typography
                                    variant="body2"
                                    sx={{ lineHeight: 1.9, pl: 2 }}
                                >
                                    -
                                </Typography>
                            )}
                            <Typography
                                variant="body2"
                                sx={{ lineHeight: 1.9, pl: 1 }}
                            >
                                追蹤方式：{kpi?.tracking || "-"}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ lineHeight: 1.9, pl: 1 }}
                            >
                                更新頻率：{kpi?.frequency || "-"}
                            </Typography>
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
};

const LinearStepper = () => {
    const apiBaseUrl = getApiBaseUrl();
    const { user, decrementToken } = useAuthContext();
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const [speciesBySite, setSpeciesBySite] = useState({});
    const [speciesLoading, setSpeciesLoading] = useState(false);
    const [speciesError, setSpeciesError] = useState("");
    const [layerOverlapBySite, setLayerOverlapBySite] = useState({});
    const [layerLoading, setLayerLoading] = useState(false);
    const [layerError, setLayerError] = useState("");
    const [tnfdStrategy, setTnfdStrategy] = useState(null);
    const [tnfdSiteEvidenceByName, setTnfdSiteEvidenceByName] = useState({});
    const [strategyLoading, setStrategyLoading] = useState(false);
    const [strategyError, setStrategyError] = useState("");
    const optionalSteps = [0, 1, 2, 3, 4];
    const [formData, setFormData] = useState({
        governance: {},
        activities: {},
        location: {},
        biodiversity: {},
        stakeholders: {},
        risksAndOpportunities: {},
    });

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <GovernanceStructureStep
                        formData={formData}
                        setFormData={setFormData}
                    />
                );
            case 1:
                return (
                    <BusinessActivitiesStep
                        formData={formData}
                        setFormData={setFormData}
                    />
                );
            case 2:
                return (
                    <BusinessLocationStep
                        formData={formData}
                        setFormData={setFormData}
                    />
                );
            case 3:
                return (
                    <BiodiversityDataCollectionStep
                        formData={formData}
                        setFormData={setFormData}
                    />
                );
            case 4:
                return (
                    <StakeholderIdentificationStep
                        formData={formData}
                        setFormData={setFormData}
                    />
                );
            default:
                return <div>尚未設定的步驟內容</div>;
        }
    };

    const isStepOptional = (step) => {
        return optionalSteps.includes(step);
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };
    const selectedIndustry = formData.risksAndOpportunities?.industry || "";
    const locationList = useMemo(
        () => Object.values(formData.location || {}),
        [formData.location],
    );
    const selectedIndustryInfo = industryNatureAppendix.industries.find(
        (item) => item.industry === selectedIndustry,
    );
    const dependencyCatalog = industryNatureAppendix.dependencyCatalog || [];
    const impactCatalog = industryNatureAppendix.impactCatalog || [];
    const findMatchedDetails = (text, catalog) => {
        const matched = catalog.filter((detail) =>
            (detail.aliases || []).some((alias) => text.includes(alias)),
        );
        return matched.filter(
            (detail, index) =>
                matched.findIndex((x) => x.key === detail.key) === index,
        );
    };
    const sectionCardSx = {
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "#fcfcfc",
    };
    const renderTextLines = (text) => {
        const lines = (text || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            return (
                <Typography color="text.secondary">尚未填寫內容。</Typography>
            );
        }

        return lines.map((line, index) => (
            <Typography paragraph key={index}>
                {line}
            </Typography>
        ));
    };

    useEffect(() => {
        const isReportStep = activeStep === steps.length;
        if (!isReportStep) {
            return;
        }

        if (locationList.length === 0) {
            setSpeciesBySite({});
            setSpeciesError("");
            setLayerOverlapBySite({});
            setLayerError("");
            setTnfdStrategy(null);
            setTnfdSiteEvidenceByName({});
            setStrategyError("");
            return;
        }

        let cancelled = false;

        const loadOccurrenceIntersections = async () => {
            setSpeciesLoading(true);
            setSpeciesError("");
            setLayerLoading(true);
            setLayerError("");
            setStrategyLoading(true);
            setStrategyError("");
            try {
                const locationsPayload = locationList.map((loc) => ({
                    name: loc.name,
                    lat: Number(loc.lat),
                    lng: Number(loc.lng),
                    radiusKm: Number(loc.radiusKm),
                }));

                const [speciesResponse, layerResponse] = await Promise.all([
                    csrfFetch(`${apiBaseUrl}/api/occurrence/intersections/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            locations: locationsPayload,
                        }),
                    }),
                    csrfFetch(`${apiBaseUrl}/api/occurrence/layer-overlaps/`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            locations: locationsPayload,
                            page: 1,
                            pageSize: 30,
                        }),
                    }),
                ]);

                if (!speciesResponse.ok) {
                    throw new Error(`Species API ${speciesResponse.status}`);
                }
                if (!layerResponse.ok) {
                    throw new Error(`Layer API ${layerResponse.status}`);
                }
                const speciesData = await speciesResponse.json();
                const layerData = await layerResponse.json();
                const buildDetailList = (items, catalog) => {
                    const dedup = new Map();
                    (items || []).forEach((item) => {
                        findMatchedDetails(item, catalog).forEach((detail) => {
                            const key = detail?.key;
                            if (!key || dedup.has(key)) {
                                return;
                            }
                            dedup.set(key, {
                                key: detail.key,
                                name: detail.name,
                                description: detail.description,
                                aliases: detail.aliases || [],
                                examples: detail.examples || [],
                            });
                        });
                    });
                    return Array.from(dedup.values());
                };
                const industryContext = selectedIndustryInfo
                    ? {
                          industry: selectedIndustryInfo.industry,
                          dependency_items:
                              selectedIndustryInfo.dependency || [],
                          impact_items: selectedIndustryInfo.impact || [],
                          dependency_details: buildDetailList(
                              selectedIndustryInfo.dependency || [],
                              dependencyCatalog,
                          ),
                          impact_details: buildDetailList(
                              selectedIndustryInfo.impact || [],
                              impactCatalog,
                          ),
                      }
                    : null;
                const strategyRisksAndOpportunities = {
                    ...(formData.risksAndOpportunities || {}),
                    ...(industryContext
                        ? { industry_context: industryContext }
                        : {}),
                };
                const strategyResponse = await csrfFetch(
                    `${apiBaseUrl}/api/occurrence/tnfd-strategy/`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            locations: locationsPayload,
                            risksAndOpportunities:
                                strategyRisksAndOpportunities,
                            speciesSites: speciesData.sites || [],
                            layerSites: layerData.sites || [],
                        }),
                    },
                );
                if (!strategyResponse.ok) {
                    throw new Error(`Strategy API ${strategyResponse.status}`);
                }
                let strategyData = await strategyResponse.json();
                if (strategyData.task_id) {
                    const maxAttempts = 150;
                    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
                        if (cancelled) {
                            return;
                        }
                        await new Promise((resolve) =>
                            setTimeout(resolve, 10000),
                        );
                        const taskResponse = await fetch(
                            `${apiBaseUrl}/api/occurrence/tnfd-strategy-tasks/${strategyData.task_id}/`,
                            { credentials: "include" },
                        );
                        const taskData = await taskResponse
                            .json()
                            .catch(() => ({}));
                        if (taskResponse.ok && taskData.status === "success") {
                            strategyData = taskData.result || {};
                            break;
                        }
                        if (!taskResponse.ok && taskResponse.status !== 202) {
                            throw new Error(
                                taskData.error ||
                                    `Strategy task ${taskResponse.status}`,
                            );
                        }
                        if (attempt === maxAttempts - 1) {
                            throw new Error("Strategy task timed out");
                        }
                    }
                }
                const mappedSpeciesBySite = {};
                const mappedLayerBySite = {};
                (speciesData.sites || []).forEach((site) => {
                    mappedSpeciesBySite[site.name] = site;
                });
                (layerData.sites || []).forEach((site) => {
                    mappedLayerBySite[site.name] = site;
                });

                if (!cancelled) {
                    setSpeciesBySite(mappedSpeciesBySite);
                    setLayerOverlapBySite(mappedLayerBySite);
                    setTnfdStrategy(strategyData.strategy || null);
                    const evidenceByName = {};
                    const siteEvidence = parseJsonIfString(
                        strategyData.site_evidence,
                        [],
                    );
                    (Array.isArray(siteEvidence) ? siteEvidence : []).forEach((item) => {
                        if (item?.site_name) {
                            evidenceByName[item.site_name] = item;
                        }
                    });
                    setTnfdSiteEvidenceByName(evidenceByName);
                    decrementToken();
                }
            } catch (error) {
                if (!cancelled) {
                    setSpeciesBySite({});
                    setLayerOverlapBySite({});
                    setTnfdStrategy(null);
                    setTnfdSiteEvidenceByName({});
                    setSpeciesError(
                        "無法取得生物多樣性資料，請確認後端服務是否啟動。",
                    );
                    setLayerError(
                        "無法取得圖層交集資料，請確認圖層資料表是否已匯入。",
                    );
                    setStrategyError(
                        "無法取得 TNFD 策略建議，請確認策略 API 設定。",
                    );
                }
            } finally {
                if (!cancelled) {
                    setSpeciesLoading(false);
                    setLayerLoading(false);
                    setStrategyLoading(false);
                }
            }
        };

        loadOccurrenceIntersections();

        return () => {
            cancelled = true;
        };
    }, [activeStep, apiBaseUrl, locationList, formData.risksAndOpportunities]);

    return (
        <Box sx={{ width: "100%", mt: 3 }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {activeStep === steps.length ? (
                <Box>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 3 }}
                    >
                        <Typography
                            variant="h4"
                            color="secondary"
                            sx={{ mt: 6 }}
                        >
                            所有步驟完成！請預覽並下載報告：
                        </Typography>
                    </Stack>
                    <Box
                        sx={{
                            p: 4,
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            mt: 4,
                        }}
                    >
                        <Typography variant="h5" gutterBottom>
                            使用者填寫報告
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                            以下依步驟彙整內容，分成各主題區塊方便檢視。
                        </Typography>
                        <Stack spacing={2.5}>
                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="治理架構"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    <Box>
                                        {renderTextLines(
                                            formData.governance?.description,
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="商業活動"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    <Box>
                                        {renderTextLines(
                                            formData.activities?.description,
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="商業地點"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    {locationList.length === 0 ? (
                                        <Typography color="text.secondary">
                                            尚未新增據點資料。
                                        </Typography>
                                    ) : (
                                        locationList.map((loc) => {
                                            const isCircle =
                                                loc.shapeType === "circle" &&
                                                Number.isFinite(
                                                    Number(loc.lat),
                                                ) &&
                                                Number.isFinite(
                                                    Number(loc.lng),
                                                ) &&
                                                Number.isFinite(
                                                    Number(loc.radiusKm),
                                                );

                                            const polygonCoords = isCircle
                                                ? []
                                                : (loc.points || []).map(
                                                      (pointStr) => {
                                                          const [lat, lng] =
                                                              pointStr
                                                                  .split(",")
                                                                  .map(Number);
                                                          return [lat, lng];
                                                      },
                                                  );

                                            const center = isCircle
                                                ? [
                                                      Number(loc.lat),
                                                      Number(loc.lng),
                                                  ]
                                                : polygonCoords.length > 0
                                                  ? [
                                                        polygonCoords.reduce(
                                                            (sum, [lat]) =>
                                                                sum + lat,
                                                            0,
                                                        ) /
                                                            polygonCoords.length,
                                                        polygonCoords.reduce(
                                                            (sum, [, lng]) =>
                                                                sum + lng,
                                                            0,
                                                        ) /
                                                            polygonCoords.length,
                                                    ]
                                                  : [23.975, 120.973];

                                            return (
                                                <Paper
                                                    key={loc.name}
                                                    variant="outlined"
                                                    sx={{ p: 2, mb: 2 }}
                                                >
                                                    <Typography>
                                                        • 據點名稱：{loc.name}
                                                    </Typography>
                                                    <Box sx={{ my: 2 }}>
                                                        <MapContainer
                                                            center={center}
                                                            zoom={16}
                                                            scrollWheelZoom={
                                                                false
                                                            }
                                                            style={{
                                                                height: 300,
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <TileLayer
                                                                attribution="&copy; OpenStreetMap contributors"
                                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            />
                                                            {isCircle ? (
                                                                <Circle
                                                                    center={
                                                                        center
                                                                    }
                                                                    radius={
                                                                        Number(
                                                                            loc.radiusKm,
                                                                        ) * 1000
                                                                    }
                                                                />
                                                            ) : (
                                                                <Polygon
                                                                    positions={
                                                                        polygonCoords
                                                                    }
                                                                />
                                                            )}
                                                        </MapContainer>
                                                    </Box>
                                                    {isCircle && (
                                                        <Typography>
                                                            • 中心點：{loc.lat},{" "}
                                                            {loc.lng}
                                                            ，半徑：
                                                            {loc.radiusKm} 公里
                                                        </Typography>
                                                    )}

                                                    <Typography>
                                                        • 影響範圍：
                                                    </Typography>
                                                    {layerLoading ? (
                                                        <Typography color="text.secondary">
                                                            正在計算圖層交集...
                                                        </Typography>
                                                    ) : layerError ? (
                                                        <Typography color="error">
                                                            {layerError}
                                                        </Typography>
                                                    ) : (
                                                        <>
                                                            <Typography
                                                                color="text.secondary"
                                                                sx={{ mb: 1 }}
                                                            >
                                                                共{" "}
                                                                {layerOverlapBySite[
                                                                    loc.name
                                                                ]
                                                                    ?.total_count ??
                                                                    0}{" "}
                                                                筆圖層交集（顯示前{" "}
                                                                {layerOverlapBySite[
                                                                    loc.name
                                                                ]?.results
                                                                    ?.length ??
                                                                    0}{" "}
                                                                筆）
                                                            </Typography>
                                                            <TableContainer
                                                                component={
                                                                    Paper
                                                                }
                                                            >
                                                                <Table>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>
                                                                                生態敏感區名稱
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                圖層名稱
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                管理單位
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                重疊比例
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {(
                                                                            layerOverlapBySite[
                                                                                loc
                                                                                    .name
                                                                            ]
                                                                                ?.results ||
                                                                            []
                                                                        ).map(
                                                                            (
                                                                                site,
                                                                                index,
                                                                            ) => (
                                                                                <TableRow
                                                                                    key={`${loc.name}-${index}`}
                                                                                >
                                                                                    <TableCell>
                                                                                        {site.name ||
                                                                                            "-"}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {site.title ||
                                                                                            "-"}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {site.management ||
                                                                                            "-"}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {site.overlap_percentage ||
                                                                                            "-"}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ),
                                                                        )}
                                                                        {(
                                                                            layerOverlapBySite[
                                                                                loc
                                                                                    .name
                                                                            ]
                                                                                ?.results ||
                                                                            []
                                                                        )
                                                                            .length ===
                                                                            0 && (
                                                                            <TableRow>
                                                                                <TableCell
                                                                                    colSpan={
                                                                                        4
                                                                                    }
                                                                                >
                                                                                    無重疊圖層資料
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </>
                                                    )}
                                                </Paper>
                                            );
                                        })
                                    )}
                                </Stack>
                            </Paper>

                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="生物多樣性"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    <Box>
                                        {renderTextLines(
                                            formData.biodiversity?.description,
                                        )}
                                    </Box>
                                    {speciesLoading && (
                                        <Typography color="text.secondary">
                                            正在查詢交集物種資料...
                                        </Typography>
                                    )}
                                    {!speciesLoading && speciesError && (
                                        <Typography color="error">
                                            {speciesError}
                                        </Typography>
                                    )}
                                    {!speciesLoading &&
                                        !speciesError &&
                                        locationList.length === 0 && (
                                            <Typography color="text.secondary">
                                                尚未新增據點資料。
                                            </Typography>
                                        )}
                                    {!speciesLoading &&
                                        !speciesError &&
                                        locationList.map((loc) => {
                                            const siteResult =
                                                speciesBySite[loc.name];
                                            const rows =
                                                siteResult?.species || [];

                                            return (
                                                <Box
                                                    key={loc.name}
                                                    sx={{ mb: 3 }}
                                                >
                                                    <Typography
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        • 據點名稱：{loc.name}
                                                    </Typography>
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{ mb: 1.5 }}
                                                    >
                                                        交集筆數：
                                                        {siteResult?.total_matches ??
                                                            0}
                                                        {siteResult?.truncated
                                                            ? `（僅顯示前 ${siteResult?.returned_count} 筆）`
                                                            : ""}
                                                    </Typography>

                                                    {rows.length === 0 ? (
                                                        <Typography color="text.secondary">
                                                            此據點尚無交集物種資料。
                                                        </Typography>
                                                    ) : (
                                                        <TableContainer
                                                            component={Paper}
                                                        >
                                                            <Table>
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>
                                                                            學名
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            中文俗名
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            類群
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            IUCN
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            紅皮書
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            保育等級
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {rows.map(
                                                                        (
                                                                            sp,
                                                                            idx,
                                                                        ) => (
                                                                            <TableRow
                                                                                key={`${sp.scientific_name}-${idx}`}
                                                                            >
                                                                                <TableCell>
                                                                                    {
                                                                                        sp.scientific_name
                                                                                    }
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {sp.common_name ||
                                                                                        "-"}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {sp.bio_group ||
                                                                                        "-"}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {sp.iucn ||
                                                                                        "-"}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {sp.red_list ||
                                                                                        "-"}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {sp.protected ||
                                                                                        "-"}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ),
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                </Stack>
                            </Paper>

                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="利害關係人"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    <Box>
                                        {renderTextLines(
                                            formData.stakeholders?.description,
                                        )}
                                    </Box>
                                </Stack>
                            </Paper>

                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="風險與機會"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    <Typography paragraph sx={{ mb: 0 }}>
                                        產業別：
                                        {formData.risksAndOpportunities
                                            .industry || "尚未選擇"}
                                    </Typography>
                                    {selectedIndustryInfo ? (
                                        <>
                                            <Divider />
                                            <Typography variant="subtitle1">
                                                依賴項目
                                            </Typography>
                                            <List>
                                                {selectedIndustryInfo.dependency.map(
                                                    (item, index) => {
                                                        const matchedDetails =
                                                            findMatchedDetails(
                                                                item,
                                                                dependencyCatalog,
                                                            );
                                                        return (
                                                            <ListItem
                                                                key={`dep-${index}`}
                                                            >
                                                                <ListItemText
                                                                    primary={`項目 ${index + 1}`}
                                                                    secondary={
                                                                        <Box>
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    mb:
                                                                                        matchedDetails.length >
                                                                                        0
                                                                                            ? 1
                                                                                            : 0,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </Typography>
                                                                            {matchedDetails.map(
                                                                                (
                                                                                    detail,
                                                                                ) => (
                                                                                    <Box
                                                                                        key={
                                                                                            detail.key
                                                                                        }
                                                                                        sx={{
                                                                                            mb: 1,
                                                                                        }}
                                                                                    >
                                                                                        <Typography
                                                                                            variant="body2"
                                                                                            color="text.secondary"
                                                                                        >
                                                                                            <strong>
                                                                                                {
                                                                                                    detail.name
                                                                                                }

                                                                                                ：
                                                                                            </strong>
                                                                                            {
                                                                                                detail.description
                                                                                            }
                                                                                        </Typography>
                                                                                        {detail
                                                                                            .examples?.[0] && (
                                                                                            <Typography
                                                                                                variant="caption"
                                                                                                color="text.secondary"
                                                                                            >
                                                                                                例：
                                                                                                {
                                                                                                    detail
                                                                                                        .examples[0]
                                                                                                }
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Box>
                                                                                ),
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        );
                                                    },
                                                )}
                                            </List>
                                            <Typography variant="subtitle1">
                                                影響項目
                                            </Typography>
                                            <List>
                                                {selectedIndustryInfo.impact.map(
                                                    (item, index) => {
                                                        const matchedDetails =
                                                            findMatchedDetails(
                                                                item,
                                                                impactCatalog,
                                                            );
                                                        return (
                                                            <ListItem
                                                                key={`imp-${index}`}
                                                            >
                                                                <ListItemText
                                                                    primary={`項目 ${index + 1}`}
                                                                    secondary={
                                                                        <Box>
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    mb:
                                                                                        matchedDetails.length >
                                                                                        0
                                                                                            ? 1
                                                                                            : 0,
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </Typography>
                                                                            {matchedDetails.map(
                                                                                (
                                                                                    detail,
                                                                                ) => (
                                                                                    <Box
                                                                                        key={
                                                                                            detail.key
                                                                                        }
                                                                                        sx={{
                                                                                            mb: 1,
                                                                                        }}
                                                                                    >
                                                                                        <Typography
                                                                                            variant="body2"
                                                                                            color="text.secondary"
                                                                                        >
                                                                                            <strong>
                                                                                                {
                                                                                                    detail.name
                                                                                                }

                                                                                                ：
                                                                                            </strong>
                                                                                            {
                                                                                                detail.description
                                                                                            }
                                                                                        </Typography>
                                                                                        {detail
                                                                                            .examples?.[0] && (
                                                                                            <Typography
                                                                                                variant="caption"
                                                                                                color="text.secondary"
                                                                                            >
                                                                                                例：
                                                                                                {
                                                                                                    detail
                                                                                                        .examples[0]
                                                                                                }
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Box>
                                                                                ),
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        );
                                                    },
                                                )}
                                            </List>
                                        </>
                                    ) : (
                                        <Typography
                                            paragraph
                                            color="text.secondary"
                                        >
                                            尚未選擇產業別，無法顯示依賴與影響項目。
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>

                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="緩解策略"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    <Box>
                                        {strategyLoading && (
                                            <Typography
                                                color="text.secondary"
                                                sx={{ mb: 2 }}
                                            >
                                                正在產生 TNFD 緩解策略...
                                            </Typography>
                                        )}
                                        {!strategyLoading && strategyError && (
                                            <Typography
                                                color="error"
                                                sx={{ mb: 2 }}
                                            >
                                                {strategyError}
                                            </Typography>
                                        )}
                                        {!strategyLoading &&
                                            !strategyError &&
                                            tnfdStrategy && (
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{ mb: 1 }}
                                                    >
                                                        LLM 產生策略摘要
                                                    </Typography>
                                                    <Typography sx={{ mb: 2 }}>
                                                        {tnfdStrategy.summary}
                                                    </Typography>

                                                    <Typography variant="h6">
                                                        地點特異性緩解策略
                                                    </Typography>
                                                    <List sx={{ pt: 0.75 }}>
                                                        {(
                                                            tnfdStrategy.site_specific_strategies ||
                                                            []
                                                        ).map((site) => (
                                                            <ListItem
                                                                key={
                                                                    site.site_name
                                                                }
                                                                alignItems="flex-start"
                                                                sx={{
                                                                    mb: 2.25,
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    // primary={`#${site.priority_rank} ${site.site_name}（${site.priority_score}）`}
                                                                    secondary={
                                                                        <Box
                                                                            sx={{
                                                                                mt: 1,
                                                                            }}
                                                                        >
                                                                            {/* <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    mb: 0.75,
                                                                                }}
                                                                            >
                                                                                場址策略依據：
                                                                                {(
                                                                                    site.reasons ||
                                                                                    []
                                                                                ).join(
                                                                                    "；",
                                                                                ) ||
                                                                                    "無"}
                                                                            </Typography> */}
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    fontWeight: 700,
                                                                                    fontSize:
                                                                                        "0.98rem",
                                                                                    mt: 1.25,
                                                                                    mb: 1.25,
                                                                                }}
                                                                            >
                                                                                前三高加權相交圖層
                                                                            </Typography>
                                                                            <Typography
                                                                                variant="caption"
                                                                                color="text.secondary"
                                                                                sx={{
                                                                                    display:
                                                                                        "block",
                                                                                    mb: 1,
                                                                                    lineHeight: 1.8,
                                                                                }}
                                                                            >
                                                                                加權分數
                                                                                =
                                                                                相交比例
                                                                                ×
                                                                                敏感度權重
                                                                                ×
                                                                                100
                                                                                （evidence_score
                                                                                =
                                                                                overlap_ratio
                                                                                ×
                                                                                sensitivity_score
                                                                                ×
                                                                                100）
                                                                            </Typography>
                                                                            {(
                                                                                tnfdSiteEvidenceByName[
                                                                                    site
                                                                                        .site_name
                                                                                ]
                                                                                    ?.top_sensitive_layers ||
                                                                                []
                                                                            )
                                                                                .slice(
                                                                                    0,
                                                                                    3,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        layer,
                                                                                        index,
                                                                                    ) => (
                                                                                        <Typography
                                                                                            key={`${site.site_name}-layer-${index}`}
                                                                                            variant="body2"
                                                                                            sx={{
                                                                                                lineHeight: 1.85,
                                                                                                mb: 0.6,
                                                                                                pl: 1,
                                                                                            }}
                                                                                        >
                                                                                            {`${index + 1}. ${layer.title || "-"}${layer.name ? `（${layer.name}）` : ""}，加權分數：${layer.evidence_score ?? "-"}`}
                                                                                        </Typography>
                                                                                    ),
                                                                                )}
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    fontWeight: 700,
                                                                                    fontSize:
                                                                                        "0.98rem",
                                                                                    mt: 1.25,
                                                                                    mb: 1.25,
                                                                                }}
                                                                            >
                                                                                建議緩解策略
                                                                            </Typography>
                                                                            {(
                                                                                site.actions ||
                                                                                []
                                                                            )
                                                                                .length ===
                                                                            0 ? (
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    color="text.secondary"
                                                                                >
                                                                                    尚無可顯示的場址策略。
                                                                                </Typography>
                                                                            ) : (
                                                                                <Stack
                                                                                    spacing={
                                                                                        2.25
                                                                                    }
                                                                                >
                                                                                    {(
                                                                                        site.actions ||
                                                                                        []
                                                                                    ).map(
                                                                                        (
                                                                                            action,
                                                                                            index,
                                                                                        ) => (
                                                                                            <Box
                                                                                                key={`${site.site_name}-action-${index}`}
                                                                                                sx={{
                                                                                                    ...actionCardSx,
                                                                                                    pl: 1.75,
                                                                                                    py: 1.6,
                                                                                                }}
                                                                                            >
                                                                                                <Typography
                                                                                                    variant="subtitle2"
                                                                                                    sx={{
                                                                                                        fontWeight: 700,
                                                                                                        mb: 1.15,
                                                                                                        lineHeight: 1.7,
                                                                                                    }}
                                                                                                >
                                                                                                    {`${index + 1}. ${action.title || "-"}`}
                                                                                                </Typography>
                                                                                                <Typography
                                                                                                    variant="body2"
                                                                                                    sx={{
                                                                                                        lineHeight: 1.9,
                                                                                                        mb: 0.5,
                                                                                                        pl: 1,
                                                                                                    }}
                                                                                                >
                                                                                                    預期效果：
                                                                                                    {action.expected_effect ||
                                                                                                        "-"}
                                                                                                </Typography>
                                                                                                <Typography
                                                                                                    variant="body2"
                                                                                                    sx={{
                                                                                                        lineHeight: 1.9,
                                                                                                        mb: 0.5,
                                                                                                        pl: 1,
                                                                                                    }}
                                                                                                >
                                                                                                    負責：
                                                                                                    {action.owner ||
                                                                                                        "-"}
                                                                                                </Typography>
                                                                                                <Typography
                                                                                                    variant="body2"
                                                                                                    sx={{
                                                                                                        lineHeight: 1.9,
                                                                                                        mb: 0.5,
                                                                                                        pl: 1,
                                                                                                    }}
                                                                                                >
                                                                                                    時程：
                                                                                                    {action.timeline ||
                                                                                                        "-"}
                                                                                                </Typography>
                                                                                                <KpiList
                                                                                                    kpis={
                                                                                                        action.kpis
                                                                                                    }
                                                                                                />
                                                                                            </Box>
                                                                                        ),
                                                                                    )}
                                                                                </Stack>
                                                                            )}
                                                                        </Box>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>

                                                    <Typography variant="h6">
                                                        物種特異性緩解策略
                                                    </Typography>
                                                    <List>
                                                        {(
                                                            tnfdStrategy.species_specific_strategies ||
                                                            []
                                                        ).map(
                                                            (
                                                                speciesStrategy,
                                                                index,
                                                            ) => {
                                                                return (
                                                                    <ListItem
                                                                        key={`${speciesStrategy.site_name || "site"}-${speciesStrategy.bio_group || "group"}-${index}`}
                                                                        alignItems="flex-start"
                                                                        sx={{
                                                                            mb: 2.25,
                                                                        }}
                                                                    >
                                                                        <ListItemText
                                                                            primary={`#${speciesStrategy.priority_rank || index + 1} ${speciesStrategy.bio_group || "未分類類群"}`}
                                                                            secondary={
                                                                                <Box
                                                                                    sx={{
                                                                                        mt: 1,
                                                                                    }}
                                                                                >
                                                                                    {(
                                                                                        speciesStrategy.group_reasons ||
                                                                                        []
                                                                                    )
                                                                                        .slice(
                                                                                            0,
                                                                                            2,
                                                                                        )
                                                                                        .map(
                                                                                            (
                                                                                                reason,
                                                                                                reasonIdx,
                                                                                            ) => (
                                                                                                <Typography
                                                                                                    key={`${speciesStrategy.site_name || "site"}-group-reason-${index}-${reasonIdx}`}
                                                                                                    variant="body2"
                                                                                                    sx={{
                                                                                                        lineHeight: 1.85,
                                                                                                        mb: 0.9,
                                                                                                    }}
                                                                                                >
                                                                                                    {`• ${reason}`}
                                                                                                </Typography>
                                                                                            ),
                                                                                        )}
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            fontSize:
                                                                                                "0.98rem",
                                                                                            mt: 1.25,
                                                                                            mb: 1.25,
                                                                                        }}
                                                                                    >
                                                                                        前三高加權物種
                                                                                    </Typography>
                                                                                    <SpeciesRankCaption />
                                                                                    {getSpeciesRankRows(
                                                                                        tnfdSiteEvidenceByName,
                                                                                        speciesStrategy,
                                                                                    ).map(
                                                                                        (
                                                                                            speciesRow,
                                                                                            rowIndex,
                                                                                        ) => (
                                                                                            <Typography
                                                                                                key={
                                                                                                    speciesRow.key
                                                                                                }
                                                                                                variant="body2"
                                                                                                sx={{
                                                                                                    lineHeight: 1.85,
                                                                                                    mb: 0.6,
                                                                                                    pl: 1,
                                                                                                }}
                                                                                            >
                                                                                                {`${rowIndex + 1}. ${speciesRow.label}${speciesRow.scientificName && speciesRow.scientificName !== speciesRow.label ? `（${speciesRow.scientificName}）` : ""}，IUCN：${speciesRow.iucn}（${speciesRow.iucnWeight}），臺灣紅皮書：${speciesRow.redList}（${speciesRow.redListWeight}），合計分數：${speciesRow.conservationScore}，sensitive：${speciesRow.sensitive}，protected：${speciesRow.protected}`}
                                                                                            </Typography>
                                                                                        ),
                                                                                    )}
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        sx={{
                                                                                            fontWeight: 700,
                                                                                            fontSize:
                                                                                                "0.98rem",
                                                                                            mt: 1.25,
                                                                                            mb: 1.25,
                                                                                        }}
                                                                                    >
                                                                                        建議緩解策略
                                                                                    </Typography>
                                                                                    {(
                                                                                        speciesStrategy.indicator_species_list ||
                                                                                        []
                                                                                    )
                                                                                        .length ===
                                                                                    0 ? (
                                                                                        <Typography
                                                                                            variant="body2"
                                                                                            color="text.secondary"
                                                                                        >
                                                                                            尚無可顯示的物種策略。
                                                                                        </Typography>
                                                                                    ) : (
                                                                                        <Stack
                                                                                            spacing={
                                                                                                2.25
                                                                                            }
                                                                                        >
                                                                                            {(
                                                                                                speciesStrategy.indicator_species_list ||
                                                                                                []
                                                                                            ).map(
                                                                                                (
                                                                                                    indicator,
                                                                                                    indicatorIndex,
                                                                                                ) => (
                                                                                                    <Box
                                                                                                        key={`${speciesStrategy.site_name || "site"}-species-indicator-${index}-${indicatorIndex}`}
                                                                                                        sx={{
                                                                                                            ...actionCardSx,
                                                                                                            pl: 1.75,
                                                                                                            py: 1.6,
                                                                                                        }}
                                                                                                    >
                                                                                                        <Typography
                                                                                                            variant="subtitle2"
                                                                                                            sx={{
                                                                                                                fontWeight: 700,
                                                                                                                mb: 1.15,
                                                                                                                lineHeight: 1.7,
                                                                                                            }}
                                                                                                        >
                                                                                                            {`${indicatorIndex + 1}. ${indicator.common_name || indicator.scientific_name || "未命名物種"}${indicator.iucn ? `（${indicator.iucn}）` : ""}`}
                                                                                                        </Typography>
                                                                                                        {(
                                                                                                            indicator.reasons ||
                                                                                                            []
                                                                                                        )
                                                                                                            .slice(
                                                                                                                0,
                                                                                                                2,
                                                                                                            )
                                                                                                            .map(
                                                                                                                (
                                                                                                                    itemReason,
                                                                                                                    itemReasonIdx,
                                                                                                                ) => (
                                                                                                                    <Typography
                                                                                                                        key={`${speciesStrategy.site_name || "site"}-species-reason-${index}-${indicatorIndex}-${itemReasonIdx}`}
                                                                                                                        variant="body2"
                                                                                                                        sx={{
                                                                                                                            lineHeight: 1.85,
                                                                                                                            mb: 0.9,
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        {`• ${itemReason}`}
                                                                                                                    </Typography>
                                                                                                                ),
                                                                                                            )}
                                                                                                        {(
                                                                                                            indicator.actions ||
                                                                                                            []
                                                                                                        ).map(
                                                                                                            (
                                                                                                                action,
                                                                                                                actionIndex,
                                                                                                            ) => (
                                                                                                                <Box
                                                                                                                    key={`${speciesStrategy.site_name || "site"}-species-action-${index}-${indicatorIndex}-${actionIndex}`}
                                                                                                                    sx={{
                                                                                                                        pl: 2,
                                                                                                                        py: 1.15,
                                                                                                                        mt: 1.5,
                                                                                                                        mb: 1.5,
                                                                                                                        borderTop:
                                                                                                                            "1px solid",
                                                                                                                        borderColor:
                                                                                                                            "divider",
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <Typography
                                                                                                                        variant="body2"
                                                                                                                        sx={{
                                                                                                                            fontWeight: 700,
                                                                                                                            lineHeight: 1.75,
                                                                                                                            mb: 0.9,
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        {`${actionIndex + 1}. ${action.title || "-"}`}
                                                                                                                    </Typography>
                                                                                                                    <Typography
                                                                                                                        variant="body2"
                                                                                                                        sx={{
                                                                                                                            lineHeight: 1.9,
                                                                                                                            mb: 0.5,
                                                                                                                            pl: 1,
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        預期效果：
                                                                                                                        {action.expected_effect ||
                                                                                                                            "-"}
                                                                                                                    </Typography>
                                                                                                                    <Typography
                                                                                                                        variant="body2"
                                                                                                                        sx={{
                                                                                                                            lineHeight: 1.9,
                                                                                                                            mb: 0.5,
                                                                                                                            pl: 1,
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        負責：
                                                                                                                        {action.owner ||
                                                                                                                            "-"}
                                                                                                                    </Typography>
                                                                                                                    <Typography
                                                                                                                        variant="body2"
                                                                                                                        sx={{
                                                                                                                            lineHeight: 1.9,
                                                                                                                            mb: 0.5,
                                                                                                                            pl: 1,
                                                                                                                        }}
                                                                                                                    >
                                                                                                                        時程：
                                                                                                                        {action.timeline ||
                                                                                                                            "-"}
                                                                                                                    </Typography>
                                                                                                                    <KpiList
                                                                                                                        kpis={
                                                                                                                            action.kpis
                                                                                                                        }
                                                                                                                    />
                                                                                                                </Box>
                                                                                                            ),
                                                                                                        )}
                                                                                                    </Box>
                                                                                                ),
                                                                                            )}
                                                                                        </Stack>
                                                                                    )}
                                                                                </Box>
                                                                            }
                                                                        />
                                                                    </ListItem>
                                                                );
                                                            },
                                                        )}
                                                    </List>
                                                </Box>
                                            )}
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Box>
                </Box>
            ) : (
                <React.Fragment>
                    <Box sx={{ mt: 3, mb: 3 }}>
                        {getStepContent(activeStep)}
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                        {activeStep !== 0 && (
                            <Button
                                color="secondary"
                                variant="outlined"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                sx={{ mr: 1 }}
                            >
                                上一步
                            </Button>
                        )}

                        <Box sx={{ flex: "1 1 auto" }} />
                        {isStepOptional(activeStep) && (
                            <Button
                                color="secondary"
                                variant="outlined"
                                onClick={handleSkip}
                                sx={{ mr: 1 }}
                            >
                                略過
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            color="secondary"
                            variant="contained"
                        >
                            {activeStep === steps.length - 1
                                ? "產生報告"
                                : "下一步"}
                        </Button>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
};

export default LinearStepper;
