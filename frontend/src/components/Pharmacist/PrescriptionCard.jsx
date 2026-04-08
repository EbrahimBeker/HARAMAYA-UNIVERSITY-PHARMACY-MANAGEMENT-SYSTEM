import { Pill, Clock, FileText } from "lucide-react";

const PrescriptionCard = ({ prescription, loading, onDispense, onRefill }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all bg-gradient-to-r from-white to-purple-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
              {prescription.prescription_number}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Clock size={12} />
              Pending
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Patient:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {prescription.patient_name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Patient ID:</span>
              <span className="ml-2 font-medium text-gray-900">
                {prescription.patient_id_number}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Physician:</span>
              <span className="ml-2 font-medium text-gray-900">
                {prescription.physician_name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(prescription.prescription_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          {prescription.diagnosis && (
            <div className="mt-2 text-sm">
              <span className="text-gray-600">Diagnosis:</span>
              <span className="ml-2 text-gray-900">
                {prescription.diagnosis}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {prescription.refills_remaining > 0 && (
            <div className="text-xs text-center mb-1">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                {prescription.refills_remaining} refill
                {prescription.refills_remaining > 1 ? "s" : ""} left
              </span>
            </div>
          )}
          <button
            onClick={() => onDispense(prescription)}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Pill size={16} />
            Dispense
          </button>
          {prescription.refills_remaining > 0 && (
            <button
              onClick={() => onRefill(prescription)}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center gap-2 text-sm"
            >
              <FileText size={14} />
              Refill
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
