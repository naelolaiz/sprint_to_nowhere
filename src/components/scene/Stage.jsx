// SPDX-License-Identifier: GPL-3.0-only

import { DeskScene } from './DeskScene.jsx';
import { MeetingScene } from './MeetingScene.jsx';
import { AuditoriumScene } from './AuditoriumScene.jsx';
import { OutdoorScene } from './OutdoorScene.jsx';
import { ExecutiveScene } from './ExecutiveScene.jsx';
import { KitchenScene } from './KitchenScene.jsx';
import { OfficeOverview } from './OfficeOverview.jsx';

export const Stage = ({ subPhase, currentEvent, debt }) => {
  const eid = currentEvent?.id;
  if (subPhase === 'event' && currentEvent) {
    if (['quick_sync','one_on_one','initiative_cancelled','standup_debug','interview','new_hire','backlog_refinement','daily_standup','meeting_cascade'].includes(eid)) {
      return <MeetingScene event={currentEvent}/>;
    }
    if (['town_hall','all_hands','values_refresh','compliance','inclusion_workshop','mental_health','reorg'].includes(eid)) {
      return <AuditoriumScene event={currentEvent}/>;
    }
    if (eid === 'volunteer_day' || eid === 'fire_drill') return <OutdoorScene event={currentEvent}/>;
    if (eid === 'ceo_idea') return <ExecutiveScene/>;
    if (eid === 'kitchen_karen') return <KitchenScene/>;
    return <DeskScene event={currentEvent} debt={debt}/>;
  }
  if (subPhase === 'work' || subPhase === 'day-summary') {
    return <DeskScene event={null} debt={debt}/>;
  }
  return <OfficeOverview/>;
};
