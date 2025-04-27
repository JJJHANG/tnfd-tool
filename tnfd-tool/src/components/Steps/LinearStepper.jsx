import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import GovernanceStructureStep from "./GovernanceStructureStep";
import BusinessActivitiesStep from "./BusinessActivitiesStep";
import BusinessLocationStep from "./BusinessLocationStep";
import BiodiversityDataCollectionStep from "./BiodiversityDataCollectionStep";
import StakeholderIdentificationStep from "./StakeholderIdentificationStep";
import RisksAndOpportunitiesStep from "./RisksAndOpportunitiesStep";
import ImpactMitigationStrategiesStep from "./ImpactMitigationStrategiesStep";

const steps = [
	"第一步",
	"第二步",
	"第三步",
	"第四步",
	"第五步",
	"第六步",
	"第七步",
];

const LinearStepper = () => {
	const [activeStep, setActiveStep] = useState(0);
	const [skipped, setSkipped] = useState(new Set());
	const optionalSteps = [0, 1, 2, 3, 4, 5, 6];
	const [formData, setFormData] = useState({
		governance: {},
		activities: {},
		location: {},
		biodiversity: {},
		stakeholders: {},
		risksAndOpportunities: {},
		mitigationStrategies: {},
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
					<BusinessLocationStep formData={formData} setFormData={setFormData} />
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
			case 5:
				return (
					<RisksAndOpportunitiesStep
						formData={formData}
						setFormData={setFormData}
					/>
				);
			case 6:
				return (
					<ImpactMitigationStrategiesStep
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
				<React.Fragment>
					<Typography sx={{ mt: 2, mb: 1 }}>
						All steps completed - you&apos;re finished
					</Typography>
					<Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
						<Box sx={{ flex: "1 1 auto" }} />
						<Button onClick={handleReset}>Reset</Button>
					</Box>
				</React.Fragment>
			) : (
				<React.Fragment>
					<Box sx={{ mt: 3, mb: 3 }}>{getStepContent(activeStep)}</Box>
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
						<Button onClick={handleNext} color="secondary" variant="contained">
							{activeStep === steps.length - 1 ? "產生報告" : "下一步"}
						</Button>
					</Box>
				</React.Fragment>
			)}
		</Box>
	);
};

export default LinearStepper;
