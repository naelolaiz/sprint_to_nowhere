// SPDX-License-Identifier: GPL-3.0-only

import { DeskScene } from './DeskScene.jsx';
import { HomeDeskScene } from './HomeDeskScene.jsx';
import { MeetingScene } from './MeetingScene.jsx';
import { AuditoriumScene } from './AuditoriumScene.jsx';
import { OutdoorScene } from './OutdoorScene.jsx';
import { ExecutiveScene } from './ExecutiveScene.jsx';
import { KitchenScene } from './KitchenScene.jsx';
import { BoardroomScene } from './BoardroomScene.jsx';
import { OfficeOverview } from './OfficeOverview.jsx';

export const Stage = ({ subPhase, currentEvent, debt, burnout, morale, atHome, stayedLate }) => {
  const eid = currentEvent?.id;
  // Once the player is working from home, the stage is the apartment for any
  // event that isn't itself a "you went somewhere else" location (boardroom,
  // outdoor, executive office, kitchen). The home-only events are routed here.
  const homeMode = atHome === true;

  if (subPhase === 'event' && currentEvent) {
    // When the player is WFH, anything that would normally take place in a
    // physical meeting room or auditorium becomes a screen on their home desk
    // (Zoom call / livestreamed deck). Keep events that are explicitly
    // outdoor/exec-only on their dedicated scenes.
    const meetingIds = ['quick_sync','one_on_one','initiative_cancelled','standup_debug','interview','new_hire','backlog_refinement','daily_standup','meeting_cascade','requirements_changed'];
    const auditoriumIds = ['town_hall','all_hands','values_refresh','compliance','inclusion_workshop','mental_health','reorg','engagement_survey'];
    const boardroomIds = ['ai_initiative_kickoff','sales_pincer','cto_skiplevel'];

    if (homeMode && (meetingIds.includes(eid) || auditoriumIds.includes(eid) || boardroomIds.includes(eid))) {
      return <HomeDeskScene event={currentEvent} debt={debt} burnout={burnout} morale={morale} stayedLate={stayedLate}/>;
    }

    if (boardroomIds.includes(eid)) {
      return <BoardroomScene event={currentEvent}/>;
    }
    if (meetingIds.includes(eid)) {
      return <MeetingScene event={currentEvent}/>;
    }
    if ([...auditoriumIds, 'volunteer_day'].includes(eid)) {
      if (eid === 'volunteer_day') return <OutdoorScene event={currentEvent}/>;
      return <AuditoriumScene event={currentEvent}/>;
    }
    if (eid === 'fire_drill') return <OutdoorScene event={currentEvent}/>;
    if (eid === 'morning_arrival') return <OutdoorScene event={currentEvent}/>;
    if (eid === 'ceo_idea') return <ExecutiveScene/>;
    if (eid === 'kitchen_karen') return <KitchenScene/>;
    if (homeMode || ['home_neighbor','home_appliance','home_doorbell','home_household'].includes(eid)) {
      return <HomeDeskScene event={currentEvent} debt={debt} burnout={burnout} morale={morale} stayedLate={stayedLate}/>;
    }
    return <DeskScene event={currentEvent} debt={debt} burnout={burnout} morale={morale} stayedLate={stayedLate}/>;
  }
  if (subPhase === 'work' || subPhase === 'day-summary') {
    if (homeMode) {
      return <HomeDeskScene event={null} debt={debt} burnout={burnout} morale={morale} stayedLate={stayedLate}/>;
    }
    return <DeskScene event={null} debt={debt} burnout={burnout} morale={morale} stayedLate={stayedLate}/>;
  }
  return <OfficeOverview burnout={burnout}/>;
};
