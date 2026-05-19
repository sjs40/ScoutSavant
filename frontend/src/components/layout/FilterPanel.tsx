import { PitchTypeFilter } from "../filters/PitchTypeFilter";
import { StandFilter } from "../filters/StandFilter";
import { CountFilter } from "../filters/CountFilter";
import { InningRangeFilter } from "../filters/InningRangeFilter";
import { TTOFilter } from "../filters/TTOFilter";
import { OutcomeFilter } from "../filters/OutcomeFilter";

export function FilterPanel() {
  return (
    <aside className="w-[220px] shrink-0 bg-surface border-r border-border flex flex-col gap-5 p-4 overflow-y-auto">
      <PitchTypeFilter />
      <div className="h-px bg-border" />
      <StandFilter />
      <div className="h-px bg-border" />
      <CountFilter />
      <div className="h-px bg-border" />
      <InningRangeFilter />
      <div className="h-px bg-border" />
      <TTOFilter />
      <div className="h-px bg-border" />
      <OutcomeFilter />
    </aside>
  );
}
