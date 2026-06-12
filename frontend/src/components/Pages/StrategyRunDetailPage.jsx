import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import useAuthContext from "../../hooks/use-auth-context";
import { getApiBaseUrl } from "../../utils/api";

const sectionCardSx = {
    p: 2.5,
    borderRadius: 1,
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "none",
};

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
        const iucn = (indicator?.iucn || matchedStrategyIndicator?.iucn || "NA")
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
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                KPI：
            </Typography>
            <Stack spacing={1.5}>
                {normalizedKpis.map((kpi, index) => {
                    const processSteps = Array.isArray(kpi?.process)
                        ? kpi.process
                        : [];

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
                                sx={{ fontWeight: 700, mb: 0.6 }}
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
                                    sx={{ mt: 0.4, mb: 0.8, pl: 4.25 }}
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

const StrategyRunDetailPage = () => {
    const apiBaseUrl = getApiBaseUrl();
    const navigate = useNavigate();
    const { runId } = useParams();
    const { isSignIn } = useAuthContext();
    const [run, setRun] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const siteEvidenceByName = useMemo(() => {
        const map = {};
        const siteEvidence = parseJsonIfString(run?.site_evidence, []);
        (Array.isArray(siteEvidence) ? siteEvidence : []).forEach((item) => {
            if (item?.site_name) {
                map[item.site_name] = item;
            }
        });
        return map;
    }, [run?.site_evidence]);

    useEffect(() => {
        if (!isSignIn) {
            navigate("/sign-in");
            return;
        }

        let cancelled = false;
        const loadDetail = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/occurrence/tnfd-strategy-runs/${runId}/`,
                    { credentials: "include" },
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.error || "無法取得歷史紀錄內容。");
                }
                if (!cancelled) {
                    setRun(data.result || null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "無法取得歷史紀錄內容。");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadDetail();
        return () => {
            cancelled = true;
        };
    }, [apiBaseUrl, isSignIn, navigate, runId]);

    const strategy = run?.strategy || {};

    return (
        <Container maxWidth="lg" sx={{ mt: 3 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                <Typography variant="h4" color="secondary" sx={{ mt: 6 }}>
                    所有步驟完成！請預覽並下載報告：
                </Typography>
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ alignSelf: "flex-start", mt: 6 }}
                    onClick={() => navigate("/strategy-history")}
                >
                    返回列表
                </Button>
            </Stack>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box
                sx={{
                    p: 4,
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    mt: 4,
                }}
            >
                {loading ? (
                    <Typography color="text.secondary">載入中...</Typography>
                ) : (
                    <>
                        <Typography variant="h5" gutterBottom>
                            使用者填寫報告
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>
                            以下呈現本次 TNFD 緩解策略建議。
                        </Typography>
                        <Stack spacing={2.5}>
                            <Paper sx={sectionCardSx}>
                                <Stack spacing={1.5}>
                                    <Chip
                                        label="緩解策略"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ width: "fit-content" }}
                                    />
                                    {strategy?.summary ? (
                                        <Box sx={{ mb: 1 }}>
                                            <Typography
                                                variant="h6"
                                                sx={{ mb: 1 }}
                                            >
                                                LLM 產生策略摘要
                                            </Typography>
                                            <Typography>
                                                {strategy.summary}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography color="text.secondary">
                                            尚無策略摘要。
                                        </Typography>
                                    )}

                                    <Typography variant="h6">
                                        地點特異性緩解策略
                                    </Typography>
                                    <List>
                                        {(
                                            strategy.site_specific_strategies ||
                                            []
                                        ).map((site) => (
                                            <ListItem
                                                key={site.site_name}
                                                alignItems="flex-start"
                                                sx={{ mb: 2.25 }}
                                            >
                                                <ListItemText
                                                    // primary={`#${site.priority_rank} ${site.site_name}（${site.priority_score}）`}
                                                    secondary={
                                                        <Box>
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
                                                                加權分數 =
                                                                相交比例 ×
                                                                敏感度權重 × 100
                                                            </Typography>
                                                            {(
                                                                siteEvidenceByName[
                                                                    site
                                                                        .site_name
                                                                ]
                                                                    ?.top_sensitive_layers ||
                                                                []
                                                            )
                                                                .slice(0, 3)
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
                                                            ).length === 0 ? (
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
                                            strategy.species_specific_strategies ||
                                            []
                                        ).map((speciesStrategy, index) => (
                                            <ListItem
                                                key={`${speciesStrategy.site_name || "site"}-${speciesStrategy.bio_group || "group"}-${index}`}
                                                alignItems="flex-start"
                                            >
                                                <ListItemText
                                                    primary={`#${speciesStrategy.priority_rank || index + 1} ${speciesStrategy.bio_group || "未分類類群"}`}
                                                    secondary={
                                                        <Box sx={{ mt: 0.75 }}>
                                                            {(
                                                                speciesStrategy.group_reasons ||
                                                                []
                                                            )
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        reason,
                                                                        reasonIdx,
                                                                    ) => (
                                                                        <Typography
                                                                            key={`species-group-reason-${index}-${reasonIdx}`}
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
                                                                siteEvidenceByName,
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
                                                            ).length === 0 ? (
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
                                                                                key={`species-indicator-${index}-${indicatorIndex}`}
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
                                                                                                key={`species-reason-${index}-${indicatorIndex}-${itemReasonIdx}`}
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
                                                                                            key={`species-action-${index}-${indicatorIndex}-${actionIndex}`}
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
                                        ))}
                                    </List>
                                </Stack>
                            </Paper>
                        </Stack>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default StrategyRunDetailPage;
