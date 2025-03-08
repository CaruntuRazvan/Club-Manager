import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import '../styles/EventCalendar.css';
import { getEvents } from '../services/eventService';

const EventCalendar = ({ userId, eventColor }) => {
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [events, setEvents] = useState([]);

  // Funcție pentru a calcula culoarea textului în funcție de fundal
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF'; // Negru pentru fundaluri deschise, alb pentru fundaluri închise
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await getEvents(userId);
        const calendarEvents = eventData.map(event => ({
          title: event.title,
          start: event.startDate,
          end: event.finishDate,
          description: event.description,
          backgroundColor: eventColor,
          borderColor: eventColor,
          textColor: getContrastColor(eventColor), // Adaugă culoarea textului
        }));
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Eroare la încărcarea evenimentelor:', error);
      }
    };

    fetchEvents();
  }, [userId, eventColor]);

  return (
    <div className="event-calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        initialView={currentView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        events={events}
        locale="ro"
        firstDay={1}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="600px"
        contentHeight="auto"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        buttonText={{
          today: 'Astăzi',
          month: 'Lună',
          week: 'Săptămână',
          day: 'Zi',
          list: 'Listă',
        }}
        dayMaxEvents={true}
        views={{
          timeGridWeek: {
            slotDuration: '01:00:00',
            slotLabelInterval: '01:00',
          },
          timeGridDay: {
            slotDuration: '01:00:00',
            slotLabelInterval: '01:00',
          },
        }}
        eventDidMount={(info) => {
          if (info.event.extendedProps.description) {
            info.el.title = `${info.event.title}\n${info.event.extendedProps.description}`;
          }
        }}
      />
    </div>
  );
};

export default EventCalendar;