# Cinema Seat Manager: Specification

> **Last updated**: 2026-11-10
> The binding requirements for this project, as mae set them on 2026-11-10. Agents interpret this document; they don't change it without mae's agreement. Open interpretation questions are tracked in `memory-bank/status.md`, and settled ones in `memory-bank/decisions.md`.

## 1. Purpose

A command-line prototype, written in TypeScript, that manages seat reservations for a single cinema screening room.

## 2. Data model

- The screening room is a 2D array of 8 rows by 10 columns.
- Each cell holds `1` for an occupied seat and `0` for an available seat.
- Do not use objects or classes to represent the data; use the 2D array.
- If metadata is needed, structure it as JSON.

## 3. Display

- Print the matrix to the console with `X` for an occupied seat and `L` for an available seat.
- Include the row and column numbers in the display.

## 4. Functions

1. **Initialize**: create the 8 x 10 seating matrix.
2. **Display**: print the current state of the screening room as described in §3.
3. **Reserve**: given a row number and a column number, change the seat from `0` to `1`, then report success, or failure if the seat was not a valid seat to reserve.
4. **Cancel**: given a row number and a column number, change a reserved seat from `1` to `0`, then confirm the reservation was cancelled, or report that it wasn't because the seat was not reserved.
5. **Occupancy**: return the number of occupied seats and the number of available seats in the room.
6. **Adjacent pair search**: find two adjacent available seats in the same row and return their positions.
   - If several pairs exist, return the first one.
   - If none exist, say so clearly in the response.

## 5. Testing

Test the functions against these room states:

1. An empty room.
2. A partially filled room.
3. A nearly full room with only scattered single seats available.
4. A full room with no seats available.

Each operation displays a clear message, similar to a request status message.

## 6. Code style

Comment every function clearly, explaining its purpose, what it does, its inputs, its outputs, and how to invoke it.
