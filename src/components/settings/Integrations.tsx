// src/components/settings/Integrations.tsx

const Integrations = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Integrations</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">CRM</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Connect to Salesforce</button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md ml-2">Connect to HubSpot</button>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Email</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Connect to Office 365</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-md ml-2">Connect to Gmail</button>
        </div>
        <div>
          <h3 className="text-xl font-semibold">Notifications</h3>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-md">Connect to Slack</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md ml-2">Connect to Teams</button>
        </div>
        <div>
          <h3 className="text-xl font-semibold">e-Signature</h3>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-md">Connect to DocuSign</button>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
