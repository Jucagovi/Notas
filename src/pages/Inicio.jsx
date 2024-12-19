import { useState } from "react";
import { Calendar } from "primereact/calendar";

const Inicio = () => {
  const [date, setDate] = useState(null);
  return (
    <>
      <h1>Esto es el inicio del documento.</h1>
      <div className='border-round'>
        <Calendar
          value={date}
          onChange={(e) => setDate(e.value)}
          inline
          showWeek
        />
      </div>
    </>
  );
};

export default Inicio;
