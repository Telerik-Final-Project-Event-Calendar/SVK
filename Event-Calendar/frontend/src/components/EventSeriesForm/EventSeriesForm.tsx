import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  FieldErrorsImpl,
  Merge,
} from "react-hook-form";
import { EventSeriesData } from "../../types/event.types";

interface EventSeriesFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  isSeries: boolean;
  recurrenceType: string;
  endType: string;
}

/**
 * EventSeriesForm Component
 *
 * A React functional component that provides a form interface for defining event series.
 * It integrates with `react-hook-form` to manage form state, validation, and input registration.
 * The component's fields dynamically appear or disappear based on user selections, allowing
 * for the creation of simple, daily, weekly, monthly, or yearly recurring event series with
 * various end conditions.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {UseFormRegister<any>} props.register - The `register` function from `react-hook-form` for registering input fields.
 * @param {FieldErrors<any>} props.errors - The `errors` object from `react-hook-form` containing validation errors.
 * @param {UseFormWatch<any>} props.watch - The `watch` function from `react-hook-form` to observe changes in form field values.
 * @param {boolean} props.isSeries - A boolean indicating whether the "Create as a series of events" checkbox is checked.
 * @param {string} props.recurrenceType - The currently selected recurrence type (e.g., 'daily', 'weekly', 'monthly', 'yearly').
 * @param {string} props.endType - The currently selected series end type (e.g., 'never', 'onDate', 'afterOccurrences').
 *
 * @returns {React.FC<EventSeriesFormProps>} A React functional component.
 *
 * Features:
 * - **Series Creation Toggle:** A checkbox allows users to specify if the event is a single occurrence or part of a series.
 * - **Dynamic Field Rendering:**
 * - **Series Details:** Fields for `Series Name`, `Recurrence Type`, `Repeat every (interval)` are shown only if `isSeries` is true.
 * - **Recurrence Specific Fields:**
 * - `Days of Week`: Appears only when `recurrenceType` is 'weekly'. Allows selecting multiple days.
 * - `Days of Month`: Appears only when `recurrenceType` is 'monthly'. Expects comma-separated day numbers.
 * - **End Type Specific Fields:**
 * - `End Date`: Appears only when `endType` is 'onDate'.
 * - `Number of Occurrences`: Appears only when `endType` is 'afterOccurrences'.
 * - **Form Validation:** Utilizes `react-hook-form` for validation rules (e.g., required fields, minimum values, valid day numbers for monthly recurrence).
 * - **User-Friendly Placeholders and Labels:** Provides clear guidance for input.
 *
 * Usage Example:
 * ```tsx
 * import React from 'react';
 * import { useForm } from 'react-hook-form';
 * import EventSeriesForm from './EventSeriesForm'; // Adjust path as necessary
 *
 * function CreateEventPage() {
 * const { register, handleSubmit, formState: { errors }, watch } = useForm();
 *
 * const isSeries = watch('isSeries', false);
 * const recurrenceType = watch('recurrenceType', '');
 * const endType = watch('endType', 'never');
 *
 * const onSubmit = (data) => console.log(data);
 *
 * return (
 * <form onSubmit={handleSubmit(onSubmit)}>
 * {/* ... other event fields (title, date, etc.) *\/}
 *
 * <EventSeriesForm
 * register={register}
 * errors={errors}
 * watch={watch}
 * isSeries={isSeries}
 * recurrenceType={recurrenceType}
 * endType={endType}
 * />
 *
 * <button type="submit">Create Event</button>
 * </form>
 * );
 * }
 * ```
 */
const EventSeriesForm: React.FC<EventSeriesFormProps> = ({
  register,
  errors,
  watch,
  isSeries,
  recurrenceType,
  endType,
}) => {
  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          {...register("isSeries")}
          className="accent-blue-600"
        />
        Create as a series of events
      </label>

      {isSeries && (
        <div className="space-y-4 mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="font-semibold text-gray-700">Series Details</h4>
          <div>
            <input
              type="text"
              placeholder="Series Name (e.g., Weekly Meeting)"
              {...register("seriesName", { required: isSeries })}
              className="input-base"
            />
            {errors.seriesName && (
              <p className="error-text">Series Name is required.</p>
            )}
          </div>

          <div>
            <label className="label-base mb-1 block">Recurrence Type</label>
            <select
              {...register("recurrenceType", { required: isSeries })}
              className="input-base"
              defaultValue="">
              <option
                value=""
                disabled>
                Select Recurrence
              </option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {errors.recurrenceType && (
              <p className="error-text">Recurrence Type is required.</p>
            )}
          </div>

          {(recurrenceType === "daily" ||
            recurrenceType === "weekly" ||
            recurrenceType === "monthly" ||
            recurrenceType === "yearly") && (
            <div>
              <label className="label-base mb-1 block">
                Repeat every (days/weeks/months/years)
              </label>
              <input
                type="number"
                {...register("recurrenceInterval", { required: true, min: 1 })}
                defaultValue={1}
                className="input-base"
              />
              {errors.recurrenceInterval && (
                <p className="error-text">Interval must be at least 1.</p>
              )}
            </div>
          )}

          {recurrenceType === "weekly" && (
            <div>
              <label className="label-base mb-1 block">Days of Week</label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day, index) => (
                  <label
                    key={day}
                    className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      value={index}
                      {...register("daysOfWeek", {
                        required: recurrenceType === "weekly",
                      })}
                      className="accent-blue-600"
                    />
                    {day.substring(0, 3)}
                  </label>
                ))}
              </div>
              {errors.daysOfWeek && (
                <p className="error-text">
                  At least one day must be selected for weekly recurrence.
                </p>
              )}
            </div>
          )}

          {recurrenceType === "monthly" && (
            <div>
              <label className="label-base mb-1 block">
                Days of Month (e.g., 1, 15)
              </label>
              <input
                type="text"
                placeholder="Comma-separated day numbers (e.g., 1,15)"
                {...register("daysOfMonth", {
                  required: true,
                  validate: (value) => {
                    if (!value) return true;
                    const days = String(value).split(",").map(Number);
                    return (
                      days.every((day) => day >= 1 && day <= 31) ||
                      "Invalid day numbers (1-31)"
                    );
                  },
                })}
                className="input-base"
              />
              {errors.daysOfMonth && (
                <p className="error-text">
                  {String(
                    errors.daysOfMonth.message || "Days of month are required."
                  )}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="label-base mb-1 block">Series End</label>
            <select
              {...register("endType", { required: isSeries })}
              className="input-base"
              defaultValue="never">
              <option value="never">Never</option>
              <option value="onDate">On date</option>
              <option value="afterOccurrences">After occurrences</option>
            </select>
            {errors.endType && (
              <p className="error-text">End type is required.</p>
            )}
          </div>

          {endType === "onDate" && (
            <div>
              <label className="label-base mb-1 block">End Date</label>
              <input
                type="date"
                {...register("seriesEndDate", { required: true })}
                className="input-base"
              />
              {errors.seriesEndDate && (
                <p className="error-text">End Date is required.</p>
              )}
            </div>
          )}

          {endType === "afterOccurrences" && (
            <div>
              <label className="label-base mb-1 block">
                Number of Occurrences
              </label>
              <input
                type="number"
                {...register("occurrencesCount", { required: true, min: 1 })}
                defaultValue={1}
                className="input-base"
              />
              {errors.occurrencesCount && (
                <p className="error-text">
                  Number of occurrences must be at least 1.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSeriesForm;
