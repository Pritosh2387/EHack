from ml_service.app.schemas.common import DataStatusResponse
from ml_service.app.services.metadata_service import MetadataService
from datetime import datetime

class DataStatusService:
    def __init__(self):
        self.metadata_service = MetadataService()

    def get_data_status(self) -> DataStatusResponse:
        metadata = self.metadata_service.get_metadata()

        # Check which datasets are available
        datasets_status = []
        missing_requirements = []
        unsupported_calculations = []

        for dataset in metadata.datasets:
            dataset_info = {
                "name": dataset.name,
                "available": dataset.available,
                "description": dataset.description,
                "source": dataset.source
            }
            datasets_status.append(dataset_info)

            if not dataset.available:
                missing_requirements.append(f"Dataset: {dataset.name}")

        # Determine overall status
        available_count = sum(1 for d in metadata.datasets if d.available)
        total_count = len(metadata.datasets)

        if available_count == total_count:
            overall_status = "ready"
        elif available_count > 0:
            overall_status = "partial"
        else:
            overall_status = "unavailable"

        # For now, all calculations are unsupported until we implement them
        unsupported_calculations = metadata.supported_analysis_types

        return DataStatusResponse(
            overall_status=overall_status,
            datasets=datasets_status,
            missing_requirements=missing_requirements,
            unsupported_calculations=unsupported_calculations,
            join_coverage={},  # Will be populated when we implement regional integration
            last_updated=datetime.now().strftime("%Y-%m-%d")
        )