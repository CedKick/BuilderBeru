import React, { useState } from 'react';
import { DateRange } from 'react-date-range';
import {
  addDays,
  subDays,
  getDay
} from 'date-fns';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../calendar-beru.css';       

export default function CalendarSelector({ onSelect }) {
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 6),
      key: 'selection',
    },
  ]);

  const getThursdayToWednesday = (clickedDate) => {
    const dayOfWeek = getDay(clickedDate); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToThursday = (dayOfWeek + 7 - 4) % 7; // 4 = Thursday
    const startDate = subDays(clickedDate, diffToThursday);
    const endDate = addDays(startDate, 6);
    return { startDate, endDate };
  };

  const handleChange = (item) => {
    const clickedDate = item.selection.startDate;
    const { startDate, endDate } = getThursdayToWednesday(clickedDate);

    const forcedRange = [
      {
        startDate,
        endDate,
        key: 'selection',
      }
    ];

    setRange(forcedRange);
    onSelect({ startDate, endDate });
  };

  return (
    <div className="bg-gray-900 p-2 rounded shadow-md border border-gray-700 text-white">
      <DateRange
        ranges={range}
        onChange={handleChange}
        moveRangeOnFirstSelection={false}
        showDateDisplay={false}
        rangeColors={['#facc15']}
      />
    </div>
  );
}
