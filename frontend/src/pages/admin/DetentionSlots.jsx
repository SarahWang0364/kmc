import { useState, useEffect } from 'react';
import detentionSlotService from '../../services/detentionSlotService';
import classroomService from '../../services/classroomService';
import termService from '../../services/termService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './DetentionSlots.css';

const DetentionSlots = () => {
  const [terms, setTerms] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState(null); // 'enable' or 'disable'
  const [dragStart, setDragStart] = useState(null); // { week, dayOfWeek, slotNumber }
  const [dragEnd, setDragEnd] = useState(null); // { week, dayOfWeek, slotNumber }

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayOfWeekMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTerm && selectedClassroom) {
      loadSlots();
    }
  }, [selectedTerm, selectedClassroom]);

  useEffect(() => {
    // Add mouse up listener to end dragging
    const handleMouseUp = () => {
      if (isDragging) {
        applyDragToggle();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragStart, dragEnd, dragAction]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [termsData, classroomsData] = await Promise.all([
        termService.getAll(),
        classroomService.getAll()
      ]);

      // Filter to current and future terms only
      const now = new Date();
      const currentAndFutureTerms = termsData.filter(t => {
        const termEnd = new Date(t.startDate);
        termEnd.setDate(termEnd.getDate() + (t.weeks * 7));
        return termEnd >= now || t.isCurrent;
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      setTerms(currentAndFutureTerms);
      setClassrooms(classroomsData.filter(c => c.isActive));

      // Auto-select first term and classroom
      if (currentAndFutureTerms.length > 0) {
        setSelectedTerm(currentAndFutureTerms[0]);
      }
      if (classroomsData.length > 0) {
        setSelectedClassroom(classroomsData[0]);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedTerm || !selectedClassroom) return;

    try {
      const slotsData = await detentionSlotService.getGrid(selectedTerm._id, selectedClassroom._id);
      setSlots(slotsData);
    } catch (err) {
      console.error('Error loading slots:', err);
      setError(err.message || 'Failed to load slots');
    }
  };

  const getSlotTimes = () => {
    if (!selectedTerm) return [];

    return selectedTerm.type === 'school_term'
      ? [
          { label: '4:00pm - 6:30pm', startTime: '16:00', endTime: '18:30' },
          { label: '6:30pm - 9:00pm', startTime: '18:30', endTime: '21:00' }
        ]
      : [
          { label: '9:00am - 12:00pm', startTime: '09:00', endTime: '12:00' },
          { label: '12:30pm - 3:30pm', startTime: '12:30', endTime: '15:30' }
        ];
  };

  const isSlotEnabled = (week, dayOfWeek, slotNumber) => {
    const slotTimes = getSlotTimes();
    if (!slotTimes[slotNumber]) return false;

    const slot = slots.find(s =>
      s.week === week &&
      getDayOfWeek(s.date) === dayOfWeek &&
      s.startTime === slotTimes[slotNumber].startTime &&
      s.endTime === slotTimes[slotNumber].endTime
    );

    return !!slot;
  };

  const getSlotData = (week, dayOfWeek, slotNumber) => {
    const slotTimes = getSlotTimes();
    if (!slotTimes[slotNumber]) return null;

    return slots.find(s =>
      s.week === week &&
      getDayOfWeek(s.date) === dayOfWeek &&
      s.startTime === slotTimes[slotNumber].startTime &&
      s.endTime === slotTimes[slotNumber].endTime
    );
  };

  const getDayOfWeek = (date) => {
    const d = new Date(date);
    return d.getDay(); // 0=Sun, 1=Mon, etc.
  };

  const getSlotKey = (week, dayOfWeek, slotNumber) => {
    return `${week}-${dayOfWeek}-${slotNumber}`;
  };

  const getDayOfWeekIndex = (dayOfWeek) => {
    // Convert dayOfWeek (1=Mon, 2=Tue, etc.) to array index (0=Mon, 1=Tue, etc.)
    return weekdays.findIndex(day => dayOfWeekMap[day] === dayOfWeek);
  };

  const getRectangularSelection = () => {
    if (!dragStart || !dragEnd) return new Set();

    const slots = new Set();
    const slotTimes = getSlotTimes();

    // Treat the grid as 2D where each (week, slot) combination is a separate row
    // Row index = week * numSlots + slotNumber
    // Column index = dayIdx

    const numSlots = slotTimes.length;

    const startRowIdx = (dragStart.week - 1) * numSlots + dragStart.slotNumber;
    const endRowIdx = (dragEnd.week - 1) * numSlots + dragEnd.slotNumber;
    const minRowIdx = Math.min(startRowIdx, endRowIdx);
    const maxRowIdx = Math.max(startRowIdx, endRowIdx);

    const startDayIdx = getDayOfWeekIndex(dragStart.dayOfWeek);
    const endDayIdx = getDayOfWeekIndex(dragEnd.dayOfWeek);
    const minDayIdx = Math.min(startDayIdx, endDayIdx);
    const maxDayIdx = Math.max(startDayIdx, endDayIdx);

    // Select all cells in the 2D rectangle
    for (let rowIdx = minRowIdx; rowIdx <= maxRowIdx; rowIdx++) {
      // Convert row index back to (week, slotNumber)
      const week = Math.floor(rowIdx / numSlots) + 1;
      const slotNumber = rowIdx % numSlots;

      for (let dayIdx = minDayIdx; dayIdx <= maxDayIdx; dayIdx++) {
        const dayName = weekdays[dayIdx];
        const dayOfWeek = dayOfWeekMap[dayName];

        slots.add(getSlotKey(week, dayOfWeek, slotNumber));
      }
    }

    return slots;
  };

  const handleSlotMouseDown = (week, dayName, slotNumber, e) => {
    if (e) e.preventDefault();
    if (!selectedTerm || !selectedClassroom || saving) return;

    const dayOfWeek = dayOfWeekMap[dayName];
    const slotData = getSlotData(week, dayOfWeek, slotNumber);
    const enabled = isSlotEnabled(week, dayOfWeek, slotNumber);
    const hasBookings = slotData && slotData.bookedCount > 0;

    // Don't allow dragging from slots with bookings
    if (hasBookings) return;

    // Start rectangular drag
    setIsDragging(true);
    setDragAction(enabled ? 'disable' : 'enable');
    setDragStart({ week, dayOfWeek, slotNumber });
    setDragEnd({ week, dayOfWeek, slotNumber });
  };

  const handleSlotMouseEnter = (week, dayName, slotNumber) => {
    if (!isDragging) return;

    const dayOfWeek = dayOfWeekMap[dayName];

    // Update the end point of the rectangle
    setDragEnd({ week, dayOfWeek, slotNumber });
  };

  const applyDragToggle = async () => {
    if (!dragStart || !dragEnd || !dragAction) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDragAction(null);
      return;
    }

    const selectedSlots = getRectangularSelection();

    try {
      setSaving(true);

      for (const slotKey of selectedSlots) {
        const [week, dayOfWeek, slotNumber] = slotKey.split('-').map(Number);

        // Skip slots with bookings
        const slotData = getSlotData(week, dayOfWeek, slotNumber);
        if (slotData && slotData.bookedCount > 0) continue;

        await detentionSlotService.batchToggle(
          selectedTerm._id,
          selectedClassroom._id,
          week,
          dayOfWeek,
          slotNumber,
          dragAction === 'enable'
        );
      }

      await loadSlots();
    } catch (err) {
      console.error('Error applying drag toggle:', err);
      alert(err.response?.data?.message || err.message || 'Failed to toggle slots');
    } finally {
      setSaving(false);
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      setDragAction(null);
    }
  };

  const toggleSlot = async (week, dayName, slotNumber, e) => {
    if (e) e.stopPropagation();
    if (!selectedTerm || !selectedClassroom || saving) {
      console.log('Toggle blocked:', { selectedTerm: !!selectedTerm, selectedClassroom: !!selectedClassroom, saving });
      return;
    }

    const dayOfWeek = dayOfWeekMap[dayName];
    const slotData = getSlotData(week, dayOfWeek, slotNumber);
    const enabled = isSlotEnabled(week, dayOfWeek, slotNumber);

    console.log('Toggle slot:', { week, dayName, dayOfWeek, slotNumber, enabled });

    // Don't allow disabling if there are bookings
    if (enabled && slotData && slotData.bookedCount > 0) {
      alert(`Cannot disable slot with ${slotData.bookedCount} booking(s). Remove all bookings first.`);
      return;
    }

    try {
      setSaving(true);
      const result = await detentionSlotService.batchToggle(
        selectedTerm._id,
        selectedClassroom._id,
        week,
        dayOfWeek,
        slotNumber,
        !enabled
      );
      console.log('Toggle result:', result);
      await loadSlots();
    } catch (err) {
      console.error('Error toggling slot:', err);
      console.error('Error details:', err.response?.data);
      alert(err.response?.data?.message || err.message || 'Failed to toggle slot');
    } finally {
      setSaving(false);
    }
  };

  const toggleAllInDay = async (dayName) => {
    if (!selectedTerm || !selectedClassroom || saving) return;

    const dayOfWeek = dayOfWeekMap[dayName];
    const slotTimes = getSlotTimes();

    // Check if all slots in this day are enabled
    let allEnabled = true;
    for (const week of weeks) {
      for (let slotNumber = 0; slotNumber < slotTimes.length; slotNumber++) {
        const slotData = getSlotData(week, dayOfWeek, slotNumber);
        const hasBookings = slotData && slotData.bookedCount > 0;
        if (hasBookings) continue; // Skip slots with bookings in the check

        if (!isSlotEnabled(week, dayOfWeek, slotNumber)) {
          allEnabled = false;
          break;
        }
      }
      if (!allEnabled) break;
    }

    // If all enabled, disable all; otherwise enable all
    const targetState = !allEnabled;

    try {
      setSaving(true);

      for (const week of weeks) {
        for (let slotNumber = 0; slotNumber < slotTimes.length; slotNumber++) {
          const slotData = getSlotData(week, dayOfWeek, slotNumber);
          const hasBookings = slotData && slotData.bookedCount > 0;

          if (hasBookings) continue;
          const isEnabled = isSlotEnabled(week, dayOfWeek, slotNumber);
          if (isEnabled === targetState) continue;

          await detentionSlotService.batchToggle(
            selectedTerm._id,
            selectedClassroom._id,
            week,
            dayOfWeek,
            slotNumber,
            targetState
          );
        }
      }

      await loadSlots();
    } catch (err) {
      console.error('Error toggling day:', err);
      alert(err.response?.data?.message || err.message || 'Failed to toggle day');
    } finally {
      setSaving(false);
    }
  };

  const toggleAllInWeek = async (week) => {
    if (!selectedTerm || !selectedClassroom || saving) return;

    const slotTimes = getSlotTimes();

    // Check if all slots in this week are enabled
    let allEnabled = true;
    for (const dayName of weekdays) {
      const dayOfWeek = dayOfWeekMap[dayName];
      for (let slotNumber = 0; slotNumber < slotTimes.length; slotNumber++) {
        const slotData = getSlotData(week, dayOfWeek, slotNumber);
        const hasBookings = slotData && slotData.bookedCount > 0;
        if (hasBookings) continue;

        if (!isSlotEnabled(week, dayOfWeek, slotNumber)) {
          allEnabled = false;
          break;
        }
      }
      if (!allEnabled) break;
    }

    // If all enabled, disable all; otherwise enable all
    const targetState = !allEnabled;

    try {
      setSaving(true);

      for (const dayName of weekdays) {
        const dayOfWeek = dayOfWeekMap[dayName];
        for (let slotNumber = 0; slotNumber < slotTimes.length; slotNumber++) {
          const slotData = getSlotData(week, dayOfWeek, slotNumber);
          const hasBookings = slotData && slotData.bookedCount > 0;

          if (hasBookings) continue;
          const isEnabled = isSlotEnabled(week, dayOfWeek, slotNumber);
          if (isEnabled === targetState) continue;

          await detentionSlotService.batchToggle(
            selectedTerm._id,
            selectedClassroom._id,
            week,
            dayOfWeek,
            slotNumber,
            targetState
          );
        }
      }

      await loadSlots();
    } catch (err) {
      console.error('Error toggling week:', err);
      alert(err.response?.data?.message || err.message || 'Failed to toggle week');
    } finally {
      setSaving(false);
    }
  };

  const getSlotStatusClass = (week, dayName, slotNumber) => {
    const dayOfWeek = dayOfWeekMap[dayName];
    const slotData = getSlotData(week, dayOfWeek, slotNumber);

    if (!slotData) return '';

    const bookedCount = slotData.bookedCount || 0;
    const capacity = slotData.capacity || 0;

    if (bookedCount === 0) return 'available';
    if (bookedCount < capacity) return 'partially-booked';
    return 'fully-booked';
  };

  const navigateTerm = (direction) => {
    const currentIndex = terms.findIndex(t => t._id === selectedTerm._id);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < terms.length) {
      setSelectedTerm(terms[newIndex]);
    }
  };

  const getTermDisplayName = (term) => {
    if (!term) return '';
    return term.type === 'school_term' ? `${term.name} (School Term)` : `${term.name} (Holiday)`;
  };

  if (loading) return <LoadingSpinner />;

  if (!selectedTerm || !selectedClassroom) {
    return (
      <div className="admin-page">
        <div className="page-header">
          <h1>Detention Slots</h1>
        </div>
        <div className="empty-state">
          <p>No terms or classrooms available</p>
        </div>
      </div>
    );
  }

  const slotTimes = getSlotTimes();
  const weeks = Array.from({ length: selectedTerm.weeks }, (_, i) => i + 1);

  return (
    <div className="admin-page detention-slots-page">
      <div className="page-header">
        <h1>Detention Slots</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Navigation and Filters */}
      <div className="controls-section">
        <div className="term-navigation">
          <button
            onClick={() => navigateTerm(-1)}
            disabled={terms.findIndex(t => t._id === selectedTerm._id) === 0}
            className="nav-btn"
          >
            ◄
          </button>
          <div className="term-selector">
            <select
              value={selectedTerm._id}
              onChange={(e) => setSelectedTerm(terms.find(t => t._id === e.target.value))}
              className="term-dropdown"
            >
              {terms.map(term => (
                <option key={term._id} value={term._id}>
                  {getTermDisplayName(term)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigateTerm(1)}
            disabled={terms.findIndex(t => t._id === selectedTerm._id) === terms.length - 1}
            className="nav-btn"
          >
            ►
          </button>
        </div>

        <select
          value={selectedClassroom._id}
          onChange={(e) => setSelectedClassroom(classrooms.find(c => c._id === e.target.value))}
          className="classroom-dropdown"
        >
          {classrooms.map(room => (
            <option key={room._id} value={room._id}>
              {room.name} (Capacity: {room.capacity})
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-box disabled"></div>
            <span>Slot Disabled</span>
          </div>
          <div className="legend-item">
            <div className="legend-box enabled available"></div>
            <span>Available (0 bookings)</span>
          </div>
          <div className="legend-item">
            <div className="legend-box enabled partially-booked"></div>
            <span>Partially Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-box enabled fully-booked"></div>
            <span>Fully Booked</span>
          </div>
        </div>
        <p className="legend-note">
          Click on a slot to enable/disable it. Slots with bookings cannot be disabled.
        </p>
      </div>

      {/* Grid */}
      <div className="slots-grid-container">
        <table className="slots-grid">
          <thead>
            <tr>
              <th className="week-header">Week</th>
              {weekdays.map(day => (
                <th
                  key={day}
                  className="day-header clickable"
                  onClick={() => toggleAllInDay(day)}
                  title={`Click to toggle all ${day} slots`}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map(week => (
              <tr key={week}>
                <td
                  className="week-cell clickable"
                  onClick={() => toggleAllInWeek(week)}
                  title={`Click to toggle all Week ${week} slots`}
                >
                  Week {week}
                </td>
                {weekdays.map(day => (
                  <td key={day} className="day-cell">
                    {slotTimes.map((slotTime, slotNumber) => {
                      const dayOfWeek = dayOfWeekMap[day];
                      const enabled = isSlotEnabled(week, dayOfWeek, slotNumber);
                      const statusClass = getSlotStatusClass(week, day, slotNumber);
                      const slotData = getSlotData(week, dayOfWeek, slotNumber);
                      const hasBookings = slotData && slotData.bookedCount > 0;
                      const slotKey = getSlotKey(week, dayOfWeek, slotNumber);
                      const selectedSlots = getRectangularSelection();
                      const isBeingDragged = selectedSlots.has(slotKey);

                      return (
                        <div
                          key={slotNumber}
                          className={`slot ${enabled ? 'enabled' : 'disabled'} ${statusClass} ${hasBookings ? 'has-bookings' : ''} ${saving ? 'saving' : ''} ${isBeingDragged ? 'dragging' : ''}`}
                          onMouseDown={(e) => handleSlotMouseDown(week, day, slotNumber, e)}
                          onMouseEnter={() => handleSlotMouseEnter(week, day, slotNumber)}
                          onClick={(e) => {
                            if (!isDragging) {
                              toggleSlot(week, day, slotNumber, e);
                            }
                          }}
                          title={
                            hasBookings
                              ? `${slotData.bookedCount}/${slotData.capacity} booked - Cannot disable slots with bookings`
                              : enabled
                                ? 'Click to disable, or drag to select rectangle'
                                : 'Click to enable, or drag to select rectangle'
                          }
                        >
                          <div className="slot-time">{slotTime.label}</div>
                          {slotData && slotData.bookedCount > 0 && (
                            <div className="slot-booked">
                              {slotData.bookedCount}/{slotData.capacity}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saving && (
        <div className="saving-indicator">
          Saving...
        </div>
      )}
    </div>
  );
};

export default DetentionSlots;
