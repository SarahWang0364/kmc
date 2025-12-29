I want you to redesign and implement the detention slots page (menu 4a) with a Where2Meet-style weekly availability grid, while staying fully consistent with the existing data model and requirements in the instructions file you’ve already read.

Core concept

The detention slots page should look and behave similarly to where2meet:

- Time slots are displayed in a grid

- Weeks are displayed as rows

- Weekdays (Mon–Fri) are displayed as columns

- Each weekday contains 2 fixed detention slots

The page must support multiple future school terms and holidays, and admins should be able to flip through all future terms/holidays.

Slot structure

Each weekday (Mon–Fri) always has exactly 2 slots, depending on term type:

School term

- Slot 1: 4:00pm – 6:30pm

- Slot 2: 6:30pm – 9:00pm

Holiday

- Slot 1: 9:00am – 12:00pm

- Slot 2: 12:30pm – 3:30pm

There are no weekend detention slots.

Time range displayed

- For the selected term/holiday, all weeks in that term/holiday must be shown at once

    - School term: 10 weeks

    - Holiday: 2 weeks

- Each row represents one calendar week (Week 1, Week 2, etc.)

Term / holiday navigation

- At the top of the page, provide controls to:

    - Select a term / holiday (only current and future ones)

    - Move forward/backward between terms and holidays

- Only one term/holiday is displayed at a time

Classroom filtering

- The page must include a classroom dropdown filter

- Admin can select one classroom at a time

- Detention slot availability is scoped to (term/holiday + classroom)

Admin interaction (very important)

- For the selected term/holiday + classroom:

- Each detention slot is a toggleable cell

- Admin can:

    - Select (enable) a slot → slot becomes available for booking

    - De-select (disable) a slot → slot is unavailable

- Slot capacity is automatically determined by the classroom capacity

- Admin must be able to:

    - Toggle individual slots

    - Batch toggle slots (e.g. select an entire week, or the same slot across all weeks)
- changes are saved real time, there doesn't need to be any save button
- slots that have been booked by students cannot be untoggled, unless all booked detentions are removed from this slot (as booking detention has not yet been implemented, you can add this to your implementation plan and do this later)