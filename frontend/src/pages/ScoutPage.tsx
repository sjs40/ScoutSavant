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
  const { summary, pitches, usage, sequences, counts, isLoading, isInitialLoading } = useDashboardData();
  const pitcher_id = useFilterStore((s) => s.pitcher_id);

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <TopNav />
      <ActiveFilterBar filteredCount={pitches?.filtered ?? null} />

      <div className="flex flex-1 overflow-hidden">
        <FilterPanel />

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {!pitcher_id ? (
            <div className="flex-1 flex items-center justify-center text-text3 font-mono text-sm">
              Search for a pitcher to begin scouting
            </div>
          ) : (
            <>
              <MetricCards data={summary} loading={isInitialLoading} />

              <div className="flex gap-4 items-start">
                <StrikeZoneMap data={pitches ?? null} loading={isLoading} />
                <ArsenalTable data={usage ?? null} />
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <SequenceMatrix data={sequences} />
                </div>
              </div>

              <CountStrip data={counts} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
