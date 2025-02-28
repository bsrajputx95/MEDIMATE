import * as Calendar from 'expo-calendar';
import { Platform, Alert, Linking } from 'react-native';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  alarms?: number[]; // minutes before event
  url?: string;
}

class CalendarService {
  private static instance: CalendarService;
  private defaultCalendarId: string | null = null;

  private constructor() {}

  static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // Request calendar permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Calendar Permission Required',
        'To add appointments to your calendar, please grant calendar access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => this.openSettings() },
        ]
      );
      return false;
    }
    
    return true;
  }

  // Open device settings
  private openSettings(): void {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }

  // Get default calendar ID
  async getDefaultCalendarId(): Promise<string | null> {
    if (this.defaultCalendarId) {
      return this.defaultCalendarId;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    if (Platform.OS === 'ios') {
      // Find the default calendar on iOS
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);
      this.defaultCalendarId = defaultCalendar?.id || calendars[0]?.id || null;
    } else {
      // On Android, use the primary calendar
      const primaryCalendar = calendars.find(cal => 
        cal.accessLevel === Calendar.CalendarAccessLevel.OWNER
      );
      this.defaultCalendarId = primaryCalendar?.id || calendars[0]?.id || null;
    }

    return this.defaultCalendarId;
  }

  // Create a calendar event
  async createEvent(event: CalendarEvent): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const calendarId = await this.getDefaultCalendarId();
      if (!calendarId) {
        Alert.alert('Error', 'No calendar available');
        return null;
      }

      const eventId = await Calendar.createEventAsync(calendarId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        notes: event.notes,
        alarms: event.alarms?.map(minutes => ({ relativeOffset: -minutes })),
        url: event.url,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      return eventId;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      Alert.alert('Error', 'Failed to add event to calendar');
      return null;
    }
  }

  // Create an appointment event
  async createAppointmentEvent(appointment: {
    doctorName: string;
    specialty: string;
    date: Date;
    time: string;
    location?: string;
    notes?: string;
  }): Promise<string | null> {
    const { date, time } = appointment;
    
    // Parse time string (e.g., "9:00 AM")
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : 
                   period === 'AM' && hours === 12 ? 0 : hours;

    const startDate = new Date(date);
    startDate.setHours(hour24, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30); // Default 30 min appointment

    return this.createEvent({
      title: `Appointment with ${appointment.doctorName}`,
      startDate,
      endDate,
      location: appointment.location,
      notes: `Specialty: ${appointment.specialty}\n${appointment.notes || ''}`,
      alarms: [60, 1440], // 1 hour and 1 day before
    });
  }

  // Create a medication reminder event
  async createMedicationReminder(medication: {
    name: string;
    dosage: string;
    time: Date;
    frequency: 'daily' | 'weekly' | 'monthly';
  }): Promise<string | null> {
    const endDate = new Date(medication.time);
    endDate.setMinutes(endDate.getMinutes() + 5);

    return this.createEvent({
      title: `Take ${medication.name}`,
      startDate: medication.time,
      endDate,
      notes: `Dosage: ${medication.dosage}`,
      alarms: [0, 5, 15], // At time, 5 min, 15 min after
    });
  }

  // Get events for a date range
  async getEvents(startDate: Date, endDate: Date): Promise<Calendar.Event[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return [];

      const calendarId = await this.getDefaultCalendarId();
      if (!calendarId) return [];

      const events = await Calendar.getEventsAsync(
        [calendarId],
        startDate,
        endDate
      );

      return events;
    } catch (error) {
      console.error('Failed to get events:', error);
      return [];
    }
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await Calendar.deleteEventAsync(eventId);
      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }

  // Update an event
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    try {
      await Calendar.updateEventAsync(eventId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        notes: event.notes,
      });
      return true;
    } catch (error) {
      console.error('Failed to update event:', error);
      return false;
    }
  }

  // Open calendar app
  async openCalendar(date?: Date): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const dateString = date 
          ? date.toISOString().split('T')[0].replace(/-/g, '')
          : '';
        await Linking.openURL(`calshow:${dateString}`);
      } else {
        // Android - open calendar app
        await Linking.openURL('content://com.android.calendar/time');
      }
    } catch (error) {
      console.error('Failed to open calendar:', error);
    }
  }

  // Check if calendar is available
  async isCalendarAvailable(): Promise<boolean> {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === 'granted';
  }

  // Get all calendars
  async getCalendars(): Promise<Calendar.Calendar[]> {
    try {
      return await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    } catch (error) {
      console.error('Failed to get calendars:', error);
      return [];
    }
  }
}

export const calendarService = CalendarService.getInstance();
export default calendarService;
