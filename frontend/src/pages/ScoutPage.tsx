import { useDashboardData } from "../hooks/useDashboardData";
import { useFilterStore } from "../store/filterStore";
import { TopNav } from "../components/layout/TopNav";
import { FilterPanel } from "../components/layout/FilterPanel";
import { ActiveFilterBar } from "../components/ActiveFilterBar";
import { MetricCards } from "../components/MetricCards";
import { StrikeZoneMap } from "../components/strikezone/StrikeZoneMap";
import { ArsenalTable } from "../components/ArsenalTable";
import { SequenceMatrix } from "../components/SequenceMatrix";
import { CountStrip } from "../components/CountStrip";

export function ScoutPage() {
  const { summary, pitches, usage, sequences, counts, isLoading, isInitialLoading, errors } = useDashboardData();
  const pitcher_id = useFilterStore((s) => s.pitcher_id);

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <TopNav />
      <ActiveFilterBar filteredCount={pitches?.filtered ?? null} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <FilterPanel />

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-w-0">
          {!pitcher_id ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="font-logo text-text3 text-4xl tracking-wider">ScoutSavant</span>
              <span className="font-mono text-text3 text-sm">
                Search for a pitcher in the left panel to begin scouting
              </span>
            </div>
          ) : (
            <>
              <MetricCards
                data={summary}
                loading={isInitialLoading}
                isFetching={isLoading}
                error={errors.summary}
              />

              {/* Main panel: StrikeZone | Arsenal+Sequences */}
              <div className="flex gap-4 flex-1 min-h-0">
                {/* Strike zone map — fixed 340px */}
                <StrikeZoneMap
                  data={pitches ?? null}
                  loading={isInitialLoading}
                  isFetching={isLoading}
                  error={errors.pitches}
                />

                {/* Right side: Arsenal + Sequence Matrix stacked, then CountStrip */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                  <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
                    <ArsenalTable
                      data={usage ?? null}
                      isFetching={isLoading}
                      error={errors.usage}
                    />
                    <div className="w-[280px] shrink-0 overflow-hidden">
                      <SequenceMatrix
                        data={sequences}
                        isFetching={isLoading}
                        error={errors.sequences}
                      />
                    </div>
                  </div>

                  <CountStrip data={counts} isFetching={isLoading} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
