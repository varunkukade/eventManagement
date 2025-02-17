import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import apiUrls from '../apiUrls';
import auth from '@react-native-firebase/auth';
import { PAGINATION_CONSTANT } from '@/utils/constants';
import { RootState, store } from '../store';

export type MessageType = {
  message: string;
  failureType?: 'failure';
};

type status = 'idle' | 'succeedded' | 'failed' | 'loading';

export type EachEvent = {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventDesc: string;
  eventLocation: string;
  eventFees: string;
  mealProvided: boolean;
  accomodationProvided: boolean;
  createdBy: string;
};

type EventsState = {
  events: EachEvent[];
  originalEvents: EachEvent[];
  lastFetchedEventId: string;
  currentSelectedEvent: EachEvent | null;
  statuses: {
    addEventAPICall: status;
    getEventAPICall: status;
    removeEventAPICall: status;
    getNextEventsAPICall: status;
    updateEventAPICall: status;
  };
  loadingMessage: string;
};

const initialState: EventsState = {
  events: [],
  originalEvents: [],
  lastFetchedEventId: 'null',
  currentSelectedEvent: null,
  statuses: {
    addEventAPICall: 'idle',
    getEventAPICall: 'idle',
    removeEventAPICall: 'idle',
    getNextEventsAPICall: 'idle',
    updateEventAPICall: 'idle',
  },
  loadingMessage: '',
};

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    reset: () => initialState,
    setSelectedEvent: (state, action: PayloadAction<EachEvent>) => {
      state.currentSelectedEvent = JSON.parse(JSON.stringify(action.payload));
    },
    setLastFetchedEventId: (state, action: PayloadAction<string>) => {
      state.lastFetchedEventId = JSON.parse(JSON.stringify(action.payload));
    },
    setEvents: (state, action: PayloadAction<EachEvent[]>) => {
      state.events = JSON.parse(JSON.stringify(action.payload));
    },
  },
  extraReducers(builder) {
    builder
      .addCase(addEventAPICall.pending, (state) => {
        state.loadingMessage = 'Creating New Event';
        state.statuses.addEventAPICall = 'loading';
      })
      .addCase(addEventAPICall.fulfilled, (state) => {
        state.statuses.addEventAPICall = 'succeedded';
      })
      .addCase(addEventAPICall.rejected, (state) => {
        state.statuses.addEventAPICall = 'failed';
      })
      .addCase(getEventsAPICall.pending, (state) => {
        state.statuses.getEventAPICall = 'loading';
      })
      .addCase(getEventsAPICall.fulfilled, (state, action) => {
        const currentUser = auth().currentUser;
        state.events.length = 0;
        state.originalEvents.length = 0;
        if (action.payload.responseData.length > 0) {
          state.events = JSON.parse(
            JSON.stringify(
              action.payload.responseData.filter(
                (eachEvent) => eachEvent.createdBy === currentUser?.uid,
              ),
            ),
          );
          state.originalEvents = JSON.parse(
            JSON.stringify(
              action.payload.responseData.filter(
                (eachEvent) => eachEvent.createdBy === currentUser?.uid,
              ),
            ),
          );
        }
        state.statuses.getEventAPICall = 'succeedded';
      })
      .addCase(getEventsAPICall.rejected, (state) => {
        state.statuses.getEventAPICall = 'failed';
      })
      .addCase(getNextEventsAPICall.pending, (state) => {
        state.statuses.getNextEventsAPICall = 'loading';
      })
      .addCase(getNextEventsAPICall.fulfilled, (state, action) => {
        if (action.payload.responseData.length > 0) {
          state.events = state.events.concat(
            action.payload.responseData.filter(
              (eachEvent) => eachEvent.createdBy === auth().currentUser?.uid,
            ),
          );
          state.originalEvents = state.originalEvents.concat(
            action.payload.responseData.filter(
              (eachEvent) => eachEvent.createdBy === auth().currentUser?.uid,
            ),
          );
        }
        state.statuses.getNextEventsAPICall = 'succeedded';
      })
      .addCase(getNextEventsAPICall.rejected, (state) => {
        state.statuses.getNextEventsAPICall = 'failed';
      })
      .addCase(removeEventAPICall.pending, (state) => {
        state.loadingMessage = 'Deleting the Event';
        state.statuses.removeEventAPICall = 'loading';
      })
      .addCase(removeEventAPICall.fulfilled, (state, action) => {
        state.events = state.events.filter(
          (eachEvent) => eachEvent.eventId !== action.meta.arg.eventId,
        );
        state.originalEvents = state.originalEvents.filter(
          (eachEvent) => eachEvent.eventId !== action.meta.arg.eventId,
        );
        state.statuses.removeEventAPICall = 'succeedded';
      })
      .addCase(removeEventAPICall.rejected, (state) => {
        state.statuses.removeEventAPICall = 'failed';
      })
      .addCase(updateEventAPICall.pending, (state) => {
        state.loadingMessage = 'Updating the Event';
        state.statuses.updateEventAPICall = 'loading';
      })
      .addCase(updateEventAPICall.fulfilled, (state, action) => {
        const {
          eventTitle,
          eventDesc,
          eventDate,
          eventFees,
          eventLocation,
          eventTime,
        } = action.meta.arg.newUpdate;
        state.events = state.events.map((eachEvent) => {
          if (eachEvent.eventId === action.meta.arg.eventId) {
            eachEvent.eventTitle = eventTitle;
            eachEvent.eventDesc = eventDesc;
            eachEvent.eventDate = eventDate;
            eachEvent.eventFees = eventFees;
            eachEvent.eventLocation = eventLocation;
            eachEvent.eventTime = eventTime;
            return eachEvent;
          } else return eachEvent;
        });
        state.originalEvents = state.originalEvents.map((eachEvent) => {
          if (eachEvent.eventId === action.meta.arg.eventId) {
            eachEvent.eventTitle = eventTitle;
            eachEvent.eventDesc = eventDesc;
            eachEvent.eventDate = eventDate;
            eachEvent.eventFees = eventFees;
            eachEvent.eventLocation = eventLocation;
            eachEvent.eventTime = eventTime;
            return eachEvent;
          } else return eachEvent;
        });

        state.statuses.updateEventAPICall = 'succeedded';
      })
      .addCase(updateEventAPICall.rejected, (state) => {
        state.statuses.updateEventAPICall = 'failed';
      });
  },
});

