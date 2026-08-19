import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: string;
  images?: string[];
  image?: string;
}

interface EventsState {
  events: Event[];
}

const initialState: EventsState = {
  events: [],
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents(state, action: PayloadAction<Event[]>) {
      state.events = action.payload;
    },
    addEvent(state, action: PayloadAction<Event>) {
      state.events.push(action.payload);
    },
    updateEvent(state, action: PayloadAction<Event>) {
      const idx = state.events.findIndex(e => e.id === action.payload.id);
      if (idx !== -1) state.events[idx] = action.payload;
    },
    deleteEvent(state, action: PayloadAction<number>) {
      state.events = state.events.filter(e => e.id !== action.payload);
    },
  },
});

export const { setEvents, addEvent, updateEvent, deleteEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
