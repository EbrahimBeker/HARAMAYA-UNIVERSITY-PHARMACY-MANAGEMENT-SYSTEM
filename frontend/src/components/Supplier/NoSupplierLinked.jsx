const NoSupplierLinked = ({ user }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Supplier Account Not Linked
          </h2>
          <p className="text-red-600 mb-4">
            Your user account is not linked to a supplier company. Please
            contact the system administrator to link your account.
          </p>
          <p className="text-sm text-gray-600">
            User ID: {user?.id} | Username: {user?.username}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoSupplierLinked;
