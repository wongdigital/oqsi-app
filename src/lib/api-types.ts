export interface InnieSelections {
    primary_work_skill: string;
    work_personality: string;
    office_habit: string;
    worst_fear: string;
    break_room_activity: string;
}

export interface InnieRequest {
    innie_traits: string;
    raw_selections: InnieSelections;
}

export interface WellnessFactResponse {
    facts: string[];
}

export function createNarrativeFromSelections(selections: InnieSelections): string {
    return `My innie's primary skill is ${selections.primary_work_skill}. ` +
           `They are ${selections.work_personality.toLowerCase()} at work. ` +
           `Their notable habit is that they ${selections.office_habit.toLowerCase()}. ` +
           `Their biggest fear at work is ${selections.worst_fear.toLowerCase()}, ` +
           `and during breaks they can usually be found ${selections.break_room_activity.toLowerCase()}.`;
} 