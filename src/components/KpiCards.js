import React from "react";

function KpiCards({ metrics }) {

  const cards = [
    { title: "Total Incidents", value: metrics ? metrics.total_incidents : "--" },
    { title: "Critical Alerts", value: metrics ? metrics.critical_alerts : "--" },
    { title: "Affected Depts", value: metrics ? metrics.departments : "--" },
    { title: "Avg Resolution", value: metrics ? metrics.resolution_time : "--" }
  ];

  return (

    <div className="grid grid-cols-4 gap-6">

      {cards.map((card, i) => (

        <div key={i}
          className="bg-[#111827] border border-blue-500/20 
          rounded-xl p-6 text-center shadow-lg shadow-blue-500/10">

          <p className="text-gray-400 text-sm">{card.title}</p>

          <p className="text-3xl font-bold text-blue-400 mt-2">
            {card.value}
          </p>

        </div>

      ))}

    </div>

  );

}

export default KpiCards;