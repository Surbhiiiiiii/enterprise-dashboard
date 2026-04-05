import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function TrendChart({ trends }) {

  const data = trends?.chart || [
    { day: "Mon", complaints: 0 },
    { day: "Tue", complaints: 0 },
    { day: "Wed", complaints: 0 },
    { day: "Thu", complaints: 0 },
    { day: "Fri", complaints: 0 }
  ];

  return (

    <div className="bg-[#111827] border border-blue-500/20 rounded-xl p-6">

      <h3 className="text-blue-400 font-semibold mb-4">
        Complaint Trend
      </h3>

      <ResponsiveContainer width="100%" height={250}>

        <LineChart data={data}>
          <XAxis dataKey="day" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={3}/>
        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}

export default TrendChart;