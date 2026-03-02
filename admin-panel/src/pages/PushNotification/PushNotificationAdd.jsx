import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useApi from "../../api/hooks/useApi.jsx";
import ApiEndPoint from "../../api/Constants/ApiEndPoint";

const PushNotificationAdd = () => {
  const navigate = useNavigate();
  const { getData } = useApi();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "location",
    location: "",
    activities: [],
    users: [],
    providers: [],
  });

  const [errors, setErrors] = useState({
    title: "",
    message: "",
    location: "",
    activities: "",
    role: "",
  });

  const [activitiesList, setActivitiesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [providersList, setProvidersList] = useState([]);

  /* ---------------- Fetch Lists (UI only) ---------------- */

  useEffect(() => {
    fetchActivities();
    fetchUsers();
    fetchProviders();
  }, []);

  const fetchActivities = async () => {
    const res = await getData(ApiEndPoint.activityList);
    if (res?.success) setActivitiesList(res.data || []);
  };

  const fetchUsers = async () => {
    const res = await getData(ApiEndPoint.getAllUser);
    if (res?.body?.rows) setUsersList(res.body.rows);
  };

  const fetchProviders = async () => {
    const res = await getData(ApiEndPoint.getAllProvider);
    if (res?.body?.rows) setProvidersList(res.body.rows);
  };

  /* ---------------- Helpers ---------------- */

  const toggleSelection = (id, key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((i) => i !== id)
        : [...prev[key], id],
    }));
    setErrors({ ...errors, activities: "", role: "" });
  };

  const toggleSelectAll = (list, key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].length === list.length ? [] : list.map((i) => i.id),
    }));
    setErrors({ ...errors, role: "" });
  };

  /* ---------------- Submit ---------------- */

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      title: "",
      message: "",
      location: "",
      activities: "",
      role: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (formData.targetType === "location" && !formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (
      formData.targetType === "activity" &&
      formData.activities.length === 0
    ) {
      newErrors.activities = "Select at least one activity";
    }

    if (
      formData.targetType === "role" &&
      formData.users.length === 0 &&
      formData.providers.length === 0
    ) {
      newErrors.role = "Select at least one user or provider";
    }

    if (
      newErrors.title ||
      newErrors.message ||
      newErrors.location ||
      newErrors.activities ||
      newErrors.role
    ) {
      setErrors(newErrors);
      return;
    }

    setErrors({
      title: "",
      message: "",
      location: "",
      activities: "",
      role: "",
    });

    toast.success("Notification sent successfully");
    navigate("/push-notifications");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen p-6">
      <div className="bg-white rounded-lg shadow max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-center mb-8">
          Send Push Notification
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border px-4 py-2 rounded ${
                errors.title && "border-red-500"
              }`}
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="font-medium">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              className={`w-full border px-4 py-2 rounded ${
                errors.message && "border-red-500"
              }`}
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                setErrors({ ...errors, message: "" });
              }}
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          {/* Target */}
          <div>
            <label className="font-medium">Target Audience</label>
            <select
              className="w-full border px-4 py-2 rounded"
              value={formData.targetType}
              onChange={(e) =>
                setFormData({ ...formData, targetType: e.target.value })
              }
            >
              <option value="location">By Location</option>
              <option value="activity">By Activity</option>
              <option value="role">By Role</option>
            </select>
          </div>

          {/* Location */}
          {formData.targetType === "location" && (
            <div>
              <label className="font-medium">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border px-4 py-2 rounded ${
                  errors.location && "border-red-500"
                }`}
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  setErrors({ ...errors, location: "" });
                }}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          )}

          {/* Activity */}
          {formData.targetType === "activity" && (
            <div>
              <label className="font-medium mb-2 block">
                Select Activities <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {activitiesList.map((a) => (
                  <label key={a.id} className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={formData.activities.includes(a.id)}
                      onChange={() => toggleSelection(a.id, "activities")}
                    />
                    {a.title}
                  </label>
                ))}
              </div>
              {errors.activities && (
                <p className="text-red-500 text-sm mt-1">{errors.activities}</p>
              )}
            </div>
          )}

          {/* Role */}
          {formData.targetType === "role" && (
            <div>
              <div className="grid grid-cols-2 gap-6">
                {/* Users */}
                <div>
                  <h3 className="font-medium mb-2">Users</h3>
                  <div className="border rounded p-3 max-h-60 overflow-y-auto">
                    {usersList.map((u) => (
                      <label key={u.id} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={formData.users.includes(u.id)}
                          onChange={() => toggleSelection(u.id, "users")}
                        />
                        {u.fullName}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Providers */}
                <div>
                  <h3 className="font-medium mb-2">Providers</h3>
                  <div className="border rounded p-3 max-h-60 overflow-y-auto">
                    {providersList.map((p) => (
                      <label key={p.id} className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={formData.providers.includes(p.id)}
                          onChange={() => toggleSelection(p.id, "providers")}
                        />
                        {p.fullName}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {errors.role && (
                <p className="text-red-500 text-sm mt-2">{errors.role}</p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button className="bg-gray-900 text-white px-6 py-2 rounded">
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PushNotificationAdd;
