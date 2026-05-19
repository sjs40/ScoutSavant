from fastapi import APIRouter
from query.filters import FilterParams
from query import pitches, summary, usage, sequences, counts

router = APIRouter(tags=["data"])


@router.get("/pitches")
def get_pitches(params: FilterParams = FilterParams.depends()):
    return pitches.query(params)


@router.get("/summary")
def get_summary(params: FilterParams = FilterParams.depends()):
    return summary.query(params)


@router.get("/usage")
def get_usage(params: FilterParams = FilterParams.depends()):
    return usage.query(params)


@router.get("/sequences")
def get_sequences(params: FilterParams = FilterParams.depends()):
    return sequences.query(params)


@router.get("/counts")
def get_counts(params: FilterParams = FilterParams.depends()):
    return counts.query(params)
