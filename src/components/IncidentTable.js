import React from "react";

function IncidentTable({ incidents: incs }) {

  const incidents = incs || [];

  return (

    <div className="bg-[#111827] border border-blue-500/20 rounded-xl p-6">

      <h3 className="text-blue-400 font-semibold mb-4">
        Recent Incidents
      </h3>

      <table className="w-full text-left">

        <thead className="text-gray-400 text-sm border-b border-blue-500/20">
          <tr>
            <th className="pb-2">Incident ID</th>
            <th>State</th>
            <th>Priority</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {incidents.map((i, idx) => (
            <tr key={idx} className="border-b border-blue-500/10 hover:bg-white/5 transition-colors">
              <td className="py-3 font-mono text-xs">{i.id}</td>
              <td className="py-3">
                 <span className={`px-2 py-1 rounded-full text-xs
                    ${["closed", "resolved"].includes(String(i.state).toLowerCase()) ? "bg-green-500/10 text-green-400" :
                      ["new", "open", "in progress", "active"].includes(String(i.state).toLowerCase()) ? "bg-ai-blue/10 text-ai-blue" :
                      "bg-gray-500/10 text-gray-400"
                    }
                 `}>
                   {i.state || i.issue?.substring(0, 15)}
                 </span>
              </td>
              <td className={`py-3 text-xs font-bold
                ${
                String(i.priority).toUpperCase() === "HIGH"
                ? "text-red-400"
                : String(i.priority).toUpperCase() === "MEDIUM"
                ? "text-yellow-400"
                : "text-green-400"
              }`}>
                {i.priority}
              </td>
              <td className="py-3 text-sm text-gray-400">{i.duration}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>

  );

}

export default IncidentTable;