export default eventsSlice.reducer;
export const {
  setSelectedEvent,
  reset: resetEventState,
  setLastFetchedEventId,
  setEvents,
} = eventsSlice.actions;

export const addEventAPICall = createAsyncThunk<
  //type of successfull returned obj
  {
    message: string;
  },
  //type of request obj passed to payload creator
  Omit<EachEvent, 'eventId'>,
  //type of returned error obj from rejectWithValue
  {
    rejectValue: MessageType;
  }
>(
  'events/addEvent',
  async (requestObject: Omit<EachEvent, 'eventId'>, thunkAPI) => {
    try {
      return await firestore()
        .collection(apiUrls.events)
        .add(requestObject)
        .then(() => {
          return { message: 'Event added successfully' };
        });
    } catch (err: any) {
      //return rejected promise.
      return thunkAPI.rejectWithValue({
        message:
          err?.message ||
          'Failed to add event. Please try again after some time',
      } as MessageType);
    }
  },
);

export const removeEventAPICall = createAsyncThunk<
  //type of successfull returned obj
  {
    message: string;
  },
  //type of request obj passed to payload creator
  {
    eventId: string;
  },
  //type of returned error obj from rejectWithValue
  {
    rejectValue: MessageType;
  }
>('people/removeEvent', async (requestObj: { eventId: string }, thunkAPI) => {
  try {
    return await firestore()
      .collection(apiUrls.events)
      .doc(requestObj.eventId)
      .delete()
      .then(() => {
        return { message: 'Event removed successfully' };
      });
  } catch (err: any) {
    //return rejected promise
    return thunkAPI.rejectWithValue({
      message:
        err?.message ||
        'Failed to remove events. Please try again after some time',
    } as MessageType);
  }
});

