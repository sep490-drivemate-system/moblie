import React from 'react';
import { CalendarEvent } from './Calendar';
import { StatusFilterType } from './StatusFilter';
import { SessionFilterType } from './SessionFilter';

export const filterEvents = (
    events: CalendarEvent[],
    statusFilter: StatusFilterType,
    sessionFilter: SessionFilterType
): CalendarEvent[] => {
    return events.filter(event => {
        // Filter by status
        if (statusFilter !== 'all' && event.type !== statusFilter) {
            return false;
        }

        // Filter by session
        if (sessionFilter !== 'all' && event.session !== sessionFilter) {
            return false;
        }

        return true;
    });
};

export const getFilteredEventsByDate = (
    events: CalendarEvent[],
    date: string,
    statusFilter: StatusFilterType,
    sessionFilter: SessionFilterType
): CalendarEvent[] => {
    const dayEvents = events.filter(event => event.date === date);
    return filterEvents(dayEvents, statusFilter, sessionFilter);
};

export const getFilteredEventsByWeek = (
    events: CalendarEvent[],
    weekStart: string,
    weekEnd: string,
    statusFilter: StatusFilterType,
    sessionFilter: SessionFilterType
): CalendarEvent[] => {
    const weekEvents = events.filter(event =>
        event.date >= weekStart && event.date <= weekEnd
    );
    return filterEvents(weekEvents, statusFilter, sessionFilter);
};

export const getFilteredEventsByMonth = (
    events: CalendarEvent[],
    month: Date,
    statusFilter: StatusFilterType,
    sessionFilter: SessionFilterType
): CalendarEvent[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex;
    });
    return filterEvents(monthEvents, statusFilter, sessionFilter);
};



