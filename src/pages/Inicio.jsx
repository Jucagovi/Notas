import { useState } from "react";
import { Calendar } from "primereact/calendar";
import ColumnaSimple from "../../layouts/ColumnaSimple";

const Inicio = () => {
  const [date, setDate] = useState(null);
  return (
    <>
      <ColumnaSimple>
        <Calendar
          value={date}
          onChange={(e) => setDate(e.value)}
          inline
          showWeek
        />
      </ColumnaSimple>
    </>
  );
};

export default Inicio;