export const getEventsAPICall = createAsyncThunk<
  //type of successfull returned obj
  {
    responseData: EachEvent[];
    message: string;
  },
  //type of request obj passed to payload creator
  undefined,
  //type of returned error obj from rejectWithValue
  {
    rejectValue: MessageType;
  }
>('events/getEvent', async (_, thunkAPI) => {
  //this callback is called as payload creator callback.
  let responseArr: EachEvent[] = [];
  try {
    return await firestore()
      .collection(apiUrls.events)
      .orderBy('eventDate', 'desc')
      .limit(PAGINATION_CONSTANT)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          let updatedObj = JSON.parse(JSON.stringify(documentSnapshot.data()));
          updatedObj.eventId = documentSnapshot.id;
          responseArr.push(updatedObj);
        });
        if (responseArr.length > 1)
          thunkAPI.dispatch(
            setLastFetchedEventId(responseArr[responseArr.length - 1].eventId),
          );
        //return the resolved promise with data.
        return {
          responseData: responseArr,
          message: 'Event fetched successfully',
        };
      });
  } catch (err: any) {
    //return rejected promise from payload creator
    return thunkAPI.rejectWithValue({
      message:
        err?.message ||
        'Failed to fetch events. Please try again after some time',
    } as MessageType);
  }
});

export type SuccessType = {
  responseData: EachEvent[];
  message: string;
  successMessagetype: 'moreEventsExist' | 'noMoreEvents';
};
export const getNextEventsAPICall = createAsyncThunk<
  //type of successfull returned obj
  SuccessType,
  //type of request obj passed to payload creator
  undefined,
  //type of thunkAPI
  {
    rejectValue: MessageType;
    dispatch: typeof store.dispatch;
    state: RootState;
  }
>(
  'events/getNextEvents',
  async (_, { dispatch, getState, rejectWithValue }) => {
    //this callback is called as payload creator callback.
    let responseArr: EachEvent[] = [];
    try {
      let lastDocFetched = await firestore()
        .collection(apiUrls.events)
        .doc(getState().events.lastFetchedEventId)
        .get();
      return await firestore()
        .collection(apiUrls.events)
        .orderBy('eventDate', 'desc')
        .startAfter(lastDocFetched)
        .limit(PAGINATION_CONSTANT)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot) => {
            let updatedObj = JSON.parse(
              JSON.stringify(documentSnapshot.data()),
            );
            updatedObj.eventId = documentSnapshot.id;
            responseArr.push(updatedObj);
          });
          if (responseArr.length > 0) {
            dispatch(
              setLastFetchedEventId(
                responseArr[responseArr.length - 1].eventId,
              ),
            );
            //return the resolved promise with data.
            return {
              responseData: responseArr,
              message: 'Event fetched successfully',
              successMessagetype: 'moreEventsExist',
            } as SuccessType;
          } else {
            //return the resolved promise with data.
            return {
              responseData: [],
              message: 'No More Events',
              successMessagetype: 'noMoreEvents',
            } as SuccessType;
          }
        });
    } catch (err: any) {
      //return rejected promise from payload creator
      return rejectWithValue({
        message:
          err?.message ||
          'Failed to fetch more events. Please try again after some time',
        failureType: 'failure',
      } as MessageType);
    }
  },
);

export const updateEventAPICall = createAsyncThunk<
  //type of successfull returned obj
  {
    message: string;
  },
  //type of request obj passed to payload creator
  { newUpdate: Omit<EachEvent, 'eventId'>; eventId: string },
  //type of returned error obj from rejectWithValue
  {
    rejectValue: MessageType;
  }
>(
  'events/updateEvent',
  async (
    requestObject: { newUpdate: Omit<EachEvent, 'eventId'>; eventId: string },
    thunkAPI,
  ) => {
    try {
      return await firestore()
        .collection(apiUrls.events)
        .doc(requestObject.eventId)
        .update(requestObject.newUpdate)
        .then(() => {
          return { message: 'Event updated successfully' };
        });
    } catch (err: any) {
      //return rejected promise.
      return thunkAPI.rejectWithValue({
        message:
          err?.message ||
          'Failed to update event. Please try again after some time',
      } as MessageType);
    }
  },
);
