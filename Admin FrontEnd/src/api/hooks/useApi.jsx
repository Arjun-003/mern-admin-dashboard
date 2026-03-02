import { useState } from "react";
import api from "../api";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ GET
  const getData = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(endpoint);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET by ID
  const getDataByParams = async (endpoint, id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`${endpoint}/${id}`);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ POST
  const postData = async (endpoint, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(endpoint, body);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ POST without token (for login etc.)
  const postDataWithOutToken = async (endpoint, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(endpoint, body, {
        headers: { Authorization: "" },
      });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ PUT
  const putData = async (endpoint, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put(endpoint, body);
      return res;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ PATCH
  const updateRecord = async (endpoint, body) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.patch(endpoint, body);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE
  const deleteData = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(endpoint);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getData,
    getDataByParams,
    postData,
    postDataWithOutToken,
    putData,
    updateRecord,
    deleteData,
    loading,
    error,
  };
};

export default useApi;