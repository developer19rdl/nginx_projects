import React, { Component } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

class CalendarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [
        {
          title: 'Event 1',
          start: moment().toDate(),
          end: moment().add(1, 'hours').toDate(),
        },
        {
          title: 'Event 2',
          start: moment().add(1, 'days').toDate(),
          end: moment().add(1, 'days').add(2, 'hours').toDate(),
        },
      ],
    };
  }

  render() {
    // Customize the toolbar
    const customToolbar = () => {
      return <div />;
    };

    return (
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={this.state.events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '35.7vh', width: "100%", padding: '5px' }}
          components={{
            toolbar: customToolbar, // Replace the default toolbar with an empty div
          }}
        />
      </div>
    );
  }
}



export default CalendarComponent;